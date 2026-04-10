import { http } from '@/utils/request';
import type { Campus } from '@/components/CampusSwitch';

// 校区列表响应
export interface CampusListResponse {
  list: Campus[];
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

const normalizeCampus = (raw: unknown): Campus => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    code: String(item.code ?? ''),
    address: item.address ? String(item.address) : undefined,
    status: toNumber(item.status, 1) === 1 ? 'active' : 'inactive',
  };
};

const isRouteUnavailable = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404 || status === 405;
};

// 获取校区列表（全量，用于下拉选择）
export const getCampusList = async () => {
  let response: unknown;
  try {
    response = await http.get<unknown>('/system/campus/accessible');
  } catch (error) {
    if (!isRouteUnavailable(error)) {
      throw error;
    }
    response = await http.get<unknown>('/system/campus/list');
  }

  const payload = unwrapData<unknown>(response);
  const list = Array.isArray(payload) ? payload.map(normalizeCampus) : [];
  return {
    list,
    total: list.length,
  } as CampusListResponse;
};
