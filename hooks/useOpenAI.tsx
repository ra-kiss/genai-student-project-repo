'use client';

import { useState, useCallback } from 'react';
import { explainText, generateFlashcards } from '../lib/openai';
import { Flashcard } from '../types';
import { App } from 'antd';

interface UseOpenAIReturn {
  isExplaining: boolean;
  isGeneratingFlashcards: boolean;
  explanation: string | null;
  flashcards: Flashcard[];
  explain: (text: string) => Promise<void>;
  generateCards: (content: string) => Promise<void>;
  clearExplanation: () => void;
  clearFlashcards: () => void;
}

/**
 * Custom hook for managing OpenAI operations with loading and error states
 */
export function useOpenAI(): UseOpenAIReturn {
  const { message } = App.useApp();
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  /**
   * Explain selected text using OpenAI
   */
  const explain = useCallback(async (text: string) => {
    if (!text.trim()) {
      message.warning('Please select some text to explain');
      return;
    }

    setIsExplaining(true);
    const loadingMessage = message.loading('Generating explanation...', 0);

    try {
      const result = await explainText(text);
      setExplanation(result);
      loadingMessage();
      message.success('Explanation generated!');
    } catch (error) {
      loadingMessage();
      console.error('Explanation error:', error);
      
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to generate explanation. Please try again.');
      }
    } finally {
      setIsExplaining(false);
    }
  }, [message]);

  /**
   * Generate flashcards from note content using OpenAI
   */
  const generateCards = useCallback(async (content: string) => {
    if (!content.trim()) {
      message.warning('Please write some content before generating flashcards');
      return;
    }

    setIsGeneratingFlashcards(true);
    const loadingMessage = message.loading('Generating flashcards...', 0);

    try {
      const result = await generateFlashcards(content);
      setFlashcards(result);
      loadingMessage();
      message.success(`Generated ${result.length} flashcards!`);
    } catch (error) {
      loadingMessage();
      console.error('Flashcard generation error:', error);
      
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to generate flashcards. Please try again.');
      }
    } finally {
      setIsGeneratingFlashcards(false);
    }
  }, [message]);

  /**
   * Clear the current explanation
   */
  const clearExplanation = useCallback(() => {
    setExplanation(null);
  }, []);

  /**
   * Clear the generated flashcards
   */
  const clearFlashcards = useCallback(() => {
    setFlashcards([]);
  }, []);

  return {
    isExplaining,
    isGeneratingFlashcards,
    explanation,
    flashcards,
    explain,
    generateCards,
    clearExplanation,
    clearFlashcards,
  };
}