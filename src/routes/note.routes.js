const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');

router.get('/notes', noteController.getNotes);
router.post('/notes', noteController.createNote);
router.put('/notes/:id', noteController.updateNote);    // Rute Edit Baru
router.delete('/notes/:id', noteController.deleteNote); // Rute Hapus Baru

module.exports = router;