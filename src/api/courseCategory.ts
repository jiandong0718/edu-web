import { http } from '@/utils/request';

// 课程分类数据
export interface CourseCategory {
  id: number;
  name: string;
  parentId: number | null;
  icon?: string;
  sort: number;
  status: 'active' | 'inactive';
  description?: string;
  children?: CourseCategory[];
  createTime?: string;
  updateTime?: string;
}

// 课程分类树节点
export interface CourseCategoryTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  icon?: string;
  sort: number;
  status: 'active' | 'inactive';
  description?: string;
  children?: CourseCategoryTreeNode[];
}

// 新增/编辑课程分类参数
export interface CourseCategoryFormData {
  id?: number;
  name: string;
  parentId?: number | null;
  icon?: string;
  sort?: number;
  status?: 'active' | 'inactive';
  description?: string;
}

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

const toBackendStatus = (status: 'active' | 'inactive' | undefined): number | undefined => {
  if (status === undefined) return undefined;
  return status === 'active' ? 1 : 0;
};

const toFrontendStatus = (status: unknown): 'active' | 'inactive' => {
  return toNumber(status, 0) === 1 ? 'active' : 'inactive';
};

const normalizeCategoryNode = (raw: unknown): CourseCategory => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const children = Array.isArray(item.children) ? item.children : [];
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    parentId: toNumber(item.parentId, 0) === 0 ? null : toNumber(item.parentId),
    icon: item.icon ? String(item.icon) : undefined,
    sort: toNumber(item.sortOrder ?? item.sort),
    status: toFrontendStatus(item.status),
    description: item.description ? String(item.description) : undefined,
    createTime: item.createTime ? String(item.createTime) : undefined,
    updateTime: item.updateTime ? String(item.updateTime) : undefined,
    children: children.map(normalizeCategoryNode),
  };
};

const toCategoryPayload = (data: CourseCategoryFormData): Record<string, unknown> => ({
  ...(data.id ? { id: data.id } : {}),
  name: data.name,
  parentId: data.parentId == null ? 0 : data.parentId,
  icon: data.icon,
  sortOrder: data.sort ?? 0,
  status: toBackendStatus(data.status ?? 'active'),
  description: data.description,
});

// 获取课程分类树
export const getCourseCategoryTree = async () => {
  const response = await http.get<unknown>('/teaching/course-category/tree');
  const data = unwrap<unknown>(response);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeCategoryNode) as CourseCategoryTreeNode[];
};

// 新增课程分类
export const createCourseCategory = (data: CourseCategoryFormData) => {
  return http.post('/teaching/course-category', toCategoryPayload(data));
};

// 修改课程分类
export const updateCourseCategory = (data: CourseCategoryFormData) => {
  return http.put('/teaching/course-category', toCategoryPayload(data));
};

// 删除课程分类
export const deleteCourseCategory = (id: number) => {
  return http.delete(`/teaching/course-category/${id}`);
};

// 更新课程分类状态
export const updateCourseCategoryStatus = (id: number, status: 'active' | 'inactive') => {
  return http.put(`/teaching/course-category/${id}/status`, undefined, {
    params: {
      status: toBackendStatus(status),
    },
  });
};
