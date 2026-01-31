import { http } from '@/utils/request';
import type {
  CheckInParams,
  BatchCheckInParams,
  LeaveQueryParams,
  LeaveListResponse,
  LeaveApproveParams,
  MakeupParams,
  AttendanceStatsParams,
  AttendanceStatsResponse,
  ClassCourseInfo,
} from '@/types/attendance';

// 获取班级课程信息（用于签到）
export const getClassCourseInfo = (classId: number, scheduleId: number) => {
  return http.get<ClassCourseInfo>('/teaching/attendance/class-info', {
    params: { classId, scheduleId },
  });
};

// 签到
export const checkIn = (data: CheckInParams) => {
  return http.post('/teaching/attendance/check-in', data);
};

// 批量签到
export const batchCheckIn = (data: BatchCheckInParams) => {
  return http.post('/teaching/attendance/batch-check-in', data);
};

// 获取请假列表
export const getLeaveList = (params: LeaveQueryParams) => {
  return http.get<LeaveListResponse>('/teaching/leave/page', { params });
};

// 审批请假
export const approveLeave = (data: LeaveApproveParams) => {
  return http.put(`/teaching/leave/${data.id}/approve`, {
    status: data.status,
    remark: data.remark,
  });
};

// 安排补课
export const arrangeMakeup = (data: MakeupParams) => {
  return http.put(`/teaching/leave/${data.id}/makeup`, {
    makeupScheduleId: data.makeupScheduleId,
  });
};

// 获取考勤统计
export const getAttendanceStats = (params: AttendanceStatsParams) => {
  return http.get<AttendanceStatsResponse>('/teaching/attendance/statistics', {
    params,
  });
};

// 导出考勤统计
export const exportAttendanceStats = (params: AttendanceStatsParams) => {
  return http.download('/teaching/attendance/statistics/export', '考勤统计.xlsx');
};
