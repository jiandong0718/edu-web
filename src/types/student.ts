// 学员类型定义

// 学员状态
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'dropout';

// 学员标签
export interface StudentTag {
  id: number;
  name: string;
  color: string;
  description?: string;
  createTime: string;
}

// 学员基本信息
export interface Student {
  id: number;
  name: string;
  avatar?: string;
  gender: 'male' | 'female';
  phone: string;
  parentPhone: string;
  parentName: string;
  idCard?: string;
  birthday: string;
  address: string;
  school: string;
  grade: string;
  status: StudentStatus;
  campusId: number;
  campusName: string;
  tags: StudentTag[];
  enrollDate: string;
  graduateDate?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 学员列表查询参数
export interface StudentQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  phone?: string;
  campusId?: number;
  status?: StudentStatus;
  tagId?: number;
  grade?: string;
}

// 学员列表响应
export interface StudentListResponse {
  list: Student[];
  total: number;
  page: number;
  pageSize: number;
}

// 学员新增/编辑参数
export interface StudentFormData {
  id?: number;
  name: string;
  avatar?: string;
  gender: 'male' | 'female';
  phone: string;
  parentPhone: string;
  parentName: string;
  idCard?: string;
  birthday: string;
  address: string;
  school: string;
  grade: string;
  status: StudentStatus;
  campusId: number;
  tagIds?: number[];
  enrollDate: string;
  graduateDate?: string;
  remark?: string;
}

// 学员标签查询参数
export interface StudentTagQueryParams {
  page: number;
  pageSize: number;
  name?: string;
}

// 学员标签列表响应
export interface StudentTagListResponse {
  list: StudentTag[];
  total: number;
  page: number;
  pageSize: number;
}

// 学员标签新增/编辑参数
export interface StudentTagFormData {
  id?: number;
  name: string;
  color: string;
  description?: string;
}

// 学员批量导入参数
export interface StudentImportData {
  name: string;
  gender: 'male' | 'female';
  phone: string;
  parentPhone: string;
  parentName: string;
  birthday: string;
  address: string;
  school: string;
  grade: string;
  campusId: number;
  enrollDate: string;
}

// 学员批量导入结果
export interface StudentImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
