// CRM 线索类型定义

// 线索状态
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

// 线索来源
export type LeadSource = 'online' | 'offline' | 'referral' | 'event' | 'other';

// 线索基本信息
export interface Lead {
  id: number;
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  gender: 'male' | 'female';
  age?: number;
  school?: string;
  grade?: string;
  subject?: string;
  source: LeadSource;
  status: LeadStatus;
  campusId: number;
  campusName: string;
  assigneeId?: number;
  assigneeName?: string;
  assignTime?: string;
  followCount: number;
  lastFollowTime?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 线索列表查询参数
export interface LeadQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  phone?: string;
  campusId?: number;
  status?: LeadStatus;
  source?: LeadSource;
  assigneeId?: number;
  startDate?: string;
  endDate?: string;
}

// 线索列表响应
export interface LeadListResponse {
  list: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

// 线索新增/编辑参数
export interface LeadFormData {
  id?: number;
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  gender: 'male' | 'female';
  age?: number;
  school?: string;
  grade?: string;
  subject?: string;
  source: LeadSource;
  status: LeadStatus;
  campusId: number;
  remark?: string;
}

// 线索分配参数
export interface LeadAssignData {
  leadIds: number[];
  assigneeId: number;
}

// 线索批量导入参数
export interface LeadImportData {
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  gender: 'male' | 'female';
  age?: number;
  school?: string;
  grade?: string;
  subject?: string;
  source: LeadSource;
  campusId: number;
}

// 线索批量导入结果
export interface LeadImportResult {
  total: number;
  success: number;
  failed: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    row: number;
    rowIndex: number;
    leadName: string;
    message: string;
    errorMessage: string;
  }>;
}

// 跟进记录
export interface FollowRecord {
  id: number;
  leadId: number;
  followerId: number;
  followerName: string;
  followType: 'phone' | 'wechat' | 'visit' | 'other';
  content: string;
  nextFollowTime?: string;
  createTime: string;
}

// 跟进记录新增参数
export interface FollowRecordFormData {
  leadId: number;
  followType: 'phone' | 'wechat' | 'visit' | 'other';
  content: string;
  nextFollowTime?: string;
}
