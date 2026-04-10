import { http } from '@/utils/request';

// 登录日志查询参数
export interface LoginLogQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  ip?: string;
  status?: 'success' | 'failure' | '';
  startTime?: string;
  endTime?: string;
}

// 登录日志数据
export interface LoginLog {
  id: number;
  username: string;
  realName: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: 'success' | 'failure';
  message?: string;
  loginTime: string;
}

// 登录日志列表响应
export interface LoginLogListResponse {
  list: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
}

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toBackendStatus = (status: LoginLogQueryParams['status']): number | undefined => {
  if (status === 'success') return 1;
  if (status === 'failure') return 0;
  return undefined;
};

const fromBackendStatus = (status: unknown): LoginLog['status'] => {
  return toNumber(status, 1) === 1 ? 'success' : 'failure';
};

const mapQueryParams = (params: LoginLogQueryParams) => ({
  pageNum: params.page ?? 1,
  pageSize: params.pageSize ?? 10,
  username: params.username,
  ip: params.ip,
  status: toBackendStatus(params.status),
  startTime: params.startTime,
  endTime: params.endTime,
});

const normalizeLoginLog = (raw: unknown): LoginLog => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    username: String(item.username ?? ''),
    realName: String(item.realName ?? item.username ?? ''),
    ip: String(item.ip ?? ''),
    location: String(item.location ?? ''),
    browser: String(item.browser ?? ''),
    os: String(item.os ?? ''),
    status: fromBackendStatus(item.status),
    message: item.msg ? String(item.msg) : item.message ? String(item.message) : undefined,
    loginTime: String(item.loginTime ?? item.createTime ?? ''),
  };
};

const normalizeLoginLogPage = (raw: unknown, params: LoginLogQueryParams): LoginLogListResponse => {
  const page = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];

  return {
    list: records.map(normalizeLoginLog),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
  };
};

const toCsvRow = (values: Array<string | number | undefined>) => {
  return values
    .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
    .join(',');
};

// 获取登录日志列表
export const getLoginLogList = async (params: LoginLogQueryParams) => {
  const response = await http.get<unknown>('/system/login-log/page', {
    params: mapQueryParams(params),
  });
  return normalizeLoginLogPage(response, params);
};

// 删除登录日志
export const deleteLoginLog = (id: number) => {
  return http.delete(`/system/login-log/${id}`);
};

// 批量删除登录日志
export const batchDeleteLoginLog = (ids: number[]) => {
  return http.delete('/system/login-log/batch', { data: ids });
};

// 导出登录日志
export const exportLoginLog = async (params: LoginLogQueryParams) => {
  const page = await getLoginLogList({
    ...params,
    page: 1,
    pageSize: Math.max(params.pageSize ?? 1000, 1000),
  });

  const header = toCsvRow(['用户名', '姓名', 'IP', '地区', '浏览器', '操作系统', '状态', '消息', '登录时间']);
  const rows = page.list.map((log) =>
    toCsvRow([
      log.username,
      log.realName,
      log.ip,
      log.location,
      log.browser,
      log.os,
      log.status === 'success' ? '成功' : '失败',
      log.message,
      log.loginTime,
    ])
  );

  const csv = `\uFEFF${[header, ...rows].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '登录日志.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
