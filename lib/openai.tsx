import { Flashcard } from '../types';

// Now we call our own API route instead of OpenAI directly
const API_URL = '/api/openai';

export interface RAGContext {
  distance?: number;
  chunk?: string;
  text?: string;
  source?: string;
  topic?: string;
  category?: string;
  [key: string]: any;
}

/**
 * Makes a request to our Next.js API route (which then calls OpenAI)
 */
async function makeOpenAIRequest(messages: Array<{ role: string; content: string }>) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to connect to API');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Format RAG context for inclusion in prompts
 */
function formatRAGContext(ragResults: RAGContext[]): string {
  if (!ragResults || ragResults.length === 0) return '';
  
  const formattedResults = ragResults
    .map((result, i) => {
      const text = (result as any).Text || result.chunk || result.text || '';
      return `${i + 1}. ${text}`;
    })
    .join('\n');

  return `\n\n---\nRELATED CONTEXT FROM KNOWLEDGE BASE:\n${formattedResults}\n---`;
}

/**
 * Explains a selected piece of text in simpler terms
 * Useful for computer science concepts, code snippets, etc.
 */
export async function explainText(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('No text provided to explain');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful computer science tutor. Explain concepts clearly and concisely, as if teaching a university student. Use examples when helpful.',
    },
    {
      role: 'user',
      content: `Please explain the following text in simpler terms:\n\n${text}`,
    },
  ];

  return await makeOpenAIRequest(messages);
}

/**
 * Expands a selected piece of text with more detail and context
 * Useful for brief notes that need elaboration
 */
export async function expandText(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('No text provided to expand');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful computer science tutor. Expand on the given text by adding more detail, context, examples, and explanations. Make it comprehensive and educational for a university student.',
    },
    {
      role: 'user',
      content: `Please expand on the following text with more detail, examples, and context:\n\n${text}`,
    },
  ];

  return await makeOpenAIRequest(messages);
}

/**
 * Summarizes a selected piece of text into key points
 * Useful for condensing long passages or complex explanations
 */
export async function summarizeText(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('No text provided to summarize');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful study assistant. Summarize the given text into clear, concise key points. Focus on the most important information that a computer science student should remember.',
    },
    {
      role: 'user',
      content: `Please summarize the following text into key points:\n\n${text}`,
    },
  ];

  return await makeOpenAIRequest(messages);
}

/**
 * Generates flashcards from note content
 * Creates question-answer pairs suitable for studying
 */
export async function generateFlashcards(noteContent: string): Promise<Flashcard[]> {
  if (!noteContent.trim()) {
    throw new Error('No content provided to generate flashcards');
  }

  const messages = [
    {
      role: 'system',
      content: `You are a helpful study assistant. Generate flashcards from the provided notes. 
Return ONLY a valid JSON array of flashcards with this exact format:
[
  {"question": "What is...", "answer": "..."},
  {"question": "How does...", "answer": "..."}
]
Create 5-10 flashcards focusing on key concepts, definitions, and important details.`,
    },
    {
      role: 'user',
      content: `Generate flashcards from these notes:\n\n${noteContent}`,
    },
  ];

  const response = await makeOpenAIRequest(messages);

  try {
    // Parse the JSON response
    const flashcards = JSON.parse(response);
    
    // Add IDs to each flashcard
    return flashcards.map((card: { question: string; answer: string }, index: number) => ({
      id: `flashcard-${Date.now()}-${index}`,
      question: card.question,
      answer: card.answer,
    }));
  } catch (error) {
    console.error('Failed to parse flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

/**
 * Enhanced: Explain text with RAG context from knowledge base
 * Provides more accurate explanations based on relevant knowledge
 */
export async function explainTextWithRAG(text: string, ragContext?: RAGContext[]): Promise<string> {
  if (!text.trim()) {
    throw new Error('No text provided to explain');
  }

  const ragInfo = formatRAGContext(ragContext || []);

  const messages = [
    {
      role: 'system',
      content: `You are a helpful computer science tutor. Explain concepts clearly and concisely, as if teaching a university student. Use examples when helpful.${ragInfo ? '\n\nIMPORTANT: Below are related input examples from the knowledge base. Use these inputs to provide more comprehensive and accurate explanations with concrete examples.' : ''}`,
    },
    {
      role: 'user',
      content: `Please explain the following text in simpler terms, using the related examples provided:\n\n${text}${ragInfo}`,
    },
  ];

  return await makeOpenAIRequest(messages);
}

/**
 * Enhanced: Expand text with RAG context from knowledge base
 * Provides more detailed expansions based on relevant materials
 */
export async function expandTextWithRAG(text: string, ragContext?: RAGContext[]): Promise<string> {
  if (!text.trim()) {
    throw new Error('No text provided to expand');
  }

  const ragInfo = formatRAGContext(ragContext || []);

  const messages = [
    {
      role: 'system',
      content: `You are a helpful computer science tutor. Expand on the given text by adding more detail, context, examples, and explanations. Make it comprehensive and educational for a university student.${ragInfo ? '\n\nIMPORTANT: Below are related input examples from the knowledge base. Use these inputs as foundation to expand and elaborate with concrete examples, use cases, and detailed explanations.' : ''}`,
    },
    {
      role: 'user',
      content: `Please expand on the following text with more detail, examples, and context using the related inputs provided:\n\n${text}${ragInfo}`,
    },
  ];

  return await makeOpenAIRequest(messages);
}

/**
 * Enhanced: Summarize text with RAG context from knowledge base
 * Provides more focused summaries based on relevant materials
 */
export async function summarizeTextWithRAG(text: string, ragContext?: RAGContext[]): Promise<string> {
  if (!text.trim()) {
    throw new Error('No text provided to summarize');
  }

  const ragInfo = formatRAGContext(ragContext || []);

  const messages = [
    {
      role: 'system',
      content: `You are a helpful study assistant. Summarize the given text into clear, concise key points. Focus on the most important information that a computer science student should remember.${ragInfo ? '\n\nIMPORTANT: Below are related input examples from the knowledge base. Consider these examples when identifying the most important points to summarize.' : ''}`,
    },
    {
      role: 'user',
      content: `Please summarize the following text into key points, considering the related examples provided:\n\n${text}${ragInfo}`,
    },
  ];

  return await makeOpenAIRequest(messages);
}

/**
 * Enhanced: Generate flashcards with RAG context from knowledge base
 * Creates more comprehensive flashcards based on relevant materials
 */
export async function generateFlashcardsWithRAG(noteContent: string, ragContext?: RAGContext[]): Promise<Flashcard[]> {
  if (!noteContent.trim()) {
    throw new Error('No content provided to generate flashcards');
  }

  const ragInfo = formatRAGContext(ragContext || []);

  const messages = [
    {
      role: 'system',
      content: `You are a helpful study assistant. Generate flashcards from the provided notes. 
Return ONLY a valid JSON array of flashcards with this exact format:
[
  {"question": "What is...", "answer": "..."},
  {"question": "How does...", "answer": "..."}
]
Create 5-10 flashcards focusing on key concepts, definitions, and important details.${ragInfo ? '\n\nConsider the provided knowledge base results to create more comprehensive and accurate flashcards.' : ''}`,
    },
    {
      role: 'user',
      content: `Generate flashcards from these notes:\n\n${noteContent}${ragInfo}`,
    },
  ];

  const response = await makeOpenAIRequest(messages);

  try {
    const flashcards = JSON.parse(response);
    return flashcards.map((card: { question: string; answer: string }, index: number) => ({
      id: `flashcard-${Date.now()}-${index}`,
      question: card.question,
      answer: card.answer,
    }));
  } catch (error) {
    console.error('Failed to parse flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}