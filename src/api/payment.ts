import { http } from '@/utils/request';
import type { AxiosResponse } from 'axios';

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

export interface PaymentPageResult {
  records?: Payment[];
  list?: Payment[];
  total?: number;
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
  return http.get<PaymentPageResult | { data?: PaymentPageResult }>('/finance/payment/page', { params });
}

/**
 * 获取收款详情
 */
export function getPaymentDetail(id: number) {
  return http.get(`/finance/payment/${id}`);
}

/**
 * 创建收款记录
 */
export function createPayment(data: Partial<Payment>) {
  return http.post('/finance/payment', data);
}

/**
 * 确认收款
 */
export function confirmPayment(id: number, transactionNo?: string) {
  return http.put(`/finance/payment/${id}/confirm`, null, {
    params: { transactionNo },
  });
}

/**
 * 获取收据详情
 */
export function getReceiptDetail(paymentId: number) {
  return http.get<ReceiptDetail | { data?: ReceiptDetail }>(`/finance/payment/receipt/${paymentId}`);
}

/**
 * 生成收据PDF
 */
export function generateReceiptPdf(paymentId: number) {
  return http.post<string>('/finance/payment/receipt/generate', null, {
    params: { paymentId },
  });
}

/**
 * 下载收据PDF
 */
export function downloadReceiptPdf(paymentId: number) {
  return http.get<AxiosResponse<Blob>>(`/finance/payment/receipt/download/${paymentId}`, {
    responseType: 'blob',
  });
}

/**
 * 预览收据
 */
export function previewReceipt(paymentId: number) {
  return http.get<string>(`/finance/payment/receipt/preview/${paymentId}`);
}

/**
 * 批量生成收据PDF
 */
export function generateBatchReceiptPdf(paymentIds: number[]) {
  return http.post<string>('/finance/payment/receipt/batch/generate', paymentIds);
}

/**
 * 批量下载收据PDF
 */
export function downloadBatchReceiptPdf(paymentIds: number[]) {
  return http.post<AxiosResponse<Blob>>('/finance/payment/receipt/batch/download', paymentIds, {
    responseType: 'blob',
  });
}
