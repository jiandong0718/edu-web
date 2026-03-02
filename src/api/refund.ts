import { http } from '@/utils/request';
import type {
  Refund,
  RefundQueryParams,
  RefundListResponse,
  RefundApplyFormData,
  RefundApproveFormData,
  RefundCalculation,
} from '@/types/refund';

// 分页查询退费申请列表
export const getRefundList = (params: RefundQueryParams) => {
  return http.get<RefundListResponse>('/finance/refund/page', { params });
};

// 获取退费申请详情
export const getRefundDetail = (id: number) => {
  return http.get<Refund>(`/finance/refund/${id}`);
};

// 计算退费金额
export const calculateRefundAmount = (contractId: number) => {
  return http.get<RefundCalculation>(`/finance/refund/calculate/${contractId}`);
};

// 提交退费申请
export const applyRefund = (data: RefundApplyFormData) => {
  return http.post<{ data: number }>('/finance/refund/apply', data);
};

// 审批退费申请
export const approveRefund = (data: RefundApproveFormData) => {
  return http.post<{ data: boolean }>('/finance/refund/approve', data);
};

// 执行退款
export const executeRefund = (id: number) => {
  return http.post<{ data: boolean }>(`/finance/refund/${id}/execute`);
};

// 删除退费申请
export const deleteRefund = (id: number) => {
  return http.delete(`/finance/refund/${id}`);
};
