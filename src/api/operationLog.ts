import { http } from '@/utils/request';

export interface OperationLog {
  id: number;
  username: string;
  realName: string;
  module: string;
  operation: string;
  operationType: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY' | 'EXPORT' | 'IMPORT' | 'OTHER';
  method: string;
  requestParams?: string;
  responseResult?: string;
  errorMsg?: string;
  status: 'success' | 'failure';
  ip: string;
  location: string;
  browser: string;
  os: string;
  duration: number;
  createTime: string;
}

export interface OperationLogQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  operationType?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  username?: string;
}

export interface OperationLogPageResult {
  list: OperationLog[];
  total: number;
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
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const OPERATION_TYPE_MAP: Record<number, OperationLog['operationType']> = {
  1: 'CREATE',
  2: 'UPDATE',
  3: 'DELETE',
  4: 'EXPORT',
  5: 'IMPORT',
  6: 'QUERY',
};

const toBackendOperationType = (value?: string): number | undefined => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized === 'CREATE') return 1;
  if (normalized === 'UPDATE') return 2;
  if (normalized === 'DELETE') return 3;
  if (normalized === 'EXPORT') return 4;
  if (normalized === 'IMPORT') return 5;
  if (normalized === 'QUERY') return 6;
  return 0;
};

const toBackendStatus = (value?: string): number | undefined => {
  if (!value) return undefined;
  if (value === 'success') return 1;
  if (value === 'failure') return 0;
  return undefined;
};

const normalizeOperationLog = (raw: unknown): OperationLog => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const businessType = toNumber(item.businessType, 0);
  return {
    id: toNumber(item.id),
    username: String(item.operatorName ?? item.username ?? ''),
    realName: String(item.operatorName ?? item.realName ?? ''),
    module: String(item.title ?? item.module ?? ''),
    operation: String(item.title ?? item.operation ?? ''),
    operationType: OPERATION_TYPE_MAP[businessType] ?? 'OTHER',
    method: String(item.requestMethod ?? item.method ?? ''),
    requestParams: item.param ? String(item.param) : item.requestParams ? String(item.requestParams) : undefined,
    responseResult: item.result ? String(item.result) : item.responseResult ? String(item.responseResult) : undefined,
    errorMsg: item.errorMsg ? String(item.errorMsg) : undefined,
    status: toNumber(item.status, 1) === 1 ? 'success' : 'failure',
    ip: String(item.ip ?? ''),
    location: String(item.location ?? ''),
    browser: String(item.browser ?? ''),
    os: String(item.os ?? ''),
    duration: toNumber(item.costTime ?? item.duration),
    createTime: String(item.createTime ?? ''),
  };
};

const normalizeOperationLogPage = (raw: unknown): OperationLogPageResult => {
  const page = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];
  return {
    list: records.map(normalizeOperationLog),
    total: toNumber(page.total, records.length),
  };
};

const toCsvRow = (values: Array<string | number | undefined>) =>
  values.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',');

// 查询操作日志列表
export const getOperationLogList = async (params: OperationLogQuery) => {
  const response = await http.get<unknown>('/system/operation-log/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      title: params.module || params.keyword,
      operatorName: params.username,
      businessType: toBackendOperationType(params.operationType),
      status: toBackendStatus(params.status),
      startTime: params.startTime,
      endTime: params.endTime,
    },
  });
  return normalizeOperationLogPage(response);
};

// 获取操作日志详情
export const getOperationLogDetail = async (id: number) => {
  const response = await http.get<unknown>(`/system/operation-log/${id}`);
  return normalizeOperationLog(unwrapData<unknown>(response));
};

// 删除操作日志
export const deleteOperationLog = (id: number) => {
  return http.delete('/system/operation-log/batch', { data: [id] });
};

// 批量删除操作日志
export const batchDeleteOperationLog = (ids: number[]) => {
  return http.delete('/system/operation-log/batch', { data: ids });
};

// 导出操作日志
export const exportOperationLog = async (params: OperationLogQuery) => {
  const page = await getOperationLogList({
    ...params,
    page: 1,
    pageSize: Math.max(params.pageSize ?? 1000, 1000),
  });

  const header = toCsvRow(['操作人', '模块', '类型', '状态', 'IP', '耗时(ms)', '时间']);
  const rows = page.list.map((item) =>
    toCsvRow([
      item.realName || item.username,
      item.module,
      item.operationType,
      item.status === 'success' ? '成功' : '失败',
      item.ip,
      item.duration,
      item.createTime,
    ])
  );

  const csv = `\uFEFF${[header, ...rows].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '操作日志.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

// 获取操作模块列表
export const getOperationModules = async () => {
  const page = await getOperationLogList({
    page: 1,
    pageSize: 1000,
  } as OperationLogQuery);
  return Array.from(new Set(page.list.map((item) => item.module).filter((module) => module)));
};

// 获取操作人列表
export const getOperationUsers = async () => {
  const page = await getOperationLogList({
    page: 1,
    pageSize: 1000,
  } as OperationLogQuery);
  return Array.from(
    new Map(
      page.list.map((item) => {
        const username = item.username || item.realName;
        const realName = item.realName || item.username;
        return [username, { username, realName }];
      })
    ).values()
  );
};
