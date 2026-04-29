const { getDb } = require('./db');

function sendMessage(req, res) {
  const { sender_id, receiver_id, content } = req.body;
  
  if (!sender_id || !receiver_id || !content.trim()) {
    return res.status(400).json({ success: false, error: '缺少必要参数' });
  }

  const db = getDb();
  try {
    const info = db.prepare(
      'INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(sender_id, receiver_id, content.trim());
    
    res.status(201).json({
      success: true,
      message: {
        id: info.lastInsertRowid,
        sender_id,
        receiver_id,
        content: content.trim(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function getMessages(req, res) {
  const { user_id, friend_id } = req.query;
  
  if (!user_id || !friend_id) {
    return res.status(400).json({ success: false, error: '缺少必要参数' });
  }

  const db = getDb();
  try {
    const rows = db.prepare(`
      SELECT m.*, u.username as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.timestamp ASC
    `).all(user_id, friend_id, friend_id, user_id);
    
    res.json({ success: true, messages: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { sendMessage, getMessages };
