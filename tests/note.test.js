const request = require('supertest');
const express = require('express');
const noteController = require('../src/controllers/note.controller');
const noteModel = require('../src/models/note.model');

// Mocking noteModel agar tidak menembak ke database MySQL asli
jest.mock('../src/models/note.model');

const app = express();
app.use(express.json());

// Registrasi route tiruan untuk keperluan testing controller
app.post('/api/notes', noteController.createNote);
app.put('/api/notes/:id', noteController.updateNote);

describe('Google Keep Clone - Unit Testing (Label & Trash)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. PENGUJIAN FITUR LABEL BEBAS / DINAMIS
  test('Harus berhasil membuat catatan baru dengan Label kustom dari user', async () => {
    const mockNoteBaru = {
      title: 'Belajar Unit Testing',
      content: 'Membuat mock database dengan Jest',
      color: 'Putih',
      label: 'Kuliah Informatika', // Mengetik label bebas
      is_archived: 0,
      is_checklist: 0,
      reminder_time: null
    };

    // Mengatur perilaku mock model saat menerima data
    noteModel.create.mockResolvedValue({
      id: 1,
      ...mockNoteBaru,
      is_deleted: 0
    });

    const response = await request(app)
      .post('/api/notes')
      .send(mockNoteBaru);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.label).toBe('Kuliah Informatika'); // Memastikan label dinamis tersimpan
    expect(noteModel.create).toHaveBeenCalledTimes(1);
  });

  // 2. PENGUJIAN FITUR SAMPAH / TRASH (SOFT DELETE)
  test('Harus berhasil mengubah status is_deleted menjadi 1 (Pindah ke Sampah)', async () => {
    const dataNoteLama = {
      title: 'Catatan Mau Dihapus',
      content: 'Ini isi catatan lama',
      color: 'Kuning',
      label: 'Pribadi',
      is_archived: 0,
      is_checklist: 0,
      reminder_time: null
    };

    // Mengatur agar ketika update dipanggil, status is_deleted diset menjadi 1 (Soft Delete)
    noteModel.update.mockResolvedValue({
      id: 99,
      ...dataNoteLama,
      is_deleted: 1 // Berhasil masuk sampah
    });

    const response = await request(app)
      .put('/api/notes/99')
      .send({
        ...dataNoteLama,
        is_deleted: 1 // Instruksi dari fungsi pindahkanKeSampah() frontend
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.is_deleted).toBe(1); // Validasi status terhapus
    expect(noteModel.update).toHaveBeenCalledWith(
      "99",
      dataNoteLama.title,
      dataNoteLama.content,
      dataNoteLama.color,
      dataNoteLama.label,
      0, // is_archived
      0, // is_checklist
      null, // reminder_time
      1 // parameter vDeleted ke model
    );
  });
});