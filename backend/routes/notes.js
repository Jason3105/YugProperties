const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notesController = require('../controllers/notesController');

// All routes require authentication
router.get('/', auth, notesController.getNotes);
router.post('/', auth, notesController.createNote);
router.put('/:id', auth, notesController.updateNote);
router.delete('/:id', auth, notesController.deleteNote);
router.patch('/:id/pin', auth, notesController.togglePin);

module.exports = router;
