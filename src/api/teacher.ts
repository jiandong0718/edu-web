import { http } from '@/utils/request';
import type {
  Teacher,
  TeacherQueryParams,
  TeacherListResponse,
  TeacherFormData,
  Certificate,
  CertificateFormData,
  Schedule,
  ScheduleFormData,
  SalaryConfig,
  SalaryConfigFormData,
  ScheduleEvent,
} from '@/types/teacher';

// 获取教师列表
export const getTeacherList = (params: TeacherQueryParams) => {
  return http.get<TeacherListResponse>('/teacher/list', { params });
};

// 获取教师详情
export const getTeacherDetail = (id: number) => {
  return http.get<Teacher>(`/teacher/${id}`);
};

// 新增教师
export const createTeacher = (data: TeacherFormData) => {
  return http.post<{ id: number }>('/teacher', data);
};

// 编辑教师
export const updateTeacher = (id: number, data: TeacherFormData) => {
  return http.put(`/teacher/${id}`, data);
};

// 删除教师
export const deleteTeacher = (id: number) => {
  return http.delete(`/teacher/${id}`);
};

// 批量删除教师
export const batchDeleteTeacher = (ids: number[]) => {
  return http.post('/teacher/batch-delete', { ids });
};

// 更新教师状态
export const updateTeacherStatus = (id: number, status: string) => {
  return http.put(`/teacher/${id}/status`, { status });
};

// 获取教师证书列表
export const getTeacherCertificates = (teacherId: number) => {
  return http.get<Certificate[]>(`/teacher/${teacherId}/certificates`);
};

// 新增教师证书
export const createCertificate = (data: CertificateFormData) => {
  return http.post<{ id: number }>('/teacher/certificate', data);
};

// 编辑教师证书
export const updateCertificate = (id: number, data: CertificateFormData) => {
  return http.put(`/teacher/certificate/${id}`, data);
};

// 删除教师证书
export const deleteCertificate = (id: number) => {
  return http.delete(`/teacher/certificate/${id}`);
};

// 获取教师排班列表
export const getTeacherSchedules = (teacherId: number) => {
  return http.get<Schedule[]>(`/teacher/${teacherId}/schedules`);
};

// 新增教师排班
export const createSchedule = (data: ScheduleFormData) => {
  return http.post<{ id: number }>('/teacher/schedule', data);
};

// 编辑教师排班
export const updateSchedule = (id: number, data: ScheduleFormData) => {
  return http.put(`/teacher/schedule/${id}`, data);
};

// 删除教师排班
export const deleteSchedule = (id: number) => {
  return http.delete(`/teacher/schedule/${id}`);
};

// 导出教师列表
export const exportTeacherList = (_params: TeacherQueryParams) => {
  return http.download('/teacher/export', '教师列表.xlsx');
};

// 获取教师课酬配置列表
export const getTeacherSalaryConfigs = (teacherId: number) => {
  return http.get<SalaryConfig[]>(`/teacher/${teacherId}/salary-configs`);
};

// 新增教师课酬配置
export const createSalaryConfig = (data: SalaryConfigFormData) => {
  return http.post<{ id: number }>('/teacher/salary-config', data);
};

// 编辑教师课酬配置
export const updateSalaryConfig = (id: number, data: SalaryConfigFormData) => {
  return http.put(`/teacher/salary-config/${id}`, data);
};

// 删除教师课酬配置
export const deleteSalaryConfig = (id: number) => {
  return http.delete(`/teacher/salary-config/${id}`);
};

// 获取教师排班事件（日历展示）
export const getTeacherScheduleEvents = (teacherId: number, params?: { startDate?: string; endDate?: string }) => {
  return http.get<ScheduleEvent[]>(`/teacher/${teacherId}/schedule-events`, { params });
};

// 批量配置教师可用时间
export const batchConfigAvailableTime = (teacherId: number, data: ScheduleFormData[]) => {
  return http.post(`/teacher/${teacherId}/available-time`, data);
};
