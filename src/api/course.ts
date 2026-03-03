import { http } from '@/utils/request';
import type { Course, CourseFormData, CourseListResponse, CourseQueryParams, CourseStatus } from '@/types/course';

export const getCourseList = (params: CourseQueryParams) => {
  return http.get<CourseListResponse>('/course/list', { params });
};

export const getCourseDetail = (id: number) => {
  return http.get<Course>(`/course/${id}`);
};

export const createCourse = (data: CourseFormData) => {
  return http.post<{ id: number }>('/course', data);
};

export const updateCourse = (id: number, data: CourseFormData) => {
  return http.put(`/course/${id}`, data);
};

export const updateCourseStatus = (id: number, status: CourseStatus) => {
  return http.put(`/course/${id}/status`, { status });
};

export const deleteCourse = (id: number) => {
  return http.delete(`/course/${id}`);
};
