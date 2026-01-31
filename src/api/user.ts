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

// 获取用户列表
export const getUserList = (params: UserQueryParams) => {
  return http.get<UserListResponse>('/system/user/list', { params });
};

// 获取顾问列表（角色为advisor的用户）
export const getAdvisorList = (campusId?: number) => {
  return http.get<User[]>('/system/user/list', {
    params: {
      roleCode: 'advisor',
      campusId,
      status: 1,
      pageSize: 1000,
    },
  }).then((res: any) => res.list || res);
};

// 获取用户详情
export const getUserDetail = (id: number) => {
  return http.get<User>(`/system/user/${id}`);
};

// 新增用户
export const createUser = (data: Partial<User>) => {
  return http.post<{ id: number }>('/system/user', data);
};

// 编辑用户
export const updateUser = (id: number, data: Partial<User>) => {
  return http.put(`/system/user/${id}`, data);
};

// 删除用户
export const deleteUser = (id: number) => {
  return http.delete(`/system/user/${id}`);
};

// 批量删除用户
export const batchDeleteUser = (ids: number[]) => {
  return http.post('/system/user/batch-delete', { ids });
};

// 重置密码
export const resetPassword = (id: number, newPassword: string) => {
  return http.put(`/system/user/${id}/reset-password`, { newPassword });
};
