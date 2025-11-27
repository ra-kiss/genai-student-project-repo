import { Flashcard } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Makes a request to OpenAI's Chat Completions API
 */
async function makeOpenAIRequest(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured. Please add your API key to .env.local');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to connect to OpenAI');
  }

  const data = await response.json();
  return data.choices[0].message.content;
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