import { http } from '@/utils/request';
import type {
  Schedule,
  ScheduleQueryParams,
  ScheduleListResponse,
  BatchScheduleRequest,
  ConflictCheckRequest,
  ConflictCheckResponse,
  ConflictInfo,
  RescheduleRequest,
  SubstituteRequest,
  CancelScheduleRequest,
} from '@/types/schedule';

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

const pad = (value: number): string => String(value).padStart(2, '0');

const toDateString = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toTimeString = (value: unknown): string => {
  if (typeof value === 'string' && value.includes(':')) {
    return value.slice(0, 5);
  }
  return '';
};

const parseDateTime = (value: string | undefined): Date | null => {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const combineDateTime = (date: string, time: string): string => {
  if (!date || !time) return '';
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date} ${normalizedTime}`;
};

const toFrontendStatus = (status: unknown): Schedule['status'] => {
  const value = String(status ?? '').toLowerCase();
  if (value === 'finished' || value === 'completed') return 'completed';
  if (value === 'cancelled') return 'cancelled';
  if (value === 'rescheduled') return 'rescheduled';
  return 'scheduled';
};

const normalizeSchedule = (raw: unknown): Schedule => {
  const row = (raw ?? {}) as Record<string, unknown>;
  const scheduleDate = row.scheduleDate ? String(row.scheduleDate) : '';
  const startTime = row.startTime ? String(row.startTime) : '';
  const endTime = row.endTime ? String(row.endTime) : '';

  return {
    id: toNumber(row.id),
    classId: toNumber(row.classId),
    className: String(row.className ?? ''),
    courseId: toNumber(row.courseId),
    courseName: String(row.courseName ?? ''),
    teacherId: toNumber(row.teacherId),
    teacherName: String(row.teacherName ?? ''),
    classroomId: row.classroomId ? toNumber(row.classroomId) : undefined,
    classroomName: row.classroomName ? String(row.classroomName) : undefined,
    startTime: combineDateTime(scheduleDate, startTime),
    endTime: combineDateTime(scheduleDate, endTime),
    status: toFrontendStatus(row.status),
    actualTeacherId: row.originalTeacherId ? toNumber(row.originalTeacherId) : undefined,
    actualTeacherName: undefined,
    cancelReason: row.cancelReason ? String(row.cancelReason) : undefined,
    remark: row.remark ? String(row.remark) : undefined,
    createdAt: row.createTime ? String(row.createTime) : '',
    updatedAt: row.updateTime ? String(row.updateTime) : '',
  };
};

const normalizeScheduleList = (raw: unknown, params: ScheduleQueryParams): ScheduleListResponse => {
  const payload = unwrap<unknown>(raw);
  const source = Array.isArray(payload)
    ? payload
    : (payload && typeof payload === 'object' && Array.isArray((payload as Record<string, unknown>).list))
      ? ((payload as Record<string, unknown>).list as unknown[])
      : [];

  let list = source.map(normalizeSchedule);
  if (params.status) {
    list = list.filter((item) => item.status === params.status);
  }
  if (params.courseId !== undefined) {
    list = list.filter((item) => item.courseId === params.courseId);
  }
  if (params.keyword && params.keyword.trim() !== '') {
    const keyword = params.keyword.trim().toLowerCase();
    list = list.filter((item) => {
      return (
        item.className.toLowerCase().includes(keyword)
        || item.courseName.toLowerCase().includes(keyword)
        || item.teacherName.toLowerCase().includes(keyword)
      );
    });
  }

  return {
    list,
    total: list.length,
  };
};

const toDefaultRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setDate(start.getDate() - 30);
  end.setDate(end.getDate() + 60);
  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
  };
};

const normalizeConflicts = (raw: unknown): ConflictCheckResponse => {
  const payload = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const teacherConflicts = Array.isArray(payload.teacherConflicts) ? payload.teacherConflicts : [];
  const classroomConflicts = Array.isArray(payload.classroomConflicts) ? payload.classroomConflicts : [];
  const studentConflicts = Array.isArray(payload.studentConflicts) ? payload.studentConflicts : [];

  const mapConflict = (item: unknown, type: ConflictInfo['type']): ConflictInfo => {
    const row = (item ?? {}) as Record<string, unknown>;
    const scheduleDate = row.scheduleDate ? String(row.scheduleDate) : '';
    const startTime = toTimeString(row.startTime);
    const endTime = toTimeString(row.endTime);
    return {
      type,
      scheduleId: toNumber(row.scheduleId),
      className: String(row.className ?? ''),
      courseName: String(row.courseName ?? ''),
      teacherName: String(row.teacherName ?? ''),
      classroomName: row.classroomName ? String(row.classroomName) : undefined,
      startTime: combineDateTime(scheduleDate, startTime),
      endTime: combineDateTime(scheduleDate, endTime),
    };
  };

  const conflicts: ConflictInfo[] = [
    ...teacherConflicts.map((item) => mapConflict(item, 'teacher')),
    ...classroomConflicts.map((item) => mapConflict(item, 'classroom')),
    ...studentConflicts
      .map((item) => (item as Record<string, unknown>).conflictSchedule)
      .map((item) => mapConflict(item, 'class')),
  ];

  return {
    hasConflict: Boolean(payload.hasConflict),
    conflicts,
  };
};

// 获取课表列表
export const getScheduleList = async (params: ScheduleQueryParams) => {
  const range = toDefaultRange();
  const response = await http.get<unknown>('/teaching/schedule/list', {
    params: {
      startDate: params.startDate ?? range.startDate,
      endDate: params.endDate ?? range.endDate,
      teacherId: params.teacherId,
      classId: params.classId,
      classroomId: params.classroomId,
    },
  });
  return normalizeScheduleList(response, params);
};

// 获取课表详情
export const getScheduleDetail = async (id: number) => {
  const response = await http.get<unknown>(`/teaching/schedule/${id}`);
  return normalizeSchedule(unwrap<unknown>(response));
};

// 批量排课（增强版）
export const batchScheduleEnhanced = (data: BatchScheduleRequest) => {
  const firstSlot = data.timeSlots[0] ?? { startTime: '09:00', endTime: '10:00' };
  const weekdays = data.repeatType === 'weekly' && Array.isArray(data.repeatValue) && data.repeatValue.length > 0
    ? data.repeatValue
    : [1];
  return http.post('/teaching/schedule/batch-enhanced', {
    classId: data.classId,
    courseId: data.courseId,
    teacherId: data.teacherId,
    classroomId: data.classroomId,
    startDate: data.startDate,
    endDate: data.endDate,
    totalLessons: data.totalSessions,
    weekdays,
    startTime: firstSlot.startTime,
    endTime: firstSlot.endTime,
    skipHolidays: data.skipHolidays,
    skipWeekends: data.skipWeekends,
    remark: data.remark,
  });
};

// 冲突检测
export const checkConflict = async (data: ConflictCheckRequest) => {
  const start = parseDateTime(data.startTime);
  const end = parseDateTime(data.endTime);
  const scheduleDate = start ? toDateString(start) : '';
  const response = await http.post<unknown>('/teaching/schedule/check-conflict', {
    scheduleId: data.excludeScheduleId,
    scheduleDate,
    startTime: start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : '',
    endTime: end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : '',
    teacherId: data.teacherId,
    classroomId: data.classroomId,
    classId: data.classId,
  });
  return normalizeConflicts(response);
};

// 调课
export const rescheduleClass = async (data: RescheduleRequest) => {
  const start = parseDateTime(data.newStartTime);
  const end = parseDateTime(data.newEndTime);
  if (!start || !end) {
    throw new Error('调课时间无效');
  }

  await http.put(`/teaching/schedule/${data.scheduleId}/reschedule`, undefined, {
    params: {
      newDate: toDateString(start),
      newStartTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      newEndTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      newClassroomId: data.newClassroomId,
    },
  });

  if (data.newTeacherId !== undefined) {
    await http.post('/teaching/schedule/substitute', {
      scheduleId: data.scheduleId,
      substituteTeacherId: data.newTeacherId,
      reason: data.reason,
    });
  }
};

// 代课
export const substituteTeacher = (data: SubstituteRequest) => {
  return http.post('/teaching/schedule/substitute', {
    scheduleId: data.scheduleId,
    substituteTeacherId: data.substituteTeacherId,
    reason: data.reason,
  });
};

// 停课
export const cancelSchedule = (data: CancelScheduleRequest) => {
  return http.post('/teaching/schedule/cancel', {
    scheduleId: data.scheduleId,
    cancelReason: data.reason,
    needMakeup: false,
  });
};

// 删除课表
export const deleteSchedule = (id: number) => {
  return http.put(`/teaching/schedule/${id}/cancel`);
};

// 批量删除课表（后端无批量删除接口，使用逐条停课兼容）
export const batchDeleteSchedule = async (ids: number[]) => {
  await Promise.all(ids.map((id) => http.put(`/teaching/schedule/${id}/cancel`)));
  return true;
};
