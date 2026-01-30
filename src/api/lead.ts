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

// 获取线索列表
export const getLeadList = (params: LeadQueryParams) => {
  return http.get<LeadListResponse>('/crm/lead/list', { params });
};

// 获取线索详情
export const getLeadDetail = (id: number) => {
  return http.get<Lead>(`/crm/lead/${id}`);
};

// 新增线索
export const createLead = (data: LeadFormData) => {
  return http.post<{ id: number }>('/crm/lead', data);
};

// 编辑线索
export const updateLead = (id: number, data: LeadFormData) => {
  return http.put(`/crm/lead/${id}`, data);
};

// 删除线索
export const deleteLead = (id: number) => {
  return http.delete(`/crm/lead/${id}`);
};

// 批量删除线索
export const batchDeleteLead = (ids: number[]) => {
  return http.post('/crm/lead/batch-delete', { ids });
};

// 更新线索状态
export const updateLeadStatus = (id: number, status: string) => {
  return http.put(`/crm/lead/${id}/status`, { status });
};

// 分配线索
export const assignLeads = (data: LeadAssignData) => {
  return http.post('/crm/lead/assign', data);
};

// 导出线索列表
export const exportLeadList = (_params: LeadQueryParams) => {
  return http.download('/crm/lead/export', '线索列表.xlsx');
};

// 下载线索导入模板
export const downloadLeadTemplate = () => {
  return http.download('/crm/lead/import/template', '线索导入模板.xlsx');
};

// 批量导入线索
export const importLeads = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return http.post<LeadImportResult>('/crm/lead/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 获取跟进记录列表
export const getFollowRecords = (leadId: number) => {
  return http.get<FollowRecord[]>(`/crm/lead/${leadId}/follow-records`);
};

// 新增跟进记录
export const createFollowRecord = (data: FollowRecordFormData) => {
  return http.post<{ id: number }>('/crm/follow-record', data);
};

// 删除跟进记录
export const deleteFollowRecord = (id: number) => {
  return http.delete(`/crm/follow-record/${id}`);
};
