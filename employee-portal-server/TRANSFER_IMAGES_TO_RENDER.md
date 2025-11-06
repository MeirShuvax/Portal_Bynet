# 📤 מדריך העברת תמונות ל-Render Persistent Disk

## 🎯 איך להעביר תמונות מהמקומי ל-Render:

לפי [המסמך של Render](https://render.com/docs/disks), יש 2 דרכים להעביר קבצים:

---

## **אפשרות 1: SCP (מומלץ - הכי פשוט)**

### **שלב 1: הכן את התמונות**

1. אסוף את כל התמונות שתרצה להעביר
2. שמור אותן בתיקייה אחת (למשל: `images-to-upload/`)

### **שלב 2: קבל את פרטי ה-SSH**

1. לך ל-**Render Dashboard** → השרת שלך → **SSH** (או **Shell**)
2. תראה משהו כמו:
   ```
   ssh YOUR_SERVICE@ssh.YOUR_REGION.render.com
   ```

### **שלב 3: העלה את התמונות**

**ב-PowerShell (Windows):**

```powershell
# העתק תיקייה שלמה
scp -s -r "C:\path\to\images-to-upload\*" YOUR_SERVICE@ssh.YOUR_REGION.render.com:/opt/render/uploads/

# או העתק קובץ בודד
scp -s "C:\path\to\image.jpg" YOUR_SERVICE@ssh.YOUR_REGION.render.com:/opt/render/uploads/
```

**ב-Linux/Mac:**

```bash
# העתק תיקייה שלמה
scp -s -r /path/to/images-to-upload/* YOUR_SERVICE@ssh.YOUR_REGION.render.com:/opt/render/uploads/

# או העתק קובץ בודד
scp -s /path/to/image.jpg YOUR_SERVICE@ssh.YOUR_REGION.render.com:/opt/render/uploads/
```

**הערות:**
- `-s` = משתמש ב-SFTP (מומלץ)
- `-r` = העתק תיקייה רקורסיבית
- `/opt/render/uploads/` = הנתיב של ה-Persistent Disk שלך

---

## **אפשרות 2: Magic-Wormhole**

### **שלב 1: התקן Magic-Wormhole**

**ב-Windows:**
```powershell
pip install magic-wormhole
```

**ב-Linux/Mac:**
```bash
pip install magic-wormhole
```

### **שלב 2: העלה מהשרת**

1. לך ל-**Render Dashboard** → השרת שלך → **Shell**
2. הפעל:
   ```bash
   cd /opt/render/uploads
   wormhole send /path/to/image.jpg
   ```
3. תקבל קוד (למשל: `4-forever-regain`)
4. **ב-Machine המקומי שלך**, הפעל:
   ```bash
   wormhole receive
   ```
5. הזן את הקוד שקיבלת
6. הקובץ יועתק

---

## **אפשרות 3: דרך הממשק (הכי נוח!)**

**אין ממשק web ב-Render להעברת קבצים**, אבל יש לך **ממשק באפליקציה שלך!**

1. התחבר לאפליקציה כ-**admin**
2. לך ל-**הגדרות למנהל** (ב-Sidebar)
3. העלה תמונות דרך הטופס

**זה הכי פשוט!** ✅

---

## 🔍 למה אני לא רואה את "הגדרות למנהל"?

### **בדוק את ה-Role שלך:**

1. **פתח DevTools** (F12) → Console
2. הפעל:
   ```javascript
   const user = JSON.parse(localStorage.getItem('userData'));
   console.log('User role:', user?.role);
   ```

3. **אם ה-role הוא `'admin'`** → הקישור אמור להופיע
4. **אם ה-role הוא `'viewer'` או `'editor'`** → הקישור לא יופיע (זה תקין!)

### **איך להפוך למנהל:**

1. **ב-Database:**
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

2. **או דרך API** (אם יש לך admin אחר):
   - צריך endpoint לעדכון role

---

## 📋 סיכום:

### **להעברת תמונות:**

1. **דרך הממשק** (מומלץ) - התחבר כ-admin והעלה דרך האפליקציה
2. **דרך SCP** - אם יש לך הרבה תמונות
3. **דרך Magic-Wormhole** - אם SCP לא עובד

### **להצגת הקישור:**

- הקישור "הגדרות למנהל" מופיע רק אם `user.role === 'admin'`
- בדוק את ה-role שלך ב-localStorage או ב-Database

---

## 💡 טיפים:

- **גיבוי**: Render יוצר snapshot אוטומטי כל 24 שעות
- **גודל**: התמונות מוגבלות ל-5MB
- **נתיב**: `/opt/render/uploads/` (או מה שהגדרת ב-`UPLOADS_PATH`)

---

**אם תרצה, אני יכול לעזור לך לבדוק את ה-role שלך או להעביר תמונות!** 🚀

