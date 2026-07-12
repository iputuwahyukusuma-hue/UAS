const db = require('../database/db');

class NoteModel {
  // 1. Ambil semua catatan
  async getAll() {
    const [rows] = await db.query('SELECT * FROM notes ORDER BY id DESC');
    return rows;
  }

  // 2. Buat catatan baru
  async create(title, content) {
    if (!title || title.trim() === "") {
      throw new Error("Judul catatan tidak boleh kosong");
    }
    const [result] = await db.query(
      'INSERT INTO notes (title, content) VALUES (?, ?)',
      [title, content]
    );
    return { id: result.insertId, title, content };
  }

  // 3. Edit/Update catatan berdasarkan ID
  async update(id, title, content) {
    if (!title || title.trim() === "") {
      throw new Error("Judul catatan tidak boleh kosong");
    }
    await db.query(
      'UPDATE notes SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    return { id: Number(id), title, content };
  }

  // 4. Hapus catatan berdasarkan ID
  async delete(id) {
    await db.query('DELETE FROM notes WHERE id = ?', [id]);
    return { id: Number(id) };
  }
}

module.exports = new NoteModel();