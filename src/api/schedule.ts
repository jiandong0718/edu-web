import { http } from '@/utils/request';
import type {
  Schedule,
  ScheduleQueryParams,
  ScheduleListResponse,
  BatchScheduleRequest,
  ConflictCheckRequest,
  ConflictCheckResponse,
  RescheduleRequest,
  SubstituteRequest,
  CancelScheduleRequest,
} from '@/types/schedule';

// 获取课表列表
export const getScheduleList = (params: ScheduleQueryParams) => {
  return http.get<ScheduleListResponse>('/teaching/schedule/list', { params });
};

// 获取课表详情
export const getScheduleDetail = (id: number) => {
  return http.get<Schedule>(`/teaching/schedule/${id}`);
};

// 批量排课（增强版）
export const batchScheduleEnhanced = (data: BatchScheduleRequest) => {
  return http.post('/teaching/schedule/batch-enhanced', data);
};

// 冲突检测
export const checkConflict = (data: ConflictCheckRequest) => {
  return http.post<ConflictCheckResponse>('/teaching/schedule/check-conflict', data);
};

// 调课
export const rescheduleClass = (data: RescheduleRequest) => {
  return http.put('/teaching/schedule/reschedule', data);
};

// 代课
export const substituteTeacher = (data: SubstituteRequest) => {
  return http.put('/teaching/schedule/substitute', data);
};

// 停课
export const cancelSchedule = (data: CancelScheduleRequest) => {
  return http.put('/teaching/schedule/cancel', data);
};

// 删除课表
export const deleteSchedule = (id: number) => {
  return http.delete(`/teaching/schedule/${id}`);
};

// 批量删除课表
export const batchDeleteSchedule = (ids: number[]) => {
  return http.post('/teaching/schedule/batch-delete', { ids });
};
