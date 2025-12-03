'use client';

import React, { useState } from 'react';
import { Input, Button, Space, Tooltip, Segmented } from 'antd';
import {
  UnorderedListOutlined,
  CodeOutlined,
  BoldOutlined,
  ItalicOutlined,
  EyeOutlined,
  EditOutlined,
  ColumnWidthOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

const { TextArea } = Input;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type ViewMode = 'split' | 'edit' | 'preview';

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder 
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const textAreaRef = React.useRef<any>(null);

  /**
   * Insert markdown formatting at cursor
   */
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    onChange(newContent);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  /**
   * Render the editor
   */
  const renderEditor = () => (
    <TextArea
      ref={textAreaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        height: '100%',
        fontSize: '16px',
        lineHeight: '1.6',
        fontFamily: 'monospace',
        resize: 'none',
        border: 'none',
        padding: viewMode === 'split' ? '16px' : '0',
      }}
      variant="borderless"
    />
  );

  /**
   * Custom components for markdown rendering
   */
  const markdownComponents: Components = {
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code
          className={className}
          style={{
            background: '#1f1f1f',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }) => (
      <h1 style={{ 
        fontSize: '2em',
        fontWeight: 'bold',
        borderBottom: '2px solid #303030', 
        paddingBottom: '8px', 
        marginTop: '24px',
        marginBottom: '16px',
      }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ 
        fontSize: '1.5em',
        fontWeight: 'bold',
        borderBottom: '1px solid #303030', 
        paddingBottom: '6px', 
        marginTop: '20px',
        marginBottom: '12px',
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ 
        fontSize: '1.25em',
        fontWeight: 'bold',
        marginTop: '16px',
        marginBottom: '8px',
      }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ 
        fontSize: '1.1em',
        fontWeight: 'bold',
        marginTop: '12px',
        marginBottom: '6px',
      }}>
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 style={{ 
        fontSize: '1em',
        fontWeight: 'bold',
        marginTop: '10px',
        marginBottom: '4px',
      }}>
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 style={{ 
        fontSize: '0.9em',
        fontWeight: 'bold',
        marginTop: '8px',
        marginBottom: '4px',
        color: '#a0a0a0',
      }}>
        {children}
      </h6>
    ),
    p: ({ children }) => (
      <p style={{ marginBottom: '12px' }}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ marginLeft: '20px', marginBottom: '12px' }}>{children}</ol>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '4px solid #1890ff',
          paddingLeft: '16px',
          margin: '12px 0',
          color: '#a0a0a0',
        }}
      >
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            border: '1px solid #303030',
          }}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th
        style={{
          border: '1px solid #303030',
          padding: '8px',
          background: '#1f1f1f',
          textAlign: 'left',
        }}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ border: '1px solid #303030', padding: '8px' }}>{children}</td>
    ),
    a: ({ children }) => {
      return <span style={{ color: '#1890ff' }}>{children}</span>;
    }
  };

  /**
   * Render the preview
   */
  const renderPreview = () => (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        padding: viewMode === 'split' ? '16px' : '0',
        fontSize: '16px',
        lineHeight: '1.6',
      }}
      className="markdown-preview"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {value || '*Nothing to preview*'}
      </ReactMarkdown>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Space style={{ marginBottom: '12px' }} wrap>
        <Tooltip title="Bold">
          <Button
            icon={<BoldOutlined />}
            onClick={() => insertFormatting('**', '**')}
            size="small"
            disabled={viewMode === 'preview'}
          />
        </Tooltip>

        <Tooltip title="Italic">
          <Button
            icon={<ItalicOutlined />}
            onClick={() => insertFormatting('_', '_')}
            size="small"
            disabled={viewMode === 'preview'}
          />
        </Tooltip>

        <Tooltip title="Code Block">
          <Button
            icon={<CodeOutlined />}
            onClick={() => insertFormatting('```\n', '\n```')}
            size="small"
            disabled={viewMode === 'preview'}
          />
        </Tooltip>

        <Tooltip title="Bullet List">
          <Button
            icon={<UnorderedListOutlined />}
            onClick={() => insertFormatting('- ')}
            size="small"
            disabled={viewMode === 'preview'}
          />
        </Tooltip>

        <div style={{ borderLeft: '1px solid #424242', height: '24px', margin: '0 8px' }} />

        {/* View Mode Toggle */}
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as ViewMode)}
          options={[
            {
              label: 'Edit',
              value: 'edit',
              icon: <EditOutlined />,
            },
            {
              label: 'Split',
              value: 'split',
              icon: <ColumnWidthOutlined />,
            },
            {
              label: 'Preview',
              value: 'preview',
              icon: <EyeOutlined />,
            },
          ]}
          size="small"
        />
      </Space>

      {/* Editor/Preview Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {viewMode === 'edit' && <div style={{ flex: 1, overflow: 'auto' }}>{renderEditor()}</div>}

        {viewMode === 'preview' && (
          <div style={{ flex: 1, overflow: 'auto' }}>{renderPreview()}</div>
        )}

        {viewMode === 'split' && (
          <>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                borderRight: '1px solid #303030',
              }}
            >
              {renderEditor()}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>{renderPreview()}</div>
          </>
        )}
      </div>
    </div>
  );
}