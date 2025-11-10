const pool = require('../config/database');

// Get all notes for a user
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY is_pinned DESC, updated_at DESC',
      [userId]
    );

    res.json({
      success: true,
      notes: result.rows
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, color } = req.body;

    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title || '', content || '', color || 'default']
    );

    res.status(201).json({
      success: true,
      note: result.rows[0]
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, color, is_pinned } = req.body;

    // Check if note belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const result = await pool.query(
      `UPDATE notes 
       SET title = $1, content = $2, color = $3, is_pinned = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 AND user_id = $6 
       RETURNING *`,
      [title, content, color, is_pinned, noteId, userId]
    );

    res.json({
      success: true,
      note: result.rows[0]
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Toggle pin status
exports.togglePin = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const result = await pool.query(
      `UPDATE notes 
       SET is_pinned = NOT is_pinned, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      note: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
