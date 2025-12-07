'use client';

import React, { useState } from 'react';
import { Drawer, Input, Button, Space, Card, Typography, Spin, Tag, App } from 'antd';
import { SearchOutlined, BookOutlined, CopyOutlined } from '@ant-design/icons';
import { useRAG, RAGChunk } from '../hooks/useRAG';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

interface RAGSearchProps {
  visible: boolean;
  onClose: () => void;
  onInsertToNote?: (text: string) => void;
}

export default function RAGSearch({ visible, onClose, onInsertToNote }: RAGSearchProps) {
  const { message } = App.useApp();
  const { queryRAG, isLoading, error } = useRAG();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<RAGChunk[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Handle search
   */
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      message.warning('Please enter a search query');
      return;
    }

    setHasSearched(true);
    try {
      const chunks = await queryRAG(query, 10, false); // 10 results, output types only
      setResults(chunks);
      if (chunks.length === 0) {
        message.info('No results found');
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to search');
    }
  };

  /**
   * Copy text to clipboard
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  /**
   * Insert text into note
   */
  const handleInsert = (text: string) => {
    if (onInsertToNote) {
      onInsertToNote(text);
      message.success('Inserted into note!');
    }
  };

  /**
   * Calculate similarity percentage from distance
   */
  const getSimilarityPercentage = (distance: number) => {
    // Lower distance = higher similarity
    // Assuming cosine distance where 0 = identical, 2 = opposite
    const similarity = Math.max(0, (1 - distance / 2) * 100);
    return similarity.toFixed(1);
  };

  /**
   * Get color for similarity score
   */
  const getSimilarityColor = (distance: number) => {
    const similarity = parseFloat(getSimilarityPercentage(distance));
    if (similarity >= 80) return 'green';
    if (similarity >= 60) return 'blue';
    if (similarity >= 40) return 'orange';
    return 'red';
  };

  return (
    <Drawer
      title={
        <Space>
          <BookOutlined style={{ color: '#722ed1' }} />
          <span>Search Knowledge Base</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      size="large"
    >
      {/* Search Input */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Search computer science concepts, algorithms, data structures..."
          enterButton={<SearchOutlined />}
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          loading={isLoading}
        />
      </Card>

      {/* Error Message */}
      {error && (
        <Card size="small" style={{ marginBottom: '16px', borderColor: '#ff4d4f' }}>
          <Text type="danger">{error}</Text>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: '16px' }}>Searching knowledge base...</Paragraph>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && (
        <>
          <Title level={5} style={{ marginBottom: '16px' }}>
            {results.length > 0 ? `Found ${results.length} relevant results` : 'No results found'}
          </Title>

          <div>
            {results.map((item, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: '16px' }}
                extra={
                  <Space>
                    <Tag color={getSimilarityColor(item.distance)}>
                      {getSimilarityPercentage(item.distance)}% match
                    </Tag>
                  </Space>
                }
              >
                {/* Display chunk content */}
                <Paragraph
                  style={{
                    marginBottom: '12px',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                  }}
                >
                  {item.Text || item.chunk || item.text || ''}
                </Paragraph>

                {/* Metadata */}
                {(item.Type || item.ID) && (
                  <Space wrap size="small" style={{ marginBottom: '12px' }}>
                    {item.Type && <Tag color="blue">{item.Type}</Tag>}
                    {item.ID && <Tag>ID: {item.ID}</Tag>}
                  </Space>
                )}

                {/* Actions */}
                <Space size="small">
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(item.Text || item.chunk || item.text || '')}
                  >
                    Copy
                  </Button>
                  {onInsertToNote && (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleInsert(item.Text || item.chunk || item.text || '')}
                    >
                      Insert to Note
                    </Button>
                  )}
                </Space>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Initial State */}
      {!isLoading && !hasSearched && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <BookOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
          <Title level={4}>Search Your Knowledge Base</Title>
          <Paragraph type="secondary">
            Search through your computer science materials using semantic search.
            <br />
            Find relevant concepts, definitions, code examples, and more.
          </Paragraph>
        </div>
      )}
    </Drawer>
  );
}
