import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import LoadingScreen from '../components/LoadingScreen';
import { 
  StickyNote,
  Plus,
  Pin,
  Trash2,
  ArrowLeft,
  PinOff,
  Palette,
  Check
} from 'lucide-react';

const COLORS = [
  { name: 'Default', value: 'default', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200' },
  { name: 'Red', value: 'red', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200' },
  { name: 'Green', value: 'green', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200' },
];

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'default' });
  const [editingNote, setEditingNote] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.title && !newNote.content) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNote)
      });
      
      if (response.ok) {
        setNewNote({ title: '', content: '', color: 'default' });
        setIsCreating(false);
        fetchNotes();
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const updateNote = async (noteId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setEditingNote(null);
        fetchNotes();
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const togglePin = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${noteId}/pin`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleColorChange = (noteId, color) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, { ...note, color });
    }
    setShowColorPicker(null);
  };

  const getColorClasses = (color) => {
    const colorObj = COLORS.find(c => c.value === color) || COLORS[0];
    return `${colorObj.bg} border ${colorObj.border}`;
  };

  const pinnedNotes = notes.filter(note => note.is_pinned);
  const unpinnedNotes = notes.filter(note => !note.is_pinned);

  if (loading) {
    return <LoadingScreen message="Loading notes..." />;
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <StickyNote className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notes</h1>
              <p className="text-muted-foreground">{notes.length} notes</p>
            </div>
          </div>
        </div>

        {/* Create Note Box */}
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardContent className="pt-6">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full text-left px-4 py-3 text-muted-foreground hover:bg-muted/50 rounded-md transition-colors"
              >
                Take a note...
              </button>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="font-semibold"
                />
                <textarea
                  placeholder="Take a note..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewNote({ ...newNote, color: color.value })}
                        className={`w-8 h-8 rounded-full border-2 ${color.bg} ${
                          newNote.color === color.value ? 'border-primary' : 'border-transparent'
                        } hover:border-primary/50 transition-colors`}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => { setIsCreating(false); setNewNote({ title: '', content: '', color: 'default' }); }}>
                      Cancel
                    </Button>
                    <Button onClick={createNote}>
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-2">PINNED</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onColorChange={handleColorChange}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  getColorClasses={getColorClasses}
                  editingNote={editingNote}
                  setEditingNote={setEditingNote}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Notes */}
        {unpinnedNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-2">OTHERS</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onTogglePin={togglePin}
                  onColorChange={handleColorChange}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  getColorClasses={getColorClasses}
                  editingNote={editingNote}
                  setEditingNote={setEditingNote}
                />
              ))}
            </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="text-center py-16">
            <StickyNote className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl text-muted-foreground">No notes yet</p>
            <p className="text-sm text-muted-foreground mt-2">Click "Take a note..." to create your first note</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Note Card Component
const NoteCard = ({ 
  note, 
  onUpdate, 
  onDelete, 
  onTogglePin, 
  onColorChange, 
  showColorPicker, 
  setShowColorPicker,
  getColorClasses,
  editingNote,
  setEditingNote
}) => {
  const [editData, setEditData] = useState({ title: note.title, content: note.content });

  const handleSave = () => {
    onUpdate(note.id, { ...note, ...editData });
  };

  const isEditing = editingNote === note.id;

  return (
    <Card 
      className={`${getColorClasses(note.color)} group hover:shadow-lg transition-all cursor-pointer relative`}
      onClick={() => !isEditing && setEditingNote(note.id)}
    >
      <CardContent className="pt-4 pb-3">
        {isEditing ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              placeholder="Title"
              className="font-semibold bg-transparent border-none focus:ring-0"
            />
            <textarea
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              placeholder="Note"
              className="w-full min-h-[100px] bg-transparent border-none resize-none focus:outline-none"
            />
          </div>
        ) : (
          <div>
            {note.title && (
              <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
            )}
            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
          </div>
        )}

        {/* Actions */}
        <div className={`flex items-center justify-between mt-3 pt-2 border-t ${note.color !== 'default' ? 'border-gray-300/50' : ''} ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTogglePin(note.id)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              title={note.is_pinned ? 'Unpin' : 'Pin'}
            >
              {note.is_pinned ? (
                <PinOff className="w-4 h-4" />
              ) : (
                <Pin className="w-4 h-4" />
              )}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(showColorPicker === note.id ? null : note.id)}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                title="Change color"
              >
                <Palette className="w-4 h-4" />
              </button>
              
              {showColorPicker === note.id && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onColorChange(note.id, color.value)}
                      className={`w-6 h-6 rounded-full ${color.bg} border hover:border-primary transition-colors ${
                        note.color === color.value ? 'ring-2 ring-primary' : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {isEditing && (
            <Button size="sm" onClick={handleSave}>
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Notes;
