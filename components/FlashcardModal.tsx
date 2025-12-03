'use client';

import React, { useState } from 'react';
import { Modal, Button, Space, Typography, Card as AntCard, Progress, App } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShuffleOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Flashcard } from '../types';

const { Title, Text } = Typography;

interface FlashcardModalProps {
  visible: boolean;
  flashcards: Flashcard[];
  onClose: () => void;
  onRegenerate: () => void;
  onUpdateFlashcard: (id: string, question: string, answer: string) => void;
  onDeleteFlashcard: (id: string) => void;
}

export default function FlashcardModal({
  visible,
  flashcards,
  onClose,
  onRegenerate,
  onUpdateFlashcard,
  onDeleteFlashcard,
}: FlashcardModalProps) {
  const { modal } = App.useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  const currentCard = flashcards[currentIndex];

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setIsFlipped(false);
      setEditMode(false);
    }
  }, [visible]);

  // Update edit fields when card changes
  React.useEffect(() => {
    if (currentCard) {
      setEditQuestion(currentCard.question);
      setEditAnswer(currentCard.answer);
      setIsFlipped(false);
    }
  }, [currentIndex, currentCard]);

  /**
   * Navigate to next card
   */
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditMode(false);
    }
  };

  /**
   * Navigate to previous card
   */
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setEditMode(false);
    }
  };

  /**
   * Flip the current card
   */
  const handleFlip = () => {
    if (!editMode) {
      setIsFlipped(!isFlipped);
    }
  };

  /**
   * Handle keyboard navigation
   */
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible || editMode) return;

      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, currentIndex, flashcards.length, editMode, isFlipped]);

  /**
   * Shuffle flashcards
   */
  const handleShuffle = () => {
    // This will be handled by parent component
    modal.info({
      title: 'Shuffle Deck',
      content: 'Shuffling is not yet implemented. Cards will be randomized in a future update.',
    });
  };

  /**
   * Mark card as mastered
   */
  const handleMarkMastered = () => {
    if (currentCard) {
      setMasteredCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentCard.id)) {
          newSet.delete(currentCard.id);
        } else {
          newSet.add(currentCard.id);
        }
        return newSet;
      });
    }
  };

  /**
   * Enter edit mode
   */
  const handleEdit = () => {
    setEditMode(true);
    setIsFlipped(false);
  };

  /**
   * Save edited card
   */
  const handleSaveEdit = () => {
    if (currentCard) {
      onUpdateFlashcard(currentCard.id, editQuestion, editAnswer);
      setEditMode(false);
    }
  };

  /**
   * Cancel edit
   */
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditQuestion(currentCard.question);
    setEditAnswer(currentCard.answer);
  };

  /**
   * Delete current card
   */
  const handleDelete = () => {
    if (currentCard) {
      modal.confirm({
        title: 'Delete Flashcard',
        content: 'Are you sure you want to delete this flashcard?',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          onDeleteFlashcard(currentCard.id);
          if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
        },
      });
    }
  };

  /**
   * Regenerate all flashcards
   */
  const handleRegenerate = () => {
    modal.confirm({
      title: 'Regenerate Flashcards',
      content: 'This will replace all current flashcards with new ones. Continue?',
      okText: 'Regenerate',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: onRegenerate,
    });
  };

  if (!currentCard) {
    return (
      <Modal
        title="Study Flashcards"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">No flashcards to display</Text>
        </div>
      </Modal>
    );
  }

  const isMastered = masteredCards.has(currentCard.id);

  return (
    <Modal
      title={
        <Space>
          <QuestionCircleOutlined style={{ color: '#1890ff' }} />
          <span>Study Flashcards</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{ body: { padding: '24px' } }}
    >
      {/* Progress */}
      <div style={{ marginBottom: '16px' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>
            Card {currentIndex + 1} of {flashcards.length}
          </Text>
          <Text type="secondary">
            {masteredCards.size} mastered
          </Text>
        </Space>
        <Progress
          percent={(currentIndex + 1) / flashcards.length * 100}
          showInfo={false}
          strokeColor="#1890ff"
          style={{ marginTop: '8px' }}
        />
      </div>

      {/* Flashcard */}
      <div style={{ marginBottom: '24px' }}>
        {!editMode ? (
          <AntCard
            onClick={handleFlip}
            style={{
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: isFlipped ? '#1f3a1f' : '#1f1f3a',
              border: `2px solid ${isFlipped ? '#52c41a' : '#1890ff'}`,
              transition: 'all 0.3s ease',
            }}
            hoverable
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                {isFlipped ? (
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                ) : (
                  <QuestionCircleOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                )}
              </div>
              <Title level={4} style={{ marginBottom: '16px', color: '#fff' }}>
                {isFlipped ? 'Answer' : 'Question'}
              </Title>
              <Text style={{ fontSize: '18px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {isFlipped ? currentCard.answer : currentCard.question}
              </Text>
              <div style={{ marginTop: '24px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Click card or press Space to flip
                </Text>
              </div>
            </div>
          </AntCard>
        ) : (
          <AntCard>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Question:</Text>
                <textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    marginTop: '8px',
                    padding: '8px',
                    fontSize: '16px',
                    background: '#1f1f1f',
                    color: '#fff',
                    border: '1px solid #424242',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <Text strong>Answer:</Text>
                <textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    marginTop: '8px',
                    padding: '8px',
                    fontSize: '16px',
                    background: '#1f1f1f',
                    color: '#fff',
                    border: '1px solid #424242',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <Space>
                <Button type="primary" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
                <Button onClick={handleCancelEdit}>Cancel</Button>
              </Space>
            </Space>
          </AntCard>
        )}
      </div>

      {/* Controls */}
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        {/* Navigation */}
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrevious}
            disabled={currentIndex === 0 || editMode}
          >
            Previous
          </Button>
          <Button
            icon={<RightOutlined />}
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1 || editMode}
          >
            Next
          </Button>
        </Space>

        {/* Actions */}
        <Space>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={handleMarkMastered}
            type={isMastered ? 'primary' : 'default'}
            disabled={editMode}
          >
            {isMastered ? 'Mastered' : 'Mark Mastered'}
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
            disabled={editMode}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            danger
            disabled={editMode}
          >
            Delete
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRegenerate}
            disabled={editMode}
          >
            Regenerate
          </Button>
        </Space>
      </Space>

      {/* Keyboard shortcuts hint */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 Use ← → arrow keys to navigate • Space to flip • Click card to flip
        </Text>
      </div>
    </Modal>
  );
}