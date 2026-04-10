import { http } from '@/utils/request';
import type {
  Student,
  StudentQueryParams,
  StudentListResponse,
  StudentFormData,
  StudentTag,
  StudentTagQueryParams,
  StudentTagListResponse,
  StudentTagFormData,
  StudentImportResult,
} from '@/types/student';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

type BackendStudent = Record<string, unknown> & {
  contacts?: Array<Record<string, unknown>>;
  tags?: unknown[];
  tagIds?: unknown[];
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

const toFrontendStatus = (status: unknown): Student['status'] => {
  const normalized = String(status ?? '');
  if (normalized === 'graduated') return 'graduated';
  if (normalized === 'suspended') return 'dropout';
  if (normalized === 'refunded') return 'inactive';
  return 'active';
};

const toBackendStatus = (status: Student['status'] | string): string => {
  if (status === 'graduated') return 'graduated';
  if (status === 'dropout') return 'suspended';
  if (status === 'inactive') return 'suspended';
  return 'enrolled';
};

const toFrontendGender = (value: unknown): Student['gender'] => {
  return toNumber(value, 1) === 2 ? 'female' : 'male';
};

const toBackendGender = (gender: Student['gender']): number => {
  return gender === 'female' ? 2 : 1;
};

const pickPrimaryContact = (contacts: BackendStudent['contacts']) => {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return null;
  }
  return (
    contacts.find((contact) => contact?.isPrimary === true || contact?.isPrimary === 1) ??
    contacts[0]
  );
};

const normalizeStudent = (raw: unknown): Student => {
  const item = (raw ?? {}) as BackendStudent;
  const contact = pickPrimaryContact(item.contacts);
  const parentName = contact?.name ? String(contact.name) : String(item.parentName ?? '');
  const parentPhone = contact?.phone ? String(contact.phone) : String(item.parentPhone ?? '');
  const createTime = String(item.createTime ?? '');
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    avatar: item.avatar ? String(item.avatar) : undefined,
    gender: toFrontendGender(item.gender),
    phone: String(item.phone ?? ''),
    parentPhone,
    parentName,
    idCard: item.idCard ? String(item.idCard) : undefined,
    birthday: String(item.birthday ?? ''),
    address: String(item.address ?? ''),
    school: String(item.school ?? ''),
    grade: String(item.grade ?? ''),
    status: toFrontendStatus(item.status),
    campusId: toNumber(item.campusId),
    campusName: String(item.campusName ?? ''),
    tags: [],
    enrollDate: String(item.enrollDate ?? createTime),
    graduateDate: item.graduateDate ? String(item.graduateDate) : undefined,
    remark: item.remark ? String(item.remark) : undefined,
    createTime,
    updateTime: String(item.updateTime ?? ''),
  };
};

const normalizeStudentPage = (raw: unknown, params: StudentQueryParams): StudentListResponse => {
  const page = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];
  return {
    list: records.map(normalizeStudent),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
  };
};

const toStudentPayload = (data: StudentFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  name: data.name,
  avatar: data.avatar,
  gender: toBackendGender(data.gender),
  phone: data.phone,
  idCard: data.idCard,
  birthday: data.birthday,
  address: data.address,
  school: data.school,
  grade: data.grade,
  status: toBackendStatus(data.status),
  campusId: data.campusId,
  tagIds: Array.isArray(data.tagIds) ? data.tagIds : undefined,
  enrollDate: data.enrollDate,
  graduateDate: data.graduateDate,
  remark: data.remark,
  contacts:
    data.parentName || data.parentPhone
      ? [
          {
            name: data.parentName,
            phone: data.parentPhone,
            relation: 'other',
            isPrimary: true,
          },
        ]
      : undefined,
});

const normalizeTag = (raw: unknown): StudentTag => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const statusRaw = item.status;
  const normalizedStatus = statusRaw === 1 || statusRaw === '1' ? 1 : statusRaw === 0 || statusRaw === '0' ? 0 : undefined;
  return {
    id: toNumber(item.id),
    name: String(item.name ?? ''),
    color: String(item.color ?? '#00d4ff'),
    description: item.description ? String(item.description) : undefined,
    usageCount: toNumber(item.usageCount),
    status: normalizedStatus,
    createTime: String(item.createTime ?? ''),
    updateTime: item.updateTime ? String(item.updateTime) : undefined,
  };
};

const normalizeTagPage = (raw: unknown, params: StudentTagQueryParams): StudentTagListResponse => {
  const page = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
      ? page.list
      : [];
  return {
    list: records.map(normalizeTag),
    total: toNumber(page.total, records.length),
    page: toNumber(page.current ?? page.page ?? page.pageNum, params.page ?? 1),
    pageSize: toNumber(page.size ?? page.pageSize, params.pageSize ?? 10),
  };
};

const normalizeImportResult = (raw: unknown): StudentImportResult => {
  const result = (unwrapData<unknown>(raw) ?? {}) as Record<string, unknown>;
  const success = toNumber(result.success ?? result.successCount);
  const failed = toNumber(result.failed ?? result.failureCount);
  const errors = Array.isArray(result.errors)
    ? result.errors.map((item) => {
        const error = (item ?? {}) as Record<string, unknown>;
        return {
          row: toNumber(error.row ?? error.rowIndex),
          message: String(error.message ?? error.errorMessage ?? ''),
        };
      })
    : [];
  return {
    success,
    failed,
    errors,
  };
};

// 获取学员列表
export const getStudentList = async (params: StudentQueryParams) => {
  const response = await http.get<unknown>('/student/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
      phone: params.phone,
      campusId: params.campusId,
      status: params.status ? toBackendStatus(params.status) : undefined,
      grade: params.grade,
    },
  });
  return normalizeStudentPage(response, params);
};

// 获取学员详情
export const getStudentDetail = async (id: number) => {
  const response = await http.get<unknown>(`/student/${id}`);
  return normalizeStudent(unwrapData<unknown>(response));
};

// 新增学员
export const createStudent = async (data: StudentFormData) => {
  const response = await http.post<unknown>('/student', toStudentPayload(data));
  const payload = unwrapData<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return { id: toNumber((payload as { id?: unknown }).id) };
  }
  return { id: 0 };
};

// 编辑学员
export const updateStudent = (id: number, data: StudentFormData) => {
  return http.put('/student', toStudentPayload(data, id));
};

// 删除学员
export const deleteStudent = (id: number) => {
  return http.delete(`/student/${id}`);
};

// 批量删除学员
export const batchDeleteStudent = (ids: number[]) => {
  return http.delete('/student/batch', { data: ids });
};

// 更新学员状态
export const updateStudentStatus = (id: number, status: string) => {
  return http.put(`/student/${id}/status`, null, {
    params: { status: toBackendStatus(status) },
  });
};

// 导出学员列表
export const exportStudentList = (params: StudentQueryParams) => {
  return http.download('/student/export', '学员列表.xlsx', {
    params: {
      ...params,
      status: params.status ? toBackendStatus(params.status) : undefined,
    },
  });
};

// 获取学员标签列表
export const getStudentTagList = async (params: StudentTagQueryParams) => {
  const response = await http.get<unknown>('/student/tag/page', {
    params: {
      pageNum: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      name: params.name,
    },
  });
  return normalizeTagPage(response, params);
};

// 获取所有学员标签（不分页）
export const getAllStudentTags = async () => {
  const response = await http.get<unknown>('/student/tag/list');
  const payload = unwrapData<unknown>(response);
  return Array.isArray(payload) ? payload.map(normalizeTag) : [];
};

// 获取学员标签详情
export const getStudentTagDetail = async (id: number) => {
  const response = await http.get<unknown>(`/student/tag/${id}`);
  return normalizeTag(unwrapData<unknown>(response));
};

// 新增学员标签
export const createStudentTag = async (data: StudentTagFormData) => {
  const response = await http.post<unknown>('/student/tag', {
    name: data.name,
    color: data.color,
  });
  const payload = unwrapData<unknown>(response);
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'id')) {
    return { id: toNumber((payload as { id?: unknown }).id) };
  }
  return { id: 0 };
};

// 编辑学员标签
export const updateStudentTag = async (id: number, data: StudentTagFormData) => {
  const detail = await getStudentTagDetail(id);
  return http.put('/student/tag', {
    id,
    name: data.name ?? detail.name,
    color: data.color ?? detail.color,
  });
};

// 删除学员标签
export const deleteStudentTag = (id: number) => {
  return http.delete(`/student/tag/${id}`);
};

// 批量删除学员标签
export const batchDeleteStudentTag = (ids: number[]) => {
  return http.delete('/student/tag/batch', { data: ids });
};

// 下载学员导入模板
export const downloadStudentTemplate = () => {
  return http.download('/student/import-template', '学员导入模板.xlsx');
};

// 批量导入学员
export const importStudents = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post<unknown>('/student/batch-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => normalizeImportResult(response));
};
