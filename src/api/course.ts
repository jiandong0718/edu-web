import { http } from '@/utils/request';
import type { Course, CourseFormData, CourseListResponse, CourseQueryParams, CourseStatus } from '@/types/course';

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

const toBackendStatus = (status: CourseStatus): string => {
  return status === 'active' ? 'ON_SALE' : 'OFF_SALE';
};

const fromBackendStatus = (status: unknown): CourseStatus => {
  const normalized = String(status ?? '').toUpperCase();
  return normalized === 'ON_SALE' || normalized === 'ACTIVE' ? 'active' : 'inactive';
};

const normalizeCourse = (raw: unknown): Course => {
  const item = (raw ?? {}) as Record<string, unknown>;

  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    category: String(item.type ?? item.categoryName ?? item.category ?? ''),
    price: toNumber(item.price),
    totalHours: toNumber(item.totalHours),
    studentCount: toNumber(item.studentCount ?? item.currentStudents),
    status: fromBackendStatus(item.status),
    description: item.description ? String(item.description) : undefined,
    createTime: item.createTime ? String(item.createTime) : undefined,
  };
};

const normalizeCoursePage = (raw: unknown, params: CourseQueryParams): CourseListResponse => {
  const page = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];

  return {
    list: records.map(normalizeCourse),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page, params.page ?? 1),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
  };
};

const toCoursePayload = (data: CourseFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  name: data.name,
  type: data.category,
  description: data.description,
  totalHours: data.totalHours,
  price: data.price,
  status: toBackendStatus(data.status),
});

export const getCourseList = async (params: CourseQueryParams) => {
  const response = await http.get<unknown>('/teaching/course/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      type: params.category,
      status: params.status ? toBackendStatus(params.status) : undefined,
    },
  });
  return normalizeCoursePage(response, params);
};

export const getCourseDetail = async (id: number) => {
  const response = await http.get<unknown>(`/teaching/course/${id}`);
  return normalizeCourse(unwrap<unknown>(response));
};

export const createCourse = async (data: CourseFormData) => {
  const response = await http.post<unknown>('/teaching/course', toCoursePayload(data));
  const payload = unwrap<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return payload as { id: number };
  }
  return { id: 0 };
};

export const updateCourse = (id: number, data: CourseFormData) => {
  return http.put('/teaching/course', toCoursePayload(data, id));
};

export const updateCourseStatus = (id: number, status: CourseStatus) => {
  if (status === 'active') {
    return http.put(`/teaching/course/${id}/on-sale`);
  }
  return http.put(`/teaching/course/${id}/off-sale`);
};

export const deleteCourse = (id: number) => {
  return http.delete(`/teaching/course/${id}`);
};
