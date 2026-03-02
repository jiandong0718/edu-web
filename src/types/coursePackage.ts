// 课程包类型定义

// 课程包状态
export type CoursePackageStatus = 'active' | 'inactive';

// 课程信息（用于课程包中的课程列表）
export interface CourseInfo {
  id: number;
  name: string;
  category: string;
  price: number;
  totalHours: number;
}

// 课程包基本信息
export interface CoursePackage {
  id: number;
  name: string;
  description?: string;
  originalPrice: number; // 原价
  price: number; // 优惠价
  discount?: number; // 折扣（百分比）
  validDays: number; // 有效期（天数）
  courses: CourseInfo[]; // 包含的课程列表
  status: CoursePackageStatus;
  createTime: string;
  updateTime: string;
}

// 课程包列表查询参数
export interface CoursePackageQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  status?: CoursePackageStatus;
  minPrice?: number;
  maxPrice?: number;
}

// 课程包列表响应
export interface CoursePackageListResponse {
  list: CoursePackage[];
  total: number;
  page: number;
  pageSize: number;
}

// 课程包新增/编辑参数
export interface CoursePackageFormData {
  id?: number;
  name: string;
  description?: string;
  originalPrice: number;
  price: number;
  validDays: number;
  courseIds: number[]; // 课程ID列表
  status: CoursePackageStatus;
}
