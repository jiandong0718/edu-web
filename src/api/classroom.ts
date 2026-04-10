import { http } from '@/utils/request';
import type {
  Classroom,
  ClassroomQueryParams,
  ClassroomListResponse,
  ClassroomFormData,
  ClassroomStatistics,
  ClassroomStatus,
} from '@/types/classroom';

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

const toBackendStatus = (status?: ClassroomStatus): number | undefined => {
  if (!status) return undefined;
  if (status === 'maintenance') return 0;
  return 1;
};

const fromBackendStatus = (status: unknown): ClassroomStatus => {
  return toNumber(status, 1) === 1 ? 'available' : 'maintenance';
};

const normalizeClassroom = (raw: unknown): Classroom => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    code: String(item.code ?? ''),
    campusId: toNumber(item.campusId),
    campusName: String(item.campusName ?? ''),
    building: String(item.building ?? ''),
    floor: toNumber(item.floor),
    capacity: toNumber(item.capacity),
    area: toNumber(item.area),
    facilities: Array.isArray(item.facilities)
      ? item.facilities.map((facility) => String(facility))
      : [],
    status: fromBackendStatus(item.status),
    remark: item.remark ? String(item.remark) : undefined,
    createTime: String(item.createTime ?? ''),
    updateTime: item.updateTime ? String(item.updateTime) : undefined,
  };
};

const normalizeClassroomPage = (raw: unknown, params: ClassroomQueryParams): ClassroomListResponse => {
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
      list: records.map(normalizeClassroom),
      total: toNumber(page.total, records.length),
      page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
      pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
    },
  };
};

const toClassroomPayload = (data: ClassroomFormData): Record<string, unknown> => ({
  name: data.name,
  code: data.code,
  campusId: data.campusId,
  building: data.building,
  floor: data.floor,
  capacity: data.capacity,
  area: data.area,
  facilities: data.facilities,
  status: toBackendStatus(data.status) ?? 1,
  remark: data.remark,
});

const toCsvRow = (values: Array<string | number | undefined>) =>
  values.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',');

// 获取教室列表
export const getClassroomList = async (params: ClassroomQueryParams) => {
  const response = await http.get<unknown>('/system/classroom/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      keyword: params.keyword,
      campusId: params.campusId,
      status: toBackendStatus(params.status),
      building: params.building,
      minCapacity: params.minCapacity,
      maxCapacity: params.maxCapacity,
    },
  });
  return normalizeClassroomPage(response, params);
};

// 获取教室详情
export const getClassroomDetail = async (id: number) => {
  const response = await http.get<unknown>(`/system/classroom/${id}`);
  return normalizeClassroom(unwrapData<unknown>(response));
};

// 新增教室
export const createClassroom = async (data: ClassroomFormData) => {
  const response = await http.post<unknown>('/system/classroom', toClassroomPayload(data));
  const payload = unwrapData<unknown>(response);
  if (typeof payload === 'number' || typeof payload === 'string') {
    return { id: toNumber(payload) };
  }
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return { id: toNumber((payload as { id?: unknown }).id) };
  }
  return { id: 0 };
};

// 编辑教室
export const updateClassroom = (id: number, data: ClassroomFormData) => {
  return http.put(`/system/classroom/${id}`, toClassroomPayload(data));
};

// 删除教室
export const deleteClassroom = (id: number) => {
  return http.delete(`/system/classroom/${id}`);
};

// 批量删除教室
export const batchDeleteClassroom = (ids: number[]) => {
  return http.delete('/system/classroom/batch', { data: ids });
};

// 更新教室状态
export const updateClassroomStatus = (id: number, status: ClassroomStatus) => {
  return http.put(`/system/classroom/${id}/status`, null, {
    params: {
      status: toBackendStatus(status) ?? 1,
    },
  });
};

// 获取教室统计数据
export const getClassroomStatistics = async () => {
  const page = await getClassroomList({
    page: 1,
    pageSize: 1000,
  });
  const list = page?.data?.list ?? [];
  const available = list.filter((item) => item.status === 'available').length;
  const maintenance = list.filter((item) => item.status === 'maintenance').length;
  return {
    total: list.length,
    available,
    occupied: 0,
    maintenance,
    totalCapacity: list.reduce((sum, item) => sum + toNumber(item.capacity), 0),
    totalArea: list.reduce((sum, item) => sum + toNumber(item.area), 0),
  } as ClassroomStatistics;
};

// 导出教室列表
export const exportClassroomList = async (params: ClassroomQueryParams) => {
  const page = await getClassroomList({
    ...params,
    page: 1,
    pageSize: Math.max(params.pageSize ?? 1000, 1000),
  });
  const list = page?.data?.list ?? [];

  const header = toCsvRow(['教室名称', '编码', '校区', '楼栋', '楼层', '容量', '面积', '状态', '备注']);
  const rows = list.map((item) =>
    toCsvRow([
      item.name,
      item.code,
      item.campusName,
      item.building,
      item.floor,
      item.capacity,
      item.area,
      item.status === 'maintenance' ? '禁用' : '启用',
      item.remark,
    ])
  );
  const csv = `\uFEFF${[header, ...rows].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = '教室列表.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};
