'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flashcard } from '../types';

const STORAGE_KEY_PREFIX = 'flashcards-';

/**
 * Custom hook for managing flashcards for a specific note
 */
export function useFlashcards(noteId: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  /**
   * Load flashcards from storage
   */
  const loadFlashcards = useCallback(() => {
    if (typeof window === 'undefined' || !noteId) return;

    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${noteId}`);
      if (saved) {
        setFlashcards(JSON.parse(saved));
      } else {
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Failed to load flashcards:', error);
      setFlashcards([]);
    }
  }, [noteId]);

  // Load flashcards when noteId changes
  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  /**
   * Save flashcards to localStorage
   */
  const saveFlashcards = useCallback((cards: Flashcard[]) => {
    if (typeof window === 'undefined' || !noteId) return;

    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${noteId}`, JSON.stringify(cards));
      setFlashcards(cards);
    } catch (error) {
      console.error('Failed to save flashcards:', error);
    }
  }, [noteId]);

  /**
   * Add new flashcards (replaces existing)
   */
  const setNewFlashcards = useCallback((cards: Flashcard[]) => {
    const cardsWithNoteId = cards.map(card => ({
      ...card,
      noteId,
    }));
    saveFlashcards(cardsWithNoteId);
  }, [noteId, saveFlashcards]);

  /**
   * Import flashcards (appends to existing)
   */
  const importFlashcards = useCallback((cards: Flashcard[]) => {
    const cardsWithNoteId = cards.map(card => ({
      ...card,
      noteId,
    }));
    const merged = [...flashcards, ...cardsWithNoteId];
    saveFlashcards(merged);
  }, [noteId, flashcards, saveFlashcards]);

  /**
   * Update a single flashcard
   */
  const updateFlashcard = useCallback((id: string, question: string, answer: string) => {
    const updated = flashcards.map(card =>
      card.id === id ? { ...card, question, answer } : card
    );
    saveFlashcards(updated);
  }, [flashcards, saveFlashcards]);

  /**
   * Delete a flashcard
   */
  const deleteFlashcard = useCallback((id: string) => {
    const filtered = flashcards.filter(card => card.id !== id);
    saveFlashcards(filtered);
  }, [flashcards, saveFlashcards]);

  /**
   * Clear all flashcards
   */
  const clearFlashcards = useCallback(() => {
    saveFlashcards([]);
  }, [saveFlashcards]);

  /**
   * Refresh flashcards from storage
   */
  const refreshFlashcards = useCallback(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  return {
    flashcards,
    setNewFlashcards,
    importFlashcards,
    updateFlashcard,
    deleteFlashcard,
    clearFlashcards,
    refreshFlashcards,
  };
}