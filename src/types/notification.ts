// 消息通知类型定义

// 消息类型
export type MessageType = 'system' | 'business' | 'approval';

// 消息状态
export type MessageStatus = 'unread' | 'read';

// 消息分类
export type MessageCategory = 'all' | 'unread' | 'read' | 'system' | 'business' | 'approval';

// 消息详情
export interface Message {
  id: number;
  title: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  senderId?: number;
  senderName?: string;
  receiverId: number;
  receiverName?: string;
  relatedId?: number; // 关联业务ID
  relatedType?: string; // 关联业务类型
  sendTime: string;
  readTime?: string;
  createTime: string;
  updateTime?: string;
}

// 消息列表查询参数
export interface MessageQueryParams {
  page: number;
  pageSize: number;
  type?: MessageType;
  status?: MessageStatus;
  keyword?: string; // 搜索关键词（标题、内容）
  startTime?: string;
  endTime?: string;
}

// 消息列表响应
export interface MessageListResponse {
  list: Message[];
  total: number;
  page: number;
  pageSize: number;
}

// 未读消息数量
export interface UnreadCount {
  total: number;
  system: number;
  business: number;
  approval: number;
}

// 标记已读参数
export interface MarkReadParams {
  ids?: number[]; // 消息ID列表，为空则全部标记已读
}

// 消息类型配置
export const MESSAGE_TYPE_CONFIG = {
  system: {
    label: '系统通知',
    color: '#00d4ff',
    icon: 'BellOutlined',
  },
  business: {
    label: '业务通知',
    color: '#0099ff',
    icon: 'NotificationOutlined',
  },
  approval: {
    label: '审批通知',
    color: '#00ff88',
    icon: 'CheckCircleOutlined',
  },
};

// 消息状态配置
export const MESSAGE_STATUS_CONFIG = {
  unread: {
    label: '未读',
    color: '#00ff88',
  },
  read: {
    label: '已读',
    color: '#666',
  },
};
