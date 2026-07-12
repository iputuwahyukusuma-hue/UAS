const db = require('../database/db'); // Sesuaikan dengan path koneksi database Anda

const noteModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM notes ORDER BY id DESC');
    return rows;
  },

  create: async (title, content, color, label, is_archived, is_checklist, reminder_time) => {
    const [result] = await db.query(
      'INSERT INTO notes (title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
      [title, content, color, label, is_archived, is_checklist, reminder_time]
    );
    return { id: result.insertId, title, content, color, label, is_archived, is_deleted: 0, is_checklist, reminder_time };
  },

  update: async (id, title, content, color, label, is_archived, is_checklist, reminder_time, is_deleted) => {
    await db.query(
      'UPDATE notes SET title = ?, content = ?, color = ?, label = ?, is_archived = ?, is_deleted = ?, is_checklist = ?, reminder_time = ? WHERE id = ?',
      [title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time, id]
    );
    return { id, title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time };
  },

  delete: async (id) => {
    await db.query('DELETE FROM notes WHERE id = ?', [id]);
    return true;
  }
};

module.exports = noteModel;