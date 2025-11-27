'use client';

import React from 'react';
import { Drawer, Typography, Button, Space, Divider, Card, App } from 'antd';
import {
  BulbOutlined,
  CopyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface AIExplanationProps {
  visible: boolean;
  explanation: string | null;
  originalText: string;
  isLoading: boolean;
  onClose: () => void;
}

export default function AIExplanation({
  visible,
  explanation,
  originalText,
  isLoading,
  onClose,
}: AIExplanationProps) {
  const { message } = App.useApp();

  /**
   * Copy explanation to clipboard
   */
  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      message.success('Explanation copied to clipboard!');
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <BulbOutlined style={{ color: '#1890ff' }} />
          <span>AI Explanation</span>
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
          disabled={!explanation}
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

      {/* Explanation */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <BulbOutlined
            style={{
              fontSize: '48px',
              color: '#1890ff',
              marginBottom: '16px',
              display: 'block',
            }}
          />
          <Text type="secondary">Generating explanation...</Text>
        </div>
      )}

      {!isLoading && explanation && (
        <>
          <Title level={5}>Explanation</Title>
          <Paragraph
            style={{
              fontSize: '15px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
            }}
          >
            {explanation}
          </Paragraph>

          <Divider />

          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 Tip: This explanation is AI-generated. Always verify important concepts
            with course materials or instructors.
          </Text>
        </>
      )}

      {!isLoading && !explanation && originalText && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">
            Click the "Explain" button to generate an explanation for the selected text.
          </Text>
        </div>
      )}
    </Drawer>
  );
}