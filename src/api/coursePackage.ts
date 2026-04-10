import { http } from '@/utils/request';
import type {
  CoursePackage,
  CoursePackageQueryParams,
  CoursePackageListResponse,
  CoursePackageFormData,
  CourseInfo,
} from '@/types/coursePackage';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

type CoursePackageItemVO = {
  courseId?: number;
  courseName?: string;
  coursePrice?: number;
  courseCount?: number;
};

type CoursePackageVO = {
  id?: number;
  name?: string;
  description?: string;
  originalPrice?: number;
  price?: number;
  discount?: number;
  validDays?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
  items?: CoursePackageItemVO[];
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

const toBackendStatus = (status: string | undefined): number | undefined => {
  if (status === undefined) return undefined;
  return status === 'active' ? 1 : 0;
};

const fromBackendStatus = (status: unknown): 'active' | 'inactive' => {
  return toNumber(status, 0) === 1 ? 'active' : 'inactive';
};

const normalizeCourseInfo = (raw: unknown): CourseInfo => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    category: String(item.type ?? item.categoryName ?? item.category ?? ''),
    price: toNumber(item.price),
    totalHours: toNumber(item.totalHours),
  };
};

const normalizeCoursePackage = (raw: unknown): CoursePackage => {
  const item = (raw ?? {}) as CoursePackageVO;
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    description: item.description,
    originalPrice: toNumber(item.originalPrice),
    price: toNumber(item.price),
    discount: toNumber(item.discount),
    validDays: toNumber(item.validDays),
    status: fromBackendStatus(item.status),
    createTime: String(item.createTime ?? ''),
    updateTime: String(item.updateTime ?? ''),
    courses: Array.isArray(item.items)
      ? item.items.map((course) => ({
          id: toNumber(course.courseId),
          name: String(course.courseName ?? ''),
          category: '',
          price: toNumber(course.coursePrice),
          totalHours: toNumber(course.courseCount),
        }))
      : [],
  };
};

const normalizePage = (raw: unknown, params: CoursePackageQueryParams): CoursePackageListResponse => {
  const page = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records) ? page.records : [];
  return {
    list: records.map(normalizeCoursePackage),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current, params.page),
    pageSize: toNumber(page.size, params.pageSize),
  };
};

const toPackagePayload = (data: CoursePackageFormData): Record<string, unknown> => ({
  name: data.name,
  description: data.description,
  originalPrice: data.originalPrice,
  price: data.price,
  validDays: data.validDays,
  status: toBackendStatus(data.status),
  items: data.courseIds.map((courseId, index) => ({
    courseId,
    courseCount: 1,
    sortOrder: index + 1,
  })),
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

// 获取课程包列表
export const getCoursePackageList = async (params: CoursePackageQueryParams) => {
  const response = await http.get<unknown>('/teaching/course-package/page', {
    params: {
      pageNum: params.page,
      pageSize: params.pageSize,
      name: params.name,
      status: toBackendStatus(params.status),
    },
  });
  return normalizePage(response, params);
};

// 获取课程包详情
export const getCoursePackageDetail = async (id: number) => {
  const response = await http.get<unknown>(`/teaching/course-package/${id}`);
  return normalizeCoursePackage(unwrap<unknown>(response));
};

// 新增课程包
export const createCoursePackage = async (data: CoursePackageFormData) => {
  const response = await http.post<unknown>('/teaching/course-package', toPackagePayload(data));
  const payload = unwrap<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return payload as { id: number };
  }
  return { id: 0 };
};

// 编辑课程包
export const updateCoursePackage = (id: number, data: CoursePackageFormData) => {
  return http.put(`/teaching/course-package/${id}`, toPackagePayload(data));
};

// 删除课程包
export const deleteCoursePackage = (id: number) => {
  return http.delete(`/teaching/course-package/${id}`);
};

// 更新课程包状态
export const updateCoursePackageStatus = (id: number, status: string) => {
  return http.put(`/teaching/course-package/${id}/status`, undefined, {
    params: { status: toBackendStatus(status) },
  });
};

// 获取所有可用课程（用于选择）
export const getAvailableCourses = async () => {
  const response = await http.get<unknown>('/teaching/course/on-sale');
  const data = unwrap<unknown>(response);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeCourseInfo);
};

// 导出课程包列表（前端生成CSV，兼容后端无专用导出接口）
export const exportCoursePackageList = async (params: CoursePackageQueryParams) => {
  const response = await getCoursePackageList({
    ...params,
    page: 1,
    pageSize: 2000,
  });

  const rows: Array<Array<string | number>> = [
    ['课程包名称', '状态', '优惠价', '原价', '有效期(天)', '课程数量', '创建时间'],
    ...response.list.map((item) => [
      item.name,
      item.status === 'active' ? '上架' : '下架',
      item.price,
      item.originalPrice,
      item.validDays,
      item.courses.length,
      item.createTime,
    ]),
  ];

  downloadCsv('课程包列表.csv', rows);
};
