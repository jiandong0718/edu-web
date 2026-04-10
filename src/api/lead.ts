import { http } from '@/utils/request';
import type {
  Lead,
  LeadQueryParams,
  LeadListResponse,
  LeadFormData,
  LeadAssignData,
  LeadImportResult,
  FollowRecord,
  FollowRecordFormData,
} from '@/types/lead';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

type LeadQueryInput = LeadQueryParams & {
  advisorId?: number;
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

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const normalizeLead = (raw: unknown): Lead => {
  const item = (raw ?? {}) as Record<string, unknown>;
  const genderValue = item.gender;
  const normalizedGender: Lead['gender'] =
    genderValue === 2 || genderValue === '2' || genderValue === 'female' ? 'female' : 'male';

  const source = String(item.source ?? 'offline') as Lead['source'];
  const status = String(item.status ?? 'new') as Lead['status'];
  const assigneeId = toNumber(item.assigneeId ?? item.advisorId);

  const normalized = {
    id: toNumber(item.id) ?? 0,
    name: String(item.name ?? ''),
    phone: String(item.phone ?? ''),
    parentName: String(item.parentName ?? ''),
    parentPhone: String(item.parentPhone ?? ''),
    gender: normalizedGender,
    age: toNumber(item.age),
    school: item.school ? String(item.school) : undefined,
    grade: item.grade ? String(item.grade) : undefined,
    subject: item.subject ? String(item.subject) : undefined,
    source,
    status,
    campusId: toNumber(item.campusId) ?? 0,
    campusName: String(item.campusName ?? ''),
    assigneeId,
    assigneeName: String(item.assigneeName ?? item.advisorName ?? ''),
    assignTime: item.assignTime ? String(item.assignTime) : undefined,
    followCount: toNumber(item.followCount) ?? 0,
    lastFollowTime: item.lastFollowTime ? String(item.lastFollowTime) : undefined,
    remark: item.remark ? String(item.remark) : undefined,
    createTime: String(item.createTime ?? ''),
    updateTime: String(item.updateTime ?? ''),
  } as Lead & {
    leadNo?: string;
    advisorId?: number;
    advisorName?: string;
    intentLevel?: string;
    sourceDetail?: string;
    lostReason?: string;
  };

  normalized.leadNo = item.leadNo ? String(item.leadNo) : '';
  normalized.advisorId = assigneeId;
  normalized.advisorName = String(item.advisorName ?? item.assigneeName ?? '');
  normalized.intentLevel = item.intentLevel ? String(item.intentLevel) : '';
  normalized.sourceDetail = item.sourceDetail ? String(item.sourceDetail) : '';
  normalized.lostReason = item.lostReason ? String(item.lostReason) : '';

  return normalized;
};

const normalizeLeadListResponse = (rawPage: unknown, params: LeadQueryParams): LeadListResponse => {
  const page = (rawPage ?? {}) as Record<string, unknown>;
  const records = Array.isArray(page.records)
    ? page.records
    : Array.isArray(page.list)
    ? page.list
    : [];

  return {
    list: records.map(normalizeLead),
    total: toNumber(page.total) ?? records.length,
    page: toNumber(page.current ?? page.page) ?? params.page,
    pageSize: toNumber(page.size ?? page.pageSize) ?? params.pageSize,
  };
};

const normalizeImportResult = (raw: unknown): LeadImportResult => {
  const result = (raw ?? {}) as Record<string, unknown>;
  const successCount = toNumber(result.successCount ?? result.success) ?? 0;
  const failureCount = toNumber(result.failureCount ?? result.failed) ?? 0;
  const total = toNumber(result.total) ?? successCount + failureCount;

  const errors = Array.isArray(result.errors)
    ? result.errors.map((item) => {
        const error = (item ?? {}) as Record<string, unknown>;
        const rowIndex = toNumber(error.rowIndex ?? error.row) ?? 0;
        const errorMessage = String(error.errorMessage ?? error.message ?? '');
        return {
          row: rowIndex,
          rowIndex,
          leadName: String(error.leadName ?? ''),
          message: errorMessage,
          errorMessage,
        };
      })
    : [];

  return {
    total,
    success: successCount,
    failed: failureCount,
    successCount,
    failureCount,
    errors,
  };
};

const toLeadPayload = (data: LeadFormData, id?: number): Record<string, unknown> => ({
  ...(id ? { id } : {}),
  name: data.name,
  phone: data.phone,
  gender: data.gender === 'female' ? 2 : 1,
  age: data.age,
  school: data.school,
  grade: data.grade,
  source: data.source,
  status: data.status,
  campusId: data.campusId,
  remark: data.remark,
});

const buildLeadQueryParams = (params: LeadQueryInput) => {
  const { page, pageSize, assigneeId, ...query } = params;
  return {
    pageNum: page,
    pageSize,
    ...query,
    ...(assigneeId !== undefined && query.advisorId === undefined ? { advisorId: assigneeId } : {}),
  };
};

// 获取线索列表
export const getLeadList = async (params: LeadQueryParams): Promise<LeadListResponse> => {
  const response = await http.get<unknown>('/marketing/lead/page', {
    params: buildLeadQueryParams(params as LeadQueryInput),
  });
  return normalizeLeadListResponse(unwrap<unknown>(response), params);
};

// 获取线索详情
export const getLeadDetail = async (id: number): Promise<Lead> => {
  const response = await http.get<unknown>(`/marketing/lead/${id}`);
  return normalizeLead(unwrap<unknown>(response));
};

// 新增线索
export const createLead = async (data: LeadFormData): Promise<{ id: number }> => {
  const response = await http.post<unknown>('/marketing/lead', toLeadPayload(data));
  const result = unwrap<unknown>(response);
  if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, 'id')) {
    return result as { id: number };
  }
  return { id: 0 };
};

// 编辑线索
export const updateLead = (id: number, data: LeadFormData) => {
  return http.put('/marketing/lead', toLeadPayload(data, id));
};

// 删除线索
export const deleteLead = (id: number) => {
  return http.delete(`/marketing/lead/${id}`);
};

// 批量删除线索
export const batchDeleteLead = async (ids: number[]) => {
  await Promise.all(ids.map((id) => deleteLead(id)));
  return true;
};

// 更新线索状态
export const updateLeadStatus = (id: number, status: string) => {
  return http.put(`/marketing/lead/${id}/status`, null, {
    params: { status },
  });
};

// 分配线索
export const assignLeads = (data: LeadAssignData) => {
  return http.put('/marketing/lead/batch-assign', data.leadIds, {
    params: {
      advisorId: data.assigneeId,
    },
  });
};

// 批量分配线索
export const batchAssignLeads = (leadIds: number[], advisorId: number) => {
  return http.put('/marketing/lead/batch-assign', leadIds, {
    params: { advisorId },
  });
};

// 导出线索列表
export const exportLeadList = (params: LeadQueryParams) => {
  return http.download('/marketing/lead/export', '线索列表.xlsx', {
    params: buildLeadQueryParams(params as LeadQueryInput),
  });
};

// 下载线索导入模板
export const downloadLeadTemplate = () => {
  return http.download('/marketing/lead/import-template', '线索导入模板.xlsx');
};

// 批量导入线索
export const importLeads = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post<unknown>('/marketing/lead/batch-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => normalizeImportResult(unwrap<unknown>(response)));
};

// 自动分配线索
export const autoAssignLeads = (leadIds: number[], campusId: number) => {
  return http.post('/marketing/lead/auto-assign', {
    leadIds,
    campusId,
  });
};

const normalizeFollowRecord = (raw: unknown): FollowRecord => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(item.id) ?? 0,
    leadId: toNumber(item.leadId) ?? 0,
    followerId: toNumber(item.followerId) ?? 0,
    followerName: String(item.followerName ?? ''),
    followType: String(item.followType ?? item.method ?? 'other') as FollowRecord['followType'],
    content: String(item.content ?? ''),
    nextFollowTime: item.nextFollowTime ? String(item.nextFollowTime) : undefined,
    createTime: String(item.createTime ?? ''),
  };
};

// 获取跟进记录列表
export const getFollowRecords = async (leadId: number): Promise<FollowRecord[]> => {
  const response = await http.get<unknown>(`/marketing/lead/${leadId}/follow-ups`);
  const records = unwrap<unknown>(response);
  return Array.isArray(records) ? records.map(normalizeFollowRecord) : [];
};

// 新增跟进记录
export const createFollowRecord = async (data: FollowRecordFormData): Promise<{ id: number }> => {
  await http.post<unknown>(`/marketing/lead/${data.leadId}/follow-ups`, {
    method: data.followType,
    content: data.content,
    nextFollowTime: data.nextFollowTime,
  });
  return { id: 0 };
};

// 删除跟进记录
export const deleteFollowRecord = async (id: number) => {
  void id;
  throw new Error('当前后端暂未提供删除跟进记录接口');
};
