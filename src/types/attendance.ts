// 考勤类型定义

// 考勤状态
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

// 请假状态
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

// 考勤记录
export interface AttendanceRecord {
  id: number;
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  studentId: number;
  studentName: string;
  scheduleId: number;
  scheduleDate: string;
  scheduleTime: string;
  status: AttendanceStatus;
  checkInTime?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 签到参数
export interface CheckInParams {
  scheduleId: number;
  studentId: number;
  status: AttendanceStatus;
  remark?: string;
}

// 批量签到参数
export interface BatchCheckInParams {
  scheduleId: number;
  studentIds: number[];
  status: AttendanceStatus;
  remark?: string;
}

// 请假申请
export interface LeaveApplication {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  scheduleId: number;
  scheduleDate: string;
  scheduleTime: string;
  reason: string;
  status: LeaveStatus;
  approveTime?: string;
  approveBy?: string;
  approveRemark?: string;
  makeupScheduleId?: number;
  makeupScheduleDate?: string;
  makeupScheduleTime?: string;
  createTime: string;
  updateTime: string;
}

// 请假列表查询参数
export interface LeaveQueryParams {
  page: number;
  pageSize: number;
  studentName?: string;
  className?: string;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
}

// 请假列表响应
export interface LeaveListResponse {
  list: LeaveApplication[];
  total: number;
  page: number;
  pageSize: number;
}

// 请假审批参数
export interface LeaveApproveParams {
  id: number;
  status: 'approved' | 'rejected';
  remark?: string;
}

// 安排补课参数
export interface MakeupParams {
  id: number;
  makeupScheduleId: number;
}

// 考勤统计 - 按班级
export interface ClassAttendanceStats {
  classId: number;
  className: string;
  totalStudents: number;
  totalSchedules: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  attendanceRate: number;
}

// 考勤统计 - 按学员
export interface StudentAttendanceStats {
  studentId: number;
  studentName: string;
  className: string;
  totalSchedules: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  attendanceRate: number;
}

// 考勤统计查询参数
export interface AttendanceStatsParams {
  startDate: string;
  endDate: string;
  classId?: number;
  studentId?: number;
}

// 考勤统计响应
export interface AttendanceStatsResponse {
  classStat: ClassAttendanceStats[];
  studentStats: StudentAttendanceStats[];
  summary: {
    totalSchedules: number;
    totalAttendances: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    leaveCount: number;
    attendanceRate: number;
  };
}

// 班级课程信息（用于签到页面）
export interface ClassCourseInfo {
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  scheduleId: number;
  scheduleDate: string;
  scheduleTime: string;
  students: StudentCheckInInfo[];
}

// 学员签到信息
export interface StudentCheckInInfo {
  studentId: number;
  studentName: string;
  avatar?: string;
  status?: AttendanceStatus;
  checkInTime?: string;
  remark?: string;
}
