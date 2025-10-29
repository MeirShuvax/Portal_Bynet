# 🚀 הוראות Setup ל-Render עם render.yaml

## 📋 מה זה `render.yaml`?

קובץ `render.yaml` הוא Blueprint Configuration ש-Render מזהה אוטומטית ומגדיר את כל השירותים לפי הקובץ הזה.

## ✅ יתרונות:

- ✅ לא צריך להגדיר כלום ידנית ב-Render Dashboard
- ✅ כל ההגדרות בקובץ אחד
- ✅ קל לשתף ועדכון
- ✅ Version Control - כל השינויים ב-Git

---

## 🔧 איך להשתמש:

### שלב 1: הוסף את `render.yaml` ל-Git

```bash
git add render.yaml
git commit -m "Add Render deployment configuration"
git push
```

### שלב 2: ב-Render Dashboard:

1. **New + → Blueprint**
2. **Connect to GitHub repository**
3. Render יזהה את `render.yaml` אוטומטית
4. **הוסף Environment Variables:**
   - עבור לכל משתנה עם `sync: false`
   - העתק את הערכים מ-`employee-portal-server/config.env`

### שלב 3: Render עושה את השאר!

- ✅ בונה את הלקוח
- ✅ מתקין dependencies
- ✅ מגדיר את השרת
- ✅ מריץ את הכל

---

## ⚙️ משתני סביבה שצריך להגדיר:

ב-Render Dashboard, תחת **Environment**, הוסף:

```
DB_HOST=your_db_host
DB_NAME=employee_portal
DB_USER=your_db_user
DB_PASSWORD=your_db_password

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_TENANT_ID=your-microsoft-tenant-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

ALLOWED_EMAILS=email1@example.com,email2@example.com,email3@example.com

OPENAI_API_KEY=sk-proj-...
ASSISTANT_MAIN=asst_...
```

**⚠️ חשוב:** העתק את כל הערכים מ-`employee-portal-server/config.env` שלך!

**📄 Template:** ראה `.env.example` לדוגמה של כל המשתנים הנדרשים.

---

## 🗄️ Database Setup:

Render מספק MySQL כשירות נוסף. אפשר:

1. **ליצור MySQL Database חדש ב-Render:**
   - New + → PostgreSQL/MySQL
   - העתק את ה-Connection String
   - העתק את הפרטים ל-Environment Variables

2. **או להשתמש ב-Database חיצוני:**
   - פשוט הגדר את ה-Environment Variables עם הפרטים

**⚠️ אחרי יצירת ה-Database:**
- הרץ מיגרציות בפעם הראשונה
- או העתק את המבנה מה-Database המקומי שלך

---

## 📝 שינויים אפשריים:

### אם תרצה לשנות את התוכנית:
```yaml
plan: starter  # או 'standard', 'pro'
```

### אם תרצה לשנות Region:
```yaml
region: frankfurt  # או 'oregon', 'singapore' וכו'
```

### אם תרצה Health Check:
```yaml
healthCheckPath: /api/health
```
(ואז צריך להוסיף route ל-`/api/health` בשרת)

---

## ✅ אחרי ה-Deploy:

1. ✅ השרת ירוץ על `https://your-app.onrender.com`
2. ✅ הלקוח יוגש אוטומטית מהשרת
3. ✅ הכל יעבוד על פורט אחד!

---

## 🐛 Troubleshooting:

### אם Build נכשל:
- בדוק את ה-Logs ב-Render
- ודא ש-`node_modules/` לא ב-.gitignore (או ש-Render מתקין)

### אם השרת לא מתחיל:
- בדוק שכל Environment Variables מוגדרות
- ודא שה-Database מחובר

### אם הלקוח לא מוגש:
- בדוק שה-Build הצליח (צריך להיות `build/` ב-`employee-portal-client`)
- בדוק את ה-Logs של השרת

---

## 📌 סיכום:

✅ **קובץ `render.yaml` מוכן!**

1. העלה ל-GitHub
2. ב-Render → New Blueprint
3. הוסף Environment Variables
4. Render עושה את השאר!

**זה הכל! 🎉**

