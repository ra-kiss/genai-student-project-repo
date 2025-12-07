import { NextRequest, NextResponse } from 'next/server';
import { retrieveRelevantChunks, retrieveInputChunks } from '@/lib/rag';

/**
 * POST /api/rag
 * retrieve relevant chunks from the rag system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 10, useInputs = false } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('RAG query:', query, 'topK:', topK, 'useInputs:', useInputs);

    // retrieve relevant chunks
    let chunks;
    try {
      // Use retrieveInputChunks for OpenAI context, retrieveRelevantChunks for search display
      chunks = useInputs 
        ? await retrieveInputChunks(query, topK || 5) 
        : await retrieveRelevantChunks(query, topK || 10);
      console.log('RAG results:', chunks.length, 'chunks found');
    } catch (ragError: any) {
      console.error('RAG retrieval error:', ragError);
      // Return empty results instead of crashing
      return NextResponse.json({
        success: true,
        query,
        results: [],
        warning: 'Could not retrieve from knowledge base: ' + ragError.message,
      });
    }

    return NextResponse.json({
      success: true,
      query,
      results: chunks || [],
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
