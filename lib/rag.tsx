import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { pipeline } from '@xenova/transformers';

// Dynamic import for faiss-node to avoid Next.js issues
let IndexFlatL2: any = null;

// Lazy-loaded resources
let metadata: any[] = [];
let embedder: any = null;
let faissIndex: any = null;

/**
 * Initialize FAISS index and metadata
 */
async function initializeRAG() {
  const ragDataPath = path.join(process.cwd(), 'rag-data');
  const metadataPath = path.join(ragDataPath, 'metadata.csv');
  const indexPath = path.join(ragDataPath, 'faiss_index');

  // Load metadata.csv
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

  // Load FAISS index (only try once)
  if (faissIndex === null) {
    if (!fs.existsSync(indexPath)) {
      console.warn('FAISS index file not found at:', indexPath);
      faissIndex = false;
    } else {
      try {
        console.log('Attempting to load FAISS index from:', indexPath);
        // Dynamic import to avoid Next.js bundling issues
        const faiss = await import('faiss-node');
        IndexFlatL2 = faiss.IndexFlatL2;
        
        // Read the FAISS index from file
        faissIndex = IndexFlatL2.read(indexPath);
        console.log('Loaded FAISS index with', faissIndex.ntotal(), 'vectors');
      } catch (error) {
        console.error('Error loading FAISS index:', error);
        console.log('Falling back to simple similarity search');
        faissIndex = false; // Mark as failed to avoid retrying
      }
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

/**
 * Simple semantic search without FAISS (using embeddings only)
 * Returns results based on cosine similarity
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

/**
 * Retrieve relevant chunks from the RAG system (outputs only for search display)
 * Uses FAISS index if available, falls back to simple similarity search
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

    // Filter metadata for output types only
    const outputMetadata = metadata.filter((item: any) => 
      item.Type && item.Type.toLowerCase() === 'output'
    );

    let results: any[] = [];

    // Use FAISS index if available
    if (faissIndex && faissIndex !== false) {
      try {
        console.log('→ Using FAISS index for search');
        
        // Search FAISS index
        const k = Math.min(topK * 2, faissIndex.ntotal()); // Get more results to filter by type
        const searchResults = faissIndex.search(queryVector, k);
        
        // Map results to metadata (filter for outputs)
        results = searchResults.labels
          .map((idx: number, i: number) => {
            const metadataItem = metadata[idx];
            if (!metadataItem || metadataItem.Type?.toLowerCase() !== 'output') {
              return null;
            }
            // Normalize distance to 0-1 range (L2 distance, smaller is better)
            // Convert to similarity score (1 - normalized_distance)
            const normalizedDistance = Math.min(searchResults.distances[i] / 2, 1);
            return {
              index: idx,
              distance: normalizedDistance,
              ...metadataItem,
            };
          })
          .filter((item: any) => item !== null)
          .slice(0, topK);
        
        console.log('✓ FAISS retrieved', results.length, 'output results');
      } catch (error) {
        console.error('✗ Error using FAISS index:', error);
        console.log('→ Falling back to embedding-based similarity');
        faissIndex = false; // Disable FAISS for future calls
      }
    }

    // Fallback: Use embeddings with cosine similarity (better than text matching)
    if (faissIndex === false || results.length === 0) {
      console.log('→ Using embedding-based cosine similarity (no FAISS native bindings in Next.js)');
      
      // We need to compute embeddings for all chunks - this is expensive but accurate
      // For better performance, pre-compute and cache embeddings
      const chunkTexts = outputMetadata.map((item: any) => 
        item.Text || item.chunk || item.text || ''
      );
      
      // Compute similarities
      const similarities = await Promise.all(
        chunkTexts.map(async (text: string, idx: number) => {
          const chunkEmbedding = await model(text, { pooling: 'mean', normalize: true });
          const chunkVector = Float32Array.from(chunkEmbedding.data);
          const similarity = cosineSimilarity(queryVector, chunkVector);
          return {
            index: idx,
            distance: 1 - similarity, // Convert similarity to distance
            ...outputMetadata[idx],
          };
        })
      );
      
      results = similarities
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, topK);
    }

    console.log('Retrieved', results.length, 'results');
    return results;
  } catch (error) {
    console.error('Error in retrieveRelevantChunks:', error);
    return [];
  }
}

/**
 * Retrieve input chunks for OpenAI context enhancement
 * Uses FAISS index if available, falls back to simple similarity search
 * @param query - The search query
 * @param topK - Number of results to return (default: 5)
 */
export async function retrieveInputChunks(query: string, topK: number = 5) {
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

    // Filter metadata for input types only
    const inputMetadata = metadata.filter((item: any) => 
      item.Type && item.Type.toLowerCase() === 'input'
    );

    let results: any[] = [];

    // Use FAISS index if available
    if (faissIndex && faissIndex !== false) {
      try {
        console.log('→ Using FAISS index for input chunks');
        
        // Search FAISS index
        const k = Math.min(topK * 2, faissIndex.ntotal()); // Get more results to filter by type
        const searchResults = faissIndex.search(queryVector, k);
        
        // Map results to metadata (filter for inputs)
        results = searchResults.labels
          .map((idx: number, i: number) => {
            const metadataItem = metadata[idx];
            if (!metadataItem || metadataItem.Type?.toLowerCase() !== 'input') {
              return null;
            }
            // Normalize distance to 0-1 range
            const normalizedDistance = Math.min(searchResults.distances[i] / 2, 1);
            return {
              index: idx,
              distance: normalizedDistance,
              ...metadataItem,
            };
          })
          .filter((item: any) => item !== null)
          .slice(0, topK);
        
        console.log('✓ FAISS retrieved', results.length, 'input chunks for OpenAI context');
      } catch (error) {
        console.error('✗ Error using FAISS index for inputs:', error);
      }
    }

    // Fallback: Use embeddings with cosine similarity
    if (faissIndex === false || results.length === 0) {
      console.log('→ Using embedding-based cosine similarity for input chunks');
      
      const chunkTexts = inputMetadata.map((item: any) => 
        item.Text || item.chunk || item.text || ''
      );
      
      // Compute similarities
      const similarities = await Promise.all(
        chunkTexts.map(async (text: string, idx: number) => {
          const chunkEmbedding = await model(text, { pooling: 'mean', normalize: true });
          const chunkVector = Float32Array.from(chunkEmbedding.data);
          const similarity = cosineSimilarity(queryVector, chunkVector);
          return {
            index: idx,
            distance: 1 - similarity,
            ...inputMetadata[idx],
          };
        })
      );
      
      results = similarities
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, topK);
    }

    console.log('Retrieved', results.length, 'input chunks for OpenAI context');
    return results;
  } catch (error) {
    console.error('Error in retrieveInputChunks:', error);
    return [];
  }
}