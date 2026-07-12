const noteModel = require('../models/note.model');

// Handler untuk GET (Tampil Data)
exports.getNotes = async (req, res) => {
  try {
    const notes = await noteModel.getAll();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler untuk POST (Tambah Data)
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = await noteModel.create(title, content);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler untuk PUT (Edit Data)
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedNote = await noteModel.update(id, title, content);
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler untuk DELETE (Hapus Data)
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await noteModel.delete(id);
    res.json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};