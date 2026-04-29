const { getDb } = require('./db');

function getPlans(req, res) {
  const { user_id, date } = req.query;
  if (!user_id || !date) {
    return res.status(400).json({ success: false, error: 'Missing user_id or date' });
  }

  const db = getDb();
  try {
    const rows = db.prepare(
      'SELECT * FROM plans WHERE user_id = ? AND date = ? ORDER BY start_time ASC'
    ).all(user_id, date);
    res.json({ success: true, plans: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function addPlan(req, res) {
  const { user_id, content, start_time, end_time, date } = req.body;
  if (!user_id || !content || !start_time || !end_time || !date) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const db = getDb();
  try {
    const info = db.prepare(
      'INSERT INTO plans (user_id, content, start_time, end_time, date) VALUES (?, ?, ?, ?, ?)'
    ).run(user_id, content, start_time, end_time, date);
    res.status(201).json({
      success: true,
      plan: { id: info.lastInsertRowid, user_id, content, start_time, end_time, date }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function deletePlan(req, res) {
  const { id } = req.params;
  const db = getDb();
  try {
    db.prepare('DELETE FROM plans WHERE id = ?').run(id);
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getPlans, addPlan, deletePlan };
