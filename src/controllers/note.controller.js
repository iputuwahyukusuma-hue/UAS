const noteModel = require('../models/note.model');

// 1. Ambil semua catatan
exports.getNotes = async (req, res) => {
  try {
    const notes = await noteModel.getAll();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Tambah catatan baru
exports.createNote = async (req, res) => {
  try {
    // TAMBAHKAN is_deleted di sini agar terbaca dari req.body frontend
    const { title, content, color, is_archived, is_deleted, is_checklist, reminder_time } = req.body;
    
    const vColor = color || 'Putih';
    const vArchived = is_archived ? 1 : 0;
    const vDeleted = is_deleted ? 1 : 0; // Normalisasi nilai deleted (0 atau 1)
    const vChecklist = is_checklist ? 1 : 0;
    
    let vReminder = null;
    if (reminder_time && reminder_time.trim() !== "") {
      vReminder = reminder_time.replace('T', ' ').slice(0, 19); 
    }

    // Jika model.create milikmu menerima objek atau parameter berurutan, pastikan vDeleted ikut dikirim jika diperlukan.
    // Namun karena di app.js kita melakukan manipulasi via PUT untuk hapus sementara, 
    // default 0 saat create note baru sudah otomatis aman.
    const newNote = await noteModel.create(title, content, vColor, vArchived, vChecklist, vReminder);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 3. Edit / Update catatan (BAGIAN UTAMA UNTUK SOFT DELETE & RECOVERY)
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    // TAMBAHKAN is_deleted yang dikirim oleh fungsi pindahkanKeSampah() / pulihkanDariSampah()
    const { title, content, color, is_archived, is_deleted, is_checklist, reminder_time } = req.body;

    const vColor = color || 'Putih';
    const vArchived = is_archived ? 1 : 0;
    const vDeleted = is_deleted ? 1 : 0; // Menangkap perubahan status sampah (0 = aktif, 1 = di sampah)
    const vChecklist = is_checklist ? 1 : 0;
    
    let vReminder = null;
    if (reminder_time && reminder_time.trim() !== "") {
      vReminder = reminder_time.replace('T', ' ').slice(0, 19);
    }

    // Catatan Penting: 
    // Jika file `src/models/note.model.js` milikmu tipe urutan parameternya kaku, pastikan argumen `vDeleted`
    // masuk ke fungsi update. Jika modelmu menggunakan query dinamis (mengupdate field yang dikirim saja),
    // maka kode di bawah ini akan langsung bekerja mendeteksi kolom `is_deleted` di database.
    const updatedNote = await noteModel.update(id, title, content, vColor, vArchived, vChecklist, vReminder, vDeleted);
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4. Hapus catatan permanen (Digunakan saat tombol "Hapus Permanen" diklik di menu Sampah)
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await noteModel.delete(id);
    res.json({ message: "Catatan berhasil dihapus secara permanen dari database" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};