import { http } from '@/utils/request';
import type {
  Class,
  ClassQueryParams,
  ClassListResponse,
  ClassFormData,
  ClassStudent,
  ClassSchedule,
  ClassAttendanceStats,
  AssignStudentParams,
  RemoveStudentParams,
  UpgradeClassParams,
  CompleteClassParams,
} from '@/types/class';

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

const toBackendStatus = (status: Class['status'] | undefined): string | undefined => {
  if (!status) return undefined;
  if (status === 'active') return 'ongoing';
  if (status === 'completed') return 'finished';
  return status;
};

const toFrontendStatus = (status: unknown): Class['status'] => {
  const value = String(status ?? '').toLowerCase();
  if (value === 'ongoing' || value === 'active') return 'active';
  if (value === 'finished' || value === 'completed' || value === 'graduate') return 'completed';
  if (value === 'cancelled') return 'cancelled';
  return 'pending';
};

const toFrontendType = (value: unknown): Class['type'] => {
  const type = String(value ?? '').toLowerCase();
  if (type === 'trial') return 'trial';
  if (type === 'intensive') return 'intensive';
  return 'regular';
};

const normalizeClass = (raw: unknown): Class => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    code: String(item.code ?? ''),
    courseId: toNumber(item.courseId),
    courseName: String(item.courseName ?? ''),
    teacherId: toNumber(item.teacherId),
    teacherName: String(item.teacherName ?? ''),
    campusId: toNumber(item.campusId),
    campusName: String(item.campusName ?? ''),
    classroomId: item.classroomId ? toNumber(item.classroomId) : undefined,
    classroomName: item.classroomName ? String(item.classroomName) : undefined,
    type: toFrontendType(item.type ?? item.classType),
    status: toFrontendStatus(item.status),
    capacity: toNumber(item.capacity, 20),
    currentStudents: toNumber(item.currentCount ?? item.currentStudents),
    startDate: item.startDate ? String(item.startDate) : '',
    endDate: item.endDate ? String(item.endDate) : '',
    totalHours: toNumber(item.totalHours),
    completedHours: toNumber(item.completedHours),
    schedule: String(item.schedule ?? ''),
    remark: item.remark ? String(item.remark) : undefined,
    createTime: item.createTime ? String(item.createTime) : '',
    updateTime: item.updateTime ? String(item.updateTime) : '',
  };
};

const normalizeClassPage = (raw: unknown, params: ClassQueryParams): ClassListResponse => {
  const page = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];

  return {
    list: records.map(normalizeClass),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page, params.page),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize),
  };
};

const toClassPayload = (data: ClassFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  name: data.name,
  code: data.code,
  courseId: data.courseId,
  teacherId: data.teacherId,
  campusId: data.campusId,
  classroomId: data.classroomId,
  capacity: data.capacity,
  startDate: data.startDate,
  endDate: data.endDate,
  status: toBackendStatus(data.status),
  remark: data.remark,
});

const normalizeClassStudent = (raw: unknown): ClassStudent => {
  const row = (raw ?? {}) as Record<string, unknown>;
  const statusValue = String(row.status ?? '').toLowerCase();
  return {
    id: toNumber(row.id, toNumber(row.studentId)),
    classId: toNumber(row.classId),
    studentId: toNumber(row.studentId),
    studentName: String(row.studentName ?? ''),
    studentAvatar: row.studentAvatar ? String(row.studentAvatar) : undefined,
    studentPhone: String(row.studentPhone ?? ''),
    parentPhone: String(row.parentPhone ?? ''),
    joinDate: row.joinDate ? String(row.joinDate) : '',
    leaveDate: row.leaveDate ? String(row.leaveDate) : undefined,
    status: statusValue === 'active' ? 'active' : 'left',
    attendanceRate: toNumber(row.attendanceRate),
    completedHours: toNumber(row.completedHours),
    remark: row.remark ? String(row.remark) : undefined,
  };
};

const normalizeClassSchedules = (raw: unknown): ClassSchedule[] => {
  const payload = unwrap<unknown>(raw);
  const list = Array.isArray(payload) ? payload : [];

  return list.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const scheduleDate = row.scheduleDate ? String(row.scheduleDate) : '';
    const status = String(row.status ?? '');
    return {
      id: toNumber(row.id),
      classId: toNumber(row.classId),
      date: scheduleDate,
      startTime: row.startTime ? String(row.startTime) : '',
      endTime: row.endTime ? String(row.endTime) : '',
      teacherId: toNumber(row.teacherId),
      teacherName: String(row.teacherName ?? ''),
      classroomId: row.classroomId ? toNumber(row.classroomId) : undefined,
      classroomName: row.classroomName ? String(row.classroomName) : undefined,
      hours: toNumber(row.classHours),
      status: status === 'finished' ? 'completed' : status === 'cancelled' ? 'cancelled' : 'scheduled',
      attendanceCount: undefined,
      remark: row.remark ? String(row.remark) : undefined,
    };
  });
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

// 获取班级列表
export const getClassList = async (params: ClassQueryParams) => {
  const response = await http.get<unknown>('/teaching/class/page', {
    params: {
      pageNum: params.page,
      pageSize: params.pageSize,
      name: params.name,
      code: params.code,
      courseId: params.courseId,
      teacherId: params.teacherId,
      campusId: params.campusId,
      status: toBackendStatus(params.status),
      type: params.type,
    },
  });
  return normalizeClassPage(response, params);
};

// 获取班级详情
export const getClassDetail = async (id: number) => {
  const response = await http.get<unknown>(`/teaching/class/${id}`);
  return normalizeClass(unwrap<unknown>(response));
};

// 新增班级
export const createClass = async (data: ClassFormData) => {
  const response = await http.post<unknown>('/teaching/class', toClassPayload(data));
  const payload = unwrap<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return payload as { id: number };
  }
  return { id: 0 };
};

// 编辑班级
export const updateClass = (id: number, data: ClassFormData) => {
  return http.put('/teaching/class', toClassPayload(data, id));
};

// 删除班级
export const deleteClass = (id: number) => {
  return http.delete(`/teaching/class/${id}`);
};

// 获取班级学员列表
export const getClassStudents = async (classId: number) => {
  const response = await http.get<unknown>(`/teaching/class/${classId}/students`);
  const payload = unwrap<unknown>(response);
  const list = Array.isArray(payload) ? payload : [];
  return list.map(normalizeClassStudent);
};

// 学员分班
export const assignStudents = (data: AssignStudentParams) => {
  return http.post(`/teaching/class/${data.classId}/students`, data.studentIds, {
    params: { joinDate: data.joinDate },
  });
};

// 学员退班
export const removeStudent = (data: RemoveStudentParams) => {
  return http.delete(`/teaching/class/${data.classId}/students/${data.studentId}`, {
    params: { leaveDate: data.leaveDate },
  });
};

// 获取班级课程安排
export const getClassSchedules = async (classId: number, params?: { startDate?: string; endDate?: string }) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startDate = params?.startDate ?? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  const endDate = params?.endDate ?? `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  const response = await http.get<unknown>('/teaching/schedule/list', {
    params: {
      classId,
      startDate,
      endDate,
    },
  });
  return normalizeClassSchedules(response);
};

// 获取班级考勤统计
export const getClassAttendanceStats = async (classId: number) => {
  const response = await http.get<unknown>(`/teaching/attendance/stats/class/${classId}`);
  const stats = (unwrap<unknown>(response) ?? {}) as Record<string, unknown>;
  const totalSchedules = toNumber(stats.total);
  return {
    totalSchedules,
    completedSchedules: totalSchedules,
    totalStudents: 0,
    averageAttendanceRate: toNumber(stats.attendanceRate),
    monthlyStats: [],
  } as ClassAttendanceStats;
};

// 班级升班
export const upgradeClass = (data: UpgradeClassParams) => {
  return http.post('/teaching/class/promote', {
    classId: data.classId,
    targetCourseId: data.newCourseId,
    newClassName: data.newClassName,
    teacherId: data.newTeacherId,
    keepOriginalClass: true,
  });
};

// 班级结业
export const completeClass = (data: CompleteClassParams) => {
  return http.post('/teaching/class/graduate', {
    classId: data.classId,
    graduationDate: data.completeDate,
    remark: data.remark,
  });
};

// 导出班级学员列表（前端生成CSV，兼容后端无专用导出接口）
export const exportClassStudents = async (classId: number) => {
  const students = await getClassStudents(classId);
  const rows: Array<Array<string | number>> = [
    ['学员姓名', '学员ID', '状态', '加入日期', '出勤率(%)', '已完成课时'],
    ...students.map((item) => [
      item.studentName,
      item.studentId,
      item.status === 'active' ? '在读' : '已退班',
      item.joinDate,
      item.attendanceRate,
      item.completedHours,
    ]),
  ];
  downloadCsv(`班级_${classId}_学员列表.csv`, rows);
};
