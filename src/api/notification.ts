import { http } from '@/utils/request';
import type {
  Message,
  MessageQueryParams,
  MessageListResponse,
  UnreadCount,
  MarkReadParams,
} from '@/types/notification';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

type UserContext = {
  userId: number;
  userType: string;
};

let userContextPromise: Promise<UserContext> | null = null;

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toMessageType = (value: unknown): Message['type'] => {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('approval')) return 'approval';
  if (normalized.includes('business')) return 'business';
  return 'system';
};

const normalizeMessage = (raw: unknown): Message => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const read = toNumber(item.isRead, 0) === 1;
  return {
    id: toNumber(item.id),
    title: String(item.title ?? ''),
    content: String(item.content ?? ''),
    type: toMessageType(item.type),
    status: read ? 'read' : 'unread',
    senderId: item.senderId != null ? toNumber(item.senderId) : undefined,
    senderName: item.senderName ? String(item.senderName) : undefined,
    receiverId: toNumber(item.userId ?? item.receiverId),
    receiverName: item.receiverName ? String(item.receiverName) : undefined,
    relatedId: item.relatedId != null ? toNumber(item.relatedId) : undefined,
    relatedType: item.relatedType ? String(item.relatedType) : undefined,
    sendTime: String(item.sendTime ?? item.createTime ?? ''),
    readTime: item.readTime ? String(item.readTime) : undefined,
    createTime: String(item.createTime ?? ''),
    updateTime: item.updateTime ? String(item.updateTime) : undefined,
  };
};

const resolveUserContext = async (): Promise<UserContext> => {
  if (!userContextPromise) {
    userContextPromise = http.get<unknown>('/auth/info').then((response) => {
      const payload = (unwrapData<unknown>(response) ?? {}) as Record<string, unknown>;
      const userId = toNumber(payload.userId ?? payload.id);
      if (!userId) {
        throw new Error('未获取到当前用户ID');
      }
      return {
        userId,
        userType: 'user',
      };
    }).catch((error) => {
      userContextPromise = null;
      throw error;
    });
  }
  return userContextPromise;
};

const matchesKeyword = (message: Message, keyword?: string) => {
  if (!keyword) return true;
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return true;
  return (
    message.title.toLowerCase().includes(normalized) ||
    message.content.toLowerCase().includes(normalized)
  );
};

const inRange = (message: Message, startTime?: string, endTime?: string) => {
  const ts = message.sendTime || message.createTime;
  if (!ts) return true;
  const value = new Date(ts).getTime();
  if (Number.isNaN(value)) return true;
  if (startTime) {
    const start = new Date(startTime).getTime();
    if (!Number.isNaN(start) && value < start) return false;
  }
  if (endTime) {
    const end = new Date(endTime).getTime();
    if (!Number.isNaN(end) && value > end) return false;
  }
  return true;
};

// 分页查询消息列表
export const getMessagePage = async (params: MessageQueryParams) => {
  const { userId, userType } = await resolveUserContext();
  const response = await http.get<unknown>('/notification/message/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      userId,
      userType,
      isRead: params.status === 'read' ? 1 : params.status === 'unread' ? 0 : undefined,
    },
  });

  const page = (unwrapData<unknown>(response) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records) ? page.records : [];
  let list = records.map(normalizeMessage);
  let total = toNumber(page.total, list.length);
  let clientFiltered = false;

  if (params.type) {
    list = list.filter((item) => item.type === params.type);
    clientFiltered = true;
  }
  if (params.keyword) {
    list = list.filter((item) => matchesKeyword(item, params.keyword));
    clientFiltered = true;
  }
  if (params.startTime || params.endTime) {
    list = list.filter((item) => inRange(item, params.startTime, params.endTime));
    clientFiltered = true;
  }
  if (clientFiltered) {
    total = list.length;
  }

  return {
    list,
    total,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
  } as MessageListResponse;
};

// 查询消息详情
export const getMessageDetail = async (id: number) => {
  const page = await getMessagePage({ page: 1, pageSize: 1000 });
  const target = page.list.find((item) => item.id === id);
  if (!target) {
    throw new Error('消息不存在');
  }
  return target;
};

// 标记消息已读
export const markMessageRead = (id: number) => {
  return http.put(`/notification/message/${id}/read`);
};

// 全部标记已读
export const markAllRead = async (params?: MarkReadParams) => {
  void params;
  const { userId, userType } = await resolveUserContext();
  return http.put('/notification/message/read-all', null, {
    params: {
      userId,
      userType,
    },
  });
};

// 删除消息
export const deleteMessage = (id: number) => {
  return http.delete(`/notification/message/${id}`);
};

// 批量删除消息
export const batchDeleteMessage = (ids: number[]) => {
  return Promise.all(ids.map((id) => deleteMessage(id))).then(() => undefined);
};

// 获取未读消息数量
export const getUnreadCount = async () => {
  const { userId, userType } = await resolveUserContext();
  const response = await http.get<unknown>('/notification/message/unread-count', {
    params: { userId, userType },
  });
  const total = toNumber(unwrapData<unknown>(response));
  return {
    total,
    system: 0,
    business: 0,
    approval: 0,
  } as UnreadCount;
};

// 删除所有已读消息
export const deleteAllRead = async () => {
  const page = await getMessagePage({
    page: 1,
    pageSize: 1000,
    status: 'read',
  });
  await Promise.all(page.list.map((item) => deleteMessage(item.id)));
};
