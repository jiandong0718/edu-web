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
  ContractApproval,
  ContractApprovalFlow,
  ContractApprovalSubmitData,
  ContractApprovalProcessData,
  ContractPrintRecord,
  ContractPrintTemplate,
  ContractPrintData,
} from '@/types/contract';

interface BackendContractItem {
  id: number;
  contractId: number;
  courseId: number;
  courseName?: string;
  quantity?: number;
  hours?: number;
  unitPrice: number;
  amount: number;
}

interface BackendContract {
  id: number;
  contractNo: string;
  studentId: number;
  studentName?: string;
  studentPhone?: string;
  campusId: number;
  campusName?: string;
  type?: string;
  amount?: number;
  paidAmount?: number;
  receivedAmount?: number;
  discountAmount?: number;
  totalHours?: number;
  signDate?: string;
  effectiveDate?: string;
  expireDate?: string;
  status?: string;
  salesId?: number;
  salesName?: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

interface BackendPaymentRecord {
  id: number;
  contractId: number;
  paymentNo: string;
  amount: number;
  paymentMethod: PaymentRecord['paymentMethod'];
  payTime?: string;
  receiverId?: number;
  receiverName?: string;
  createTime: string;
  remark?: string;
}

interface BackendHourAccount {
  id: number;
  contractId: number;
  studentId: number;
  courseId: number;
  totalHours: number;
  usedHours: number;
  remainingHours: number;
  giftHours?: number;
  status: string;
}

interface BackendRefundApplication {
  id: number;
  contractId: number;
  contractNo?: string;
  studentName?: string;
  applyAmount?: number;
  reason?: string;
  applyTime?: string;
  status: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  approveRemark?: string;
  createTime: string;
}

type ContractWithHours = Contract & {
  totalHours?: number;
  remainingHours?: number;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBackendContractStatus = (value?: Contract['status']) => {
  if (!value) return undefined;
  if (value === 'active') return 'signed';
  if (value === 'terminated') return 'cancelled';
  return value;
};

const toBackendContractType = (value?: Contract['type']) => {
  if (!value) return undefined;
  if (value === 'regular') return 'new';
  if (value === 'package') return 'upgrade';
  return 'trial';
};

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return (payload as { data?: T }).data as T;
  }
  return payload as T;
};

const unwrapList = <T>(payload: unknown): T[] => {
  const value = unwrap<unknown>(payload);
  return Array.isArray(value) ? (value as T[]) : [];
};

const unwrapNullableList = <T>(payload: unknown): Array<T | null> => {
  const value = unwrap<unknown>(payload);
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => (item == null ? null : (item as T)));
};

const toFrontendContractType = (value: unknown): Contract['type'] => {
  const type = String(value ?? '').toLowerCase();
  if (type === 'trial') return 'trial';
  if (type === 'package' || type === 'upgrade') return 'package';
  return 'regular';
};

const toFrontendContractStatus = (value: unknown): Contract['status'] => {
  const status = String(value ?? '').toLowerCase();
  if (status === 'signed' || status === 'active') return 'active';
  if (status === 'completed' || status === 'expired') return 'expired';
  if (status === 'cancelled') return 'terminated';
  if (status === 'refunded') return 'refunded';
  return 'draft';
};

const mapContract = (contract: BackendContract): ContractWithHours => ({
  id: contract.id,
  contractNo: contract.contractNo,
  studentId: contract.studentId,
  studentName: contract.studentName || '-',
  studentAvatar: undefined,
  studentPhone: contract.studentPhone || '',
  parentName: '',
  parentPhone: '',
  campusId: contract.campusId,
  campusName: contract.campusName || '-',
  type: toFrontendContractType(contract.type),
  status: toFrontendContractStatus(contract.status),
  totalAmount: toNumber(contract.amount),
  paidAmount: toNumber(contract.receivedAmount),
  refundAmount: 0,
  discountAmount: toNumber(contract.discountAmount),
  totalHours: toNumber(contract.totalHours),
  signDate: contract.signDate || '',
  startDate: contract.effectiveDate || '',
  endDate: contract.expireDate || '',
  salesPersonId: toNumber(contract.salesId),
  salesPersonName: contract.salesName || '-',
  remark: contract.remark,
  createTime: contract.createTime,
  updateTime: contract.updateTime,
});

const mapContractItem = (item: BackendContractItem): ContractItem => {
  const quantity = toNumber(item.quantity ?? item.hours, 0);
  const originalPrice = toNumber(item.unitPrice) * quantity;
  const totalPrice = toNumber(item.amount);
  const discountAmount = Math.max(0, originalPrice - totalPrice);
  return {
    id: item.id,
    contractId: item.contractId,
    courseId: item.courseId,
    courseName: item.courseName || `课程#${item.courseId}`,
    quantity,
    unitPrice: toNumber(item.unitPrice),
    totalPrice: originalPrice,
    discountAmount,
    finalPrice: totalPrice,
    usedQuantity: 0,
    remainingQuantity: quantity,
  };
};

const mapPaymentRecord = (payment: BackendPaymentRecord): PaymentRecord => ({
  id: payment.id,
  contractId: payment.contractId,
  paymentNo: payment.paymentNo,
  amount: toNumber(payment.amount),
  paymentMethod: payment.paymentMethod,
  paymentDate: payment.payTime || payment.createTime,
  receiverId: payment.receiverId || 0,
  receiverName: payment.receiverName || '-',
  remark: payment.remark,
  createTime: payment.createTime,
});

const mapRefundApplication = (refund: BackendRefundApplication): RefundApplication => ({
  id: refund.id,
  contractId: refund.contractId,
  contractNo: refund.contractNo || '-',
  studentName: refund.studentName || '-',
  refundAmount: toNumber(refund.applyAmount),
  refundReason: refund.reason || '-',
  refundDate: refund.applyTime || refund.createTime,
  status: (refund.status === 'refunded' ? 'completed' : refund.status) as RefundApplication['status'],
  applicantId: 0,
  applicantName: '-',
  approverId: refund.approverId,
  approverName: refund.approverName,
  approveDate: refund.approveTime,
  approveRemark: refund.approveRemark,
  createTime: refund.createTime,
});

const normalizeContractPage = (raw: unknown, params: ContractQueryParams): ContractListResponse => {
  const payload = (unwrap<unknown>(raw) ?? {}) as Record<string, unknown>;
  const records = Array.isArray(payload.records)
    ? payload.records
    : Array.isArray(payload.list)
      ? payload.list
      : [];

  return {
    list: records.map((item) => mapContract(item as BackendContract)),
    total: toNumber(payload.total, records.length),
    page: toNumber(payload.current ?? payload.page, params.page),
    pageSize: toNumber(payload.size ?? payload.pageSize, params.pageSize),
  };
};

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

// 获取合同列表
export const getContractList = async (params: ContractQueryParams) => {
  const response = await http.get<unknown>('/finance/contract/page', {
    params: {
      pageNum: params.page,
      pageSize: params.pageSize,
      contractNo: params.contractNo,
      studentName: params.studentName,
      studentPhone: params.studentPhone,
      campusId: params.campusId,
      status: toBackendContractStatus(params.status),
      type: toBackendContractType(params.type),
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
  return normalizeContractPage(response, params);
};

// 获取合同详情
export const getContractDetail = async (id: number) => {
  const response = await http.get<unknown>(`/finance/contract/${id}`);
  return mapContract(unwrap<BackendContract>(response));
};

// 新增合同
export const createContract = async (data: ContractFormData) => {
  return unwrap<boolean>(await http.post<unknown>('/finance/contract', {
    studentId: data.studentId,
    campusId: data.campusId,
    type: toBackendContractType(data.type),
    signDate: data.signDate,
    startDate: data.startDate,
    endDate: data.endDate,
    salesPersonId: data.salesPersonId,
    items: data.items,
    remark: data.remark,
  }));
};

// 编辑合同
export const updateContract = async (id: number, data: ContractFormData) => {
  return unwrap<boolean>(await http.put<unknown>(`/finance/contract/${id}`, {
    studentId: data.studentId,
    campusId: data.campusId,
    type: toBackendContractType(data.type),
    signDate: data.signDate,
    startDate: data.startDate,
    endDate: data.endDate,
    salesPersonId: data.salesPersonId,
    items: data.items,
    remark: data.remark,
  }));
};

// 删除合同
export const deleteContract = (id: number) => {
  return http.delete(`/finance/contract/${id}`);
};

// 作废合同
export const cancelContract = (id: number) => {
  return http.put(`/finance/contract/${id}/cancel`);
};

// 获取合同明细列表
export const getContractItems = async (contractId: number) => {
  const items = unwrapList<BackendContractItem>(
    await http.get<unknown>(`/finance/contract/${contractId}/items`)
  );
  return items.map(mapContractItem);
};

// 获取收款记录列表
export const getPaymentRecords = async (contractId: number) => {
  const payments = unwrapList<BackendPaymentRecord>(
    await http.get<unknown>(`/finance/contract/${contractId}/payments`)
  );
  return payments.map(mapPaymentRecord);
};

// 新增收款记录
export const createPayment = (data: PaymentFormData) => {
  return http.post('/finance/payment', {
    contractId: data.contractId,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    payTime: data.paymentDate,
    remark: data.remark,
  });
};

// 获取课时账户信息
export const getHourAccounts = async (contractId: number) => {
  const [accounts, items] = await Promise.all([
    http.get<unknown>(`/finance/contract/${contractId}/hour-accounts`),
    getContractItems(contractId),
  ]);

  const courseNameMap = new Map(items.map((item) => [item.courseId, item.courseName]));

  return unwrapList<BackendHourAccount>(accounts).map((account) => ({
    id: account.id,
    studentId: account.studentId,
    courseId: account.courseId,
    courseName: courseNameMap.get(account.courseId) || `课程#${account.courseId}`,
    totalHours: toNumber(account.totalHours),
    usedHours: toNumber(account.usedHours),
    remainingHours: toNumber(account.remainingHours),
    giftHours: toNumber(account.giftHours),
    expireDate: '',
    status: (account.status === 'exhausted' ? 'expired' : account.status) as HourAccount['status'],
  }));
};

// 获取退费申请列表
export const getRefundApplications = async (contractId: number) => {
  const refunds = unwrapList<BackendRefundApplication>(
    await http.get<unknown>(`/finance/contract/${contractId}/refunds`)
  );
  return refunds.map(mapRefundApplication);
};

// 下载合同
export const downloadContract = (id: number) => {
  return http.download(`/finance/contract/${id}/download`, `合同_${id}.pdf`);
};

// 导出合同列表
export const exportContractList = async (params: ContractQueryParams) => {
  const response = await getContractList({
    ...params,
    page: 1,
    pageSize: 2000,
  });
  const rows: Array<Array<string | number>> = [
    ['合同编号', '学生', '校区', '状态', '合同金额', '已付金额', '签约日期', '有效期开始', '有效期结束'],
    ...response.list.map((item) => [
      item.contractNo,
      item.studentName,
      item.campusName,
      item.status,
      item.totalAmount,
      item.paidAmount,
      item.signDate,
      item.startDate,
      item.endDate,
    ]),
  ];
  downloadCsv('合同列表.csv', rows);
};

// ==================== 审批相关接口 ====================

// 提交审批
export const submitApproval = async (data: ContractApprovalSubmitData) => {
  return unwrap<number>(await http.post<unknown>('/finance/contract/approval/submit', data));
};

// 处理审批
export const processApproval = async (data: ContractApprovalProcessData) => {
  return unwrap<boolean>(await http.post<unknown>('/finance/contract/approval/process', data));
};

// 撤销审批
export const cancelApproval = async (id: number) => {
  return unwrap<boolean>(await http.post<unknown>(`/finance/contract/approval/${id}/cancel`));
};

// 获取审批历史
export const getApprovalHistory = async (contractId: number) => {
  return unwrapList<ContractApproval>(
    await http.get<unknown>(`/finance/contract/${contractId}/approval/history`)
  );
};

// 获取审批流程
export const getApprovalFlow = async (approvalId: number) => {
  return unwrapList<ContractApprovalFlow>(
    await http.get<unknown>(`/finance/contract/approval/${approvalId}/flow`)
  );
};

// 获取待审批列表
export const getPendingApprovals = async () => {
  return unwrapList<ContractApproval>(
    await http.get<unknown>('/finance/contract/approval/pending')
  );
};

// ==================== 打印相关接口 ====================

// 打印合同
export const printContract = async (data: ContractPrintData) => {
  return unwrap<number>(await http.post<unknown>('/finance/contract/print', data));
};

// 批量打印合同
export const batchPrintContracts = async (contractIds: number[], templateId?: number) => {
  return unwrapNullableList<number>(
    await http.post<unknown>('/finance/contract/print/batch', null, {
      params: { contractIds, templateId },
    })
  );
};

// 获取打印记录
export const getPrintRecords = async (contractId: number) => {
  return unwrapList<ContractPrintRecord>(
    await http.get<unknown>(`/finance/contract/${contractId}/print/records`)
  );
};

// 获取打印模板列表
export const getPrintTemplates = async () => {
  return unwrapList<ContractPrintTemplate>(
    await http.get<unknown>('/finance/contract/print/templates')
  );
};

// 预览打印内容
export const previewPrint = async (contractId: number, templateId?: number) => {
  return unwrap<string>(
    await http.get<unknown>(`/finance/contract/${contractId}/print/preview`, {
      params: { templateId },
    })
  );
};
