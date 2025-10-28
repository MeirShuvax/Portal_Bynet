const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './config.env' });
const mysql = require('mysql2/promise');
const sequelize = require('./config/database');
const path = require('path');
const { Op } = require('sequelize');


console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);

// ייבוא כל המודלים דרך ה-loader
const db = require('./models');
const User = db.User;
const Wish = db.Wish;
const HonorsType = db.HonorsType;
const Honors = db.Honors;
const Chat = db.Chat;
const AISession = db.AISession; // החזרתי למצב יציב
// אם יש Update:
const Update = db.Update;
const SystemContent = db.SystemContent;

// Routes
const userRoutes = require('./routes/users.routes');
const wishesRoutes = require('./routes/wishes.routes');
const honorsRoutes = require('./routes/honors.routes');
const honorsTypeRoutes = require('./routes/honors_type.routes');
const chatRoutes = require('./routes/chat.routes');
const aiRoutes = require('./routes/ai.routes'); // החזרתי למצב יציב
const updatesRoutes = require('./routes/updates.routes');
const systemContentRoutes = require('./routes/system_content.routes');
const filesRoutes = require('./routes/files.routes');

const { authenticate } = require('./middlewares/auth.middleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.set('io', io); // נותן גישה ל־io בכל ה־req

// שרת קבצים סטטיים מהתיקיה uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

// =======================
// 🌐 Middlewares
// =======================
app.use(cors());
app.use(bodyParser.json());
// הוספת ה-middleware רק אחרי שהשרת התחבר למסד הנתונים

// =======================
// 🔗 Model Associations
// =======================

// 🎉 Wishes
Wish.belongsTo(User, { foreignKey: 'from_user_id', as: 'fromUser' });
Wish.belongsTo(Honors, { foreignKey: 'honor_id', as: 'honor' });

User.hasMany(Wish, { foreignKey: 'from_user_id', as: 'wishesSent' });
Honors.hasMany(Wish, { foreignKey: 'honor_id', as: 'wishes' });

// 🏆 Honors
Honors.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Honors.belongsTo(HonorsType, { foreignKey: 'honors_type_id', as: 'honorsType' });

User.hasMany(Honors, { foreignKey: 'user_id', as: 'honors' });
HonorsType.hasMany(Honors, { foreignKey: 'honors_type_id', as: 'honors' });

// 💬 Chat
Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Chat.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

User.hasMany(Chat, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Chat, { foreignKey: 'recipient_id', as: 'receivedMessages' });

// 🤖 AI Sessions
AISession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(AISession, { foreignKey: 'user_id', as: 'aiSessions' });

// =======================
// ⚙️ Initialization
// =======================

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  console.log(`✅ Database '${process.env.DB_NAME}' is ready.`);
  await connection.end();
}

async function syncModelsSafely() {
  try {
    // סנכרון המודלים קודם
    await sequelize.sync();
    console.log('✅ All tables synced');
  } catch (error) {
    console.error('❌ Error syncing models:', error);
  }
}

async function insertInitialData() {
  const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });

  if (!adminExists) {
    await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'admin',
      birth_date: '1990-01-01'
    });
    console.log('✅ Initial admin user created.');
  } else {
    console.log('ℹ️ Admin user already exists, skipping creation.');
  }
}

// פונקציה להוספת קישורים חשובים
async function insertImportantLinks() {
  const SystemContent = db.SystemContent;
  
  const importantLinks = [
    {
      type: 'link',
      url: 'https://app.meckano.co.il/login.php#login',
      title: 'מעקנו - מערכת נוכחות',
      description: 'מערכת נוכחות ושעות עבודה - דיווח וניהול שעות עבודה במערכת נוכחות מנצחת'
    },
    {
      type: 'link',
      url: 'https://bynetdcs.co.il',
      title: 'אתר החברה - בינת דאטה סנטרס',
      description: 'אתר החברה הרשמי של בינת דאטה סנטרס - מידע על החברה, שירותים ומוצרים'
    },
    {
      type: 'link',
      url: 'https://bynetdcs.monday.com/',
      title: 'Monday - ניהול פרויקטים',
      description: 'פלטפורמת ניהול פרויקטים וצוותים - מעקב אחר משימות ופרויקטים'
    },
    {
      type: 'link',
      url: 'https://login.microsoftonline.com/b5f3202f-73b3-40a8-a61e-596ab18836ea/oauth2/authorize?client%5Fid=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&response%5Fmode=form%5Fpost&response%5Ftype=code%20id%5Ftoken&resource=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&scope=openid&nonce=6DD5C4A3C76F105265C9706F2A701C924057A330748A881E%2D9071BC5D938B8A7CBFAFA472A41D23B237A453160DB2F500A4763D085FD83265&redirect%5Furi=https%3A%2F%2Fbynet1%2Esharepoint%2Ecom%2F%5Fforms%2Fdefault%2Easpx&state=OD0w&claims=%7B%22id%5Ftoken%22%3A%7B%22xms%5Fcc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&wsucxt=1&cobrandid=11bd8083%2D87e0%2D41b5%2Dbb78%2D0bc43c8a8e8a&client%2Drequest%2Did=bff5c5a1%2Df069%2Dd000%2Df5ad%2D749c34dd187d',
      title: 'פורטל בינת תקשורת - SharePoint',
      description: 'פורטל העובדים של בינת תקשורת - גישה למערכות פנימיות, מסמכים ומידע ארגוני'
    },
    {
      type: 'link',
      url: 'https://m365.cloud.microsoft/search/people?auth=2&tenantId=b5f3202f-73b3-40a8-a61e-596ab18836ea',
      title: 'אנשי קשר Microsoft 365',
      description: 'גישה לדף אנשי הקשר של Microsoft 365 - חיפוש ופרטי קשר של כל העובדים בחברה'
    }
  ];

  for (const linkData of importantLinks) {
    try {
      const existingLink = await SystemContent.findOne({ 
        where: { 
          url: linkData.url,
          type: 'link'
        } 
      });
      
      if (!existingLink) {
        await SystemContent.create(linkData);
        console.log(`✅ Important link created: ${linkData.title}`);
      } else {
        console.log(`ℹ️ Important link already exists: ${linkData.title}`);
      }
    } catch (error) {
      console.error(`❌ Error with link ${linkData.title}:`, error.message);
      // Continue with next link
    }
  }
}

// פונקציה להוספת משתמשי Microsoft
async function insertMicrosoftUsers() {
  const microsoftUsers = [
    {
      full_name: 'Meir Shuvax',
      email: 'Meir.Shuvax@bynetdcs.co.il',
      password: 'N/A', // Microsoft users don't need password
      role: 'admin',
      birth_date: null,
      manager_id: null
    },
    {
      full_name: 'Meir Shalom',
      email: 'meirs@bynet.co.il',
      password: 'N/A', // Microsoft users don't need password
      role: 'admin',
      birth_date: null,
      manager_id: null
    },
    {
      full_name: 'David Cholli',
      email: 'David.Cholli@bynetdcs.co.il',
      password: 'N/A', // Microsoft users don't need password
      role: 'admin',
      birth_date: null,
      manager_id: null
    },
    {
      full_name: 'Avi Zaafrani',
      email: 'Avi.Zaafrani@bynetdcs.co.il',
      password: 'N/A', // Microsoft users don't need password
      role: 'admin',
      birth_date: null,
      manager_id: null
    }
  ];

  for (const userData of microsoftUsers) {
    try {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Microsoft user created: ${userData.email}`);
      } else {
        // עדכן את המשתמש הקיים להיות admin
        if (existingUser.role !== 'admin') {
          await existingUser.update({ role: 'admin' });
          console.log(`✅ Updated user to admin: ${userData.email}`);
        } else {
          console.log(`ℹ️ Microsoft user already exists as admin: ${userData.email}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error with user ${userData.email}:`, error.message);
      // Continue with next user
    }
  }
}

async function createChatTable() {
  try {
    // await Chat.sync({ force: false }); // force: false אומר שלא למחוק את הטבלה אם היא קיימת
    console.log('✅ טבלת הצ\'אט נוצרה בהצלחה');
  } catch (error) {
    console.error('❌ שגיאה ביצירת טבלת הצ\'אט:', error);
  }
}

// פונקציה לעדכון העובדים הקיימים עם manager_id
async function updateExistingEmployeesWithManager() {
  try {
    console.log('🔄 עדכון עובדים קיימים עם manager_id...');
    
    // מצא את כל העובדים שלא יש להם manager_id (חוץ ממנהלים)
    const employeesWithoutManager = await User.findAll({
      where: {
        manager_id: null,
        role: { [Op.ne]: 'admin' }
      }
    });

    if (employeesWithoutManager.length === 0) {
      console.log('✅ כל העובדים כבר יש להם manager_id');
      return;
    }

    // מצא מנהל ראשי
    const mainAdmin = await User.findOne({
      where: { role: 'admin' }
    });

    if (!mainAdmin) {
      console.log('⚠️ לא נמצא מנהל ראשי, יצירת אחד...');
      const newAdmin = await User.create({
        full_name: 'מנהל ראשי',
        email: 'main-admin@bynet.com',
        password: '123456',
        role: 'admin',
        birth_date: '1980-01-01'
      });
      console.log('✅ מנהל ראשי נוצר:', newAdmin.full_name);
    }

    // עדכן את כל העובדים עם manager_id
    const admin = mainAdmin || await User.findOne({ where: { role: 'admin' } });
    
    for (const employee of employeesWithoutManager) {
      await employee.update({ manager_id: admin.id });
      console.log(`✅ עדכון ${employee.full_name} תחת ${admin.full_name}`);
    }

    console.log(`✅ עדכון ${employeesWithoutManager.length} עובדים הושלם בהצלחה`);
  } catch (error) {
    console.error('❌ שגיאה בעדכון עובדים:', error);
  }
}

// =======================
// 🚀 Server Start
// =======================

createDatabaseIfNotExists()
  .then(() => sequelize.authenticate())
  .then(() => {
    console.log('✅ Connection to the database has been established successfully.');
  })
  .then(() => syncModelsSafely()) // קודם סנכרון המודלים
  .then(() => insertInitialData()) // אחר כך הוספת יוזר אדמין
  .then(() => insertMicrosoftUsers()) // הוספת משתמשי Microsoft
  .then(() => insertImportantLinks()) // הוספת קישורים חשובים
  .then(() => updateExistingEmployeesWithManager()) // עדכון עובדים קיימים עם manager_id
  .then(() => {
    console.log('✅ Server setup completed successfully');
  })
  .catch(err => {
    console.error('❌ Error during setup:', err);
  });


// =======================
// 🌐 Routes
// =======================

// ========================
// ⚠️ TEMPORARY AUTH BYPASS FOR DEVELOPMENT
// ========================
// Create a mock authenticate middleware that allows all requests
const bypassAuth = (req, res, next) => {
  // Set a mock user for development
  req.user = {
    id: 1,
    email: 'test@bynet.co.il',
    name: 'Test User',
    role: 'admin',
    microsoftId: 'test-123'
  };
  console.log('⚠️ Auth bypassed - Development mode');
  next();
};

// Use bypass auth for all routes in development
const USE_AUTH = false; // Set to false to bypass auth

app.use('/api/auth', require('./routes/auth.routes')); // Auth routes (no middleware needed)
app.use('/api/users', USE_AUTH ? authenticate : bypassAuth, require('./routes/users.routes'));
app.use('/api', USE_AUTH ? authenticate : bypassAuth, require('./routes/chartImage.routes'));
app.use('/api/wishes', USE_AUTH ? authenticate : bypassAuth, wishesRoutes);
app.use('/api/honors-types', USE_AUTH ? authenticate : bypassAuth, honorsTypeRoutes);
app.use('/api/honors', USE_AUTH ? authenticate : bypassAuth, honorsRoutes);
app.use('/api/chat', USE_AUTH ? authenticate : bypassAuth, chatRoutes);
app.use('/api/ai', USE_AUTH ? authenticate : bypassAuth, aiRoutes);
app.use('/api/updates', USE_AUTH ? authenticate : bypassAuth, updatesRoutes);
app.use('/api/system-contents', USE_AUTH ? authenticate : bypassAuth, systemContentRoutes);
app.use('/api/files', USE_AUTH ? authenticate : bypassAuth, filesRoutes);


// =======================
// 🔌 WebSocket Events
// =======================
io.on('connection', (socket) => {
  console.log('🔌 User connected to chat');

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// =======================
// 📦 Serve React Client (Production)
// =======================
const fs = require('fs');
// Check both possible build locations (old structure and new structure)
const oldClientBuildPath = path.join(__dirname, '../employee-portal-client/build');
const newClientBuildPath = path.join(__dirname, '../client/build');
const clientBuildPath = fs.existsSync(newClientBuildPath) ? newClientBuildPath : 
                        fs.existsSync(oldClientBuildPath) ? oldClientBuildPath : null;

if (clientBuildPath) {
  // Serve static files from React build folder (Production mode)
  app.use(express.static(clientBuildPath));
  
  // Catch all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
  console.log(`✅ React client build found at: ${clientBuildPath}`);
  console.log('📦 Serving React client from server (Production mode)');
} else {
  // Development mode - client runs separately on port 3000
  console.log('ℹ️  React client build not found - Development mode');
  console.log('   Looking for build in:');
  console.log(`   - ${newClientBuildPath}`);
  console.log(`   - ${oldClientBuildPath}`);
  console.log('   Run: cd employee-portal-client && npm run build');
  
  // Serve a simple message for root path in development
  app.get('/', (req, res) => {
    res.json({ 
      message: '🎉 Server is running successfully!',
      mode: 'development',
      info: 'Build the client first: cd employee-portal-client && npm run build',
      api: 'API available at /api/*'
    });
  });
}

// =======================
// 🟢 Listen
// =======================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// פונקציה להרצת מיגרציות (לשימוש עם npm run migrate)
async function runMigrations() {
  try {
    console.log('🚀 הרצת מיגרציות...');
    
    // התחבר למסד הנתונים
    await sequelize.authenticate();
    console.log('✅ התחברות למסד הנתונים הצליחה');
    
    // סנכרון המודלים
    await sequelize.sync();
    console.log('✅ סנכרון מודלים הושלם');
    
    // עדכון עובדים קיימים
    await updateExistingEmployeesWithManager();
    
    console.log('✅ כל המיגרציות הושלמו בהצלחה!');
    process.exit(0);
  } catch (error) {
    console.error('❌ שגיאה בהרצת מיגרציות:', error);
    process.exit(1);
  }
}

// אם הסקריפט נקרא ישירות, הרץ מיגרציות
// if (require.main === module) {
//   runMigrations();
// }
