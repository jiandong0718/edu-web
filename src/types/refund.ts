// 退费申请状态
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

// 退款方式
export type RefundMethod = 'wechat' | 'alipay' | 'unionpay' | 'cash' | 'bank';

// 退费申请实体
export interface Refund {
  id: number;
  refundNo: string;
  contractId: number;
  contractNo: string;
  studentId: number;
  studentName: string;
  campusId: number;
  campusName: string;
  applyAmount: number;
  actualAmount: number;
  penaltyAmount: number;
  reason: string;
  description?: string;
  status: RefundStatus;
  applyTime: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  approveRemark?: string;
  refundTime?: string;
  refundMethod?: RefundMethod;
  refundTransactionNo?: string;
  createTime: string;
  updateTime: string;
}

// 退费金额计算结果
export interface RefundCalculation {
  contractAmount: number;
  paidAmount: number;
  totalHours: number;
  usedHours: number;
  remainingHours: number;
  pricePerHour: number;
  usedAmount: number;
  penaltyAmount: number;
  penaltyRate: number;
  refundableAmount: number;
  calculationNote: string;
}

// 退费申请查询参数
export interface RefundQueryParams {
  pageNum: number;
  pageSize: number;
  refundNo?: string;
  contractNo?: string;
  studentName?: string;
  campusId?: number;
  status?: RefundStatus;
  startDate?: string;
  endDate?: string;
}

// 退费申请列表响应
export interface RefundListResponse {
  records: Refund[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 退费申请表单数据
export interface RefundApplyFormData {
  contractId: number;
  reason: string;
  description?: string;
}

// 退费审批表单数据
export interface RefundApproveFormData {
  refundId: number;
  approveResult: 'approved' | 'rejected';
  actualAmount?: number;
  approveRemark?: string;
}
