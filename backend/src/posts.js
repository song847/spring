const { getDb } = require('./db');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function createPost(req, res) {
  const { user_id, content, media_url, media_type } = req.body;
  if (!user_id || (!content && !media_url)) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const localTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const db = getDb();
  try {
    const info = db.prepare(
      'INSERT INTO posts (user_id, content, media_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(user_id, content, media_url || null, media_type || null, localTime);
    
    res.status(201).json({
      success: true,
      post: { 
        id: info.lastInsertRowid, 
        user_id, 
        content, 
        media_url,
        media_type,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function getPosts(req, res) {
  const { user_id } = req.query;
  
  const db = getDb();
  try {
    let rows;
    if (user_id) {
      const query = 'SELECT p.*, u.username, u.unique_id FROM posts p JOIN users u ON p.user_id = u.id WHERE p.user_id = ? ORDER BY p.created_at DESC';
      rows = db.prepare(query).all(user_id);
    } else {
      const query = 'SELECT p.*, u.username, u.unique_id FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC';
      rows = db.prepare(query).all();
    }
    res.json({ success: true, posts: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function deletePost(req, res) {
  const { id } = req.params;
  const { user_id } = req.query;
  
  const db = getDb();
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    if (post.user_id !== parseInt(user_id)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }
    
    if (post.media_url) {
      const filePath = path.join(UPLOAD_DIR, path.basename(post.media_url));
      fs.unlinkSync(filePath);
    }
    
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createPost, getPosts, deletePost };
