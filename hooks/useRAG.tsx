'use client';

import { useState } from 'react';

export interface RAGChunk {
  distance: number;
  [key: string]: any; // additional metadata fields from csv
}

export interface RAGResponse {
  success: boolean;
  query: string;
  results: RAGChunk[];
}

export function useRAG() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * query the rag system for relevant chunks
    * @param query - search query
    * @param topK - number of results to return (default: 10 for display, 5 for inputs)
    * @param useInputs - if true, retrieve input types for OpenAI context
    */
  const queryRAG = async (query: string, topK?: number, useInputs: boolean = false): Promise<RAGChunk[]> => {
    setIsLoading(true);
    setError(null);

    const defaultTopK = useInputs ? 5 : 10;

    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, topK: topK || defaultTopK, useInputs }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('RAG API error response:', text);
        throw new Error(`Failed to retrieve results (${response.status})`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from RAG API');
      }

      try {
        const data: RAGResponse = JSON.parse(text);
        return data.results || [];
      } catch (parseError) {
        console.error('Failed to parse RAG response:', text);
        throw new Error('Invalid response format from RAG API');
      }
    } catch (err: any) {
      console.error('RAG query error:', err);
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queryRAG,
    isLoading,
    error,
  };
}
