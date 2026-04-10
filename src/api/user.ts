import { http } from '@/utils/request';

// 用户信息
export interface User {
  id: number;
  username: string;
  realName: string;
  phone: string;
  email: string;
  avatar?: string;
  gender: number;
  status: number;
  campusId: number;
  campusName?: string;
  roleIds?: number[];
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  realName?: string;
  phone?: string;
  campusId?: number;
  status?: number;
  roleCode?: string;
}

// 用户列表响应
export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
}

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

type BackendRole = {
  id?: number;
  code?: string;
  name?: string;
};

type BackendUser = Partial<User> & {
  id?: number | string;
  roles?: BackendRole[];
  roleIds?: Array<number | string>;
  createTime?: string;
  updateTime?: string;
};

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const normalizeUser = (raw: unknown): User => {
  const item = (raw ?? {}) as BackendUser;
  const roleIds = Array.isArray(item.roleIds)
    ? item.roleIds.map((roleId) => toNumber(roleId)).filter((roleId) => roleId > 0)
    : Array.isArray(item.roles)
      ? item.roles
          .map((role) => toNumber((role as BackendRole)?.id))
          .filter((roleId) => roleId > 0)
      : undefined;

  return {
    id: toNumber(item.id),
    username: String(item.username ?? ''),
    realName: String(item.realName ?? item.username ?? ''),
    phone: String(item.phone ?? ''),
    email: String(item.email ?? ''),
    avatar: item.avatar ? String(item.avatar) : undefined,
    gender: toNumber(item.gender, 0),
    status: toNumber(item.status, 1),
    campusId: toNumber(item.campusId),
    campusName: item.campusName ? String(item.campusName) : undefined,
    roleIds,
    remark: item.remark ? String(item.remark) : undefined,
    createTime: String(item.createTime ?? ''),
    updateTime: String(item.updateTime ?? ''),
  };
};

const normalizeUserPage = (raw: unknown, params: UserQueryParams): UserListResponse => {
  const page = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];

  return {
    list: records.map(normalizeUser),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
  };
};

// 获取用户列表
export const getUserList = async (params: UserQueryParams) => {
  const response = await http.get<unknown>('/system/user/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      username: params.username,
      realName: params.realName,
      phone: params.phone,
      campusId: params.campusId,
      status: params.status,
    },
  });
  return normalizeUserPage(response, params);
};

// 获取顾问列表（角色为advisor的用户）
export const getAdvisorList = async (campusId?: number) => {
  const response = await http.get<unknown>('/system/user/page', {
    params: {
      pageNum: 1,
      pageSize: 1000,
      campusId,
      status: 1,
    },
  });

  const page = (unwrapData<unknown>(response) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records) ? page.records : [];

  const advisors = records.filter((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }
    const roles = (item as { roles?: unknown }).roles;
    if (!Array.isArray(roles)) {
      // 后端当前列表未必返回角色关联，无法精确筛选时退化为不过滤
      return true;
    }
    return roles.some((role) => {
      if (!role || typeof role !== 'object') {
        return false;
      }
      const code = (role as BackendRole).code;
      return typeof code === 'string' && code.toLowerCase() === 'advisor';
    });
  });

  return advisors.map(normalizeUser);
};

// 获取用户详情
export const getUserDetail = async (id: number) => {
  const response = await http.get<unknown>(`/system/user/${id}`);
  return normalizeUser(unwrapData<unknown>(response));
};

// 新增用户
export const createUser = async (data: Partial<User>) => {
  const response = await http.post<unknown>('/system/user', data);
  const payload = unwrapData<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return { id: toNumber((payload as { id?: unknown }).id) };
  }
  return { id: 0 };
};

// 编辑用户
export const updateUser = (id: number, data: Partial<User>) => {
  return http.put('/system/user', { ...data, id });
};

// 删除用户
export const deleteUser = (id: number) => {
  return http.delete(`/system/user/${id}`);
};

// 批量删除用户
export const batchDeleteUser = (ids: number[]) => {
  return http.delete('/system/user/batch', { data: ids });
};

// 重置密码
export const resetPassword = (id: number, newPassword: string) => {
  return http.put(`/system/user/${id}/password/reset`, null, {
    params: { newPassword },
  });
};
