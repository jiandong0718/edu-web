import { http } from '@/utils/request';
import type {
  Contract,
  ContractQueryParams,
  ContractListResponse,
  ContractFormData,
  ContractItem,
  PaymentRecord,
  HourAccount,
  RefundApplication,
  PaymentFormData,
  RefundFormData,
  ContractApproval,
  ContractApprovalFlow,
  ContractApprovalSubmitData,
  ContractApprovalProcessData,
  ContractPrintRecord,
  ContractPrintTemplate,
  ContractPrintData,
} from '@/types/contract';

// 获取合同列表
export const getContractList = (params: ContractQueryParams) => {
  return http.get<ContractListResponse>('/finance/contract/list', { params });
};

// 获取合同详情
export const getContractDetail = (id: number) => {
  return http.get<Contract>(`/finance/contract/${id}`);
};

// 新增合同
export const createContract = (data: ContractFormData) => {
  return http.post<{ id: number }>('/finance/contract', data);
};

// 编辑合同
export const updateContract = (id: number, data: ContractFormData) => {
  return http.put(`/finance/contract/${id}`, data);
};

// 删除合同
export const deleteContract = (id: number) => {
  return http.delete(`/finance/contract/${id}`);
};

// 获取合同明细列表
export const getContractItems = (contractId: number) => {
  return http.get<ContractItem[]>(`/finance/contract/${contractId}/items`);
};

// 获取收款记录列表
export const getPaymentRecords = (contractId: number) => {
  return http.get<PaymentRecord[]>(`/finance/contract/${contractId}/payments`);
};

// 新增收款记录
export const createPayment = (data: PaymentFormData) => {
  return http.post('/finance/contract/payment', data);
};

// 获取课时账户信息
export const getHourAccounts = (contractId: number) => {
  return http.get<HourAccount[]>(`/finance/contract/${contractId}/hour-accounts`);
};

// 申请退费
export const applyRefund = (data: RefundFormData) => {
  return http.post('/finance/contract/refund/apply', data);
};

// 获取退费申请列表
export const getRefundApplications = (contractId: number) => {
  return http.get<RefundApplication[]>(`/finance/contract/${contractId}/refunds`);
};

// 下载合同
export const downloadContract = (id: number) => {
  return http.download(`/finance/contract/${id}/download`, `合同_${id}.pdf`);
};

// 导出合同列表
export const exportContractList = (params: ContractQueryParams) => {
  return http.download('/finance/contract/export', '合同列表.xlsx', { params });
};

// ==================== 审批相关接口 ====================

// 提交审批
export const submitApproval = (data: ContractApprovalSubmitData) => {
  return http.post<number>('/finance/contract/approval/submit', data);
};

// 处理审批
export const processApproval = (data: ContractApprovalProcessData) => {
  return http.post<boolean>('/finance/contract/approval/process', data);
};

// 撤销审批
export const cancelApproval = (id: number) => {
  return http.post<boolean>(`/finance/contract/approval/${id}/cancel`);
};

// 获取审批历史
export const getApprovalHistory = (contractId: number) => {
  return http.get<ContractApproval[]>(`/finance/contract/${contractId}/approval/history`);
};

// 获取审批流程
export const getApprovalFlow = (approvalId: number) => {
  return http.get<ContractApprovalFlow[]>(`/finance/contract/approval/${approvalId}/flow`);
};

// 获取待审批列表
export const getPendingApprovals = () => {
  return http.get<ContractApproval[]>('/finance/contract/approval/pending');
};

// ==================== 打印相关接口 ====================

// 打印合同
export const printContract = (data: ContractPrintData) => {
  return http.post<number>('/finance/contract/print', data);
};

// 批量打印合同
export const batchPrintContracts = (contractIds: number[], templateId?: number) => {
  return http.post<number[]>('/finance/contract/print/batch', { contractIds, templateId });
};

// 获取打印记录
export const getPrintRecords = (contractId: number) => {
  return http.get<ContractPrintRecord[]>(`/finance/contract/${contractId}/print/records`);
};

// 获取打印模板列表
export const getPrintTemplates = () => {
  return http.get<ContractPrintTemplate[]>('/finance/contract/print/templates');
};

// 预览打印内容
export const previewPrint = (contractId: number, templateId?: number) => {
  return http.get<string>(`/finance/contract/${contractId}/print/preview`, {
    params: { templateId },
  });
};
