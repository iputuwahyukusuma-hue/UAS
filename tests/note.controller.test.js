const request = require('supertest');
const express = require('express');
const noteController = require('../src/controllers/note.controller');
const noteModel = require('../src/models/note.model');

// Mocking noteModel agar terisolasi dari database
jest.mock('../src/models/note.model');

const app = express();
app.use(express.json());

// Registrasi Route untuk Testing Controller
app.get('/api/notes', noteController.getNotes);
app.post('/api/notes', noteController.createNote);
app.put('/api/notes/:id', noteController.updateNote);
  app.delete('/api/notes/:id', noteController.deleteNote);

describe('Google Keep Clone - Controller Layer Unit Testing', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. PENGUJIAN GET NOTES
  // ==========================================
  describe('GET /api/notes', () => {
    test('Harus mengembalikan status 200 dan daftar catatan jika sukses', async () => {
      const mockNotes = [{ id: 1, title: 'Test Note' }];
      noteModel.getAll.mockResolvedValue(mockNotes);

      const response = await request(app).get('/api/notes');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockNotes);
    });

    test('Harus mengembalikan status 500 jika terjadi error pada model (Mengejar Line 7-8)', async () => {
      noteModel.getAll.mockRejectedValue(new Error('Database Bermasalah'));

      const response = await request(app).get('/api/notes');

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database Bermasalah');
    });
  });

  // ==========================================
  // 2. PENGUJIAN CREATE NOTE
  // ==========================================
  describe('POST /api/notes', () => {
    test('Harus berhasil membuat catatan baru dengan parameter default (Status 201)', async () => {
      const mockInput = { title: 'Halo', content: 'Dunia' };
      const mockOutput = { id: 1, title: 'Halo', content: 'Dunia', color: 'Putih', label: null, is_archived: 0, is_checklist: 0, reminder_time: null };
      
      noteModel.create.mockResolvedValue(mockOutput);

      const response = await request(app).post('/api/notes').send(mockInput);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(mockOutput);
      // Memastikan nilai fallback default dikirim ke model
      expect(noteModel.create).toHaveBeenCalledWith('Halo', 'Dunia', 'Putih', null, 0, 0, null);
    });

    test('Harus memformat reminder_time jika dikirim dari frontend', async () => {
      const mockInput = { title: 'Rapat', reminder_time: '2026-07-12T15:30:00' };
      noteModel.create.mockResolvedValue({ id: 2 });

      await request(app).post('/api/notes').send(mockInput);

      // Memastikan 'T' diganti spasi
      expect(noteModel.create).toHaveBeenCalledWith('Rapat', undefined, 'Putih', null, 0, 0, '2026-07-12 15:30:00');
    });

    test('Harus mengembalikan status 400 jika pembuatan gagal (Mengejar Line 27-28)', async () => {
      noteModel.create.mockRejectedValue(new Error('Gagal insert data'));

      const response = await request(app).post('/api/notes').send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Gagal insert data');
    });
  });

  // ==========================================
  // 3. PENGUJIAN UPDATE NOTE
  // ==========================================
  describe('PUT /api/notes/:id', () => {
    test('Harus berhasil memperbarui catatan dan mengembalikan data terbaru (Status 200)', async () => {
      const mockInput = { title: 'Ubah Judul', is_deleted: true };
      const mockOutput = { id: 5, title: 'Ubah Judul', is_deleted: 1 };
      noteModel.update.mockResolvedValue(mockOutput);

      const response = await request(app).put('/api/notes/5').send(mockInput);

      expect(response.statusCode).toBe(200);
      expect(response.body.is_deleted).toBe(1);
      expect(noteModel.update).toHaveBeenCalledWith('5', 'Ubah Judul', undefined, 'Putih', null, 0, 0, null, 1);
    });

    test('Harus mengembalikan status 400 jika update gagal (Mengejar Line 50-51)', async () => {
      noteModel.update.mockRejectedValue(new Error('ID tidak ditemukan'));

      const response = await request(app).put('/api/notes/999').send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'ID tidak ditemukan');
    });
  });

  // ==========================================
  // 4. PENGUJIAN DELETE NOTE
  // ==========================================
  describe('DELETE /api/notes/:id', () => {
    test('Harus berhasil menghapus secara permanen dan memberikan pesan sukses', async () => {
      noteModel.delete.mockResolvedValue(true);

      const response = await request(app).delete('/api/notes/10');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Catatan berhasil dihapus');
      expect(noteModel.delete).toHaveBeenCalledWith('10');
    });

    test('Harus mengembalikan status 500 jika penghapusan gagal (Mengejar Line 60-61)', async () => {
      noteModel.delete.mockRejectedValue(new Error('Gagal menghapus'));

      const response = await request(app).delete('/api/notes/10');

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Gagal menghapus');
    });
  });
});