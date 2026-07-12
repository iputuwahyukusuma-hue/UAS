const noteModel = require('../src/models/note.model');
const db = require('../src/database/db');

// Lakukan mock pada modul database agar query SQL tidak masuk ke database Laragon asli
jest.mock('../src/database/db', () => ({
  query: jest.fn()
}));

describe('Google Keep Clone - Model Layer Unit Testing', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. UJI AMBIL SEMUA CATATAN (getAll)
  test('getAll() harus mengembalikan semua baris catatan dari database', async () => {
    const mockRows = [
      { id: 1, title: 'Catatan Kuliah', content: 'Belajar Node.js', is_deleted: 0 },
      { id: 2, title: 'Belanjaan', content: 'Kopi, Susu, Gula', is_deleted: 0 }
    ];
    
    db.query.mockResolvedValue([mockRows]);

    const hasil = await noteModel.getAll();

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM notes ORDER BY id DESC');
    expect(hasil).toHaveLength(2);
    expect(hasil[0].title).toBe('Catatan Kuliah');
  });

  // 2. UJI PEMBUATAN CATATAN BARU (create)
  test('create() harus menjalankan query INSERT dan mengembalikan objek catatan baru dengan ID tergenerasi', async () => {
    const mockResult = { insertId: 10 };
    db.query.mockResolvedValue([mockResult]);

    const hasil = await noteModel.create(
      'Tugas Akhir',
      'Menyelesaikan unit test',
      'Biru',
      'Kuliah', // label dinamis ketikan user
      0,        // is_archived
      0,        // is_checklist
      null      // reminder_time
    );

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO notes (title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
      ['Tugas Akhir', 'Menyelesaikan unit test', 'Biru', 'Kuliah', 0, 0, null]
    );
    expect(hasil).toEqual({
      id: 10,
      title: 'Tugas Akhir',
      content: 'Menyelesaikan unit test',
      color: 'Biru',
      label: 'Kuliah',
      is_archived: 0,
      is_deleted: 0,
      is_checklist: 0,
      reminder_time: null
    });
  });

  // 3. UJI PEMBARUAN CATATAN / SAMPAH (update)
  test('update() harus menjalankan query UPDATE SQL dan mengembalikan objek hasil pembaruan', async () => {
    db.query.mockResolvedValue([{}]); // Mock kembalian database untuk update bebas

    const hasil = await noteModel.update(
      5,              // id
      'Judul Diedit',  // title
      'Konten Baru',  // content
      'Kuning',       // color
      'Kerja',        // label
      0,              // is_archived
      0,              // is_checklist
      null,           // reminder_time
      1               // is_deleted (Menguji skenario Soft Delete / Pindah ke Sampah)
    );

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE notes SET title = ?, content = ?, color = ?, label = ?, is_archived = ?, is_deleted = ?, is_checklist = ?, reminder_time = ? WHERE id = ?',
      ['Judul Diedit', 'Konten Baru', 'Kuning', 'Kerja', 0, 1, 0, null, 5]
    );
    expect(hasil.is_deleted).toBe(1);
    expect(hasil.id).toBe(5);
  });

  // 4. UJI HAPUS PERMANEN (delete)
  test('delete() harus menjalankan perintah DELETE SQL dan mengembalikan nilai true', async () => {
    db.query.mockResolvedValue([{}]);

    const hasil = await noteModel.delete(5);

    expect(db.query).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ?', [5]);
    expect(hasil).toBe(true);
  });
});