'use client';

import { useState, useCallback } from 'react';
import { explainText, expandText, summarizeText, generateFlashcards } from '../lib/openai';
import { Flashcard } from '../types';
import { App } from 'antd';

interface UseOpenAIReturn {
  isExplaining: boolean;
  isExpanding: boolean;
  isSummarizing: boolean;
  isGeneratingFlashcards: boolean;
  explanation: string | null;
  expansion: string | null;
  summary: string | null;
  flashcards: Flashcard[];
  explain: (text: string) => Promise<void>;
  expand: (text: string) => Promise<void>;
  summarize: (text: string) => Promise<void>;
  generateCards: (content: string) => Promise<void>;
  clearExplanation: () => void;
  clearExpansion: () => void;
  clearSummary: () => void;
  clearFlashcards: () => void;
}

/**
 * Custom hook for managing OpenAI operations with loading and error states
 */
export function useOpenAI(): UseOpenAIReturn {
  const { message } = App.useApp();
  const [isExplaining, setIsExplaining] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [expansion, setExpansion] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
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
   * Expand selected text using OpenAI
   */
  const expand = useCallback(async (text: string) => {
    if (!text.trim()) {
      message.warning('Please select some text to expand');
      return;
    }

    setIsExpanding(true);
    const loadingMessage = message.loading('Expanding text...', 0);

    try {
      const result = await expandText(text);
      setExpansion(result);
      loadingMessage();
      message.success('Text expanded!');
    } catch (error) {
      loadingMessage();
      console.error('Expansion error:', error);
      
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to expand text. Please try again.');
      }
    } finally {
      setIsExpanding(false);
    }
  }, [message]);

  /**
   * Summarize selected text using OpenAI
   */
  const summarize = useCallback(async (text: string) => {
    if (!text.trim()) {
      message.warning('Please select some text to summarize');
      return;
    }

    setIsSummarizing(true);
    const loadingMessage = message.loading('Summarizing text...', 0);

    try {
      const result = await summarizeText(text);
      setSummary(result);
      loadingMessage();
      message.success('Summary generated!');
    } catch (error) {
      loadingMessage();
      console.error('Summary error:', error);
      
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to summarize text. Please try again.');
      }
    } finally {
      setIsSummarizing(false);
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
   * Clear the current expansion
   */
  const clearExpansion = useCallback(() => {
    setExpansion(null);
  }, []);

  /**
   * Clear the current summary
   */
  const clearSummary = useCallback(() => {
    setSummary(null);
  }, []);

  /**
   * Clear the generated flashcards
   */
  const clearFlashcards = useCallback(() => {
    setFlashcards([]);
  }, []);

  return {
    isExplaining,
    isExpanding,
    isSummarizing,
    isGeneratingFlashcards,
    explanation,
    expansion,
    summary,
    flashcards,
    explain,
    expand,
    summarize,
    generateCards,
    clearExplanation,
    clearExpansion,
    clearSummary,
    clearFlashcards,
  };
}