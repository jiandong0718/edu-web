// 教师类型定义

// 教师状态
export type TeacherStatus = 'active' | 'inactive' | 'leave';

// 教师类型
export type TeacherType = 'full_time' | 'part_time' | 'intern';

// 证书类型
export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  certificateNo: string;
  fileUrl?: string;
}

// 排班信息
export interface Schedule {
  id: number;
  dayOfWeek: number; // 1-7 表示周一到周日
  startTime: string;
  endTime: string;
  campusId: number;
  campusName: string;
}

// 教师基本信息
export interface Teacher {
  id: number;
  name: string;
  avatar?: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  idCard: string;
  birthday: string;
  address: string;
  teacherType: TeacherType;
  status: TeacherStatus;
  campusId: number;
  campusName: string;
  subjects: string[]; // 教授科目
  level: string; // 教师等级
  joinDate: string; // 入职日期
  leaveDate?: string; // 离职日期
  certificates?: Certificate[]; // 证书列表
  schedules?: Schedule[]; // 排班列表
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 教师列表查询参数
export interface TeacherQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  phone?: string;
  campusId?: number;
  teacherType?: TeacherType;
  status?: TeacherStatus;
  subject?: string;
}

// 教师列表响应
export interface TeacherListResponse {
  list: Teacher[];
  total: number;
  page: number;
  pageSize: number;
}

// 教师新增/编辑参数
export interface TeacherFormData {
  id?: number;
  name: string;
  avatar?: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  idCard: string;
  birthday: string;
  address: string;
  teacherType: TeacherType;
  status: TeacherStatus;
  campusId: number;
  subjects: string[];
  level: string;
  joinDate: string;
  leaveDate?: string;
  remark?: string;
}

// 证书新增/编辑参数
export interface CertificateFormData {
  id?: number;
  teacherId: number;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  certificateNo: string;
  fileUrl?: string;
}

// 排班新增/编辑参数
export interface ScheduleFormData {
  id?: number;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  campusId: number;
}
