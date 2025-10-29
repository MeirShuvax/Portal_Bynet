# 🚀 הגדרות Deploy ל-Render

## ⚙️ הגדרות Render - לפי המבנה הנוכחי שלך

### עבור Web Service (השרת):

```
Root Directory: employee-portal-server
Build Command: cd ../employee-portal-client && npm install && npm run build && cd ../employee-portal-server && npm install
Start Command: node index.js
Environment: Node
```

---

## 📝 הסבר:

**Root Directory:** `employee-portal-server`
- כי `index.js` שלך נמצא בתיקייה הזו

**Build Command:**
```bash
cd ../employee-portal-client && npm install && npm run build && cd ../employee-portal-server && npm install
```
- עובר ל-`employee-portal-client`
- מתקין dependencies
- בונה את הלקוח (יוצר `build/`)
- חוזר ל-`employee-portal-server`
- מתקין dependencies של השרת

**Start Command:** `node index.js`
- מפעיל את השרת
- השרת יזהה את ה-build ב-`../employee-portal-client/build` אוטומטית

**PORT:**
- Render יקבע אוטומטית `process.env.PORT`
- הקוד שלך כבר משתמש ב: `const PORT = process.env.PORT || 5000`
- ✅ הכל אמור לעבוד!

---

## 🔐 משתני סביבה (Environment Variables)

במסך ה-Environment Variables ב-Render, הוסף:

```
PORT=5000
NODE_ENV=production

# Database
DB_HOST=your_db_host
DB_NAME=employee_portal
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Microsoft Azure AD
MICROSOFT_CLIENT_ID=...
MICROSOFT_TENANT_ID=...
MICROSOFT_CLIENT_SECRET=...

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_this

# OpenAI
OPENAI_API_KEY=...
ASSISTANT_MAIN=...

# Allowed emails
ALLOWED_EMAILS=email1@example.com,email2@example.com
```

**⚠️ חשוב:** העתק את כל הערכים מ-`employee-portal-server/config.env` שלך

---

## ✅ מה Render יעשה:

1. ✅ יבנה את הלקוח (`npm run build` ב-`employee-portal-client`)
2. ✅ יתקין dependencies של השרת
3. ✅ יריץ את `index.js`
4. ✅ השרת יזהה את ה-build ויגיש את הלקוח
5. ✅ הכל יעבוד על פורט אחד!

---

## 🎯 אם תרצה להעביר למבנה חדש (client/server):

אחרי שתעביר את הקבצים, ההגדרות יהיו:
```
Root Directory: server
Build Command: cd ../client && npm install && npm run build && cd ../server && npm install
Start Command: node index.js
```

---

## 📌 סיכום:

**עבור המבנה הנוכחי שלך - ההגדרות הנכונות:**
```
Root Directory: employee-portal-server
Build Command: cd ../employee-portal-client && npm install && npm run build && cd ../employee-portal-server && npm install
Start Command: node index.js
```

✅ זה אמור לעבוד מושלם!

