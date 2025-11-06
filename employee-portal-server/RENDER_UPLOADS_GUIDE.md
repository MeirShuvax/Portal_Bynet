# 📁 מדריך שמירת תמונות ב-Render

## ⚠️ הבעיה:
ב-Render, הקבצים בתיקיית השרת **נמחקים** בכל restart/redeploy. זה אומר שהתמונות יאבדו!

## ✅ הפתרונות:

### **אפשרות 1: Render Persistent Disk (מומלץ - פשוט וזול)**

Render מציע **Persistent Disk** - דיסק קבוע שלא נמחק.

#### איך להגדיר:

1. **ב-Render Dashboard:**
   - לך ל-**Services** → בחר את השרת שלך
   - לחץ על **Settings** → גלול למטה ל-**Persistent Disks**
   - לחץ על **+ Add Persistent Disk**

2. **הגדר את ה-Disk:**
   - **Name**: `uploads-disk` (או כל שם שתרצה)
   - **Mount Path**: `/opt/render/uploads` (זה הנתיב בתוך השרת)
   - **Size**: 10GB (או כמה שאתה צריך)

3. **הוסף משתנה סביבה:**
   - לך ל-**Environment** → **Environment Variables**
   - הוסף:
     ```
     UPLOADS_PATH=/opt/render/uploads
     ```

4. **Redeploy:**
   - השרת יתחיל מחדש וישתמש ב-Persistent Disk

#### ✅ יתרונות:
- ✅ פשוט להגדיר
- ✅ התמונות נשמרות גם אחרי restart/redeploy
- ✅ זול יחסית (כ-$0.25/GB/חודש)
- ✅ אין צורך לשנות קוד

---

### **אפשרות 2: Cloud Storage (AWS S3 / Google Cloud Storage)**

אם תרצה פתרון יותר מקצועי, אפשר להשתמש ב-Cloud Storage.

#### איך להגדיר:

1. **צור S3 Bucket** (אם משתמש ב-AWS):
   - לך ל-AWS Console → S3
   - צור Bucket חדש
   - קבל Access Key ו-Secret Key

2. **הוסף משתני סביבה ב-Render:**
   ```
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   ```

3. **התקן חבילה:**
   ```bash
   npm install aws-sdk multer-s3
   ```

4. **שנה את הקוד** להשתמש ב-S3 במקום local storage

#### ✅ יתרונות:
- ✅ יותר מקצועי
- ✅ גיבוי אוטומטי
- ✅ CDN אפשרי
- ✅ לא תלוי בשרת

#### ❌ חסרונות:
- ❌ יותר מורכב להגדיר
- ❌ צריך לשנות קוד
- ❌ עלות נוספת

---

## 🎯 המלצה:

**להתחלה - השתמש ב-Persistent Disk (אפשרות 1)** - זה הכי פשוט וזה יעבוד מיד!

אם תרצה, אני יכול לעזור לך להגדיר את זה.

---

## 📝 סיכום מה לעשות:

### **עם Persistent Disk:**
1. ✅ צור Persistent Disk ב-Render
2. ✅ הגדר `UPLOADS_PATH=/opt/render/uploads` במשתני סביבה
3. ✅ Redeploy
4. ✅ **זהו!** התמונות יישמרו באופן קבוע

### **בלי Persistent Disk:**
❌ התמונות **יאבדו** בכל restart/redeploy!

---

## 🔍 איך לבדוק שזה עובד:

1. העלה תמונה
2. בדוק שהיא נגישה: `https://your-domain.com/uploads/filename.jpg`
3. עשה restart לשרת
4. בדוק שוב - התמונה עדיין צריכה להיות שם!

---

## 💡 טיפים:

- **גיבוי**: גם עם Persistent Disk, מומלץ לגבות את התמונות
- **גודל**: התמונות מוגבלות ל-5MB (ניתן לשנות)
- **ניקוי**: מומלץ לנקות תמונות ישנות מדי פעם

