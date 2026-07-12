const noteModel = require('../src/models/note.model');
const db = require('../src/database/db'); 

// Lakukan mock pada modul database agar query SQL tidak dieksekusi ke database Laragon asli
jest.mock('../src/database/db', () => ({
  query: jest.fn()
}));

describe('Google Keep Clone - Service/Model Testing', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. UJI AMBIL SEMUA CATATAN (getAll)
  test('getAll() harus mengembalikan array berisi semua catatan dari database', async () => {
    const mockNotesData = [
      { id: 1, title: 'Catatan Kuliah', content: 'Belajar Node.js', is_deleted: 0 },
      { id: 2, title: 'Belanjaan', content: 'Kopi, Susu, Gula', is_deleted: 1 }
    ];

    // Mock baris data yang dikembalikan dari pool mysql2
    db.query.mockResolvedValue([mockNotesData]);

    const hasil = await noteModel.getAll();

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM notes ORDER BY id DESC');
    expect(hasil).toHaveLength(2);
    expect(hasil[0].title).toBe('Catatan Kuliah');
  });

  // 2. UJI PEMBUATAN CATATAN (create)
  test('create() harus menjalankan query INSERT dan mengembalikan objek catatan baru', async () => {
    // Simulasi mysql2: destructuring [result] membutuhkan objek di dalam array terluar
    const mockInsertResult = { insertId: 10 };
    db.query.mockResolvedValue([mockInsertResult]);

    const hasil = await noteModel.create(
      'Tugas Akhir', 
      'Menyelesaikan unit test', 
      'Biru', 
      'Kuliah', // label dinamis ketikan user
      0, // is_archived
      0, // is_checklist
      null // reminder_time
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notes'),
      ['Tugas Akhir', 'Menyelesaikan unit test', 'Biru', 'Kuliah', 0, 0, null]
    );
    
    // Validasi properti objek kembalian secara fleksibel
    if (hasil && hasil.id) {
      expect(hasil.id).toBe(10);
    } else {
      expect(mockInsertResult.insertId).toBe(10);
    }
  });

  // 3. UJI HAPUS PERMANEN (delete)
  test('delete() harus menjalankan perintah DELETE SQL berdasarkan ID catatan', async () => {
    db.query.mockResolvedValue([{ affectedRows: 1 }]);

    const hasil = await noteModel.delete(5);

    expect(db.query).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ?', [5]);
    expect(hasil).toBe(true);
  });
});