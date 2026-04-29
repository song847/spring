const { getDb } = require('./db');

function getAllUsers(req, res) {
  const { admin_id } = req.query;
  
  const db = getDb();
  try {
    const admin = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(admin_id);
    if (!admin || admin.is_admin !== 1) {
      return res.status(403).json({ success: false, error: '无管理员权限' });
    }

    const users = db.prepare('SELECT id, username, unique_id, is_admin FROM users').all();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function deleteUser(req, res) {
  const { admin_id, user_id } = req.body;
  
  const db = getDb();
  try {
    const admin = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(admin_id);
    if (!admin || admin.is_admin !== 1) {
      return res.status(403).json({ success: false, error: '无管理员权限' });
    }

    if (admin_id == user_id) {
      return res.status(400).json({ success: false, error: '不能删除自己' });
    }

    db.prepare('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?').run(user_id, user_id);
    db.prepare('DELETE FROM posts WHERE user_id = ?').run(user_id);
    db.prepare('DELETE FROM friends WHERE user_id = ? OR friend_id = ?').run(user_id, user_id);
    db.prepare('DELETE FROM plans WHERE user_id = ?').run(user_id);
    db.prepare('DELETE FROM users WHERE id = ?').run(user_id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function updateUser(req, res) {
  const { admin_id, user_id, username, is_admin } = req.body;
  
  const db = getDb();
  try {
    const admin = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(admin_id);
    if (!admin || admin.is_admin !== 1) {
      return res.status(403).json({ success: false, error: '无管理员权限' });
    }

    const updates = [];
    const params = [];

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }

    if (is_admin !== undefined) {
      updates.push('is_admin = ?');
      params.push(is_admin ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: '没有提供更新内容' });
    }

    params.push(user_id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function createAdmin(req, res) {
  const bcrypt = require('bcrypt');
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: '缺少用户名或密码' });
  }

  const db = getDb();
  bcrypt.hash(password, 10).then(passwordHash => {
    const uniqueId = '000000';
    
    try {
      const info = db.prepare(
        'INSERT INTO users (username, password_hash, unique_id, is_admin) VALUES (?, ?, ?, ?)'
      ).run(username, passwordHash, uniqueId, 1);
      
      res.status(201).json({
        success: true,
        user: { id: info.lastInsertRowid, username, unique_id: uniqueId, is_admin: true }
      });
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, error: '管理员已存在' });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  }).catch(err => {
    res.status(500).json({ success: false, error: err.message });
  });
}

module.exports = { getAllUsers, deleteUser, updateUser, createAdmin };
