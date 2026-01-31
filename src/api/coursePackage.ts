import { http } from '@/utils/request';
import type {
  CoursePackage,
  CoursePackageQueryParams,
  CoursePackageListResponse,
  CoursePackageFormData,
  CourseInfo,
} from '@/types/coursePackage';

// 获取课程包列表
export const getCoursePackageList = (params: CoursePackageQueryParams) => {
  return http.get<CoursePackageListResponse>('/course-package/list', { params });
};

// 获取课程包详情
export const getCoursePackageDetail = (id: number) => {
  return http.get<CoursePackage>(`/course-package/${id}`);
};

// 新增课程包
export const createCoursePackage = (data: CoursePackageFormData) => {
  return http.post<{ id: number }>('/course-package', data);
};

// 编辑课程包
export const updateCoursePackage = (id: number, data: CoursePackageFormData) => {
  return http.put(`/course-package/${id}`, data);
};

// 删除课程包
export const deleteCoursePackage = (id: number) => {
  return http.delete(`/course-package/${id}`);
};

// 更新课程包状态
export const updateCoursePackageStatus = (id: number, status: string) => {
  return http.put(`/course-package/${id}/status`, { status });
};

// 获取所有可用课程（用于选择）
export const getAvailableCourses = () => {
  return http.get<CourseInfo[]>('/course/available');
};

// 导出课程包列表
export const exportCoursePackageList = (_params: CoursePackageQueryParams) => {
  return http.download('/course-package/export', '课程包列表.xlsx');
};
