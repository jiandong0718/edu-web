import { http } from '@/utils/request';
import type {
  Message,
  MessageQueryParams,
  MessageListResponse,
  UnreadCount,
  MarkReadParams,
} from '@/types/notification';

// 分页查询消息列表
export const getMessagePage = (params: MessageQueryParams) => {
  return http.get<MessageListResponse>('/notification/message/page', { params });
};

// 查询消息详情
export const getMessageDetail = (id: number) => {
  return http.get<Message>(`/notification/message/${id}`);
};

// 标记消息已读
export const markMessageRead = (id: number) => {
  return http.put(`/notification/message/${id}/read`);
};

// 全部标记已读
export const markAllRead = (params?: MarkReadParams) => {
  return http.put('/notification/message/read-all', params);
};

// 删除消息
export const deleteMessage = (id: number) => {
  return http.delete(`/notification/message/${id}`);
};

// 批量删除消息
export const batchDeleteMessage = (ids: number[]) => {
  return http.delete('/notification/message/batch', { data: { ids } });
};

// 获取未读消息数量
export const getUnreadCount = () => {
  return http.get<UnreadCount>('/notification/message/unread-count');
};

// 删除所有已读消息
export const deleteAllRead = () => {
  return http.delete('/notification/message/read-all');
};
