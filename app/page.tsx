'use client';

import React, { useState } from 'react';
import { Layout, Typography, ConfigProvider, theme, App } from 'antd';
import NoteEditor from '../components/NoteEditor';
import AIExplanation from '../components/AIExplanation';
import { useOpenAI } from '../hooks/useOpenAI';

const { Header, Content } = Layout;
const { Title } = Typography;

function HomeContent() {
  const [selectedText, setSelectedText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { isExplaining, explanation, explain, clearExplanation } = useOpenAI();

  /**
   * Handle explanation request from NoteEditor
   */
  const handleExplainRequest = async (text: string) => {
    setSelectedText(text);
    setDrawerVisible(true);
    await explain(text);
  };

  /**
   * Close the explanation drawer
   */
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    clearExplanation();
    setSelectedText('');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        background: '#141414', 
        padding: '0 24px',
        borderBottom: '1px solid #303030',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          AI-Powered Notes
        </Title>
      </Header>

      {/* Main Content */}
      <Content style={{ padding: '24px', background: '#000' }}>
        <div style={{
          background: '#141414',
          padding: '24px',
          borderRadius: '8px',
          height: 'calc(100vh - 120px)',
        }}>
          <NoteEditor onExplainRequest={handleExplainRequest} />
        </div>
      </Content>

      {/* AI Explanation Drawer */}
      <AIExplanation
        visible={drawerVisible}
        explanation={explanation}
        originalText={selectedText}
        isLoading={isExplaining}
        onClose={handleCloseDrawer}
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