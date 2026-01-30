import { http } from '@/utils/request';

export interface OperationLog {
  id: number;
  username: string;
  realName: string;
  module: string;
  operation: string;
  operationType: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY' | 'EXPORT' | 'IMPORT' | 'OTHER';
  method: string;
  requestParams?: string;
  responseResult?: string;
  errorMsg?: string;
  status: 'success' | 'failure';
  ip: string;
  location: string;
  browser: string;
  os: string;
  duration: number;
  createTime: string;
}

export interface OperationLogQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  operationType?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  username?: string;
}

export interface OperationLogPageResult {
  list: OperationLog[];
  total: number;
}

// 查询操作日志列表
export const getOperationLogList = (params: OperationLogQuery) => {
  return http.get<OperationLogPageResult>('/system/operation-log/list', { params });
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
  return http.delete('/system/operation-log/batch', { data: { ids } });
};

// 导出操作日志
export const exportOperationLog = (_params: OperationLogQuery) => {
  return http.download('/system/operation-log/export', '操作日志.xlsx');
};

// 获取操作模块列表
export const getOperationModules = () => {
  return http.get<string[]>('/system/operation-log/modules');
};

// 获取操作人列表
export const getOperationUsers = () => {
  return http.get<Array<{ username: string; realName: string }>>('/system/operation-log/users');
};
