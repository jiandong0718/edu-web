import { http } from '@/utils/request';

// 登录日志查询参数
export interface LoginLogQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  ip?: string;
  status?: 'success' | 'failure' | '';
  startTime?: string;
  endTime?: string;
}

// 登录日志数据
export interface LoginLog {
  id: number;
  username: string;
  realName: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: 'success' | 'failure';
  message?: string;
  loginTime: string;
}

// 登录日志列表响应
export interface LoginLogListResponse {
  list: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
}

// 操作日志查询参数
export interface OperationLogQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  module?: string;
  status?: 'success' | 'failure' | '';
  startTime?: string;
  endTime?: string;
}

// 操作日志数据
export interface OperationLog {
  id: number;
  username: string;
  realName: string;
  module: string;
  operation: string;
  method: string;
  params: string;
  result: 'success' | 'failure';
  errorMsg?: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  duration: number;
  createTime: string;
}

// 操作日志列表响应
export interface OperationLogListResponse {
  list: OperationLog[];
  total: number;
  page: number;
  pageSize: number;
}

// 获取登录日志列表
export const getLoginLogList = (params: LoginLogQueryParams) => {
  return http.get<LoginLogListResponse>('/system/login-log/list', { params });
};

// 删除登录日志
export const deleteLoginLog = (id: number) => {
  return http.delete(`/system/login-log/${id}`);
};

// 批量删除登录日志
export const batchDeleteLoginLog = (ids: number[]) => {
  return http.post('/system/login-log/batch-delete', { ids });
};

// 导出登录日志
export const exportLoginLog = (params: LoginLogQueryParams) => {
  return http.get('/system/login-log/export', {
    params,
    responseType: 'blob'
  }).then((response: any) => {
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '登录日志.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  });
};

// 获取操作日志列表
export const getOperationLogList = (params: OperationLogQueryParams) => {
  return http.get<OperationLogListResponse>('/system/operation-log/list', { params });
};

// 获取操作日志详情
export const getOperationLogDetail = (id: number) => {
  return http.get<OperationLog>(`/system/operation-log/${id}`);
};

// 删除操作日志
export const deleteOperationLog = (id: number) => {
  return http.delete(`/system/operation-log/${id}`);
};

// 批量删除操作日志
export const batchDeleteOperationLog = (ids: number[]) => {
  return http.post('/system/operation-log/batch-delete', { ids });
};

// 导出操作日志
export const exportOperationLog = (params: OperationLogQueryParams) => {
  return http.get('/system/operation-log/export', {
    params,
    responseType: 'blob'
  }).then((response: any) => {
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '操作日志.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  });
};
