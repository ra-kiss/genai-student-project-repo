'use client';

import React, { useState } from 'react';
import { Layout, Typography, ConfigProvider, theme, App } from 'antd';
import NoteEditor from '../components/NoteEditor';
import AIExplanation from '../components/AIExplanation';
import NotesDropdown from '../components/NotesDropdown';
import { useOpenAI } from '../hooks/useOpenAI';
import { useNote } from '../hooks/useNote';

const { Header, Content } = Layout;
const { Title } = Typography;

function HomeContent() {
  const [selectedText, setSelectedText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'explain' | 'expand' | 'summarize'>('explain');
  
  const { 
    note: currentNote,
    allNotes,
    updateContent,
    updateTitle,
    createNewNote,
    switchNote,
    deleteNote,
    isSaving,
    lastSaved,
  } = useNote();
  
  const { 
    isExplaining, 
    isExpanding,
    isSummarizing,
    explanation, 
    expansion,
    summary,
    explain, 
    expand,
    summarize,
    clearExplanation,
    clearExpansion,
    clearSummary,
  } = useOpenAI();

  /**
   * Handle explanation request from NoteEditor
   */
  const handleExplainRequest = async (text: string) => {
    setSelectedText(text);
    setDrawerMode('explain');
    setDrawerVisible(true);
    await explain(text);
  };

  /**
   * Handle expansion request from NoteEditor
   */
  const handleExpandRequest = async (text: string) => {
    setSelectedText(text);
    setDrawerMode('expand');
    setDrawerVisible(true);
    await expand(text);
  };

  /**
   * Handle summarize request from NoteEditor
   */
  const handleSummarizeRequest = async (text: string) => {
    setSelectedText(text);
    setDrawerMode('summarize');
    setDrawerVisible(true);
    await summarize(text);
  };

  /**
   * Close the drawer
   */
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    clearExplanation();
    clearExpansion();
    clearSummary();
    setSelectedText('');
  };

  /**
   * Get current content and loading state based on mode
   */
  const getCurrentContent = () => {
    switch (drawerMode) {
      case 'explain':
        return { content: explanation, isLoading: isExplaining };
      case 'expand':
        return { content: expansion, isLoading: isExpanding };
      case 'summarize':
        return { content: summary, isLoading: isSummarizing };
    }
  };

  const { content, isLoading } = getCurrentContent();

  if (!currentNote) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#000'
      }}>
        <Typography.Text>Loading...</Typography.Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        background: '#141414', 
        padding: '0 24px',
        borderBottom: '1px solid #303030',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          AI-Powered Notes
        </Title>
        
        <NotesDropdown
          currentNote={currentNote}
          allNotes={allNotes}
          onSelectNote={switchNote}
          onCreateNote={createNewNote}
          onDeleteNote={deleteNote}
        />
      </Header>

      {/* Main Content */}
      <Content style={{ padding: '24px', background: '#000' }}>
        <div style={{
          background: '#141414',
          padding: '24px',
          borderRadius: '8px',
          height: 'calc(100vh - 120px)',
        }}>
          <NoteEditor 
            note={currentNote}
            onContentChange={updateContent}
            onTitleChange={updateTitle}
            isSaving={isSaving}
            lastSaved={lastSaved}
            onExplainRequest={handleExplainRequest}
            onExpandRequest={handleExpandRequest}
            onSummarizeRequest={handleSummarizeRequest}
            key={currentNote.id}
          />
        </div>
      </Content>

      {/* AI Content Drawer */}
      <AIExplanation
        visible={drawerVisible}
        content={content}
        originalText={selectedText}
        isLoading={isLoading}
        onClose={handleCloseDrawer}
        mode={drawerMode}
      />
    </Layout>
  );
}

export default function Home() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <App>
        <HomeContent />
      </App>
    </ConfigProvider>
  );
}