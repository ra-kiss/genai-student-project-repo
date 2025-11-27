export interface Note {
  id: string;
  content: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  noteId?: string;
}

export interface AIExplanation {
  text: string;
  explanation: string;
}