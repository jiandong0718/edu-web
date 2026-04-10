import { http } from '@/utils/request';
import type {
  SystemConfig,
  ConfigQueryParams,
  ConfigListResponse,
  ConfigFormData,
  ConfigStatistics,
} from '@/types/config';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

const CATEGORY_SET = new Set<ConfigFormData['category']>([
  'system',
  'upload',
  'security',
  'notification',
  'business',
]);

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

const normalizeCategory = (value: unknown): ConfigFormData['category'] => {
  const category = String(value ?? 'system') as ConfigFormData['category'];
  return CATEGORY_SET.has(category) ? category : 'system';
};

const normalizeConfig = (raw: unknown): SystemConfig => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    configKey: String(item.configKey ?? ''),
    configValue: String(item.configValue ?? ''),
    configName: String(item.configName ?? item.configKey ?? ''),
    configType: String(item.configType ?? 'string') as SystemConfig['configType'],
    category: normalizeCategory(item.configGroup ?? item.category),
    description: item.description ? String(item.description) : undefined,
    isSystem: toNumber(item.isSystem, 0) === 1,
    sortOrder: toNumber(item.sort ?? item.sortOrder),
    status: toNumber(item.status, 1) === 1 ? 1 : 0,
    createTime: String(item.createTime ?? ''),
    updateTime: item.updateTime ? String(item.updateTime) : undefined,
  };
};

const normalizeConfigList = (raw: unknown): SystemConfig[] => {
  const payload = unwrapData<unknown>(raw);
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map(normalizeConfig);
};

const normalizeConfigPage = (raw: unknown, params: ConfigQueryParams): ConfigListResponse => {
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
      list: records.map(normalizeConfig),
      total: toNumber(page.total, records.length),
      page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
      pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
    },
  };
};

const toConfigPayload = (data: ConfigFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  configKey: data.configKey,
  configValue: data.configValue,
  configType: data.configType,
  configGroup: data.category,
  description: data.description,
  sort: data.sortOrder,
  status: data.status ?? 1,
});

const toCsvRow = (values: Array<string | number | undefined | boolean>) =>
  values.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',');

// 获取系统参数列表
export const getConfigList = async (params: ConfigQueryParams) => {
  const response = await http.get<unknown>('/system/config/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      configKey: params.keyword,
      configGroup: params.category,
      configType: params.configType,
      status: params.status,
    },
  });
  return normalizeConfigPage(response, params);
};

// 获取系统参数详情
export const getConfigDetail = async (id: number) => {
  const response = await http.get<unknown>(`/system/config/${id}`);
  return normalizeConfig(unwrapData<unknown>(response));
};

// 根据键获取系统参数
export const getConfigByKey = async (key: string) => {
  const response = await http.get<unknown>(`/system/config/key/${key}`);
  const value = unwrapData<unknown>(response);
  if (typeof value === 'string') {
    return {
      id: 0,
      configKey: key,
      configValue: value,
      configName: key,
      configType: 'string',
      category: 'system',
      isSystem: false,
      sortOrder: 0,
      status: 1,
      createTime: '',
    } as SystemConfig;
  }
  return normalizeConfig(value);
};

// 新增系统参数
export const createConfig = async (data: ConfigFormData) => {
  const response = await http.post<unknown>('/system/config', toConfigPayload(data));
  const payload = unwrapData<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return { id: toNumber((payload as { id?: unknown }).id) };
  }
  return { id: 0 };
};

// 编辑系统参数
export const updateConfig = (id: number, data: ConfigFormData) => {
  return http.put('/system/config', toConfigPayload(data, id));
};

// 删除系统参数
export const deleteConfig = (id: number) => {
  return http.delete(`/system/config/${id}`);
};

// 批量删除系统参数
export const batchDeleteConfig = (ids: number[]) => {
  return http.delete('/system/config/batch', { data: ids });
};

// 更新系统参数状态
export const updateConfigStatus = async (id: number, status: 0 | 1) => {
  const detail = await getConfigDetail(id);
  return updateConfig(id, {
    configKey: detail.configKey,
    configValue: detail.configValue,
    configName: detail.configName,
    configType: detail.configType,
    category: detail.category,
    description: detail.description,
    sortOrder: detail.sortOrder,
    status,
  });
};

// 刷新系统参数缓存
export const refreshConfigCache = () => {
  return http.post('/system/config/cache/refresh');
};

// 获取系统参数统计数据
export const getConfigStatistics = async () => {
  const response = await http.get<unknown>('/system/config/list');
  const list = normalizeConfigList(response);
  const enabledCount = list.filter((item) => item.status === 1).length;
  const categoryStats = ['system', 'upload', 'security', 'notification', 'business'].map((category) => ({
    category: category as ConfigFormData['category'],
    count: list.filter((item) => item.category === category).length,
  }));
  return {
    total: list.length,
    systemCount: list.filter((item) => item.isSystem).length,
    customCount: list.filter((item) => !item.isSystem).length,
    enabledCount,
    disabledCount: list.length - enabledCount,
    categoryStats,
  } as ConfigStatistics;
};

// 导出系统参数列表
export const exportConfigList = async (params: ConfigQueryParams) => {
  const response = await http.get<unknown>('/system/config/list', {
    params: {
      configKey: params.keyword,
      configGroup: params.category,
      configType: params.configType,
      status: params.status,
    },
  });
  const list = normalizeConfigList(response);

  const header = toCsvRow(['参数键', '参数名称', '参数值', '类型', '分组', '状态', '系统内置', '备注']);
  const rows = list.map((item) =>
    toCsvRow([
      item.configKey,
      item.configName,
      item.configValue,
      item.configType,
      item.category,
      item.status === 1 ? '启用' : '禁用',
      item.isSystem,
      item.description,
    ])
  );

  const csv = `\uFEFF${[header, ...rows].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '系统参数列表.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
