const { getDb } = require('./db');

function createNestItem(req, res) {
  const { user_id, content, category, media_url, media_type } = req.body;
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
      'INSERT INTO nest (user_id, content, category, media_url, media_type, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(user_id, content, category || '其他', media_url || null, media_type || null, localTime);
    
    res.status(201).json({
      success: true,
      item: { 
        id: info.lastInsertRowid, 
        user_id, 
        content,
        category: category || '其他',
        media_url,
        media_type,
        created_at: localTime
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function getNestItems(req, res) {
  const { user_id } = req.query;
  
  const db = getDb();
  try {
    let rows;
    if (user_id) {
      const query = 'SELECT * FROM nest WHERE user_id = ? ORDER BY created_at DESC';
      rows = db.prepare(query).all(user_id);
    } else {
      const query = 'SELECT * FROM nest ORDER BY created_at DESC';
      rows = db.prepare(query).all();
    }
    res.json({ success: true, items: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function deleteNestItem(req, res) {
  const { id } = req.params;
  const { user_id } = req.query;
  
  const db = getDb();
  try {
    const item = db.prepare('SELECT * FROM nest WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    if (item.user_id !== parseInt(user_id)) {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }
    
    db.prepare('DELETE FROM nest WHERE id = ?').run(id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createNestItem, getNestItems, deleteNestItem };
