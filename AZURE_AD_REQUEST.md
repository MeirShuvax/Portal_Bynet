# בקשה לעדכון Azure AD - Redirect URIs

## נושא הבקשה
הוספת Redirect URI חדש ל-Azure Active Directory Application עבור פורטל העובדים.

## פרטי האפליקציה
- **Application ID (Client ID):** `18d62b55-f089-48a6-a467-789ba2f4d75d`
- **Application Name:** [שם האפליקציה - תוכל להחליף]
- **Tenant ID:** `b5f3202f-73b3-40a8-a61e-596ab18836ea`

## מה צריך להוסיף

### Redirect URIs חדשים להוספה:

בתפריט **Azure Portal → Azure Active Directory → App registrations → [שם האפליקציה] → Authentication → Redirect URIs**, יש להוסיף:

```
https://employee-portal-td9r.onrender.com
```

**הסבר:** 
הפורטל מוגש כעת גם מ-Cloud (Render), ולא רק מ-localhost. Microsoft MSAL מחזיר את המשתמש לאותו URL שממנו התחילה ההתחברות (`window.location.origin`), אז מספיק URL אחד - השורש של האתר.

### Redirect URIs קיימים (לשמור):
```
http://localhost:3000
```
(להותיר לפיתוח מקומי)

---

## הוראות מפורטות

### שלבים ב-Azure Portal:

1. **כניסה ל-Azure Portal**
   - לך ל: https://portal.azure.com
   - נווט ל: **Azure Active Directory**

2. **מציאת האפליקציה**
   - לחץ על **App registrations**
   - חפש את האפליקציה עם Client ID: `18d62b55-f089-48a6-a467-789ba2f4d75d`
   - לחץ על האפליקציה

3. **עדכון Redirect URIs**
   - בתפריט השמאלי, לחץ על **Authentication**
   - בחלק **Redirect URIs**, לחץ על **Add URI** או **+ Add a platform**
   - בחר **Single-page application (SPA)** או **Web**
   - הוסף:
     - `https://employee-portal-td9r.onrender.com`
     - `https://employee-portal-td9r.onrender.com/auth/microsoft/callback`
   - לחץ על **Save**

4. **וידוא**
   - ודא שהרשימה כוללת:
     - ✅ `http://localhost:3000` (קיים)
     - ✅ `https://employee-portal-td9r.onrender.com` (חדש)
     - ✅ `https://employee-portal-td9r.onrender.com/auth/microsoft/callback` (חדש)

---

## פרטים נוספים

- **Platform Type:** Single-page application (SPA) או Web
- **Implicit grant and hybrid flows:** 
  - ✅ Access tokens (if needed)
  - ✅ ID tokens (usually needed)
- **Supported account types:** כפי שכבר מוגדר

---

## הערות חשובות

1. **אין צורך לשנות את ה-Client ID או Client Secret** - רק להוסיף URIs חדשים
2. **לשמור את כל ה-URIs הקיימים** - אל למחוק את `http://localhost:3000`
3. **לאחר הוספה**, יש להמתין 1-2 דקות עד שהשינויים ייכנסו לתוקף
4. **אם בעתיד תוסף Custom Domain**, יהיה צורך להוסיף גם אותו

---

## אישור

לאחר ביצוע, אנא אשר שהשינויים בוצעו והם פעילים.

תודה!

---

## קישורים שימושיים

- [תיעוד Microsoft - Redirect URI](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-modify-supported-accounts)
- [Azure Portal - App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps)

