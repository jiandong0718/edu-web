import { http } from '@/utils/request';
import type { EnrollmentData, RevenueData, TeachingData } from '@/types/dashboard';

// 获取招生数据看板
export const getEnrollmentDashboard = () => {
  return http.get<EnrollmentData>('/dashboard/enrollment');
};

// 获取营收数据看板
export const getRevenueDashboard = () => {
  return http.get<RevenueData>('/dashboard/revenue');
};

// 获取教学数据看板
export const getTeachingDashboard = () => {
  return http.get<TeachingData>('/dashboard/teaching');
};

// ========== 教学数据看板详细接口 ==========

// 获取教学数据概览
export const getTeachingOverview = (campusId?: number) => {
  return http.get('/system/dashboard/teaching/overview', { params: { campusId } });
};

// 获取考勤率趋势
export const getAttendanceRateTrend = (params?: {
  campusId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return http.get('/system/dashboard/teaching/attendance-rate', { params });
};

// 获取班级统计
export const getClassStats = (params?: {
  campusId?: number;
  status?: string;
}) => {
  return http.get('/system/dashboard/teaching/class-stats', { params });
};

// 获取教师统计
export const getTeacherStats = (campusId?: number) => {
  return http.get('/system/dashboard/teaching/teacher-stats', { params: { campusId } });
};

// 获取课程消耗统计
export const getCourseConsumption = (params?: {
  campusId?: number;
  limit?: number;
}) => {
  return http.get('/system/dashboard/teaching/course-consumption', { params });
};

// 获取班级状态分布
export const getClassStatusDistribution = (campusId?: number) => {
  return http.get('/system/dashboard/teaching/class-status-distribution', { params: { campusId } });
};

// ========== 新版招生数据看板 API ==========

export interface EnrollmentOverviewParams {
  campusId?: number;
  timeRange?: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface EnrollmentTrendParams {
  campusId?: number;
  days?: number;
}

export interface EnrollmentAdvisorParams {
  campusId?: number;
  timeRange?: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// 获取招生数据概览
export const getEnrollmentOverview = (params?: EnrollmentOverviewParams) => {
  return http.get('/dashboard/enrollment/overview', { params });
};

// 获取招生趋势
export const getEnrollmentTrend = (params?: EnrollmentTrendParams) => {
  return http.get('/dashboard/enrollment/trend', { params });
};

// 获取转化漏斗
export const getEnrollmentFunnel = (params?: EnrollmentOverviewParams) => {
  return http.get('/dashboard/enrollment/funnel', { params });
};

// 获取线索来源分布
export const getEnrollmentSource = (params?: EnrollmentOverviewParams) => {
  return http.get('/dashboard/enrollment/source', { params });
};

// 获取顾问排行榜
export const getEnrollmentAdvisorRanking = (params?: EnrollmentAdvisorParams) => {
  return http.get('/dashboard/enrollment/advisor-ranking', { params });
};

// ========== 营收数据看板详细接口 ==========

// 获取营收数据概览
export const getRevenueOverview = (campusId?: number) => {
  return http.get('/system/dashboard/revenue/overview', { params: { campusId } });
};

// 获取营收趋势
export const getRevenueTrend = (params?: {
  campusId?: number;
  days?: number;
}) => {
  return http.get('/system/dashboard/revenue/trend', { params });
};

// 获取收款方式分布
export const getPaymentMethodDistribution = (params?: {
  campusId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return http.get('/system/dashboard/revenue/payment-method', { params });
};

// 获取欠费统计
export const getArrearsList = (params?: {
  campusId?: number;
  limit?: number;
}) => {
  return http.get('/system/dashboard/revenue/arrears', { params });
};

// 获取课程营收排行
export const getCourseRevenueRanking = (params?: {
  campusId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  return http.get('/system/dashboard/revenue/course-revenue', { params });
};
