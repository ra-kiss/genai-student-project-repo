'use client';

import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { 
  getAllNotes, 
  getNoteById, 
  saveNote as saveNoteToStorage, 
  deleteNote as deleteNoteFromStorage,
  getCurrentNoteId,
  setCurrentNoteId,
  createNewNote as createNewNoteInStorage
} from '../lib/storage';

const AUTO_SAVE_DELAY = 3000; // 3 seconds

/**
 * Custom hook for managing note state with auto-save
 */
export function useNote() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load notes on mount
  useEffect(() => {
    const notes = getAllNotes();
    setAllNotes(notes);
    
    // Load current note or create a new one
    const currentId = getCurrentNoteId();
    if (currentId) {
      const note = getNoteById(currentId);
      if (note) {
        setCurrentNote(note);
        return;
      }
    }
    
    // If no current note, create or load the first one
    if (notes.length > 0) {
      setCurrentNote(notes[0]);
      setCurrentNoteId(notes[0].id);
    } else {
      const newNote = createNewNoteInStorage();
      setCurrentNote(newNote);
      setAllNotes([newNote]);
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!currentNote) return;
    
    const timeoutId = setTimeout(() => {
      saveNote();
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [currentNote?.content, currentNote?.title]);

  /**
   * Save current note to localStorage
   */
  const saveNote = useCallback(() => {
    if (!currentNote || typeof window === 'undefined') return;
    
    setIsSaving(true);
    try {
      const updatedNote = {
        ...currentNote,
        updatedAt: new Date().toISOString(),
      };
      
      saveNoteToStorage(updatedNote);
      setCurrentNote(updatedNote);
      
      // Update in allNotes array
      setAllNotes(prev => {
        const index = prev.findIndex(n => n.id === updatedNote.id);
        if (index >= 0) {
          const newNotes = [...prev];
          newNotes[index] = updatedNote;
          return newNotes;
        }
        return [...prev, updatedNote];
      });
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentNote]);

  /**
   * Update note content
   */
  const updateContent = useCallback((content: string) => {
    if (!currentNote) return;
    
    setCurrentNote(prev => prev ? {
      ...prev,
      content,
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentNote]);

  /**
   * Update note title
   */
  const updateTitle = useCallback((title: string) => {
    if (!currentNote) return;
    
    setCurrentNote(prev => prev ? {
      ...prev,
      title,
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentNote]);

  /**
   * Create a new note
   */
  const createNewNote = useCallback(() => {
    const newNote = createNewNoteInStorage();
    setCurrentNote(newNote);
    setAllNotes(prev => [...prev, newNote]);
  }, []);

  /**
   * Switch to a different note
   */
  const switchNote = useCallback((noteId: string) => {
    const note = getNoteById(noteId);
    if (note) {
      setCurrentNote(note);
      setCurrentNoteId(noteId);
    }
  }, []);

  /**
   * Delete a note
   */
  const deleteNote = useCallback((noteId: string) => {
    deleteNoteFromStorage(noteId);
    
    setAllNotes(prev => {
      const filtered = prev.filter(n => n.id !== noteId);
      
      // If we deleted the current note, switch to another one
      if (currentNote?.id === noteId) {
        if (filtered.length > 0) {
          setCurrentNote(filtered[0]);
          setCurrentNoteId(filtered[0].id);
        } else {
          // Create a new note if no notes left
          const newNote = createNewNoteInStorage();
          setCurrentNote(newNote);
          return [newNote];
        }
      }
      
      return filtered;
    });
  }, [currentNote]);

  return {
    note: currentNote,
    allNotes,
    updateContent,
    updateTitle,
    createNewNote,
    switchNote,
    deleteNote,
    saveNote,
    isSaving,
    lastSaved,
  };
}