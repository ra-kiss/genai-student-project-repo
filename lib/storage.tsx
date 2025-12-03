import { Note } from '../types';

const NOTES_KEY = 'notes-list';
const CURRENT_NOTE_ID_KEY = 'current-note-id';

/**
 * Get all notes from localStorage
 */
export function getAllNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const notesJson = localStorage.getItem(NOTES_KEY);
    if (!notesJson) return [];
    return JSON.parse(notesJson);
  } catch (error) {
    console.error('Failed to load notes:', error);
    return [];
  }
}

/**
 * Save all notes to localStorage
 */
export function saveAllNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes:', error);
  }
}

/**
 * Get a specific note by ID
 */
export function getNoteById(id: string): Note | null {
  const notes = getAllNotes();
  return notes.find(note => note.id === id) || null;
}

/**
 * Save or update a note
 */
export function saveNote(note: Note): void {
  const notes = getAllNotes();
  const index = notes.findIndex(n => n.id === note.id);
  
  if (index >= 0) {
    notes[index] = note;
  } else {
    notes.push(note);
  }
  
  saveAllNotes(notes);
}

/**
 * Delete a note by ID
 */
export function deleteNote(id: string): void {
  const notes = getAllNotes();
  const filtered = notes.filter(note => note.id !== id);
  saveAllNotes(filtered);
}

/**
 * Get the current note ID
 */
export function getCurrentNoteId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_NOTE_ID_KEY);
}

/**
 * Set the current note ID
 */
export function setCurrentNoteId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_NOTE_ID_KEY, id);
}

/**
 * Create a new note
 */
export function createNewNote(): Note {
  const newNote: Note = {
    id: `note-${Date.now()}`,
    content: '',
    title: 'Untitled Note',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveNote(newNote);
  setCurrentNoteId(newNote.id);
  
  return newNote;
}