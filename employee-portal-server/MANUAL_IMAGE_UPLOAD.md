# 📤 מדריך העברת תמונות ידנית לפרודקשן

## 🎯 איך להעביר תמונות מהמקומי לפרודקשן:

### **אפשרות 1: דרך Render Shell (מומלץ - הכי פשוט)**

#### **שלב 1: הכן את התמונות**

1. אסוף את כל התמונות שתרצה להעביר
2. שמור אותן בתיקייה אחת (למשל: `images-to-upload/`)

#### **שלב 2: פתח Render Shell**

1. לך ל-**Render Dashboard**: https://dashboard.render.com
2. בחר את ה-**Service** שלך (`employee-portal-server`)
3. לחץ על **Shell** (בתפריט העליון)
4. Shell יפתח בחלון חדש

#### **שלב 3: העלה את התמונות**

ב-Render Shell, הפעל:

```bash
# עבור לתיקיית uploads
cd /opt/render/uploads

# בדוק מה יש שם
ls -la
```

**אבל רגע!** Render Shell לא מאפשר העלאת קבצים ישירות דרך הדפדפן.

---

### **אפשרות 2: דרך SFTP (אם יש לך גישה)**

Render לא תומך ב-SFTP ישירות, אבל אפשר להשתמש ב-**Render CLI** או **API**.

---

### **אפשרות 3: דרך API (הכי נוח!)**

#### **שלב 1: הכן את התמונות**

שמור את התמונות בתיקייה אחת.

#### **שלב 2: השתמש ב-cURL או Postman**

**דוגמה עם cURL:**

```bash
# קבל token קודם (דרך login)
# אחרי שיש לך token:

# העלה תמונה
curl -X POST https://portal.bynetdcs.co.il/api/system-contents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "title=תמונת השבוע" \
  -F "description=תיאור התמונה" \
  -F "type=image"
```

**דוגמה עם PowerShell (Windows):**

```powershell
# קבל token קודם
$token = "YOUR_TOKEN_HERE"

# העלה תמונה
$imagePath = "C:\path\to\image.jpg"
$uri = "https://portal.bynetdcs.co.il/api/system-contents"

$formData = @{
    file = Get-Item -Path $imagePath
    title = "תמונת השבוע"
    description = "תיאור התמונה"
    type = "image"
}

$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri $uri -Method Post -Form $formData -Headers $headers
```

---

### **אפשרות 4: דרך Script (אוטומטי)**

אפשר ליצור script שיעלה את כל התמונות אוטומטית!

#### **צור קובץ: `upload-images.js`**

```javascript
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_URL = 'https://portal.bynetdcs.co.il/api/system-contents';
const TOKEN = 'YOUR_TOKEN_HERE'; // החלף ב-token שלך
const IMAGES_DIR = './images-to-upload'; // תיקיית התמונות

async function uploadImage(imagePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('type', 'image');
  form.append('title', path.basename(imagePath, path.extname(imagePath)));
  form.append('description', '');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();
    console.log(`✅ Uploaded: ${imagePath}`, data);
    return data;
  } catch (error) {
    console.error(`❌ Failed to upload ${imagePath}:`, error);
    throw error;
  }
}

async function uploadAllImages() {
  const imagesDir = path.join(__dirname, IMAGES_DIR);
  
  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Directory not found: ${imagesDir}`);
    return;
  }

  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  );

  console.log(`📁 Found ${imageFiles.length} images to upload`);

  for (const file of imageFiles) {
    const filePath = path.join(imagesDir, file);
    await uploadImage(filePath);
    // המתן קצת בין העלאות
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 All images uploaded!');
}

uploadAllImages();
```

#### **הרץ את ה-Script:**

```bash
# התקן את החבילות הנדרשות
npm install form-data node-fetch

# הרץ את ה-script
node upload-images.js
```

---

### **אפשרות 5: דרך GitHub Actions (אוטומטי לחלוטין)**

אפשר ליצור GitHub Action שיעלה תמונות אוטומטית בכל push!

---

## 🎯 המלצה:

**הכי פשוט - דרך API עם PowerShell או cURL:**

1. ✅ לא צריך גישה ל-Shell
2. ✅ עובד מכל מקום
3. ✅ אפשר לעשות script אוטומטי
4. ✅ בטוח (דרך authentication)

---

## 📋 סיכום מה לעשות:

### **דרך API (מומלץ):**

1. **קבל Token:**
   - התחבר לאפליקציה
   - פתח DevTools → Network
   - מצא request עם `Authorization: Bearer ...`
   - העתק את ה-token

2. **העלה תמונה:**
   ```bash
   curl -X POST https://portal.bynetdcs.co.il/api/system-contents \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@image.jpg" \
     -F "title=תמונת השבוע" \
     -F "type=image"
   ```

3. **או השתמש ב-Script** (אם יש לך הרבה תמונות)

---

## 💡 טיפים:

- **גודל**: התמונות מוגבלות ל-5MB
- **פורמטים**: רק תמונות (`image/*`) מתקבלות
- **שמות**: שמור שמות קבצים פשוטים (ללא תווים מיוחדים)

---

**אם תרצה, אני יכול ליצור לך script מוכן!** 🚀

