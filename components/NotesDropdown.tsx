'use client';

import React from 'react';
import { Dropdown, Button, Space, Typography, Modal, App } from 'antd';
import {
  DownOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Note } from '../types';

const { Text } = Typography;

interface NotesDropdownProps {
  currentNote: Note | null;
  allNotes: Note[];
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesDropdown({
  currentNote,
  allNotes,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}: NotesDropdownProps) {
  const { modal } = App.useApp();

  /**
   * Handle delete with confirmation
   */
  const handleDelete = (noteId: string, noteTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    modal.confirm({
      title: 'Delete Note',
      content: `Are you sure you want to delete "${noteTitle}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        onDeleteNote(noteId);
      },
    });
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  /**
   * Build menu items
   */
  const menuItems: MenuProps['items'] = [
    {
      key: 'new',
      icon: <PlusOutlined />,
      label: 'Create New Note',
      onClick: onCreateNote,
      style: { borderBottom: '1px solid #303030', marginBottom: '8px', paddingBottom: '8px' },
    },
    ...allNotes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(note => ({
        key: note.id,
        icon: <FileTextOutlined />,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: note.id === currentNote?.id ? 'bold' : 'normal',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {note.title || 'Untitled Note'}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDate(note.updatedAt)}
              </Text>
            </div>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => handleDelete(note.id, note.title, e)}
              style={{ marginLeft: '8px' }}
            />
          </div>
        ),
        onClick: () => onSelectNote(note.id),
      })),
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <Button type="text" style={{ color: '#fff' }}>
        <Space>
          My Notes ({allNotes.length})
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}