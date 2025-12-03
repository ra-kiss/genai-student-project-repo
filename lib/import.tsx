import { Note } from '../types';
import { Flashcard } from '../types';

/**
 * Import note from TXT or MD file
 */
export async function importNote(file: File): Promise<Note> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileName = file.name.replace(/\.(txt|md)$/i, '');
        
        // If it's a markdown file with a title, extract it
        let title = fileName;
        let noteContent = content;
        
        if (file.name.endsWith('.md')) {
          // Check if first line is a markdown title
          const lines = content.split('\n');
          if (lines[0].startsWith('# ')) {
            title = lines[0].replace('# ', '').trim();
            noteContent = lines.slice(1).join('\n').trim();
          }
        } else if (file.name.endsWith('.txt')) {
          // For TXT files, check if there's a title pattern (Title\n===)
          const lines = content.split('\n');
          if (lines.length >= 2 && lines[1].match(/^=+$/)) {
            title = lines[0].trim();
            noteContent = lines.slice(2).join('\n').trim();
          }
        }
        
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: title || 'Imported Note',
          content: noteContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        resolve(newNote);
      } catch (error) {
        reject(new Error('Failed to parse note file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Import flashcards from JSON file
 */
export async function importFlashcards(file: File): Promise<{
  noteTitle: string;
  flashcards: Flashcard[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the structure
        if (!data.flashcards || !Array.isArray(data.flashcards)) {
          throw new Error('Invalid flashcard file format');
        }
        
        // Convert to Flashcard objects with new IDs
        const flashcards: Flashcard[] = data.flashcards.map((card: any, index: number) => ({
          id: `flashcard-${Date.now()}-${index}`,
          question: card.question || '',
          answer: card.answer || '',
        }));
        
        resolve({
          noteTitle: data.note || 'Unknown',
          flashcards,
        });
      } catch (error) {
        reject(new Error('Failed to parse flashcard file. Make sure it\'s a valid JSON file.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}