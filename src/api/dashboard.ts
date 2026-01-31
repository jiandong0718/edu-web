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
