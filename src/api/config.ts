import { http } from '@/utils/request';
import type {
  SystemConfig,
  ConfigQueryParams,
  ConfigListResponse,
  ConfigFormData,
  ConfigStatistics,
} from '@/types/config';

// 获取系统参数列表
export const getConfigList = (params: ConfigQueryParams) => {
  return http.get<ConfigListResponse>('/system/config/list', { params });
};

// 获取系统参数详情
export const getConfigDetail = (id: number) => {
  return http.get<SystemConfig>(`/system/config/${id}`);
};

// 根据键获取系统参数
export const getConfigByKey = (key: string) => {
  return http.get<SystemConfig>(`/system/config/key/${key}`);
};

// 新增系统参数
export const createConfig = (data: ConfigFormData) => {
  return http.post<{ id: number }>('/system/config', data);
};

// 编辑系统参数
export const updateConfig = (id: number, data: ConfigFormData) => {
  return http.put(`/system/config/${id}`, data);
};

// 删除系统参数
export const deleteConfig = (id: number) => {
  return http.delete(`/system/config/${id}`);
};

// 批量删除系统参数
export const batchDeleteConfig = (ids: number[]) => {
  return http.post('/system/config/batch-delete', { ids });
};

// 更新系统参数状态
export const updateConfigStatus = (id: number, status: 0 | 1) => {
  return http.put(`/system/config/${id}/status`, { status });
};

// 刷新系统参数缓存
export const refreshConfigCache = () => {
  return http.post('/system/config/refresh-cache');
};

// 获取系统参数统计数据
export const getConfigStatistics = () => {
  return http.get<ConfigStatistics>('/system/config/statistics');
};

// 导出系统参数列表
export const exportConfigList = (_params: ConfigQueryParams) => {
  return http.download('/system/config/export', '系统参数列表.xlsx');
};
