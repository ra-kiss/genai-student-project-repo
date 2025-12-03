'use client';

import React from 'react';
import { Dropdown, Button, Space, App } from 'antd';
import {
  DownOutlined,
  ExportOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Note } from '../types';
import { Flashcard } from '../types';
import { exportAsTxt, exportAsMarkdown, exportFlashcardsAsJson } from '../lib/export';

interface ExportDropdownProps {
  currentNote: Note;
  flashcards: Flashcard[];
}

export default function ExportDropdown({ currentNote, flashcards }: ExportDropdownProps) {
  const { message } = App.useApp();

  const handleExport = (type: 'txt' | 'md' | 'flashcards') => {
    try {
      switch (type) {
        case 'txt':
          exportAsTxt(currentNote);
          message.success('Note exported as TXT');
          break;
        case 'md':
          exportAsMarkdown(currentNote);
          message.success('Note exported as Markdown');
          break;
        case 'flashcards':
          if (flashcards.length === 0) {
            message.warning('No flashcards to export');
            return;
          }
          exportFlashcardsAsJson(flashcards, currentNote.title);
          message.success('Flashcards exported as JSON');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'note-header',
      type: 'group',
      label: 'Export Note',
    },
    {
      key: 'txt',
      icon: <FileTextOutlined />,
      label: 'Export as TXT',
      onClick: () => handleExport('txt'),
    },
    {
      key: 'md',
      icon: <FileMarkdownOutlined />,
      label: 'Export as Markdown',
      onClick: () => handleExport('md'),
    },
    {
      type: 'divider',
    },
    {
      key: 'flashcards-header',
      type: 'group',
      label: 'Export Flashcards',
    },
    {
      key: 'flashcards',
      icon: <CreditCardOutlined />,
      label: `Export Flashcards as JSON ${flashcards.length > 0 ? `(${flashcards.length})` : ''}`,
      onClick: () => handleExport('flashcards'),
      disabled: flashcards.length === 0,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomLeft">
      <Button type="text" style={{ color: '#fff' }}>
        <Space>
          <ExportOutlined />
          Export
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}