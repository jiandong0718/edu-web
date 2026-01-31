import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Popover, List, Button, Empty, Spin } from 'antd';
import { BellOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Message } from '@/types/notification';
import { getMessagePage, getUnreadCount, markMessageRead } from '@/api/notification';
import './index.css';

interface NotificationBellProps {
  style?: React.CSSProperties;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ style, className }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);

  // 加载未读数量
  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadCount();
      setUnreadCount(result.total);
    } catch (error) {
      console.error('加载未读数量失败:', error);
    }
  };

  // 加载最近消息
  const loadRecentMessages = async () => {
    setLoading(true);
    try {
      const response = await getMessagePage({
        page: 1,
        pageSize: 5,
        status: 'unread',
      });
      setRecentMessages(response.list);
    } catch (error) {
      console.error('加载最近消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // 轮询更新未读数量（每30秒）
  useEffect(() => {
    const timer = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // 打开弹窗时加载最近消息
  const handleVisibleChange = (visible: boolean) => {
    setPopoverVisible(visible);
    if (visible) {
      loadRecentMessages();
    }
  };

  // 查看消息详情
  const handleViewMessage = async (message: Message) => {
    setPopoverVisible(false);
    navigate('/notification/message');

    // 标记为已读
    if (message.status === 'unread') {
      try {
        await markMessageRead(message.id);
        loadUnreadCount();
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
  };

  // 查看全部消息
  const handleViewAll = () => {
    setPopoverVisible(false);
    navigate('/notification/message');
  };

  // 弹窗内容
  const popoverContent = (
    <div className="notification-popover">
      <div className="notification-header">
        <span className="notification-title">未读消息</span>
        <span className="notification-count">{unreadCount} 条</span>
      </div>
      <Spin spinning={loading}>
        {recentMessages.length > 0 ? (
          <List
            className="notification-list"
            dataSource={recentMessages}
            renderItem={(item) => (
              <List.Item
                className="notification-item"
                onClick={() => handleViewMessage(item)}
              >
                <div className="notification-item-content">
                  <div className="notification-item-title">{item.title}</div>
                  <div className="notification-item-time">{item.sendTime}</div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无未读消息"
            style={{ padding: '20px 0' }}
          />
        )}
      </Spin>
      {recentMessages.length > 0 && (
        <div className="notification-footer">
          <Button type="link" onClick={handleViewAll} block>
            查看全部消息 <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      placement="bottomRight"
      open={popoverVisible}
      onOpenChange={handleVisibleChange}
      overlayClassName="notification-bell-popover"
    >
      <Tooltip title="通知">
        <Badge count={unreadCount} overflowCount={99} className="notification-badge">
          <div className={`notification-bell ${className || ''}`} style={style}>
            <BellOutlined />
          </div>
        </Badge>
      </Tooltip>
    </Popover>
  );
};

export default NotificationBell;
