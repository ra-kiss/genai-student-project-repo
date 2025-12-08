import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { pipeline } from '@xenova/transformers';

// Lazy-loaded resources
let metadata: any[] = [];
let embedder: any = null;

/**
 * Initialize metadata only (skip FAISS for now due to Next.js native binding issues)
 */
async function initializeRAG() {
  if (metadata.length > 0) return;

  const ragDataPath = path.join(process.cwd(), 'rag-data');
  const metadataPath = path.join(ragDataPath, 'metadata.csv');

  // load metadata.csv
  if (metadata.length === 0) {
    try {
      const metadataCSV = fs.readFileSync(metadataPath, 'utf-8');
      metadata = parse(metadataCSV, {
        columns: true,
        skip_empty_lines: true,
      });
      console.log('Loaded', metadata.length, 'metadata entries');
    } catch (error) {
      console.error('Error loading metadata:', error);
      metadata = [];
    }
  }
}

/**
 * Load sentence embedding model (MiniLM)
 */
async function loadEmbedder() {
  if (!embedder) {
    try {
      embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedder loaded');
    } catch (error) {
      console.error('Error loading embedder:', error);
      embedder = null;
    }
  }
  return embedder;
}

// NOT USED ANYMORE
/**
 * Simple semantic search using embeddings
 * Returns results based on cosine similarity
 */
// function cosineSimilarity(a: Float32Array, b: Float32Array): number {
//   let dotProduct = 0;
//   let normA = 0;
//   let normB = 0;

//   for (let i = 0; i < a.length; i++) {
//     dotProduct += a[i] * b[i];
//     normA += a[i] * a[i];
//     normB += b[i] * b[i];
//   }

//   normA = Math.sqrt(normA);
//   normB = Math.sqrt(normB);

//   if (normA === 0 || normB === 0) return 0;
//   return dotProduct / (normA * normB);
// }

/**
 * Retrieve relevant chunks from the RAG system (outputs only for search display)
 * @param query - The search query
 * @param topK - Number of results to return (default: 10)
 */
export async function retrieveRelevantChunks(query: string, topK: number = 10) {
  try {
    // Initialize RAG resources
    await initializeRAG();

    // Load embedding model
    const model = await loadEmbedder();

    if (!model) {
      console.warn('Embedder not available, returning empty results');
      return [];
    }

    if (metadata.length === 0) {
      console.warn('No metadata available, returning empty results');
      return [];
    }

    // Embed the query
    const queryEmbedding = await model(query, { pooling: 'mean', normalize: true });
    const queryVector = Float32Array.from(queryEmbedding.data);

    // Simple similarity search on metadata - filter for output types only
    const results = metadata
      .filter((item: any) => item.Type && item.Type.toLowerCase() === 'output')
      .map((item: any, idx: number) => {
        // Use a simple scoring based on text matching as fallback
        const chunkText = (item.Text || item.chunk || item.text || '').toString().toLowerCase();
        const queryLower = query.toLowerCase();
        
        // Simple similarity: how many query words appear in chunk
        const queryWords = queryLower.split(/\s+/);
        const matches = queryWords.filter((word) =>
          chunkText.includes(word) && word.length > 2
        ).length;
        
        const distance = 1 - (matches / Math.max(queryWords.length, 1)) * 0.5;

        return {
          index: idx,
          distance,
          ...item,
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, topK);

    console.log('Retrieved', results.length, 'results');
    return results;
  } catch (error) {
    console.error('Error in retrieveRelevantChunks:', error);
    return [];
  }
}

/**
 * Retrieve input chunks for OpenAI context enhancement
 * @param query - The search query
 * @param topK - Number of results to return (default: 5)
 */
export async function retrieveInputChunks(query: string, topK: number = 5) {
  try {
    // Initialize RAG resources
    await initializeRAG();

    if (metadata.length === 0) {
      console.warn('No metadata available, returning empty results');
      return [];
    }

    const queryLower = query.toLowerCase();

    // Simple similarity search on metadata - filter for input types only
    const results = metadata
      .filter((item: any) => item.Type && item.Type.toLowerCase() === 'input')
      .map((item: any, idx: number) => {
        // Use a simple scoring based on text matching as fallback
        const chunkText = (item.Text || item.chunk || item.text || '').toString().toLowerCase();
        
        // Simple similarity: how many query words appear in chunk
        const queryWords = queryLower.split(/\s+/);
        const matches = queryWords.filter((word) =>
          chunkText.includes(word) && word.length > 2
        ).length;
        
        const distance = 1 - (matches / Math.max(queryWords.length, 1)) * 0.5;

        return {
          index: idx,
          distance,
          ...item,
        };
      })
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, topK);

    console.log('Retrieved', results.length, 'input chunks for OpenAI context');
    return results;
  } catch (error) {
    console.error('Error in retrieveInputChunks:', error);
    return [];
  }
}
