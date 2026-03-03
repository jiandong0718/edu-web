export type CourseStatus = 'active' | 'inactive';

export interface Course {
  id: number;
  name: string;
  category?: string;
  price: number;
  totalHours: number;
  studentCount: number;
  status: CourseStatus;
  description?: string;
  createTime?: string;
}

export interface CourseQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  category?: string;
  status?: CourseStatus;
}

export interface CourseListResponse {
  list: Course[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface CourseFormData {
  id?: number;
  name: string;
  category?: string;
  price: number;
  totalHours: number;
  status: CourseStatus;
  description?: string;
}
