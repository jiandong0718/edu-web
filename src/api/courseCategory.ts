import { http } from '@/utils/request';

// 课程分类数据
export interface CourseCategory {
  id: number;
  name: string;
  parentId: number | null;
  icon?: string;
  sort: number;
  status: 'active' | 'inactive';
  description?: string;
  children?: CourseCategory[];
  createTime?: string;
  updateTime?: string;
}

// 课程分类树节点
export interface CourseCategoryTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  icon?: string;
  sort: number;
  status: 'active' | 'inactive';
  description?: string;
  children?: CourseCategoryTreeNode[];
}

// 新增/编辑课程分类参数
export interface CourseCategoryFormData {
  id?: number;
  name: string;
  parentId?: number | null;
  icon?: string;
  sort?: number;
  status?: 'active' | 'inactive';
  description?: string;
}

// 获取课程分类树
export const getCourseCategoryTree = () => {
  return http.get<CourseCategoryTreeNode[]>('/teaching/course-category/tree');
};

// 新增课程分类
export const createCourseCategory = (data: CourseCategoryFormData) => {
  return http.post('/teaching/course-category', data);
};

// 修改课程分类
export const updateCourseCategory = (data: CourseCategoryFormData) => {
  return http.put('/teaching/course-category', data);
};

// 删除课程分类
export const deleteCourseCategory = (id: number) => {
  return http.delete(`/teaching/course-category/${id}`);
};

// 更新课程分类状态
export const updateCourseCategoryStatus = (id: number, status: 'active' | 'inactive') => {
  return http.put(`/teaching/course-category/${id}/status`, { status });
};
