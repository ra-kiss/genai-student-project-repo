import { Note } from '../types';
import { Flashcard } from '../types';

/**
 * Export note as TXT file
 */
export function exportAsTxt(note: Note) {
  const content = `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(note.title)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export note as Markdown file
 */
export function exportAsMarkdown(note: Note) {
  const content = `# ${note.title}\n\n${note.content}`;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(note.title)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export flashcards as JSON file
 */
export function exportFlashcardsAsJson(flashcards: Flashcard[], noteTitle: string) {
  const data = {
    note: noteTitle,
    exportedAt: new Date().toISOString(),
    flashcards: flashcards.map(card => ({
      question: card.question,
      answer: card.answer,
    })),
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(noteTitle)}-flashcards.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename by removing invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}