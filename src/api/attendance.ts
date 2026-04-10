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

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object') {
    const envelope = payload as ApiEnvelope<T>;
    if (Object.prototype.hasOwnProperty.call(envelope, 'data') && Object.prototype.hasOwnProperty.call(envelope, 'code')) {
      return envelope.data as T;
    }
  }
  return payload as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStatus = (value: unknown): 'pending' | 'approved' | 'rejected' => {
  const status = String(value ?? '').toLowerCase();
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'cancelled') return 'rejected';
  return 'pending';
};

const normalizeLeaveList = (raw: unknown, page: number, pageSize: number): LeaveListResponse => {
  const payload = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(payload.records) ? payload.records : [];

  const list = records.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const startDate = row.startDate ? String(row.startDate) : '';
    const endDate = row.endDate ? String(row.endDate) : '';
    return {
      id: toNumber(row.id),
      studentId: toNumber(row.studentId),
      studentName: String(row.studentName ?? ''),
      classId: toNumber(row.classId),
      className: String(row.className ?? ''),
      courseId: 0,
      courseName: '',
      scheduleId: toNumber(row.scheduleId),
      scheduleDate: startDate && endDate && startDate !== endDate ? `${startDate} ~ ${endDate}` : startDate || endDate,
      scheduleTime: '',
      reason: String(row.reason ?? ''),
      status: toStatus(row.status),
      approveTime: row.approveTime ? String(row.approveTime) : undefined,
      approveBy: row.approverName ? String(row.approverName) : undefined,
      approveRemark: row.approveRemark ? String(row.approveRemark) : undefined,
      makeupScheduleId: row.makeupScheduleId ? toNumber(row.makeupScheduleId) : undefined,
      makeupScheduleDate: undefined,
      makeupScheduleTime: undefined,
      createTime: String(row.createTime ?? ''),
      updateTime: String(row.updateTime ?? ''),
    };
  });

  return {
    list,
    total: toNumber(payload.total, list.length),
    page: toNumber(payload.current, page),
    pageSize: toNumber(payload.size, pageSize),
  };
};

const normalizeStats = (raw: unknown): AttendanceStatsResponse => {
  const payload = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const classStat = Array.isArray(payload.classStat) ? payload.classStat : [];
  const studentStats = Array.isArray(payload.studentStats) ? payload.studentStats : [];
  const summary = (payload.summary ?? {}) as Record<string, unknown>;

  return {
    classStat: classStat.map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      return {
        classId: toNumber(row.classId),
        className: String(row.className ?? ''),
        totalStudents: toNumber(row.totalStudents),
        totalSchedules: toNumber(row.totalSchedules),
        presentCount: toNumber(row.presentCount),
        absentCount: toNumber(row.absentCount),
        lateCount: toNumber(row.lateCount),
        leaveCount: toNumber(row.leaveCount),
        attendanceRate: toNumber(row.attendanceRate),
      };
    }),
    studentStats: studentStats.map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      return {
        studentId: toNumber(row.studentId),
        studentName: String(row.studentName ?? ''),
        className: String(row.className ?? ''),
        totalSchedules: toNumber(row.totalSchedules),
        presentCount: toNumber(row.presentCount),
        absentCount: toNumber(row.absentCount),
        lateCount: toNumber(row.lateCount),
        leaveCount: toNumber(row.leaveCount),
        attendanceRate: toNumber(row.attendanceRate),
      };
    }),
    summary: {
      totalSchedules: toNumber(summary.totalSchedules),
      totalAttendances: toNumber(summary.totalAttendances),
      presentCount: toNumber(summary.presentCount),
      absentCount: toNumber(summary.absentCount),
      lateCount: toNumber(summary.lateCount),
      leaveCount: toNumber(summary.leaveCount),
      attendanceRate: toNumber(summary.attendanceRate),
    },
  };
};

const normalizeClassCourseInfo = (scheduleRaw: unknown, attendanceRaw: unknown): ClassCourseInfo => {
  const schedule = (unwrap<unknown>(scheduleRaw) ?? {}) as Record<string, unknown>;
  const attendances = unwrap<unknown>(attendanceRaw);
  const records = Array.isArray(attendances) ? attendances : [];
  const startTime = schedule.startTime ? String(schedule.startTime) : '';
  const endTime = schedule.endTime ? String(schedule.endTime) : '';

  return {
    classId: toNumber(schedule.classId),
    className: String(schedule.className ?? ''),
    courseId: toNumber(schedule.courseId),
    courseName: String(schedule.courseName ?? ''),
    scheduleId: toNumber(schedule.id),
    scheduleDate: String(schedule.scheduleDate ?? ''),
    scheduleTime: startTime && endTime ? `${startTime}-${endTime}` : startTime || endTime,
    students: records.map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      return {
        studentId: toNumber(row.studentId),
        studentName: String(row.studentName ?? ''),
        status: row.status ? (String(row.status) as 'present' | 'absent' | 'late' | 'leave') : undefined,
        checkInTime: row.signTime ? String(row.signTime) : undefined,
        remark: row.remark ? String(row.remark) : undefined,
      };
    }),
  };
};

const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const escapeCell = (cell: string | number) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// 获取班级课程信息（用于签到）
export const getClassCourseInfo = async (classId: number, scheduleId: number) => {
  const [scheduleResponse, attendanceResponse] = await Promise.all([
    http.get<unknown>(`/teaching/schedule/${scheduleId}`),
    http.get<unknown>(`/teaching/attendance/schedule/${scheduleId}`),
  ]);
  const data = normalizeClassCourseInfo(scheduleResponse, attendanceResponse);
  if (data.classId === 0) {
    data.classId = classId;
  }
  return data;
};

// 签到
export const checkIn = (data: CheckInParams) => {
  return http.post('/teaching/attendance/sign-in', data);
};

// 批量签到
export const batchCheckIn = (data: BatchCheckInParams) => {
  return http.post('/teaching/attendance/batch-sign-in', data);
};

// 获取请假列表
export const getLeaveList = async (params: LeaveQueryParams) => {
  const response = await http.get<unknown>('/teaching/leave/page', {
    params: {
      pageNum: params.page,
      pageSize: params.pageSize,
      studentName: params.studentName,
      className: params.className,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
  return normalizeLeaveList(response, params.page, params.pageSize);
};

// 审批请假
export const approveLeave = (data: LeaveApproveParams) => {
  return http.put(`/teaching/leave/${data.id}/approve`, undefined, {
    params: {
      status: data.status,
      remark: data.remark,
    },
  });
};

// 安排补课
export const arrangeMakeup = (data: MakeupParams) => {
  return http.put(`/teaching/leave/${data.id}/makeup`, undefined, {
    params: {
      makeupScheduleId: data.makeupScheduleId,
    },
  });
};

// 获取考勤统计
export const getAttendanceStats = async (params: AttendanceStatsParams) => {
  const response = await http.get<unknown>('/teaching/attendance/statistics', {
    params,
  });
  return normalizeStats(response);
};

// 导出考勤统计（前端生成CSV，兼容后端无专用导出接口）
export const exportAttendanceStats = async (params: AttendanceStatsParams) => {
  const stats = await getAttendanceStats(params);
  const rows: Array<Array<string | number>> = [
    ['类型', '对象', '总课次', '出勤', '缺勤', '迟到', '请假', '出勤率(%)'],
    ['汇总', '全部', stats.summary.totalSchedules, stats.summary.presentCount, stats.summary.absentCount, stats.summary.lateCount, stats.summary.leaveCount, stats.summary.attendanceRate],
    ...stats.classStat.map((item) => [
      '班级',
      item.className,
      item.totalSchedules,
      item.presentCount,
      item.absentCount,
      item.lateCount,
      item.leaveCount,
      item.attendanceRate,
    ]),
    ...stats.studentStats.map((item) => [
      '学员',
      item.studentName,
      item.totalSchedules,
      item.presentCount,
      item.absentCount,
      item.lateCount,
      item.leaveCount,
      item.attendanceRate,
    ]),
  ];
  downloadCsv('考勤统计.csv', rows);
};
