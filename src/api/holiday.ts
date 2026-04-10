import { http } from '@/utils/request';
import type {
  Holiday,
  HolidayQueryParams,
  HolidayListResponse,
  HolidayFormData,
  HolidayStatus,
} from '@/types/holiday';

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

const toBackendType = (type: Holiday['type']): number => {
  if (type === 'compensatory') return 2;
  if (type === 'company') return 3;
  return 1;
};

const fromBackendType = (type: unknown): Holiday['type'] => {
  const normalized = toNumber(type, 1);
  if (normalized === 2) return 'compensatory';
  if (normalized === 3) return 'company';
  return 'legal';
};

const toBackendStatus = (status?: HolidayStatus): number | undefined => {
  if (!status) return undefined;
  return status === 'enabled' ? 1 : 0;
};

const fromBackendStatus = (status: unknown): HolidayStatus => {
  return toNumber(status, 1) === 1 ? 'enabled' : 'disabled';
};

const calcDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }
  const diff = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return diff >= 0 ? diff + 1 : 0;
};

const normalizeHoliday = (raw: unknown): Holiday => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const startDate = String(item.startDate ?? '');
  const endDate = String(item.endDate ?? '');
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    type: fromBackendType(item.type),
    startDate,
    endDate,
    days: toNumber(item.days, calcDays(startDate, endDate)),
    status: fromBackendStatus(item.status),
    remark: item.remark ? String(item.remark) : undefined,
    createTime: String(item.createTime ?? ''),
    updateTime: item.updateTime ? String(item.updateTime) : undefined,
  };
};

const normalizeHolidayPage = (raw: unknown, params: HolidayQueryParams): HolidayListResponse => {
  const page = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];

  return {
    code: 200,
    msg: 'success',
    data: {
      list: records.map(normalizeHoliday),
      total: toNumber(page.total, records.length),
      page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
      pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
    },
  };
};

const toHolidayPayload = (data: HolidayFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  name: data.name,
  type: toBackendType(data.type),
  startDate: data.startDate,
  endDate: data.endDate,
  status: toBackendStatus(data.status) ?? 1,
  remark: data.remark,
});

const toCsvRow = (values: Array<string | number | undefined>) =>
  values.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',');

const resolveDateRange = (params: HolidayQueryParams) => {
  if (params.startDate || params.endDate || !params.year) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  const year = toNumber(params.year, 0);
  if (year < 1900 || year > 9999) {
    return {
      startDate: params.startDate,
      endDate: params.endDate,
    };
  }

  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
};

// 获取节假日列表（分页）
export const getHolidayPage = async (params: HolidayQueryParams) => {
  const { startDate, endDate } = resolveDateRange(params);
  const response = await http.get<unknown>('/system/holiday/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      type: params.type ? toBackendType(params.type) : undefined,
      status: toBackendStatus(params.status),
      startDate,
      endDate,
    },
  });
  return normalizeHolidayPage(response, params);
};

// 获取节假日详情
export const getHolidayDetail = async (id: number) => {
  const response = await http.get<unknown>(`/system/holiday/${id}`);
  return normalizeHoliday(unwrapData<unknown>(response));
};

// 新增节假日
export const createHoliday = async (data: HolidayFormData) => {
  const response = await http.post<unknown>('/system/holiday', toHolidayPayload(data));
  const payload = unwrapData<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return { id: toNumber((payload as { id?: unknown }).id) };
  }
  return { id: 0 };
};

// 编辑节假日
export const updateHoliday = (id: number, data: HolidayFormData) => {
  return http.put('/system/holiday', toHolidayPayload(data, id));
};

// 删除节假日
export const deleteHoliday = (id: number) => {
  return http.delete(`/system/holiday/${id}`);
};

// 批量删除节假日
export const batchDeleteHoliday = (ids: number[]) => {
  return http.delete('/system/holiday/batch', { data: ids });
};

// 更新节假日状态
export const updateHolidayStatus = (id: number, status: HolidayStatus) => {
  return http.put(`/system/holiday/${id}/status`, null, {
    params: {
      status: toBackendStatus(status),
    },
  });
};

// 导出节假日列表
export const exportHolidayList = async (params: HolidayQueryParams) => {
  const page = await getHolidayPage({
    ...params,
    page: 1,
    pageSize: Math.max(params.pageSize ?? 1000, 1000),
  });
  const list = page?.data?.list ?? [];

  const header = toCsvRow(['名称', '类型', '开始日期', '结束日期', '天数', '状态', '备注']);
  const rows = list.map((item) =>
    toCsvRow([
      item.name,
      item.type === 'legal' ? '法定节假日' : item.type === 'compensatory' ? '调休' : '公司假期',
      item.startDate,
      item.endDate,
      item.days,
      item.status === 'enabled' ? '启用' : '禁用',
      item.remark,
    ])
  );

  const csv = `\uFEFF${[header, ...rows].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '节假日列表.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

// 批量导入节假日
export const importHolidays = (file: File) => {
  void file;
  return Promise.reject(new Error('当前后端未提供节假日导入接口'));
};
