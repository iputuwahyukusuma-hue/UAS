const noteModel = require('../models/note.model');

exports.getNotes = async (req, res) => {
  try {
    const notes = await noteModel.getAll();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time } = req.body;
    const vColor = color || 'Putih';
    const vLabel = label || null;
    const vArchived = is_archived ? 1 : 0;
    const vChecklist = is_checklist ? 1 : 0;
    
    let vReminder = null;
    if (reminder_time && reminder_time.trim() !== "") {
      vReminder = reminder_time.replace('T', ' ').slice(0, 19); 
    }

    const newNote = await noteModel.create(title, content, vColor, vLabel, vArchived, vChecklist, vReminder);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, color, label, is_archived, is_deleted, is_checklist, reminder_time } = req.body;

    const vColor = color || 'Putih';
    const vLabel = label || null;
    const vArchived = is_archived ? 1 : 0;
    const vDeleted = is_deleted ? 1 : 0;
    const vChecklist = is_checklist ? 1 : 0;
    
    let vReminder = null;
    if (reminder_time && reminder_time.trim() !== "") {
      vReminder = reminder_time.replace('T', ' ').slice(0, 19);
    }

    const updatedNote = await noteModel.update(id, title, content, vColor, vLabel, vArchived, vChecklist, vReminder, vDeleted);
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await noteModel.delete(id);
    res.json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};