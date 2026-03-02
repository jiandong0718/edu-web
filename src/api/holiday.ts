import { http } from '@/utils/request';
import type {
  Holiday,
  HolidayQueryParams,
  HolidayListResponse,
  HolidayFormData,
  HolidayStatus,
} from '@/types/holiday';

// 获取节假日列表（分页）
export const getHolidayPage = (params: HolidayQueryParams) => {
  return http.get<HolidayListResponse>('/system/holiday/page', { params });
};

// 获取节假日详情
export const getHolidayDetail = (id: number) => {
  return http.get<Holiday>(`/system/holiday/${id}`);
};

// 新增节假日
export const createHoliday = (data: HolidayFormData) => {
  return http.post<{ id: number }>('/system/holiday', data);
};

// 编辑节假日
export const updateHoliday = (id: number, data: HolidayFormData) => {
  return http.put(`/system/holiday/${id}`, data);
};

// 删除节假日
export const deleteHoliday = (id: number) => {
  return http.delete(`/system/holiday/${id}`);
};

// 批量删除节假日
export const batchDeleteHoliday = (ids: number[]) => {
  return http.post('/system/holiday/batch-delete', { ids });
};

// 更新节假日状态
export const updateHolidayStatus = (id: number, status: HolidayStatus) => {
  return http.put(`/system/holiday/${id}/status`, { status });
};

// 导出节假日列表
export const exportHolidayList = (_params: HolidayQueryParams) => {
  return http.download('/system/holiday/export', '节假日列表.xlsx');
};

// 批量导入节假日
export const importHolidays = (file: File) => {
  return http.upload('/system/holiday/import', file);
};
