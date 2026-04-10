import { http } from '@/utils/request';
import type {
  ClassHourAccount,
  ClassHourAccountQueryParams,
  ClassHourAccountListResponse,
  ClassHourAdjustFormData,
  ClassHourAdjustRecord,
  ClassHourAdjustRecordQueryParams,
  ClassHourAdjustRecordListResponse,
  ClassHourStatistics,
} from '@/types/classHour';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

interface BackendClassHourBalanceVO {
  accountId: number;
  studentId: number;
  studentName: string;
  studentPhone?: string;
  courseId: number;
  courseName: string;
  campusId?: number;
  campusName?: string;
  totalHours: number;
  usedHours: number;
  remainingHours: number;
  giftHours?: number;
  frozenHours?: number;
  status: string;
  createTime?: string;
  updateTime?: string;
}

interface BackendClassHourRecordVO {
  id: number;
  accountId: number;
  studentName?: string;
  courseName?: string;
  type?: string;
  hours?: number;
  beforeHours?: number;
  balance?: number;
  remark?: string;
  createBy?: number;
  createByName?: string;
  createTime?: string;
}

interface BackendPage<T> {
  records?: T[];
  list?: T[];
  total?: number;
  current?: number;
  size?: number;
}

interface BackendClassHourSummary {
  totalAccounts?: number;
  activeAccounts?: number;
  warningAccounts?: number;
  frozenAccounts?: number;
  exhaustedAccounts?: number;
  totalHours?: number;
  usedHours?: number;
  remainingHours?: number;
  giftHours?: number;
}

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const WARNING_THRESHOLD = 10;

const toFrontendStatus = (value: unknown, remainingHours: number): ClassHourAccount['status'] => {
  const status = String(value ?? '').toLowerCase();
  if (status === 'frozen') return 'frozen';
  if (status === 'exhausted') return 'expired';
  if (remainingHours <= WARNING_THRESHOLD) return 'warning';
  return 'active';
};

const toAdjustType = (type: unknown, hours: unknown): ClassHourAdjustRecord['adjustType'] => {
  const normalized = String(type ?? '').toLowerCase();
  if (normalized === 'revoke') return 'revoke';
  if (normalized === 'gift') return 'gift';
  if (normalized === 'adjust') {
    return toNumber(hours) >= 0 ? 'gift' : 'deduct';
  }
  if (normalized === 'refund') return 'deduct';
  return 'deduct';
};

const normalizeAccount = (item: BackendClassHourBalanceVO): ClassHourAccount => {
  const remainingHours = toNumber(item.remainingHours);
  return {
    id: toNumber(item.accountId),
    studentId: toNumber(item.studentId),
    studentName: item.studentName || '-',
    studentAvatar: undefined,
    studentPhone: item.studentPhone || '',
    courseId: toNumber(item.courseId),
    courseName: item.courseName || '-',
    campusId: toNumber(item.campusId),
    campusName: item.campusName || '-',
    totalHours: toNumber(item.totalHours),
    usedHours: toNumber(item.usedHours),
    remainingHours,
    frozenHours: toNumber(item.frozenHours),
    giftHours: toNumber(item.giftHours),
    expireDate: '',
    status: toFrontendStatus(item.status, remainingHours),
    createTime: item.createTime || '',
    updateTime: item.updateTime || '',
  };
};

const normalizePage = <T>(raw: unknown) => {
  const page = (unwrap<unknown>(raw) ?? {}) as BackendPage<T>;
  const list = Array.isArray(page.records) ? page.records : Array.isArray(page.list) ? page.list : [];
  return {
    list,
    total: toNumber(page.total, list.length),
    current: toNumber(page.current, 1),
    size: toNumber(page.size, list.length),
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

// 获取课时账户列表
export const getClassHourAccountList = async (params: ClassHourAccountQueryParams) => {
  const response = await http.get<unknown>('/finance/class-hour/balance/page', {
    params: {
      current: params.page,
      size: params.pageSize,
      studentName: params.studentName,
      studentPhone: params.studentPhone,
      courseName: params.courseName,
      campusId: params.campusId,
      courseId: undefined,
      studentId: undefined,
      status: params.status,
    },
  });
  const page = normalizePage<BackendClassHourBalanceVO>(response);
  return {
    list: page.list.map(normalizeAccount),
    total: page.total,
    page: page.current,
    pageSize: page.size,
  } satisfies ClassHourAccountListResponse;
};

// 获取课时账户详情
export const getClassHourAccountDetail = async (id: number) => {
  const response = await http.get<BackendClassHourBalanceVO>(`/finance/class-hour/balance/detail/${id}`);
  return normalizeAccount(unwrap<BackendClassHourBalanceVO>(response));
};

// 课时调整
export const adjustClassHour = (data: ClassHourAdjustFormData) => {
  const mergedReason = data.remark ? `${data.reason}；备注：${data.remark}` : data.reason;
  return http.post<{ id: number }>('/finance/class-hour/adjust', {
    accountId: data.accountId,
    adjustType: data.adjustType,
    hours: data.adjustHours,
    reason: mergedReason,
  });
};

// 获取课时调整记录列表
export const getClassHourAdjustRecordList = async (params: ClassHourAdjustRecordQueryParams) => {
  const response = await http.get<unknown>('/finance/class-hour/record', {
    params: {
      accountId: params.accountId,
      studentId: undefined,
      pageNum: params.page,
      pageSize: params.pageSize,
    },
  });
  const page = normalizePage<BackendClassHourRecordVO>(response);
  return {
    list: page.list.map((item) => ({
      id: toNumber(item.id),
      accountId: toNumber(item.accountId),
      studentName: item.studentName || '-',
      courseName: item.courseName || '-',
      adjustType: toAdjustType(item.type, item.hours),
      adjustHours: toNumber(item.hours),
      beforeHours: toNumber(item.beforeHours),
      afterHours: toNumber(item.balance),
      reason: item.remark || '-',
      operatorId: toNumber(item.createBy),
      operatorName: item.createByName || '-',
      operateTime: item.createTime || '',
      remark: item.remark,
    })),
    total: page.total,
    page: page.current,
    pageSize: page.size,
  } satisfies ClassHourAdjustRecordListResponse;
};

// 获取指定账户的调整记录
export const getAccountAdjustRecords = async (accountId: number) => {
  const response = await getClassHourAdjustRecordList({
    page: 1,
    pageSize: 200,
    accountId,
  });
  return response.list;
};

// 获取课时统计信息
export const getClassHourStatistics = async () => {
  const response = await http.get<BackendClassHourSummary>('/finance/class-hour/statistics/summary');
  const summary = unwrap<BackendClassHourSummary>(response);
  return {
    totalAccounts: toNumber(summary.totalAccounts),
    activeAccounts: toNumber(summary.activeAccounts),
    warningAccounts: toNumber(summary.warningAccounts),
    expiredAccounts: toNumber(summary.exhaustedAccounts),
    totalHours: toNumber(summary.totalHours),
    usedHours: toNumber(summary.usedHours),
    remainingHours: toNumber(summary.remainingHours),
    giftHours: toNumber(summary.giftHours),
  } satisfies ClassHourStatistics;
};

// 导出课时账户列表（前端生成CSV，兼容后端无专用导出接口）
export const exportClassHourAccountList = async (params: ClassHourAccountQueryParams) => {
  const response = await getClassHourAccountList({
    ...params,
    page: 1,
    pageSize: 2000,
  });
  const rows: Array<Array<string | number>> = [
    ['学员', '手机号', '课程', '校区', '总课时', '已用课时', '剩余课时', '赠送课时', '状态'],
    ...response.list.map((item) => [
      item.studentName,
      item.studentPhone,
      item.courseName,
      item.campusName,
      item.totalHours,
      item.usedHours,
      item.remainingHours,
      item.giftHours,
      item.status,
    ]),
  ];
  downloadCsv('课时账户列表.csv', rows);
};

// 导出课时调整记录（前端生成CSV，兼容后端无专用导出接口）
export const exportClassHourAdjustRecords = async (params: ClassHourAdjustRecordQueryParams) => {
  const response = await getClassHourAdjustRecordList({
    ...params,
    page: 1,
    pageSize: 2000,
  });
  const rows: Array<Array<string | number>> = [
    ['学员', '课程', '类型', '调整课时', '调整前', '调整后', '操作人', '时间', '原因'],
    ...response.list.map((item) => [
      item.studentName,
      item.courseName,
      item.adjustType,
      item.adjustHours,
      item.beforeHours,
      item.afterHours,
      item.operatorName,
      item.operateTime,
      item.reason,
    ]),
  ];
  downloadCsv('课时调整记录.csv', rows);
};
