require('dotenv').config();
const { OpenAI } = require('openai');
const { AISession, User } = require('../models');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Helper function to get an existing session or create a new one.
 * @param {number} userId The ID of the user.
 * @returns {Promise<AISession>} The found or newly created session.
 */
async function getOrCreateSession(userId) {
  console.log('🔍 getOrCreateSession called with userId:', userId, 'Type:', typeof userId);
  
  let session = await AISession.findOne({
    where: { user_id: userId, is_primary: true }
  });

  console.log('🔍 Existing session found:', !!session);

  if (!session) {
    console.log('🟡 No session found for user, creating a new one...');
    if (!process.env.ASSISTANT_MAIN) {
      console.log('⚠️ ASSISTANT_MAIN environment variable is not set, using default');
      // You can set a default assistant ID here or create one programmatically
      throw new Error('ASSISTANT_MAIN environment variable is not set');
    }
    
    console.log('🔍 ASSISTANT_MAIN:', process.env.ASSISTANT_MAIN);
    
    // Let's try to create a new assistant if the current one doesn't work
    let assistantId = process.env.ASSISTANT_MAIN;
    try {
      console.log('🔍 Checking if assistant exists...');
      await openai.beta.assistants.retrieve(assistantId);
      console.log('✅ Assistant exists');
    } catch (error) {
      console.log('⚠️ Assistant not found, creating new one...');
      const newAssistant = await openai.beta.assistants.create({
        name: "Employee Portal Assistant",
        instructions: "You are a helpful assistant for employees in the company. Answer questions in Hebrew and be friendly and professional.",
        model: "gpt-4o-mini"
      });
      assistantId = newAssistant.id;
      console.log('✅ New assistant created:', assistantId);
    }
    
    console.log('🔍 Creating OpenAI thread...');
    const thread = await openai.beta.threads.create();
    console.log('✅ Thread created with ID:', thread.id);

    console.log('🔍 Creating AISession record...');
    session = await AISession.create({
      user_id: userId,
      assistant_id: assistantId,
      thread_id: thread.id,
      is_default: true,
      is_primary: true,
      is_temporary: false
    });
    console.log(`✅ New session and thread created for user ${userId}:`, {
      id: session.id,
      user_id: session.user_id,
      assistant_id: session.assistant_id,
      thread_id: session.thread_id
    });
  } else {
    console.log('✅ Using existing session:', {
      id: session.id,
      user_id: session.user_id,
      assistant_id: session.assistant_id,
      thread_id: session.thread_id
    });
  }

  return session;
}


// יצירת Assistant + Thread – נשמר בטבלת ai_sessions
exports.initSession = async (req, res) => {
  try {
    console.log('🚀 INIT Session called');
    const userId = req.user?.id;
    console.log('🔍 User ID from token:', userId, 'Type:', typeof userId);
    
    if (!userId) {
      console.log('❌ No user ID found in token');
      return res.status(401).json({ error: 'Unauthorized: missing user' });
    }

    console.log('🔄 Calling getOrCreateSession...');
    const session = await getOrCreateSession(userId);
    console.log('✅ Session created/retrieved:', {
      id: session.id,
      user_id: session.user_id,
      assistant_id: session.assistant_id,
      thread_id: session.thread_id
    });
    
    res.status(200).json(session);

  } catch (error) {
    console.error('❌ שגיאה ביצירת thread:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

// שליחת שאלה ל־Assistant
// exports.ask = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ error: 'Unauthorized' });

//     console.log('🔍 שלב 1: בדיקת משתמש ותקינות prompt');
//     const { prompt } = req.body;
//     if (!prompt || typeof prompt !== 'string') {
//       return res.status(400).json({ error: 'Missing or invalid prompt' });
//     }

//     console.log('🔍 שלב 2: חיפוש session ראשית');
//     const session = await AISession.findOne({
//       where: { user_id: userId, is_primary: true }
//     });
//     if (!session) return res.status(404).json({ error: 'No primary session found' });
//     console.log('✅ נמצא session:', { thread_id: session.thread_id, assistant_id: session.assistant_id });

//     // בדיקת runs פעילים
//     console.log('🔍 בדיקת runs פעילים');
//     const activeRuns = await openai.beta.threads.runs.list(session.thread_id);
//     const runningRun = activeRuns.data.find(run => run.status === 'in_progress' || run.status === 'queued');
    
//     if (runningRun) {
//       console.log('⚠️ נמצא run פעיל:', runningRun.id);
//       // ביטול ה-run הפעיל
//       await openai.beta.threads.runs.cancel(session.thread_id, runningRun.id);
//       console.log('✅ ה-run בוטל');
//       // המתנה קצרה לוודא שהביטול התקבל
//       await new Promise(resolve => setTimeout(resolve, 1000));
//     }

//     console.log('🔍 שלב 3: שליפת פרטי משתמש');
//     const user = await User.findByPk(userId);
//     console.log('✅ פרטי משתמש:', { name: user.full_name, role: user.role });

//     console.log('🔍 שלב 4: בדיקת הודעות קיימות');
//     const existingMessages = await openai.beta.threads.messages.list(session.thread_id);
//     const isFirstMessage = existingMessages.data.length === 0;
//     console.log('✅ מספר הודעות קיימות:', existingMessages.data.length);

//     const enrichedPrompt = isFirstMessage
//       ? `
// אתה עוזר אישי לעובד בחברה.
// שם העובד: ${user.full_name}
// תפקיד: ${user.role}
// ${user.department ? `מחלקה: ${user.department}` : ''}
// שאלה: ${prompt}
//       `.trim()
//       : prompt;

//     console.log('🔍 שלב 5: שליחת הודעה ל־GPT');
//     await openai.beta.threads.messages.create(session.thread_id, {
//       role: 'user',
//       content: enrichedPrompt
//     });
//     console.log('✅ הודעה נשלחה בהצלחה');

//     console.log('🔍 שלב 6: הפעלת Assistant');
//     const run = await openai.beta.threads.runs.create(session.thread_id, {
//       assistant_id: session.assistant_id
//     });
//     console.log('✅ Assistant הופעל, run ID:', run.id);

//     console.log('🔍 שלב 7: המתנה לתשובה');
//     let responseText = '';
//     const maxRetries = 60; // הגדלת זמן ההמתנה ל-60 שניות
//     let retries = 0;

//     while (retries < maxRetries) {
//       console.log(`🔄 ניסיון ${retries + 1}/${maxRetries}`);
//       const runStatus = await openai.beta.threads.runs.retrieve(session.thread_id, run.id);
//       console.log('📊 סטטוס ריצה:', runStatus.status);

//       if (runStatus.status === 'completed') {
//         console.log('✅ הריצה הושלמה, מושכת הודעות');
//         const messages = await openai.beta.threads.messages.list(session.thread_id);
//         const lastMessage = messages.data.find(m => m.role === 'assistant');
//         responseText = lastMessage?.content?.[0]?.text?.value || '';
//         console.log('✅ תשובה התקבלה:', responseText.substring(0, 100) + '...');
//         break;
//       }

//       if (runStatus.status === 'failed') {
//         console.error('❌ Assistant run failed:', runStatus.last_error);
//         return res.status(500).json({ error: 'Assistant run failed', details: runStatus.last_error });
//       }

//       if (runStatus.status === 'requires_action') {
//         console.log('⚠️ Assistant דורש פעולה נוספת:', runStatus.required_action);
//         // ביטול הריצה אם דורשת פעולה
//         await openai.beta.threads.runs.cancel(session.thread_id, run.id);
//         return res.status(500).json({ error: 'Assistant requires action', details: runStatus.required_action });
//       }

//       if (runStatus.status === 'cancelled') {
//         console.log('⚠️ הריצה בוטלה');
//         return res.status(500).json({ error: 'Run was cancelled' });
//       }

//       if (runStatus.status === 'expired') {
//         console.log('⚠️ הריצה פגה');
//         return res.status(500).json({ error: 'Run expired' });
//       }

//       // בדיקת שגיאות נוספות
//       if (runStatus.last_error) {
//         console.error('❌ שגיאה בריצה:', runStatus.last_error);
//         return res.status(500).json({ error: 'Run error', details: runStatus.last_error });
//       }

//       await new Promise(resolve => setTimeout(resolve, 1000));
//       retries++;
//     }

//     if (!responseText) {
//       console.error('❌ לא התקבלה תשובה בזמן');
//       // נסה לבטל את הריצה לפני החזרת השגיאה
//       try {
//         await openai.beta.threads.runs.cancel(session.thread_id, run.id);
//         console.log('✅ הריצה בוטלה בהצלחה');
//       } catch (error) {
//         console.error('❌ שגיאה בביטול הריצה:', error.message);
//       }
//       return res.status(500).json({ error: 'No assistant response received in time' });
//     }

//     console.log('✅ שליחת תשובה למשתמש');
//     res.json({ response: responseText });
//   } catch (error) {
//     console.error('❌ שגיאה בשיחה:', error.message);
//     console.error('Stack trace:', error.stack);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }; 


async function cancelActiveRun(threadId) {
  const activeRuns = await openai.beta.threads.runs.list(threadId);
  const running = activeRuns.data.find(run => ['in_progress', 'queued'].includes(run.status));
  if (running) {
    await openai.beta.threads.runs.cancel(threadId, running.id);
    await new Promise(resolve => setTimeout(resolve, 1000)); // זמן המתנה לביטול
  }
}

/** פונקציית עזר לשליחת ההודעה ל־thread */
async function sendMessageToThread(threadId, prompt) {
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: prompt
  });
}

/** פונקציית עזר להרצת ה־Assistant */
async function runAssistant(threadId, assistantId) {
  console.log('🔍 runAssistant called with:', { threadId, assistantId });
  try {
    // First, let's check if the assistant exists
    console.log('🔍 Checking assistant exists...');
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    console.log('✅ Assistant found:', { id: assistant.id, name: assistant.name });
    
    // Now create the run
    console.log('🔍 Creating run...');
    const run = await openai.beta.threads.runs.create(threadId, { 
      assistant_id: assistantId 
    });
    console.log('🔍 runAssistant result:', { 
      id: run.id, 
      status: run.status, 
      object: run.object,
      fullRun: run 
    });
    return run;
  } catch (error) {
    console.error('❌ Error in runAssistant:', error);
    throw error;
  }
}

/** המתנה להשלמת ריצה וקבלת תשובה */
async function waitForCompletion(threadId, runId, maxRetries = 60) {
  console.log('🔍 waitForCompletion called with:', { threadId, runId, threadIdType: typeof threadId, runIdType: typeof runId });
  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔄 Attempt ${i + 1}: Checking run status...`);
    const status = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
    if (status.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data.find(m => m.role === 'assistant');
      return lastMessage?.content?.[0]?.text?.value || '';
    }
    if (['failed', 'expired', 'cancelled'].includes(status.status)) {
      throw new Error(`Run failed with status: ${status.status}`);
    }
    if (status.status === 'requires_action') {
      await openai.beta.threads.runs.cancel(threadId, runId);
      throw new Error('Assistant requires action');
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('No assistant response received in time');
}

/** פונקציית שליחת שאלה ל־assistant */
exports.ask = async (req, res) => {
  try {
    console.log('🚀 ASK endpoint called');
    const userId = req.user?.id;
    console.log('🔍 User ID:', userId, 'Type:', typeof userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { prompt } = req.body;
    console.log('🔍 Prompt:', prompt);
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt' });
    }

    console.log('🔄 Calling getOrCreateSession...');
    const session = await getOrCreateSession(userId); // This is the fix
    console.log('✅ Session retrieved:', session ? 'Found' : 'Not found');

    const user = await User.findByPk(userId);
    await cancelActiveRun(session.thread_id);

    const messages = await openai.beta.threads.messages.list(session.thread_id);
    const isFirst = messages.data.length === 0;

    const fullPrompt = isFirst
      ? `
אתה עוזר אישי לעובדי החברה.
שם: ${user.full_name}
תפקיד: ${user.role}
${user.department ? `מחלקה: ${user.department}` : ''}
שאלה: ${prompt}
`.trim()
      : prompt;

    await sendMessageToThread(session.thread_id, fullPrompt);
    console.log('🔄 Running assistant...');
    console.log('🔍 Session details:', { 
      thread_id: session.thread_id, 
      assistant_id: session.assistant_id,
      user_id: session.user_id 
    });
    const run = await runAssistant(session.thread_id, session.assistant_id);
    console.log('✅ Run created:', { id: run.id, status: run.status });
    console.log('🔍 About to call waitForCompletion with:', { 
      threadId: session.thread_id, 
      runId: run.id,
      threadIdType: typeof session.thread_id,
      runIdType: typeof run.id
    });
    const responseText = await waitForCompletion(session.thread_id, run.id);

    res.json({ response: responseText });
  } catch (err) {
    console.error('❌ Assistant error:', err.message);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Error details:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

// שליפת ההיסטוריה של השיחה עבור המשתמש
exports.getConversationHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const session = await getOrCreateSession(userId); // Also update here for consistency

    if (!session) return res.status(404).json({ error: 'No primary session found for user' });

    const messagesData = await openai.beta.threads.messages.list(session.thread_id);
    const user = await User.findByPk(userId);

    const messages = messagesData.data.map(msg => ({
      role: msg.role,
      created_at: msg.created_at,
      content: msg.content?.[0]?.text?.value || '(no text)'
    }));

    res.json({
      user: {
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
        birth_date: user.birth_date
      },
      thread_id: session.thread_id,
      messages
    });
  } catch (error) {
    console.error('❌ שגיאה בשליפת ההיסטוריה:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
};


