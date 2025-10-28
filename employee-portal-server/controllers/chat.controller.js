const { Chat, User } = require('../models');

// שליפת 30 הודעות אחרונות עם אפשרות טעינה אחורה
exports.getChatMessages = async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = 30;

    const messages = await Chat.findAll({
      order: [['created_at', 'DESC']],
      limit,
      offset,
      include: {
        model: User,
        as: 'sender',
        attributes: ['id', 'full_name']
      }
    });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching chat messages:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// שליחת הודעה עם שידור מיידי ל-WebSocket
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const sender_id = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const newMessage = await Chat.create({
      sender_id,
      content
    });

    // שאיבה מחדש עם פרטי המשתמש לצורך שידור
    const fullMessage = await Chat.findByPk(newMessage.id, {
      include: {
        model: User,
        as: 'sender',
        attributes: ['id', 'full_name']
      }
    });

    // שידור לכל המשתמשים המחוברים
    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', fullMessage);
    }

    res.status(201).json(fullMessage);
  } catch (err) {
    console.error('Error sending chat message:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}; 