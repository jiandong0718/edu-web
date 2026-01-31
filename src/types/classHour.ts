// 课时账户类型定义

// 课时账户状态
export type ClassHourAccountStatus = 'active' | 'expired' | 'frozen' | 'warning';

// 课时调整类型
export type ClassHourAdjustType = 'gift' | 'deduct' | 'revoke';

// 课时账户信息
export interface ClassHourAccount {
  id: number;
  studentId: number;
  studentName: string;
  studentAvatar?: string;
  studentPhone: string;
  courseId: number;
  courseName: string;
  campusId: number;
  campusName: string;
  totalHours: number; // 总课时
  usedHours: number; // 已用课时
  remainingHours: number; // 剩余课时
  frozenHours: number; // 冻结课时
  giftHours: number; // 赠送课时
  expireDate: string; // 到期日期
  status: ClassHourAccountStatus;
  createTime: string;
  updateTime: string;
}

// 课时调整记录
export interface ClassHourAdjustRecord {
  id: number;
  accountId: number;
  studentName: string;
  courseName: string;
  adjustType: ClassHourAdjustType;
  adjustHours: number; // 调整课时数（正数为增加，负数为减少）
  beforeHours: number; // 调整前课时
  afterHours: number; // 调整后课时
  reason: string; // 调整原因
  operatorId: number;
  operatorName: string;
  operateTime: string;
  remark?: string;
}

// 课时账户列表查询参数
export interface ClassHourAccountQueryParams {
  page: number;
  pageSize: number;
  studentName?: string;
  studentPhone?: string;
  courseName?: string;
  campusId?: number;
  status?: ClassHourAccountStatus;
  minRemainingHours?: number; // 最小剩余课时
  maxRemainingHours?: number; // 最大剩余课时
}

// 课时账户列表响应
export interface ClassHourAccountListResponse {
  list: ClassHourAccount[];
  total: number;
  page: number;
  pageSize: number;
}

// 课时调整表单数据
export interface ClassHourAdjustFormData {
  accountId: number;
  adjustType: ClassHourAdjustType;
  adjustHours: number;
  reason: string;
  remark?: string;
}

// 课时调整记录查询参数
export interface ClassHourAdjustRecordQueryParams {
  page: number;
  pageSize: number;
  accountId?: number;
  studentName?: string;
  adjustType?: ClassHourAdjustType;
  startDate?: string;
  endDate?: string;
}

// 课时调整记录列表响应
export interface ClassHourAdjustRecordListResponse {
  list: ClassHourAdjustRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 课时统计信息
export interface ClassHourStatistics {
  totalAccounts: number; // 总账户数
  activeAccounts: number; // 活跃账户数
  warningAccounts: number; // 预警账户数
  expiredAccounts: number; // 已过期账户数
  totalHours: number; // 总课时数
  usedHours: number; // 已用课时数
  remainingHours: number; // 剩余课时数
  giftHours: number; // 赠送课时数
}
