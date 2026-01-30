import { http } from '@/utils/request';
import type {
  Student,
  StudentQueryParams,
  StudentListResponse,
  StudentFormData,
  StudentTag,
  StudentTagQueryParams,
  StudentTagListResponse,
  StudentTagFormData,
  StudentImportResult,
} from '@/types/student';

// 获取学员列表
export const getStudentList = (params: StudentQueryParams) => {
  return http.get<StudentListResponse>('/student/list', { params });
};

// 获取学员详情
export const getStudentDetail = (id: number) => {
  return http.get<Student>(`/student/${id}`);
};

// 新增学员
export const createStudent = (data: StudentFormData) => {
  return http.post<{ id: number }>('/student', data);
};

// 编辑学员
export const updateStudent = (id: number, data: StudentFormData) => {
  return http.put(`/student/${id}`, data);
};

// 删除学员
export const deleteStudent = (id: number) => {
  return http.delete(`/student/${id}`);
};

// 批量删除学员
export const batchDeleteStudent = (ids: number[]) => {
  return http.post('/student/batch-delete', { ids });
};

// 更新学员状态
export const updateStudentStatus = (id: number, status: string) => {
  return http.put(`/student/${id}/status`, { status });
};

// 导出学员列表
export const exportStudentList = (_params: StudentQueryParams) => {
  return http.download('/student/export', '学员列表.xlsx');
};

// 获取学员标签列表
export const getStudentTagList = (params: StudentTagQueryParams) => {
  return http.get<StudentTagListResponse>('/student/tag/list', { params });
};

// 获取所有学员标签（不分页）
export const getAllStudentTags = () => {
  return http.get<StudentTag[]>('/student/tag/all');
};

// 获取学员标签详情
export const getStudentTagDetail = (id: number) => {
  return http.get<StudentTag>(`/student/tag/${id}`);
};

// 新增学员标签
export const createStudentTag = (data: StudentTagFormData) => {
  return http.post<{ id: number }>('/student/tag', data);
};

// 编辑学员标签
export const updateStudentTag = (id: number, data: StudentTagFormData) => {
  return http.put(`/student/tag/${id}`, data);
};

// 删除学员标签
export const deleteStudentTag = (id: number) => {
  return http.delete(`/student/tag/${id}`);
};

// 批量删除学员标签
export const batchDeleteStudentTag = (ids: number[]) => {
  return http.post('/student/tag/batch-delete', { ids });
};

// 下载学员导入模板
export const downloadStudentTemplate = () => {
  return http.download('/student/import-template', '学员导入模板.xlsx');
};

// 批量导入学员
export const importStudents = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post<StudentImportResult>('/student/batch-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
