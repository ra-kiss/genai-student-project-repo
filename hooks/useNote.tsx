'use client';

import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';

const STORAGE_KEY = 'current-note';
const AUTO_SAVE_DELAY = 3000; // 3 seconds

/**
 * Custom hook for managing note state with auto-save
 */
export function useNote() {
  const [note, setNote] = useState<Note>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse saved note:', error);
        }
      }
    }

    // Default note
    return {
      id: `note-${Date.now()}`,
      content: '',
      title: 'Untitled Note',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveNote();
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [note.content, note.title]);

  /**
   * Save note to localStorage
   */
  const saveNote = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsSaving(true);
      try {
        const updatedNote = {
          ...note,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNote));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save note:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [note]);

  /**
   * Update note content
   */
  const updateContent = useCallback((content: string) => {
    setNote(prev => ({
      ...prev,
      content,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  /**
   * Update note title
   */
  const updateTitle = useCallback((title: string) => {
    setNote(prev => ({
      ...prev,
      title,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  /**
   * Create a new note
   */
  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: '',
      title: 'Untitled Note',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNote(newNote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNote));
  }, []);

  return {
    note,
    updateContent,
    updateTitle,
    createNewNote,
    saveNote,
    isSaving,
    lastSaved,
  };
}