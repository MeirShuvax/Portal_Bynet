# Employee Portal

פורטל עובדים - מערכת ניהול עובדים עם מבנה ארגוני, ברכות, כבודים, AI צ'אט ועוד.

## 📁 מבנה הפרויקט

```
portal/
├── employee-portal-client/    ← React Client (לבסוף: client/)
├── employee-portal-server/    ← Node.js Server (לבסוף: server/)
└── .gitignore
```

## 🚀 איך להריץ את האתר מקומית

### אפשרות 1: פיתוח (Development Mode) - מומלץ לפיתוח

**שלב 1: הפעלת השרת**
```bash
# פתח טרמינל ראשון
cd employee-portal-server

# התקן dependencies (בפעם הראשונה בלבד)
npm install

# הפעל את השרת
npm start
```
השרת ירוץ על: `http://localhost:5000`

**שלב 2: הפעלת הלקוח**
```bash
# פתח טרמינל שני
cd employee-portal-client

# התקן dependencies (בפעם הראשונה בלבד)
npm install

# הפעל את הלקוח
npm start
```
הלקוח ירוץ על: `http://localhost:3000`

הלקוח יתחבר אוטומטית לשרת דרך `API_BASE_URL` (מוגדר ב-`src/constants.js`).

---

### אפשרות 2: פרודקשן (Production Mode) - השרת מגיש את הלקוח

**שלב 1: בניית הלקוח**
```bash
cd employee-portal-client
npm install
npm run build
```
זה יוצר תיקיית `build/` עם הקבצים הסטטיים.

**שלב 2: העברת ה-build לשרת (אם המבנה עוד לא הועבר)**
```bash
# אם עדיין לא העברת את התיקיות למבנה החדש:
# copy employee-portal-client/build/* to employee-portal-server/../client/build/
```

**שלב 3: הפעלת השרת**
```bash
cd employee-portal-server
npm install
npm start
```
השרת ירוץ על: `http://localhost:5000` ויגיש גם את הלקוח והשרת מאותו פורט.

---

## ⚙️ הגדרות סביבה

### שרת (employee-portal-server/config.env)
```env
PORT=5000
DB_HOST=localhost
DB_NAME=employee_portal
DB_USER=root
DB_PASSWORD=your_password

# Microsoft Azure AD
MICROSOFT_CLIENT_ID=...
MICROSOFT_TENANT_ID=...
MICROSOFT_CLIENT_SECRET=...

# JWT
JWT_SECRET=your_jwt_secret_key

# OpenAI
OPENAI_API_KEY=...
ASSISTANT_MAIN=...
```

### לקוח (employee-portal-client)
הקובץ `src/constants.js` מכיל את `API_BASE_URL`:
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

לתצורת פרודקשן, צור `.env` בתיקיית הלקוח:
```env
REACT_APP_API_URL=http://your-production-server.com
```

---

## 📝 פקודות שימושיות

### שרת
```bash
cd employee-portal-server

# הרצת השרת
npm start

# הרצה עם אוטו-ריסטרט (nodemon)
npm run dev

# הרצת מיגרציות
npm run migrate
```

### לקוח
```bash
cd employee-portal-client

# הרצת בשרת פיתוח
npm start

# בניית לפרודקשן
npm run build

# הרצת טסטים
npm test
```

---

## 🔍 פתרון בעיות

### "Failed to fetch"
- ודא שהשרת רץ על פורט 5000
- בדוק ש-`API_BASE_URL` ב-`constants.js` מצביע לפורט הנכון
- ודא שה-CORS מופעל בשרת (כבר מוגדר)

### השרת לא מתחיל
- ודא ש-MySQL רץ
- בדוק את `config.env` שיש את כל ההגדרות
- ודא שפורט 5000 פנוי

### הלקוח לא מתחבר לשרת
- ודא שהשרת רץ
- בדוק ב-Console של הדפדפן אם יש שגיאות CORS
- ודא ש-`REACT_APP_API_URL` לא מוגדר ב-`.env` (או שהוא מוגדר נכון)

---

## 🗂️ מסד נתונים

השרת משתמש ב-Sequelize עם MySQL. מיגרציות נמצאות ב-`employee-portal-server/migrations/`.

להרצת מיגרציות:
```bash
cd employee-portal-server
npm run migrate
```

---

## 📦 Deploy

לפני deploy:
1. בנה את הלקוח: `cd employee-portal-client && npm run build`
2. ודא שה-`.gitignore` מתעלם מ-`config.env`, `node_modules/`, `uploads/`
3. הגדר משתני סביבה בשרת הפרודקשן

---

## 🔐 אימות (Authentication)

במצב פיתוח, יש אפשרות לעקוף אימות (מוגדר ב-`server/index.js` עם `USE_AUTH = false`).

**אזהרה:** וודא שבפרודקשן `USE_AUTH = true`!

