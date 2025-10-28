const sharp = require('sharp');

console.log('🔍 chartImage.controller loaded - HTML to Image converter');

// פונקציה ליצירת תמונה מ-HTML
const generateOrgChartImage = async (req, res) => {
  try {
    console.log('🔍 Starting HTML to image conversion...');
    
    // קבלת HTML מהלקוח
    const { htmlContent } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({ error: 'לא נשלח תוכן HTML' });
    }
    
    console.log('✅ HTML received, length:', htmlContent.length);
    
    // המרת HTML ל-PNG עם Sharp
    const htmlBuffer = Buffer.from(htmlContent, 'utf8');
    
    // יצירת תמונה באיכות גבוהה
    const imageBuffer = await sharp(htmlBuffer)
      .png({
        quality: 100,
        compressionLevel: 0
      })
      .resize(1200, null, { // רוחב קבוע, גובה אוטומטי
        withoutEnlargement: true,
        fit: 'inside'
      })
      .toBuffer();
    
    console.log('✅ Image created successfully, size:', imageBuffer.length);
    
    // שליחת התמונה ללקוח
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="מבנה-ארגוני-${new Date().toLocaleDateString('he-IL')}.png"`,
      'Content-Length': imageBuffer.length
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('שגיאה ביצירת תמונה:', error);
    res.status(500).json({ error: 'שגיאה ביצירת תמונה מהעץ הארגוני' });
  }
};

module.exports = {
  generateOrgChartImage
};
