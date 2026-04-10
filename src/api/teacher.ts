import { http } from '@/utils/request';
import type {
  Teacher,
  TeacherQueryParams,
  TeacherListResponse,
  TeacherFormData,
  Certificate,
  CertificateFormData,
  Schedule,
  ScheduleFormData,
  SalaryConfig,
  SalaryConfigFormData,
  ScheduleEvent,
} from '@/types/teacher';

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

const toBackendStatus = (status: Teacher['status']): string => {
  if (status === 'inactive') return 'on_leave';
  if (status === 'leave') return 'resigned';
  return 'active';
};

const toFrontendStatus = (status: unknown): Teacher['status'] => {
  const value = String(status ?? '').toLowerCase();
  if (value === 'on_leave' || value === 'inactive' || value === 'leave') return 'inactive';
  if (value === 'resigned') return 'leave';
  return 'active';
};

const toBackendGender = (gender: Teacher['gender']): number => {
  return gender === 'female' ? 2 : 1;
};

const toFrontendGender = (gender: unknown): Teacher['gender'] => {
  const value = String(gender ?? '');
  return value === '2' || value === 'female' ? 'female' : 'male';
};

const normalizeSubjects = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter((item) => item.trim() !== '');
  }
  if (typeof value === 'string') {
    return value
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter((item) => item !== '');
  }
  return [];
};

const toMajorText = (subjects: string[]): string => {
  return subjects
    .map((item) => item.trim())
    .filter((item) => item !== '')
    .join('，');
};

const normalizeTeacher = (raw: unknown): Teacher => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const subjects = normalizeSubjects(item.subjects ?? item.major);
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    avatar: item.avatar ? String(item.avatar) : undefined,
    gender: toFrontendGender(item.gender),
    phone: String(item.phone ?? ''),
    email: String(item.email ?? ''),
    idCard: String(item.idCard ?? ''),
    birthday: item.birthday ? String(item.birthday) : '',
    address: item.address ? String(item.address) : '',
    teacherType: (String(item.teacherType ?? '').toLowerCase() === 'part_time'
      ? 'part_time'
      : String(item.teacherType ?? '').toLowerCase() === 'intern'
        ? 'intern'
        : 'full_time'),
    status: toFrontendStatus(item.status),
    campusId: toNumber(item.campusId),
    campusName: String(item.campusName ?? ''),
    subjects,
    level: String(item.level ?? item.education ?? ''),
    joinDate: item.entryDate ? String(item.entryDate) : item.joinDate ? String(item.joinDate) : '',
    leaveDate: item.leaveDate ? String(item.leaveDate) : undefined,
    certificates: undefined,
    schedules: undefined,
    remark: item.remark ? String(item.remark) : undefined,
    createTime: item.createTime ? String(item.createTime) : '',
    updateTime: item.updateTime ? String(item.updateTime) : '',
  };
};

const normalizeTeacherPage = (raw: unknown, params: TeacherQueryParams): TeacherListResponse => {
  const page = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];

  return {
    list: records.map(normalizeTeacher),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page, params.page),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize),
  };
};

const toTeacherPayload = (data: TeacherFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  teacherNo: id ? undefined : `T${Date.now()}`,
  name: data.name,
  avatar: data.avatar,
  gender: toBackendGender(data.gender),
  phone: data.phone,
  email: data.email,
  idCard: data.idCard,
  entryDate: data.joinDate,
  education: data.level,
  major: toMajorText(data.subjects),
  status: toBackendStatus(data.status),
  campusId: data.campusId,
  remark: data.remark,
});

const normalizeCertificate = (raw: unknown): Certificate => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    name: String(item.certName ?? item.name ?? ''),
    issuer: String(item.issueOrg ?? item.issuer ?? ''),
    issueDate: item.issueDate ? String(item.issueDate) : '',
    expiryDate: item.expireDate ? String(item.expireDate) : undefined,
    certificateNo: String(item.certNo ?? item.certificateNo ?? ''),
    fileUrl: item.fileUrl ? String(item.fileUrl) : undefined,
  };
};

const toCertificatePayload = (data: CertificateFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  teacherId: data.teacherId,
  certName: data.name,
  certNo: data.certificateNo,
  certType: 'other',
  issueOrg: data.issuer,
  issueDate: data.issueDate,
  expireDate: data.expiryDate,
  fileUrl: data.fileUrl,
  status: 1,
});

const normalizeAvailableTime = (raw: unknown): Schedule => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    dayOfWeek: toNumber(item.dayOfWeek, 1),
    startTime: item.startTime ? String(item.startTime) : '',
    endTime: item.endTime ? String(item.endTime) : '',
    campusId: 0,
    campusName: '',
  };
};

const toAvailableTimePayload = (data: ScheduleFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  teacherId: data.teacherId,
  dayOfWeek: data.dayOfWeek,
  startTime: data.startTime,
  endTime: data.endTime,
  status: 1,
});

const normalizeSalaryConfig = (raw: unknown): SalaryConfig => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    teacherId: toNumber(item.teacherId),
    courseType: String(item.courseName ?? item.classTypeName ?? item.classType ?? '通用'),
    hourlyRate: toNumber(item.amount),
    effectiveDate: item.effectiveDate ? String(item.effectiveDate) : '',
    remark: item.remark ? String(item.remark) : undefined,
  };
};

const toSalaryClassType = (courseType: string): string | undefined => {
  const value = courseType.trim().toLowerCase();
  if (value === '一对一' || value === 'one_to_one') return 'one_to_one';
  if (value === '小班课' || value === 'small_class') return 'small_class';
  if (value === '大班课' || value === 'large_class') return 'large_class';
  return undefined;
};

const toSalaryPayload = (data: SalaryConfigFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  teacherId: data.teacherId,
  classType: toSalaryClassType(data.courseType),
  salaryType: 'per_hour',
  amount: data.hourlyRate,
  effectiveDate: data.effectiveDate,
  remark: data.remark,
  status: 1,
});

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

// 获取教师列表
export const getTeacherList = async (params: TeacherQueryParams) => {
  const response = await http.get<unknown>('/teaching/teacher/page', {
    params: {
      pageNum: params.page,
      pageSize: params.pageSize,
      name: params.name,
      phone: params.phone,
      status: params.status ? toBackendStatus(params.status) : undefined,
      campusId: params.campusId,
    },
  });
  return normalizeTeacherPage(response, params);
};

// 获取教师详情
export const getTeacherDetail = async (id: number) => {
  const response = await http.get<unknown>(`/teaching/teacher/${id}`);
  return normalizeTeacher(unwrap<unknown>(response));
};

// 新增教师
export const createTeacher = async (data: TeacherFormData) => {
  await http.post('/teaching/teacher', toTeacherPayload(data));
  return { id: 0 };
};

// 编辑教师
export const updateTeacher = (id: number, data: TeacherFormData) => {
  return http.put('/teaching/teacher', toTeacherPayload(data, id));
};

// 删除教师
export const deleteTeacher = (id: number) => {
  return http.delete(`/teaching/teacher/${id}`);
};

// 批量删除教师
export const batchDeleteTeacher = (ids: number[]) => {
  return http.delete('/teaching/teacher/batch', {
    data: ids,
  });
};

// 更新教师状态
export const updateTeacherStatus = (id: number, status: string) => {
  const mappedStatus = status === 'active' ? 'active' : status === 'inactive' ? 'on_leave' : 'resigned';
  return http.put(`/teaching/teacher/${id}/status`, undefined, {
    params: { status: mappedStatus },
  });
};

// 获取教师证书列表
export const getTeacherCertificates = async (teacherId: number) => {
  const response = await http.get<unknown>('/teaching/teacher/certificate/list', {
    params: { teacherId },
  });
  const data = unwrap<unknown>(response);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeCertificate);
};

// 新增教师证书
export const createCertificate = async (data: CertificateFormData) => {
  const response = await http.post<unknown>('/teaching/teacher/certificate', toCertificatePayload(data));
  const payload = unwrap<unknown>(response);
  if (typeof payload === 'number') {
    return { id: payload };
  }
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return payload as { id: number };
  }
  return { id: 0 };
};

// 编辑教师证书
export const updateCertificate = (id: number, data: CertificateFormData) => {
  return http.put('/teaching/teacher/certificate', toCertificatePayload(data, id));
};

// 删除教师证书
export const deleteCertificate = (id: number) => {
  return http.delete(`/teaching/teacher/certificate/${id}`);
};

// 获取教师排班列表
export const getTeacherSchedules = async (teacherId: number) => {
  const response = await http.get<unknown>('/teaching/teacher/available-time/list', {
    params: { teacherId },
  });
  const data = unwrap<unknown>(response);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeAvailableTime);
};

// 新增教师排班
export const createSchedule = async (data: ScheduleFormData) => {
  const response = await http.post<unknown>('/teaching/teacher/available-time', toAvailableTimePayload(data));
  const payload = unwrap<unknown>(response);
  if (typeof payload === 'number') {
    return { id: payload };
  }
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return payload as { id: number };
  }
  return { id: 0 };
};

// 编辑教师排班
export const updateSchedule = (id: number, data: ScheduleFormData) => {
  return http.put('/teaching/teacher/available-time', toAvailableTimePayload(data, id));
};

// 删除教师排班
export const deleteSchedule = (id: number) => {
  return http.delete(`/teaching/teacher/available-time/${id}`);
};

// 导出教师列表（前端生成CSV，兼容后端无专用导出接口）
export const exportTeacherList = async (params: TeacherQueryParams) => {
  const response = await getTeacherList({
    ...params,
    page: 1,
    pageSize: 2000,
  });
  const rows: Array<Array<string | number>> = [
    ['姓名', '状态', '手机号', '邮箱', '校区', '入职日期'],
    ...response.list.map((item) => [
      item.name,
      item.status === 'active' ? '在职' : item.status === 'inactive' ? '休假' : '离职',
      item.phone,
      item.email,
      item.campusName,
      item.joinDate,
    ]),
  ];
  downloadCsv('教师列表.csv', rows);
};

// 获取教师课酬配置列表
export const getTeacherSalaryConfigs = async (teacherId: number) => {
  const response = await http.get<unknown>('/teaching/teacher/salary/list', {
    params: { teacherId },
  });
  const data = unwrap<unknown>(response);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeSalaryConfig);
};

// 新增教师课酬配置
export const createSalaryConfig = async (data: SalaryConfigFormData) => {
  const response = await http.post<unknown>('/teaching/teacher/salary', toSalaryPayload(data));
  const payload = unwrap<unknown>(response);
  if (typeof payload === 'number') {
    return { id: payload };
  }
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return payload as { id: number };
  }
  return { id: 0 };
};

// 编辑教师课酬配置
export const updateSalaryConfig = (id: number, data: SalaryConfigFormData) => {
  return http.put('/teaching/teacher/salary', toSalaryPayload(data, id));
};

// 删除教师课酬配置
export const deleteSalaryConfig = (id: number) => {
  return http.delete(`/teaching/teacher/salary/${id}`);
};

// 获取教师排班事件（日历展示）
export const getTeacherScheduleEvents = async (teacherId: number, params?: { startDate?: string; endDate?: string }) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const response = await http.get<unknown>('/teaching/schedule/list', {
    params: {
      teacherId,
      startDate: params?.startDate ?? toDateString(monthStart),
      endDate: params?.endDate ?? toDateString(monthEnd),
    },
  });
  const data = unwrap<unknown>(response);
  const list = Array.isArray(data) ? data : [];
  return list.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const date = row.scheduleDate ? String(row.scheduleDate) : '';
    const startTime = row.startTime ? String(row.startTime).slice(0, 5) : '';
    const endTime = row.endTime ? String(row.endTime).slice(0, 5) : '';
    return {
      id: toNumber(row.id),
      date,
      title: String(row.className ?? row.courseName ?? '课程'),
      startTime,
      endTime,
      type: 'class',
    } as ScheduleEvent;
  });
};

// 批量配置教师可用时间
export const batchConfigAvailableTime = (teacherId: number, data: ScheduleFormData[]) => {
  return http.post('/teaching/teacher/available-time/batch-save', {
    teacherId,
    timeSlots: data.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
    })),
  });
};
