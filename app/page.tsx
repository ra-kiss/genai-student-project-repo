'use client';

import React, { useState } from 'react';
import { Layout, Typography, ConfigProvider, theme, App, Button, Badge } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import NoteEditor from '../components/NoteEditor';
import AIExplanation from '../components/AIExplanation';
import NotesDropdown from '../components/NotesDropdown';
import FlashcardModal from '../components/FlashcardModal';
import ExportDropdown from '../components/ExportDropdown';
import ImportDropdown from '../components/ImportDropdown';
import { useOpenAI } from '../hooks/useOpenAI';
import { useNote } from '../hooks/useNote';
import { useFlashcards } from '../hooks/useFlashcards';
import { Note, Flashcard } from '../types';
import { saveNote as saveNoteToStorage } from '../lib/storage';

const { Header, Content } = Layout;
const { Title } = Typography;

function HomeContent() {
  const [selectedText, setSelectedText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'explain' | 'expand' | 'summarize'>('explain');
  const [flashcardModalVisible, setFlashcardModalVisible] = useState(false);
  
  const { 
    note: currentNote,
    allNotes,
    updateContent,
    updateTitle,
    createNewNote,
    switchNote,
    deleteNote,
    saveNote,
    isSaving,
    lastSaved,
  } = useNote();
  
  const { 
    isExplaining, 
    isExpanding,
    isSummarizing,
    isGeneratingFlashcards,
    explanation, 
    expansion,
    summary,
    flashcards: generatedFlashcards,
    explain, 
    expand,
    summarize,
    generateCards,
    clearExplanation,
    clearExpansion,
    clearSummary,
    clearFlashcards: clearGeneratedFlashcards,
  } = useOpenAI();

  const {
    flashcards: savedFlashcards,
    setNewFlashcards,
    importFlashcards: importFlashcardsToNote,
    updateFlashcard,
    deleteFlashcard,
    refreshFlashcards,
  } = useFlashcards(currentNote?.id || '');

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
   * Generate flashcards from current note
   */
  const handleGenerateFlashcards = async () => {
    if (!currentNote?.content) return;
    
    await generateCards(currentNote.content);
  };

  /**
   * Open flashcard modal
   */
  const handleOpenFlashcards = () => {
    if (savedFlashcards.length > 0) {
      // Show saved flashcards
      setFlashcardModalVisible(true);
    } else if (generatedFlashcards.length > 0) {
      // Show newly generated flashcards and save them
      setNewFlashcards(generatedFlashcards);
      setFlashcardModalVisible(true);
      clearGeneratedFlashcards();
    } else {
      // Generate new flashcards
      handleGenerateFlashcards();
    }
  };

  /**
   * Handle flashcard modal close
   */
  const handleCloseFlashcardModal = () => {
    setFlashcardModalVisible(false);
  };

  /**
   * Handle regenerate flashcards
   */
  const handleRegenerateFlashcards = async () => {
    if (!currentNote?.content) return;
    
    setFlashcardModalVisible(false);
    await generateCards(currentNote.content);
    // Will automatically show the modal when generation completes
  };

  /**
   * Handle import note
   */
  const handleImportNote = (note: Note) => {
    // Save the imported note to storage
    saveNoteToStorage(note);
    
    // Switch to the imported note
    switchNote(note.id);
  };

  /**
   * Handle import flashcards
   */
  const handleImportFlashcards = (flashcards: Flashcard[], targetNoteId: string) => {
    // Get the hook instance for the target note
    const STORAGE_KEY_PREFIX = 'flashcards-';
    const existingFlashcardsJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}${targetNoteId}`);
    const existingFlashcards = existingFlashcardsJson ? JSON.parse(existingFlashcardsJson) : [];
    
    // Merge and save
    const merged = [...existingFlashcards, ...flashcards.map(card => ({
      ...card,
      noteId: targetNoteId,
    }))];
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${targetNoteId}`, JSON.stringify(merged));
    
    // If importing to current note, refresh the display immediately
    if (targetNoteId === currentNote?.id) {
      refreshFlashcards();
    }
  };

  /**
   * Auto-open modal when flashcards are generated
   */
  React.useEffect(() => {
    if (generatedFlashcards.length > 0 && !isGeneratingFlashcards) {
      setNewFlashcards(generatedFlashcards);
      setFlashcardModalVisible(true);
      clearGeneratedFlashcards();
    }
  }, [generatedFlashcards, isGeneratingFlashcards]);

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>
            AI-Powered Notes
          </Title>
          <ExportDropdown currentNote={currentNote} flashcards={savedFlashcards} />
          <ImportDropdown 
            onImportNote={handleImportNote}
            onImportFlashcards={handleImportFlashcards}
            allNotes={allNotes}
            currentNoteId={currentNote.id}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              onClick={handleOpenFlashcards}
              loading={isGeneratingFlashcards}
            >
              {savedFlashcards.length > 0 ? `Flashcards ( ${savedFlashcards.length} )` : 'Generate Flashcards'}
            </Button>
          
          <NotesDropdown
            currentNote={currentNote}
            allNotes={allNotes}
            onSelectNote={switchNote}
            onCreateNote={createNewNote}
            onDeleteNote={deleteNote}
          />
        </div>
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
            saveNote={saveNote}
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

      {/* Flashcard Modal */}
      <FlashcardModal
        visible={flashcardModalVisible}
        flashcards={savedFlashcards}
        onClose={handleCloseFlashcardModal}
        onRegenerate={handleRegenerateFlashcards}
        onUpdateFlashcard={updateFlashcard}
        onDeleteFlashcard={deleteFlashcard}
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