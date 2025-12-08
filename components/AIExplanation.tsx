'use client';

import React from 'react';
import { Drawer, Typography, Button, Space, Divider, Card, App } from 'antd';
import {
  BulbOutlined,
  ExpandOutlined,
  CompressOutlined,
  CopyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface AIExplanationProps {
  visible: boolean;
  content: string | null;
  originalText: string;
  isLoading: boolean;
  onClose: () => void;
  mode: 'explain' | 'expand' | 'summarize';
  ragContext?: Array<{ Text?: string; text?: string; chunk?: string; Type?: string; [key: string]: any }>;
}

export default function AIExplanation({
  visible,
  content,
  originalText,
  isLoading,
  onClose,
  mode,
  ragContext,
}: AIExplanationProps) {
  const { message } = App.useApp();

  /**
   * Copy content to clipboard
   */
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      message.success('Copied to clipboard!');
    }
  };

  /**
   * Get title and icon based on mode
   */
  const getTitle = () => {
    switch (mode) {
      case 'explain':
        return { text: 'AI Explanation', icon: <BulbOutlined style={{ color: '#1890ff' }} /> };
      case 'expand':
        return { text: 'AI Expansion', icon: <ExpandOutlined style={{ color: '#52c41a' }} /> };
      case 'summarize':
        return { text: 'AI Summary', icon: <CompressOutlined style={{ color: '#faad14' }} /> };
    }
  };

  const title = getTitle();

  return (
    <Drawer
      title={
        <Space>
          {title.icon}
          <span>{title.text}</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      size="large"
      extra={
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopy}
          size="small"
          disabled={!content}
        >
          Copy
        </Button>
      }
    >
      {/* Original Text */}
      {originalText && (
        <>
          <Card
            size="small"
            title={<Text strong>Selected Text</Text>}
            style={{ marginBottom: '24px', backgroundColor: '#1f1f1f' }}
          >
            <Paragraph
              style={{
                marginBottom: 0,
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {originalText}
            </Paragraph>
          </Card>
        </>
      )}

      {/* AI Generated Content */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {title.icon && React.cloneElement(title.icon as React.ReactElement<any>, {
            style: {
              fontSize: '48px',
              marginBottom: '16px',
              display: 'block',
            }
          })}
          <Text type="secondary">
            {mode === 'explain' && 'Generating explanation...'}
            {mode === 'expand' && 'Expanding text...'}
            {mode === 'summarize' && 'Summarizing text...'}
          </Text>
        </div>
      )}

      {!isLoading && content && (
        <>
          <Title level={5}>
            {mode === 'explain' && 'Explanation'}
            {mode === 'expand' && 'Expanded Version'}
            {mode === 'summarize' && 'Summary'}
          </Title>
          <Paragraph
            style={{
              fontSize: '15px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
            }}
          >
            {content}
          </Paragraph>

          {/* Knowledge Base Context Used */}
          {ragContext && ragContext.length > 0 && (
            <>
              <Divider />
              <Card
                size="small"
                title={<Text strong style={{ color: '#722ed1' }}>📚 RAG Context Used</Text>}
                style={{ marginBottom: '16px', backgroundColor: '#1f1f1f', borderColor: '#722ed1' }}
              >
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {ragContext.map((item, index) => (
                    <div key={index} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: index < ragContext.length - 1 ? '1px solid #303030' : 'none' }}>
                      <Text style={{ fontSize: '13px', color: '#d4d4d4' }}>
                        {index + 1}. {item.Text || item.text || item.chunk || ''}
                      </Text>
                    </div>
                  ))}
                </div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '8px' }}>
                  {ragContext.length} input example{ragContext.length !== 1 ? 's' : ''} from RAG
                </Text>
              </Card>
            </>
          )}

          <Divider />

          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 Tip: This content is AI-generated. Always verify important concepts
            with course materials or instructors.
          </Text>
        </>
      )}

      {!isLoading && !content && originalText && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">
            Click the button to generate {mode === 'explain' ? 'an explanation' : mode === 'expand' ? 'an expansion' : 'a summary'} for the selected text.
          </Text>
        </div>
      )}
    </Drawer>
  );
}