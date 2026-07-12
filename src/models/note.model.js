const db = require('../database/db'); // Sesuaikan dengan path koneksi database Anda

const noteModel = {
  // 1. Ambil semua catatan (Termasuk kolom is_deleted)
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM notes ORDER BY id DESC');
    return rows;
  },

  // 2. Tambah catatan baru (Default is_deleted adalah 0)
  create: async (title, content, color, is_archived, is_checklist, reminder_time) => {
    const [result] = await db.query(
      'INSERT INTO notes (title, content, color, is_archived, is_deleted, is_checklist, reminder_time) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [title, content, color, is_archived, is_checklist, reminder_time]
    );
    return { id: result.insertId, title, content, color, is_archived, is_deleted: 0, is_checklist, reminder_time };
  },

  // 3. Update catatan (PENTING: Tambahkan kolom is_deleted ke dalam query SQL)
  update: async (id, title, content, color, is_archived, is_checklist, reminder_time, is_deleted) => {
    await db.query(
      'UPDATE notes SET title = ?, content = ?, color = ?, is_archived = ?, is_deleted = ?, is_checklist = ?, reminder_time = ? WHERE id = ?',
      [title, content, color, is_archived, is_deleted, is_checklist, reminder_time, id]
    );
    return { id, title, content, color, is_archived, is_deleted, is_checklist, reminder_time };
  },

  // 4. Hapus Permanen
  delete: async (id) => {
    await db.query('DELETE FROM notes WHERE id = ?', [id]);
    return true;
  }
};

module.exports = noteModel;