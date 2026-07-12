const noteModel = require('../src/models/note.model');
const db = require('../src/database/db');

// Lakukan mock pada modul database agar query SQL tidak masuk ke database Laragon asli
jest.mock('../src/database/db', () => ({
  query: jest.fn()
}));

describe('Google Keep Clone - Model Layer Unit Testing (Comprehensive 45+ Scenarios)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. UJI AMBIL SEMUA CATATAN (getAll) - 5 Test Cases
  // =========================================================================
  describe('getAll() Scenarios', () => {
    test('Harus mengembalikan semua baris catatan dari database (Skenario Dasar)', async () => {
      const mockRows = [
        { id: 1, title: 'Catatan Kuliah', content: 'Belajar Node.js', is_deleted: 0 },
        { id: 2, title: 'Belanjaan', content: 'Kopi, Susu, Gula', is_deleted: 0 }
      ];
      db.query.mockResolvedValue([mockRows]);
      const hasil = await noteModel.getAll();
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM notes ORDER BY id DESC');
      expect(hasil).toHaveLength(2);
    });

    const getAllScenarios = [
      { desc: 'Array kosong ketika database kosong', data: [] },
      { desc: 'Satu catatan aktif', data: [{ id: 1, title: 'A', is_deleted: 0 }] },
      { desc: 'Catatan dengan status terhapus (soft-deleted)', data: [{ id: 2, title: 'B', is_deleted: 1 }] },
      { desc: 'Banyak catatan sekaligus (Stress Test skala kecil)', data: Array(10).fill({ title: 'Test' }) }
    ];

    getAllScenarios.forEach(({ desc, data }) => {
      test(`Harus menangani kondisi: ${desc}`, async () => {
        db.query.mockResolvedValue([data]);
        const hasil = await noteModel.getAll();
        expect(hasil).toHaveLength(data.length);
      });
    });
  });

  // =========================================================================
  // 2. UJI PEMBUATAN CATATAN (create) - 15 Test Cases (Data-Driven)
  // =========================================================================
  describe('create() Parameterized Scenarios', () => {
    const createDataMatrix = [
      // Skenario 1-5: Variasi Teks Judul & Konten
      ['Tugas Akhir', 'Menyelesaikan unit test', 'Biru', 'Kuliah', 0, 0, null],
      ['', 'Konten tanpa judul', 'Putih', null, 0, 0, null],
      ['Judul tanpa konten', '', 'Putih', null, 0, 0, null],
      ['!', '@#$%^&*()', 'Merah', 'Simbol', 0, 0, null],
      ['A'.repeat(255), 'Teks Panjang', 'Hijau', 'Validasi', 0, 0, null],
      
      // Skenario 6-10: Variasi Pilihan Warna & Label Dinamis
      ['Catatan Rapat', 'Isi', 'Kuning', 'Pekerjaan Utama', 0, 0, null],
      ['Belanja', 'Isi', 'Merah Muda', 'Rutinitas Bulanan', 0, 0, null],
      ['Ide Aplikasi', 'Isi', 'Ungu', 'Personal-Project-2026', 0, 0, null],
      ['Data Rahasia', 'Isi', 'Hitam', 'Privat/Secret', 0, 0, null],
      ['Bebas Warna', 'Isi', 'Transparan', 'Kustom Teks Label', 0, 0, null],

      // Skenario 11-15: Variasi Flag Boolean & Waktu Pengingat
      ['Arsip Saja', 'Isi', 'Putih', null, 1, 0, null],
      ['Checklist Saja', 'Isi', 'Putih', null, 0, 1, null],
      ['Arsip & Checklist', 'Isi', 'Putih', null, 1, 1, null],
      ['Dengan Pengingat', 'Isi', 'Putih', 'Reminder', 0, 0, '2026-07-12 15:30:00'],
      ['Semua Aktif', 'Isi Catatan Lengkap', 'Cokelat', 'UAS', 1, 1, '2026-12-31 23:59:59']
    ];

    test.each(createDataMatrix)(
      'Skenario Create %##: Harus menyimpan dengan judul: "%s", warna: "%s", label: "%s"',
      async (title, content, color, label, is_archived, is_checklist, reminder_time) => {
        const mockResult = { insertId: Math.floor(Math.random() * 100) + 1 };
        db.query.mockResolvedValue([mockResult]);

        const hasil = await noteModel.create(title, content, color, label, is_archived, is_checklist, reminder_time);

        expect(db.query).toHaveBeenCalledWith(
          'INSERT INTO notes (title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
          [title, content, color, label, is_archived, is_checklist, reminder_time]
        );
        expect(hasil.id).toBe(mockResult.insertId);
        expect(hasil.title).toBe(title);
        expect(hasil.color).toBe(color);
      }
    );
  });

  // =========================================================================
  // 3. UJI PEMBARUAN DATA / SAMPAH (update) - 15 Test Cases (Data-Driven)
  // =========================================================================
  describe('update() Parameterized Scenarios', () => {
    const updateDataMatrix = [
      // Skenario 1-5: Variasi ID & Judul Baru
      [5, 'Judul Diedit', 'Konten Baru', 'Kuning', 'Kerja', 0, 0, null, 1],
      [1, '', 'Konten Diubah', 'Putih', null, 0, 0, null, 0],
      [99, 'Judul Saja', '', 'Putih', null, 0, 0, null, 0],
      [999, 'Update Simbol', '!!!', 'Merah', 'Fix', 0, 0, null, 0],
      [21, 'A'.repeat(50), 'B'.repeat(50), 'Biru', 'Label', 0, 0, null, 0],

      // Skenario 6-10: Skenario Transisi Status Trash (Soft Delete / Restore)
      [10, 'Buang Ke Sampah', 'Isi', 'Putih', null, 0, 0, null, 1],
      [10, 'Kembalikan Dari Sampah', 'Isi', 'Putih', null, 0, 0, null, 0],
      [11, 'Arsip Tapi Masuk Sampah', 'Isi', 'Kelabu', 'Arsip', 1, 0, null, 1],
      [12, 'Checklist Masuk Sampah', 'Isi', 'Putih', null, 0, 1, null, 1],
      [13, 'Catatan Pengingat Masuk Sampah', 'Isi', 'Putih', null, 0, 0, '2026-07-12 12:00:00', 1],

      // Skenario 11-15: Variasi Kombinasi State
      [44, 'Ubah Semua', 'Ganti', 'Hijau', 'Dinamis', 1, 1, '2026-08-08 08:08:08', 0],
      [45, 'Ubah Semua Ke Sampah', 'Ganti', 'Hijau', 'Dinamis', 1, 1, '2026-08-08 08:08:08', 1],
      [2, 'Hanya Ganti Warna', 'Konten Sama', 'Merah', null, 0, 0, null, 0],
      [3, 'Hanya Ganti Label', 'Konten Sama', 'Putih', 'Label Baru', 0, 0, null, 0],
      [4, 'Hanya Ganti Reminder', 'Konten Sama', 'Putih', null, 0, 0, '2026-01-01 00:00:00', 0]
    ];

    test.each(updateDataMatrix)(
      'Skenario Update %##: Harus mengubah ID %d dengan flag deleted: %d',
      async (id, title, content, color, label, is_archived, is_checklist, reminder_time, is_deleted) => {
        db.query.mockResolvedValue([{}]);

        const hasil = await noteModel.update(id, title, content, color, label, is_archived, is_checklist, reminder_time, is_deleted);

        expect(db.query).toHaveBeenCalledWith(
          'UPDATE notes SET title = ?, content = ?, color = ?, label = ?, is_archived = ?, is_deleted = ?, is_checklist = ?, reminder_time = ? WHERE id = ?',
          [title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time, id]
        );
        expect(hasil.id).toBe(id);
        expect(hasil.is_deleted).toBe(is_deleted);
      }
    );
  });

  // =========================================================================
  // 4. UJI HAPUS PERMANEN (delete) - 10 Test Cases
  // =========================================================================
  describe('delete() Scenarios', () => {
    test('delete() standar harus sukses mengembalikan nilai true', async () => {
      db.query.mockResolvedValue([{}]);
      const hasil = await noteModel.delete(5);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ?', [5]);
      expect(hasil).toBe(true);
    });

    const deleteIds = [1, 2, 3, 10, 99, 100, 9999, -1, 0, 55];

    deleteIds.forEach((id, index) => {
      test(`Skenario Delete Permanen Ke-${index + 2}: Harus mengeksekusi penghapusan untuk ID: ${id}`, async () => {
        db.query.mockResolvedValue([{}]);
        const hasil = await noteModel.delete(id);
        expect(db.query).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ?', [id]);
        expect(hasil).toBe(true);
      });
    });
  });
});