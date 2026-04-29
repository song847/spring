const { getDb } = require('./db');

function searchUser(req, res) {
  const { unique_id } = req.query;
  const db = getDb();
  try {
    const row = db.prepare('SELECT id, username, unique_id FROM users WHERE unique_id = ?').get(unique_id);
    if (!row) return res.status(404).json({ success: false, error: '未找到该用户' });
    res.json({ success: true, user: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function sendFriendRequest(req, res) {
  const { user_id, friend_id } = req.body;
  const db = getDb();
  try {
    db.prepare(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)'
    ).run(user_id, friend_id, 'pending');
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, error: '已经是好友或已发送申请' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
}

function acceptFriendRequest(req, res) {
  const { user_id, friend_id } = req.body;
  const db = getDb();
  try {
    db.prepare(
      'UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?'
    ).run('accepted', user_id, friend_id);
    db.prepare(
      'INSERT OR IGNORE INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)'
    ).run(friend_id, user_id, 'accepted');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function getFriends(req, res) {
  const { user_id } = req.query;
  const db = getDb();
  try {
    const rows = db.prepare(`
      SELECT u.id, u.username, u.unique_id, f.status
      FROM friends f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ? AND f.status = 'accepted'
    `).all(user_id);
    res.json({ success: true, friends: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { searchUser, sendFriendRequest, acceptFriendRequest, getFriends };
