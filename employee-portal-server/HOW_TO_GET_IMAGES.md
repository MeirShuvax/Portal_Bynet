# 📥 איך למשוך תמונות מה-Git Repository

## ⚠️ חשוב לדעת:

**תמונות לא נשמרות ב-Git!** 

התמונות נשמרות ב-`uploads/` directory, וזה **מוזנח** ב-`.gitignore` כי:
- תמונות הן קבצים גדולים
- Git לא מיועד לקבצים גדולים
- כל תמונה חדשה = commit גדול

---

## 📍 איפה התמונות נמצאות:

### **בפיתוח (Development):**
```
employee-portal-server/uploads/
```

### **בפרודקשן (Production - Render):**
```
/opt/render/uploads/  (על Persistent Disk)
```

---

## 🔄 איך למשוך תמונות:

### **אפשרות 1: מהשרת בפרודקשן (מומלץ)**

אם אתה רוצה להוריד תמונות מהשרת בפרודקשן:

1. **דרך API:**
   ```bash
   # קבל רשימת תמונות
   curl https://portal.bynetdcs.co.il/api/system-contents/images
   
   # הורד תמונה ספציפית
   curl https://portal.bynetdcs.co.il/uploads/filename.jpg -o filename.jpg
   ```

2. **דרך Render Dashboard:**
   - לך ל-**Shell** ב-Render
   - הפעל:
     ```bash
     cd /opt/render/uploads
     ls -la
     # העתק קבצים דרך SFTP או דרך Render Shell
     ```

### **אפשרות 2: מהמקומי (אם יש לך)**

אם יש לך את התמונות במחשב המקומי:

```bash
# העתק מהמקומי
cd employee-portal-server
cp -r uploads/ /path/to/destination/
```

### **אפשרות 3: מ-Database (רק נתיבים)**

הנתיבים של התמונות נשמרים ב-Database:

```sql
-- תמונות פרופיל
SELECT id, full_name, profile_image FROM users WHERE profile_image IS NOT NULL;

-- תמונות מערכת (PhotoOfWeek)
SELECT id, title, url FROM system_contents WHERE type = 'image';
```

---

## 🚀 איך להעלות תמונות לפרודקשן:

### **דרך האפליקציה:**
1. התחבר לאפליקציה
2. העלה תמונות דרך הממשק
3. התמונות יישמרו אוטומטית ב-Persistent Disk

### **דרך API:**
```bash
# העלה תמונה
curl -X POST https://portal.bynetdcs.co.il/api/system-contents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "title=תמונת השבוע" \
  -F "description=תיאור"
```

---

## 📋 סיכום:

1. **תמונות לא ב-Git** - הן ב-`uploads/` directory
2. **בפיתוח**: `employee-portal-server/uploads/`
3. **בפרודקשן**: `/opt/render/uploads/` (על Persistent Disk)
4. **למשוך**: דרך API או Render Shell
5. **להעלות**: דרך האפליקציה או API

---

## 💡 טיפים:

- **גיבוי**: מומלץ לגבות את תיקיית `uploads/` באופן קבוע
- **גודל**: התמונות מוגבלות ל-5MB
- **פורמטים**: רק תמונות (`image/*`) מתקבלות

---

**אם אתה צריך עזרה ספציפית, תגיד לי מה בדיוק אתה רוצה לעשות!** 🎯

