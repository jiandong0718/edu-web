import { http } from '@/utils/request';
import type {
  Class,
  ClassQueryParams,
  ClassListResponse,
  ClassFormData,
  ClassStudent,
  ClassSchedule,
  ClassAttendanceStats,
  AssignStudentParams,
  RemoveStudentParams,
  UpgradeClassParams,
  CompleteClassParams,
} from '@/types/class';

// 获取班级列表
export const getClassList = (params: ClassQueryParams) => {
  return http.get<ClassListResponse>('/teaching/class/list', { params });
};

// 获取班级详情
export const getClassDetail = (id: number) => {
  return http.get<Class>(`/teaching/class/${id}`);
};

// 新增班级
export const createClass = (data: ClassFormData) => {
  return http.post<{ id: number }>('/teaching/class', data);
};

// 编辑班级
export const updateClass = (id: number, data: ClassFormData) => {
  return http.put(`/teaching/class/${id}`, data);
};

// 删除班级
export const deleteClass = (id: number) => {
  return http.delete(`/teaching/class/${id}`);
};

// 获取班级学员列表
export const getClassStudents = (classId: number) => {
  return http.get<ClassStudent[]>(`/teaching/class/${classId}/students`);
};

// 学员分班
export const assignStudents = (data: AssignStudentParams) => {
  return http.post('/teaching/class/assign-students', data);
};

// 学员退班
export const removeStudent = (data: RemoveStudentParams) => {
  return http.post('/teaching/class/remove-student', data);
};

// 获取班级课程安排
export const getClassSchedules = (classId: number, params?: { startDate?: string; endDate?: string }) => {
  return http.get<ClassSchedule[]>(`/teaching/class/${classId}/schedules`, { params });
};

// 获取班级考勤统计
export const getClassAttendanceStats = (classId: number) => {
  return http.get<ClassAttendanceStats>(`/teaching/class/${classId}/attendance-stats`);
};

// 班级升班
export const upgradeClass = (data: UpgradeClassParams) => {
  return http.post('/teaching/class/upgrade', data);
};

// 班级结业
export const completeClass = (data: CompleteClassParams) => {
  return http.post('/teaching/class/complete', data);
};

// 导出班级学员列表
export const exportClassStudents = (classId: number) => {
  return http.download(`/teaching/class/${classId}/students/export`, '班级学员列表.xlsx');
};
