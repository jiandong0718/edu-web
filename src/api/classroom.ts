import { http } from '@/utils/request';
import type {
  Classroom,
  ClassroomQueryParams,
  ClassroomListResponse,
  ClassroomFormData,
  ClassroomStatistics,
  ClassroomStatus,
} from '@/types/classroom';

// 获取教室列表
export const getClassroomList = (params: ClassroomQueryParams) => {
  return http.get<ClassroomListResponse>('/classroom/list', { params });
};

// 获取教室详情
export const getClassroomDetail = (id: number) => {
  return http.get<Classroom>(`/classroom/${id}`);
};

// 新增教室
export const createClassroom = (data: ClassroomFormData) => {
  return http.post<{ id: number }>('/classroom', data);
};

// 编辑教室
export const updateClassroom = (id: number, data: ClassroomFormData) => {
  return http.put(`/classroom/${id}`, data);
};

// 删除教室
export const deleteClassroom = (id: number) => {
  return http.delete(`/classroom/${id}`);
};

// 批量删除教室
export const batchDeleteClassroom = (ids: number[]) => {
  return http.post('/classroom/batch-delete', { ids });
};

// 更新教室状态
export const updateClassroomStatus = (id: number, status: ClassroomStatus) => {
  return http.put(`/classroom/${id}/status`, { status });
};

// 获取教室统计数据
export const getClassroomStatistics = () => {
  return http.get<ClassroomStatistics>('/classroom/statistics');
};

// 导出教室列表
export const exportClassroomList = (_params: ClassroomQueryParams) => {
  return http.download('/classroom/export', '教室列表.xlsx');
};
