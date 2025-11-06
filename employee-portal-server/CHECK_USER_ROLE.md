# 🔍 איך לבדוק ולשנות את ה-Role שלך

## למה אני לא רואה "הגדרות למנהל"?

הקישור מופיע **רק למנהלים** (`role === 'admin'`).

---

## איך לבדוק את ה-Role שלך:

### **דרך 1: DevTools (הכי פשוט)**

1. פתח **DevTools** (F12)
2. לך ל-**Console**
3. הפעל:
   ```javascript
   // בדוק מה יש ב-localStorage
   const userData = localStorage.getItem('userData');
   console.log('User Data:', userData);
   
   // אם יש, פרסר
   if (userData) {
     const user = JSON.parse(userData);
     console.log('Role:', user.role);
     console.log('Email:', user.email);
   }
   ```

### **דרך 2: דרך API**

פתח **DevTools** → **Network** → מצא request ל-`/api/users/me` → בדוק את ה-response

---

## איך להפוך למנהל:

### **דרך 1: ב-Database (ישירות)**

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### **דרך 2: דרך Script**

צור קובץ `make-admin.js`:

```javascript
const { User } = require('./models');
const db = require('./models');

async function makeAdmin() {
  try {
    await db.sequelize.authenticate();
    
    const email = 'your-email@example.com'; // החלף באימייל שלך
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    await user.update({ role: 'admin' });
    console.log('✅ User is now admin:', email);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeAdmin();
```

הרץ:
```bash
node make-admin.js
```

### **דרך 3: דרך Admin אחר**

אם יש לך admin אחר, הוא יכול לעדכן את ה-role דרך הממשק (אם יש).

---

## אחרי ששינית את ה-Role:

1. **התנתק והתחבר מחדש** (או רענן את הדף)
2. הקישור "הגדרות למנהל" אמור להופיע

---

## איך לגשת ישירות לדף (אם אתה admin):

אם אתה admin אבל הקישור לא מופיע, תוכל לגשת ישירות:
```
https://portal.bynetdcs.co.il/upload-images
```

אבל **הדף יבדוק הרשאות** - אם אתה לא admin, תראה הודעת שגיאה.

---

**אם תרצה, אני יכול ליצור לך script להפוך למנהל!** 🚀

