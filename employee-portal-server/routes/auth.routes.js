const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const TokenService = require('../services/tokenService');
const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config({ path: './config.env' });

// Microsoft MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

// נתיב לאימות Microsoft
router.post('/microsoft', async (req, res) => {
  try {
    console.log('🔐 Microsoft authentication request received');
    const { accessToken } = req.body;
    
    if (!accessToken) {
      console.log('❌ No access token provided');
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    console.log('✅ Access token received, length:', accessToken.length);

    // Verify the token with Microsoft
    const result = await cca.acquireTokenSilent({
      scopes: ['User.Read'],
      account: null
    }).catch(async () => {
      // If silent acquisition fails, validate the token manually
      try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Invalid token');
        }
        
        return await response.json();
      } catch (error) {
        throw new Error('Token validation failed');
      }
    });

    // Get user info from Microsoft Graph
    console.log('📡 Fetching user info from Microsoft Graph...');
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('📊 Microsoft Graph response status:', userResponse.status);
    
    if (!userResponse.ok) {
      console.log('❌ Failed to get user information from Microsoft Graph');
      return res.status(401).json({ error: 'Failed to get user information' });
    }

    const userInfo = await userResponse.json();
    console.log('✅ User info received:', { 
      email: userInfo.mail || userInfo.userPrincipalName, 
      name: userInfo.displayName,
      id: userInfo.id 
    });

    // Get user profile photo from Microsoft Graph
    let profileImageUrl = null;
    try {
      console.log('🖼️ Attempting to fetch profile photo...');
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('📸 Photo response status:', photoResponse.status);
      
      if (photoResponse.ok) {
        // Save image as file instead of base64
        const photoBuffer = await photoResponse.arrayBuffer();
        const fs = require('fs');
        const path = require('path');
        
        // בפרודקשן: אפשר להשתמש ב-UPLOADS_PATH או ברירת מחדל
        const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
        
        // Check if user exists and get current profile image
        const userEmail = userInfo.mail || userInfo.userPrincipalName;
        const existingUser = await TokenService.checkUserExists(userEmail);
        
        // Delete old profile image if exists
        if (existingUser && existingUser.profile_image) {
          try {
            // ניקוי הנתיב - הסר /uploads/ אם יש, והשאר רק את שם הקובץ
            let oldImageFilename = existingUser.profile_image;
            if (oldImageFilename.startsWith('/uploads/')) {
              oldImageFilename = oldImageFilename.replace('/uploads/', '');
            } else if (oldImageFilename.startsWith('/')) {
              oldImageFilename = oldImageFilename.substring(1); // הסר את ה-/ הראשון
            }
            
            const oldImagePath = path.join(uploadsDir, oldImageFilename);
            console.log('🔍 Checking for old image at:', oldImagePath);
            
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log('🗑️ Deleted old profile image:', oldImageFilename);
            } else {
              console.log('ℹ️ Old image not found (may have been deleted already):', oldImagePath);
            }
          } catch (deleteError) {
            console.log('⚠️ Could not delete old image:', deleteError.message);
            // לא נכשל אם לא הצלחנו למחוק - נמשיך עם התמונה החדשה
          }
        }
        
        // Create unique filename
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 1000000000);
        const filename = `profile-${timestamp}-${randomId}-${userInfo.displayName || 'user'}.jpg`;
        const filepath = path.join(uploadsDir, filename);
        
        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log('✅ Created uploads directory:', uploadsDir);
        }
        
        // Save image file
        try {
          fs.writeFileSync(filepath, Buffer.from(photoBuffer));
          profileImageUrl = `/${filename}`;
          console.log('✅ Profile photo saved as file:', profileImageUrl);
          console.log('📁 File path:', filepath);
          console.log('📊 File size:', Buffer.from(photoBuffer).length, 'bytes');
          
          // Display the image as base64 for preview
          const base64Image = Buffer.from(photoBuffer).toString('base64');
          console.log('🖼️ NEW PROFILE IMAGE PREVIEW:');
          console.log(`data:image/jpeg;base64,${base64Image.substring(0, 100)}...`);
          
        } catch (saveError) {
          console.error('❌ Error saving profile photo:', saveError);
          profileImageUrl = null;
        }
      } else {
        console.log('❌ Failed to fetch profile photo, status:', photoResponse.status);
      }
    } catch (photoError) {
      console.log('❌ Could not fetch profile photo:', photoError.message);
    }
    
    // Check if user exists in our database
    const userEmail = userInfo.mail || userInfo.userPrincipalName;
    console.log('🔍 Checking if user exists in database:', userEmail);
    
    const user = await TokenService.checkUserExists(userEmail);
    
    if (!user) {
      console.log('❌ User not found in database:', userEmail);
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Your email is not registered in the system. Please contact administrator.' 
      });
    }
    
    console.log('✅ User found in database:', { id: user.id, name: user.full_name, email: user.email });

    // Create or update user with Microsoft info and profile image
    console.log('💾 Creating/updating user with profile image...');
    const updatedUser = await TokenService.createOrUpdateUser(userInfo, profileImageUrl);
    console.log('✅ User updated successfully:', { id: updatedUser.id, name: updatedUser.full_name });

    // Create JWT token
    console.log('🔑 Creating JWT token...');
    const jwtToken = TokenService.createToken({
      ...userInfo,
      databaseId: updatedUser.id // Add database ID to userInfo
    });

    console.log('🎉 Authentication completed successfully!');
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.full_name,
        role: updatedUser.role,
        profileImage: updatedUser.profile_image,
        profile_image: updatedUser.profile_image // Also include the DB field name
      }
    });

  } catch (error) {
    console.error('Microsoft authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// נתיב לבדיקת אותנטיקציה
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// נתיב לבדיקת טוקן
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await TokenService.getUserByToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        profileImage: user.profile_image,
        profile_image: user.profile_image // Also include the DB field name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// נתיב לבדיקת טוקן
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const result = await TokenService.refreshTokenIfNeeded(token);
    
    res.json({
      success: true,
      token: result.token,
      refreshed: result.refreshed
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// נתיב להתנתקות
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
