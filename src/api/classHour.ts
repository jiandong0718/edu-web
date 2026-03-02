import { http } from '@/utils/request';
import type {
  ClassHourAccount,
  ClassHourAccountQueryParams,
  ClassHourAccountListResponse,
  ClassHourAdjustFormData,
  ClassHourAdjustRecord,
  ClassHourAdjustRecordQueryParams,
  ClassHourAdjustRecordListResponse,
  ClassHourStatistics,
} from '@/types/classHour';

// 获取课时账户列表
export const getClassHourAccountList = (params: ClassHourAccountQueryParams) => {
  return http.get<ClassHourAccountListResponse>('/finance/class-hour/account/list', { params });
};

// 获取课时账户详情
export const getClassHourAccountDetail = (id: number) => {
  return http.get<ClassHourAccount>(`/finance/class-hour/account/${id}`);
};

// 课时调整
export const adjustClassHour = (data: ClassHourAdjustFormData) => {
  return http.post<{ id: number }>('/finance/class-hour/adjust', data);
};

// 获取课时调整记录列表
export const getClassHourAdjustRecordList = (params: ClassHourAdjustRecordQueryParams) => {
  return http.get<ClassHourAdjustRecordListResponse>('/finance/class-hour/adjust/records', { params });
};

// 获取指定账户的调整记录
export const getAccountAdjustRecords = (accountId: number) => {
  return http.get<ClassHourAdjustRecord[]>(`/finance/class-hour/account/${accountId}/adjust-records`);
};

// 获取课时统计信息
export const getClassHourStatistics = () => {
  return http.get<ClassHourStatistics>('/finance/class-hour/statistics');
};

// 导出课时账户列表
export const exportClassHourAccountList = (params: ClassHourAccountQueryParams) => {
  return http.download('/finance/class-hour/account/export', '课时账户列表.xlsx', { params });
};

// 导出课时调整记录
export const exportClassHourAdjustRecords = (params: ClassHourAdjustRecordQueryParams) => {
  return http.download('/finance/class-hour/adjust/export', '课时调整记录.xlsx', { params });
};
