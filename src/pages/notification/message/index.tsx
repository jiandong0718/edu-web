import React, { useState, useEffect } from 'react';
import {
  Layout,
  List,
  Badge,
  Button,
  Input,
  Space,
  Tag,
  Empty,
  Spin,
  message as antMessage,
  Modal,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  BellOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  CheckOutlined,
  DeleteOutlined,
  SearchOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type {
  Message,
  MessageType,
  MessageCategory,
  MessageQueryParams,
} from '@/types/notification';
import {
  getMessagePage,
  markMessageRead,
  markAllRead,
  deleteMessage,
  deleteAllRead,
} from '@/api/notification';
import MessageDetail from './components/MessageDetail';
import './index.css';

const { Sider, Content } = Layout;

// 消息分类配置
const MESSAGE_CATEGORIES = [
  { key: 'all', label: '全部消息', icon: <InboxOutlined /> },
  { key: 'unread', label: '未读消息', icon: <BellOutlined /> },
  { key: 'read', label: '已读消息', icon: <CheckOutlined /> },
  { key: 'system', label: '系统通知', icon: <BellOutlined /> },
  { key: 'business', label: '业务通知', icon: <NotificationOutlined /> },
  { key: 'approval', label: '审批通知', icon: <CheckCircleOutlined /> },
];

// 消息类型图标映射
const MESSAGE_TYPE_ICONS: Record<MessageType, React.ReactNode> = {
  system: <BellOutlined />,
  business: <NotificationOutlined />,
  approval: <CheckCircleOutlined />,
};

// 消息类型颜色映射
const MESSAGE_TYPE_COLORS: Record<MessageType, string> = {
  system: '#00d4ff',
  business: '#0099ff',
  approval: '#00ff88',
};

const MessageCenter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<MessageCategory>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [queryParams, setQueryParams] = useState<MessageQueryParams>({
    page: 1,
    pageSize: 20,
  });

  // 加载消息列表
  const loadMessages = async () => {
    setLoading(true);
    try {
      const params: MessageQueryParams = {
        ...queryParams,
        keyword: searchKeyword || undefined,
      };

      // 根据分类设置查询参数
      if (currentCategory === 'unread') {
        params.status = 'unread';
      } else if (currentCategory === 'read') {
        params.status = 'read';
      } else if (currentCategory === 'system' || currentCategory === 'business' || currentCategory === 'approval') {
        params.type = currentCategory as MessageType;
      }

      const response = await getMessagePage(params);
      setMessages(response.list);
      setTotal(response.total);
    } catch (error) {
      console.error('加载消息列表失败:', error);
      antMessage.error('加载消息列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和参数变化时重新加载
  useEffect(() => {
    loadMessages();
  }, [queryParams, currentCategory, searchKeyword]);

  // 切换分类
  const handleCategoryChange = (category: MessageCategory) => {
    setCurrentCategory(category);
    setQueryParams({ ...queryParams, page: 1 });
  };

  // 搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setQueryParams({ ...queryParams, page: 1 });
  };

  // 查看消息详情
  const handleViewMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    setDetailVisible(true);

    // 如果是未读消息，标记为已读
    if (msg.status === 'unread') {
      try {
        await markMessageRead(msg.id);
        // 更新本地状态
        setMessages(messages.map(m =>
          m.id === msg.id ? { ...m, status: 'read' as const } : m
        ));
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
  };

  // 关闭详情
  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedMessage(null);
  };

  // 删除消息
  const handleDeleteMessage = async (id: number) => {
    try {
      await deleteMessage(id);
      antMessage.success('删除成功');
      loadMessages();
    } catch (error) {
      console.error('删除消息失败:', error);
      antMessage.error('删除消息失败');
    }
  };

  // 全部标记已读
  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      antMessage.success('已全部标记为已读');
      loadMessages();
    } catch (error) {
      console.error('标记已读失败:', error);
      antMessage.error('标记已读失败');
    }
  };

  // 删除所有已读消息
  const handleDeleteAllRead = async () => {
    try {
      await deleteAllRead();
      antMessage.success('已删除所有已读消息');
      loadMessages();
    } catch (error) {
      console.error('删除失败:', error);
      antMessage.error('删除失败');
    }
  };

  // 刷新
  const handleRefresh = () => {
    loadMessages();
  };

  // 分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setQueryParams({ ...queryParams, page, pageSize });
  };

  // 获取未读消息数量
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="message-center">
      <Layout className="message-layout">
        {/* 左侧分类 */}
        <Sider width={240} className="message-sider">
          <div className="category-list">
            {MESSAGE_CATEGORIES.map(category => (
              <div
                key={category.key}
                className={`category-item ${currentCategory === category.key ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.key as MessageCategory)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-label">{category.label}</span>
                {category.key === 'unread' && unreadCount > 0 && (
                  <Badge count={unreadCount} className="category-badge" />
                )}
              </div>
            ))}
          </div>
        </Sider>

        {/* 右侧消息列表 */}
        <Content className="message-content">
          {/* 工具栏 */}
          <div className="message-toolbar">
            <Space>
              <Input
                placeholder="搜索标题或内容"
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 300 }}
                onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                onChange={(e) => !e.target.value && handleSearch('')}
              />
              <Tooltip title="刷新">
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
              </Tooltip>
            </Space>
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                全部标记已读
              </Button>
              <Popconfirm
                title="确定删除所有已读消息吗？"
                onConfirm={handleDeleteAllRead}
                okText="确定"
                cancelText="取消"
              >
                <Button icon={<DeleteOutlined />} danger>
                  删除已读消息
                </Button>
              </Popconfirm>
            </Space>
          </div>

          {/* 消息列表 */}
          <Spin spinning={loading}>
            <List
              className="message-list"
              dataSource={messages}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无消息"
                  />
                ),
              }}
              pagination={{
                current: queryParams.page,
                pageSize: queryParams.pageSize,
                total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: handlePageChange,
              }}
              renderItem={(item) => (
                <List.Item
                  className={`message-item ${item.status === 'unread' ? 'unread' : ''}`}
                  onClick={() => handleViewMessage(item)}
                  actions={[
                    <Popconfirm
                      title="确定删除这条消息吗？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDeleteMessage(item.id);
                      }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        className="message-icon"
                        style={{ color: MESSAGE_TYPE_COLORS[item.type] }}
                      >
                        {MESSAGE_TYPE_ICONS[item.type]}
                      </div>
                    }
                    title={
                      <div className="message-title">
                        <span>{item.title}</span>
                        {item.status === 'unread' && (
                          <Badge status="processing" text="未读" />
                        )}
                      </div>
                    }
                    description={
                      <div className="message-description">
                        <div className="message-content-preview">
                          {item.content.length > 100
                            ? `${item.content.substring(0, 100)}...`
                            : item.content}
                        </div>
                        <div className="message-meta">
                          <Tag color={MESSAGE_TYPE_COLORS[item.type]}>
                            {item.type === 'system' && '系统通知'}
                            {item.type === 'business' && '业务通知'}
                            {item.type === 'approval' && '审批通知'}
                          </Tag>
                          <span className="message-time">{item.sendTime}</span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>
        </Content>
      </Layout>

      {/* 消息详情抽屉 */}
      <MessageDetail
        visible={detailVisible}
        message={selectedMessage}
        onClose={handleCloseDetail}
        onDelete={(id) => {
          handleDeleteMessage(id);
          handleCloseDetail();
        }}
      />
    </div>
  );
};

export default MessageCenter;
