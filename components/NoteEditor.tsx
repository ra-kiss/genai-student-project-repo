'use client';

import React, { useState } from 'react';
import { Input, Button, Space, Tooltip, Typography } from 'antd';
import {
  BulbOutlined,
  ExpandOutlined,
  CompressOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Note } from '../types';
import MarkdownEditor from './MarkdownEditor';

const { Text } = Typography;

interface NoteEditorProps {
  note: Note;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  saveNote: () => void;
  onExplainRequest: (selectedText: string) => void;
  onExpandRequest: (selectedText: string) => void;
  onSummarizeRequest: (selectedText: string) => void;
}

export default function NoteEditor({ 
  note,
  onContentChange,
  onTitleChange,
  isSaving,
  lastSaved,
  saveNote,
  onExplainRequest, 
  onExpandRequest,
  onSummarizeRequest 
}: NoteEditorProps) {
  const [selectedText, setSelectedText] = useState('');

  /**
   * Handle text selection - this needs to work with the markdown editor
   */
  React.useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selected = selection?.toString() || '';
      setSelectedText(selected);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  /**
   * Format last saved time
   */
  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet';
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 10) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Saved ${minutes}m ago`;
    
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Title Input */}
      <Input
        size="large"
        placeholder="Untitled Note"
        value={note.title}
        onChange={(e) => onTitleChange(e.target.value)}
        variant="borderless"
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}
      />

      {/* AI Tools Bar */}
      <Space style={{ marginBottom: '12px' }} wrap>
        <Tooltip title="Explain Selected Text (Ctrl+E)">
          <Button
            icon={<BulbOutlined />}
            onClick={() => selectedText && onExplainRequest(selectedText)}
            disabled={!selectedText}
            type={selectedText ? 'primary' : 'default'}
            size="small"
          >
            Explain
          </Button>
        </Tooltip>

        <Tooltip title="Expand Selected Text">
          <Button
            icon={<ExpandOutlined />}
            onClick={() => selectedText && onExpandRequest(selectedText)}
            disabled={!selectedText}
            size="small"
          >
            Expand
          </Button>
        </Tooltip>

        <Tooltip title="Summarize Selected Text">
          <Button
            icon={<CompressOutlined />}
            onClick={() => selectedText && onSummarizeRequest(selectedText)}
            disabled={!selectedText}
            size="small"
          >
            Summarize
          </Button>
        </Tooltip>

        <div style={{ flex: 1 }} />

        {/* Save Status */}
        <Space size="small">
          <Tooltip title="Save Now">
            <Button
              icon={<SaveOutlined />}
              onClick={saveNote}
              size="small"
              loading={isSaving}
            >
              Save
            </Button>
          </Tooltip>
          {isSaving && <Text type="secondary">Saving...</Text>}
          {!isSaving && lastSaved && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatLastSaved()}
            </Text>
          )}
        </Space>
      </Space>

      {/* Markdown Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MarkdownEditor
          value={note.content}
          onChange={onContentChange}
          placeholder="Start typing your notes here... "
       />
      </div>
    </div>
  );
}