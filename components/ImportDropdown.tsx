'use client';

import React, { useRef } from 'react';
import { Dropdown, Button, Space, App } from 'antd';
import {
  DownOutlined,
  ImportOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { importNote, importFlashcards } from '../lib/import';
import { Note, Flashcard } from '../types';

interface ImportDropdownProps {
  onImportNote: (note: Note) => void;
  onImportFlashcards: (flashcards: Flashcard[], noteTitle: string) => void;
  allNotes: Note[];
  currentNoteId: string;
}

export default function ImportDropdown({
  onImportNote,
  onImportFlashcards,
  allNotes,
  currentNoteId,
}: ImportDropdownProps) {
  const { message, modal } = App.useApp();
  const noteFileInputRef = useRef<HTMLInputElement>(null);
  const flashcardFileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle note file import
   */
  const handleNoteFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const note = await importNote(file);
      onImportNote(note);
      message.success(`Note "${note.title}" imported successfully!`);
    } catch (error) {
      console.error('Import error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to import note');
    }

    // Reset input
    if (noteFileInputRef.current) {
      noteFileInputRef.current.value = '';
    }
  };

  /**
   * Handle flashcard file import
   */
  const handleFlashcardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { noteTitle, flashcards } = await importFlashcards(file);
      
      // Check if a note with matching title exists
      const matchingNote = allNotes.find(
        note => note.title.toLowerCase() === noteTitle.toLowerCase()
      );

      if (matchingNote) {
        // Ask user if they want to add to matching note or current note
        modal.confirm({
          title: 'Import Flashcards',
          content: `Found a note titled "${matchingNote.title}". Where would you like to import these flashcards?`,
          okText: `Add to "${matchingNote.title}"`,
          cancelText: 'Add to Current Note',
          onOk: () => {
            onImportFlashcards(flashcards, matchingNote.id);
            message.success(`${flashcards.length} flashcards imported to "${matchingNote.title}"!`);
          },
          onCancel: () => {
            onImportFlashcards(flashcards, currentNoteId);
            message.success(`${flashcards.length} flashcards imported to current note!`);
          },
        });
      } else {
        // No matching note, add to current note
        onImportFlashcards(flashcards, currentNoteId);
        message.success(`${flashcards.length} flashcards imported to current note!`);
      }
    } catch (error) {
      console.error('Import error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to import flashcards');
    }

    // Reset input
    if (flashcardFileInputRef.current) {
      flashcardFileInputRef.current.value = '';
    }
  };

  /**
   * Trigger file input for notes
   */
  const handleImportNoteClick = () => {
    noteFileInputRef.current?.click();
  };

  /**
   * Trigger file input for flashcards
   */
  const handleImportFlashcardsClick = () => {
    flashcardFileInputRef.current?.click();
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'note-header',
      type: 'group',
      label: 'Import Note',
    },
    {
      key: 'note-txt-md',
      icon: <FileTextOutlined />,
      label: 'Import TXT or MD file',
      onClick: handleImportNoteClick,
    },
    {
      type: 'divider',
    },
    {
      key: 'flashcards-header',
      type: 'group',
      label: 'Import Flashcards',
    },
    {
      key: 'flashcards',
      icon: <CreditCardOutlined />,
      label: 'Import Flashcards JSON',
      onClick: handleImportFlashcardsClick,
    },
  ];

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={noteFileInputRef}
        type="file"
        accept=".txt,.md"
        style={{ display: 'none' }}
        onChange={handleNoteFileChange}
      />
      <input
        ref={flashcardFileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFlashcardFileChange}
      />

      {/* Dropdown button */}
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomLeft">
        <Button type="text" style={{ color: '#fff' }}>
          <Space>
            <ImportOutlined />
            Import
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </>
  );
}