import React from 'react';
import { Drawer, Button, Tag, Space, Descriptions, Popconfirm } from 'antd';
import {
  BellOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Message, MessageType } from '@/types/notification';
import './MessageDetail.css';

interface MessageDetailProps {
  visible: boolean;
  message: Message | null;
  onClose: () => void;
  onDelete: (id: number) => void;
}

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

// 消息类型标签
const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  system: '系统通知',
  business: '业务通知',
  approval: '审批通知',
};

const MessageDetail: React.FC<MessageDetailProps> = ({
  visible,
  message,
  onClose,
  onDelete,
}) => {
  if (!message) return null;

  return (
    <Drawer
      title={
        <div className="message-detail-header">
          <span
            className="message-type-icon"
            style={{ color: MESSAGE_TYPE_COLORS[message.type] }}
          >
            {MESSAGE_TYPE_ICONS[message.type]}
          </span>
          <span>消息详情</span>
        </div>
      }
      placement="right"
      width={600}
      open={visible}
      onClose={onClose}
      className="message-detail-drawer"
      extra={
        <Space>
          <Popconfirm
            title="确定删除这条消息吗？"
            onConfirm={() => onDelete(message.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <div className="message-detail-content">
        {/* 消息标题 */}
        <div className="message-detail-title">
          <h2>{message.title}</h2>
          <Tag color={MESSAGE_TYPE_COLORS[message.type]}>
            {MESSAGE_TYPE_LABELS[message.type]}
          </Tag>
        </div>

        {/* 消息元信息 */}
        <Descriptions column={1} className="message-detail-meta">
          {message.senderName && (
            <Descriptions.Item
              label={
                <span>
                  <UserOutlined /> 发送人
                </span>
              }
            >
              {message.senderName}
            </Descriptions.Item>
          )}
          <Descriptions.Item
            label={
              <span>
                <ClockCircleOutlined /> 发送时间
              </span>
            }
          >
            {message.sendTime}
          </Descriptions.Item>
          {message.readTime && (
            <Descriptions.Item
              label={
                <span>
                  <CheckCircleOutlined /> 阅读时间
                </span>
              }
            >
              {message.readTime}
            </Descriptions.Item>
          )}
          <Descriptions.Item
            label={
              <span>
                <BellOutlined /> 状态
              </span>
            }
          >
            {message.status === 'unread' ? (
              <Tag color="success">未读</Tag>
            ) : (
              <Tag color="default">已读</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>

        {/* 消息内容 */}
        <div className="message-detail-body">
          <div className="message-content-label">消息内容</div>
          <div className="message-content-text">{message.content}</div>
        </div>

        {/* 关联信息 */}
        {message.relatedType && message.relatedId && (
          <div className="message-related-info">
            <div className="related-label">关联信息</div>
            <div className="related-content">
              <Tag color="blue">{message.relatedType}</Tag>
              <span>ID: {message.relatedId}</span>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default MessageDetail;
