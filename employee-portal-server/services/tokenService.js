const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config({ path: './config.env' });

class TokenService {
  /**
   * Create JWT token for user
   * @param {Object} userInfo - User information from Microsoft
   * @returns {string} JWT token
   */
  static createToken(userInfo) {
    return jwt.sign(
      {
        id: userInfo.databaseId || userInfo.id, // Use database ID if available, fallback to Microsoft ID
        email: userInfo.mail || userInfo.userPrincipalName,
        name: userInfo.displayName,
        microsoftId: userInfo.microsoftId || userInfo.id, // Store Microsoft ID separately
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '60d' } // Token valid for 60 days (2 months)
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token data
   */
  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  /**
   * Check if user email exists in database
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async checkUserExists(email) {
    try {
      console.log('🔍 TokenService: Checking user exists for email:', email);
      const user = await User.findOne({
        where: { email: email },
        attributes: ['id', 'full_name', 'email', 'role', 'manager_id', 'birth_date', 'profile_image', 'createdAt', 'updatedAt']
      });
      
      if (user) {
        console.log('✅ TokenService: User found:', { id: user.id, name: user.full_name, email: user.email });
      } else {
        console.log('❌ TokenService: User not found for email:', email);
      }
      
      return user;
    } catch (error) {
      console.error('❌ TokenService: Error checking user exists:', error);
      return null;
    }
  }

  /**
   * Create or update user from Microsoft info
   * @param {Object} userInfo - User information from Microsoft
   * @param {string} profileImageUrl - Base64 encoded profile image
   * @returns {Promise<Object>} User object
   */
  static async createOrUpdateUser(userInfo, profileImageUrl = null) {
    try {
      const email = userInfo.mail || userInfo.userPrincipalName;
      const existingUser = await this.checkUserExists(email);

      if (existingUser) {
        // Update existing user with Microsoft info
        console.log('🔄 TokenService: Updating existing user:', email);
        console.log('🖼️ TokenService: Profile image URL length:', profileImageUrl ? profileImageUrl.length : 0);
        
        try {
          await existingUser.update({
            full_name: userInfo.displayName || existingUser.full_name,
            profile_image: profileImageUrl || existingUser.profile_image
          });
          console.log('✅ TokenService: User updated successfully');
          // Return user with correct database ID
          return {
            id: existingUser.id, // Database INTEGER ID
            email: existingUser.email,
            displayName: existingUser.full_name,
            microsoftId: userInfo.id, // Microsoft UUID
            profile_image: existingUser.profile_image
          };
        } catch (updateError) {
          console.error('❌ TokenService: Error updating user:', updateError);
          // If profile image is too large, try without it
          if (updateError.message.includes('Data too long')) {
            console.log('⚠️ TokenService: Profile image too large, updating without image');
            await existingUser.update({
              full_name: userInfo.displayName || existingUser.full_name,
              profile_image: null
            });
            return {
              id: existingUser.id,
              email: existingUser.email,
              displayName: existingUser.full_name,
              microsoftId: userInfo.id,
              profile_image: null
            };
          }
          throw updateError;
        }
      } else {
        // Create new user
        const newUser = await User.create({
          full_name: userInfo.displayName || 'Unknown User',
          email: email,
          role: 'user', // Default role
          profile_image: profileImageUrl || null,
          birth_date: null,
          manager_id: null
        });
        // Return user with correct database ID
        return {
          id: newUser.id, // Database INTEGER ID
          email: newUser.email,
          displayName: newUser.full_name,
          microsoftId: userInfo.id, // Microsoft UUID
          profile_image: newUser.profile_image
        };
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  /**
   * Get user by token
   * @param {string} token - JWT token
   * @returns {Promise<Object|null>} User object or null
   */
  static async getUserByToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await this.checkUserExists(decoded.email);
      return user;
    } catch (error) {
      console.error('Error getting user by token:', error);
      return null;
    }
  }

  /**
   * Refresh token if needed
   * @param {string} token - Current JWT token
   * @returns {Promise<Object>} New token data or current token
   */
  static async refreshTokenIfNeeded(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await this.checkUserExists(decoded.email);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if token expires soon (within 14 days)
      const now = Math.floor(Date.now() / 1000);
      const tokenExp = decoded.exp;
      const timeUntilExpiry = tokenExp - now;

      if (timeUntilExpiry < 1209600) { // Less than 14 days (2 weeks)
        // Create new token
        const newToken = this.createToken({
          id: user.id, // Database INTEGER ID
          mail: user.email,
          displayName: user.full_name,
          microsoftId: decoded.microsoftId, // Keep the original Microsoft ID
          profileImage: user.profile_image
        });
        
        return {
          token: newToken,
          refreshed: true
        };
      }

      return {
        token: token,
        refreshed: false
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
}

module.exports = TokenService;
