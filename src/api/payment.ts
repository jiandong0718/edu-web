import request from '@/utils/request';

/**
 * 收款记录
 */
export interface Payment {
  id: number;
  paymentNo: string;
  contractId: number;
  studentId: number;
  campusId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  payTime: string;
  transactionNo?: string;
  receiverId?: number;
  remark?: string;
  createTime: string;
  updateTime: string;
}

/**
 * 收据详情
 */
export interface ReceiptDetail {
  receiptNo: string;
  paymentDate: string;
  studentInfo: {
    name: string;
    phone: string;
    studentNo: string;
  };
  paymentItem: {
    name: string;
    quantity: number;
    unitPrice: number;
    contractNo: string;
  };
  amount: number;
  amountInWords: string;
  paymentMethod: string;
  receiver: string;
  institutionInfo: {
    name: string;
    address: string;
    phone: string;
    campusName: string;
  };
  remark?: string;
}

/**
 * 分页查询收款记录
 */
export function getPaymentPage(params: {
  pageNum: number;
  pageSize: number;
  contractId?: number;
  studentId?: number;
  status?: string;
}) {
  return request.get('/finance/payment/page', { params });
}

/**
 * 获取收款详情
 */
export function getPaymentDetail(id: number) {
  return request.get(`/finance/payment/${id}`);
}

/**
 * 创建收款记录
 */
export function createPayment(data: Partial<Payment>) {
  return request.post('/finance/payment', data);
}

/**
 * 确认收款
 */
export function confirmPayment(id: number, transactionNo?: string) {
  return request.put(`/finance/payment/${id}/confirm`, null, {
    params: { transactionNo },
  });
}

/**
 * 获取收据详情
 */
export function getReceiptDetail(paymentId: number) {
  return request.get<ReceiptDetail>(`/finance/payment/receipt/${paymentId}`);
}

/**
 * 生成收据PDF
 */
export function generateReceiptPdf(paymentId: number) {
  return request.post<string>('/finance/payment/receipt/generate', null, {
    params: { paymentId },
  });
}

/**
 * 下载收据PDF
 */
export function downloadReceiptPdf(paymentId: number) {
  return request.get(`/finance/payment/receipt/download/${paymentId}`, {
    responseType: 'blob',
  });
}

/**
 * 预览收据
 */
export function previewReceipt(paymentId: number) {
  return request.get<string>(`/finance/payment/receipt/preview/${paymentId}`);
}

/**
 * 批量生成收据PDF
 */
export function generateBatchReceiptPdf(paymentIds: number[]) {
  return request.post<string>('/finance/payment/receipt/batch/generate', paymentIds);
}

/**
 * 批量下载收据PDF
 */
export function downloadBatchReceiptPdf(paymentIds: number[]) {
  return request.post('/finance/payment/receipt/batch/download', paymentIds, {
    responseType: 'blob',
  });
}
