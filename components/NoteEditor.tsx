'use client';

import React, { useState } from 'react';
import { Input, Button, Space, Tooltip, Typography } from 'antd';
import {
  UnorderedListOutlined,
  CodeOutlined,
  BoldOutlined,
  ItalicOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useNote } from '../hooks/useNote';

const { TextArea } = Input;
const { Text } = Typography;

interface NoteEditorProps {
  onExplainRequest: (selectedText: string) => void;
}

export default function NoteEditor({ onExplainRequest }: NoteEditorProps) {
  const { note, updateContent, updateTitle, isSaving, lastSaved } = useNote();
  const [selectedText, setSelectedText] = useState('');
  const textAreaRef = React.useRef<any>(null);

  /**
   * Handle text selection
   */
  const handleTextSelect = () => {
    const selection = window.getSelection();
    const selected = selection?.toString() || '';
    setSelectedText(selected);
  };

  /**
   * Insert markdown formatting at cursor
   */
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = note.content.substring(start, end);
    const before = note.content.substring(0, start);
    const after = note.content.substring(end);

    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    updateContent(newContent);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

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
        onChange={(e) => updateTitle(e.target.value)}
        variant="borderless"
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}
      />

      {/* Toolbar */}
      <Space style={{ marginBottom: '12px' }} wrap>
        <Tooltip title="Bold (Ctrl+B)">
          <Button
            icon={<BoldOutlined />}
            onClick={() => insertFormatting('**', '**')}
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Italic (Ctrl+I)">
          <Button
            icon={<ItalicOutlined />}
            onClick={() => insertFormatting('_', '_')}
            size="small"
          />
        </Tooltip>

        <Tooltip title="Code Block">
          <Button
            icon={<CodeOutlined />}
            onClick={() => insertFormatting('```\n', '\n```')}
            size="small"
          />
        </Tooltip>

        <Tooltip title="Bullet List">
          <Button
            icon={<UnorderedListOutlined />}
            onClick={() => insertFormatting('- ')}
            size="small"
          />
        </Tooltip>

        <div style={{ borderLeft: '1px solid #424242', height: '24px', margin: '0 8px' }} />

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

        <div style={{ flex: 1 }} />

        {/* Save Status */}
        <Space size="small">
          {isSaving && <Text type="secondary">Saving...</Text>}
          {!isSaving && lastSaved && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatLastSaved()}
            </Text>
          )}
        </Space>
      </Space>

      {/* Text Editor */}
      <TextArea
        ref={textAreaRef}
        value={note.content}
        onChange={(e) => updateContent(e.target.value)}
        onSelect={handleTextSelect}
        placeholder="Start typing your notes here... 

You can:
- Use markdown formatting (bold, italic, code blocks)
- Select text and click 'Explain' to get AI explanations
- Generate flashcards from your notes

Your notes are automatically saved every 3 seconds."
        style={{
          flex: 1,
          fontSize: '16px',
          lineHeight: '1.6',
          fontFamily: 'monospace',
          resize: 'none',
        }}
        variant="borderless"
      />
    </div>
  );
}