// 合同类型定义

// 合同状态
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'refunded';

// 合同类型
export type ContractType = 'regular' | 'trial' | 'package';

// 合同基本信息
export interface Contract {
  id: number;
  contractNo: string;
  studentId: number;
  studentName: string;
  studentAvatar?: string;
  studentPhone: string;
  parentName: string;
  parentPhone: string;
  campusId: number;
  campusName: string;
  type: ContractType;
  status: ContractStatus;
  totalAmount: number;
  paidAmount: number;
  refundAmount: number;
  discountAmount: number;
  signDate: string;
  startDate: string;
  endDate: string;
  salesPersonId: number;
  salesPersonName: string;
  remark?: string;
  createTime: string;
  updateTime: string;
}

// 合同明细
export interface ContractItem {
  id: number;
  contractId: number;
  courseId: number;
  courseName: string;
  coursePackageId?: number;
  coursePackageName?: string;
  quantity: number; // 数量（课时数）
  unitPrice: number; // 单价
  totalPrice: number; // 总价
  discountAmount: number; // 优惠金额
  finalPrice: number; // 实付金额
  usedQuantity: number; // 已使用课时
  remainingQuantity: number; // 剩余课时
  remark?: string;
}

// 收款记录
export interface PaymentRecord {
  id: number;
  contractId: number;
  paymentNo: string;
  amount: number;
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'bank_transfer' | 'pos';
  paymentDate: string;
  receiverId: number;
  receiverName: string;
  remark?: string;
  createTime: string;
}

// 课时账户信息
export interface HourAccount {
  id: number;
  studentId: number;
  courseId: number;
  courseName: string;
  totalHours: number; // 总课时
  usedHours: number; // 已用课时
  remainingHours: number; // 剩余课时
  frozenHours: number; // 冻结课时
  expireDate: string;
  status: 'active' | 'expired' | 'frozen';
}

// 退费申请
export interface RefundApplication {
  id: number;
  contractId: number;
  contractNo: string;
  studentName: string;
  refundAmount: number;
  refundReason: string;
  refundDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  applicantId: number;
  applicantName: string;
  approverId?: number;
  approverName?: string;
  approveDate?: string;
  approveRemark?: string;
  createTime: string;
}

// 合同列表查询参数
export interface ContractQueryParams {
  page: number;
  pageSize: number;
  contractNo?: string;
  studentName?: string;
  studentPhone?: string;
  campusId?: number;
  status?: ContractStatus;
  type?: ContractType;
  startDate?: string;
  endDate?: string;
}

// 合同列表响应
export interface ContractListResponse {
  list: Contract[];
  total: number;
  page: number;
  pageSize: number;
}

// 合同新增/编辑参数
export interface ContractFormData {
  id?: number;
  studentId: number;
  campusId: number;
  type: ContractType;
  signDate: string;
  startDate: string;
  endDate: string;
  salesPersonId: number;
  items: Array<{
    courseId: number;
    coursePackageId?: number;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
  }>;
  remark?: string;
}

// 收款参数
export interface PaymentFormData {
  contractId: number;
  amount: number;
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'bank_transfer' | 'pos';
  paymentDate: string;
  remark?: string;
}

// 退费申请参数
export interface RefundFormData {
  contractId: number;
  refundAmount: number;
  refundReason: string;
  refundDate: string;
}

// 合同审批记录
export interface ContractApproval {
  id: number;
  contractId: number;
  contractNo: string;
  approvalNo: string;
  approvalType: 'contract' | 'change' | 'cancel';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submitterId: number;
  submitterName: string;
  submitTime: string;
  submitReason?: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  approveRemark?: string;
  currentStep: number;
  totalSteps: number;
  createTime: string;
}

// 合同审批流程
export interface ContractApprovalFlow {
  id: number;
  approvalId: number;
  stepNo: number;
  approverId: number;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approveTime?: string;
  approveRemark?: string;
  createTime: string;
}

// 合同审批提交参数
export interface ContractApprovalSubmitData {
  contractId: number;
  approvalType: 'contract' | 'change' | 'cancel';
  submitReason?: string;
}

// 合同审批处理参数
export interface ContractApprovalProcessData {
  approvalId: number;
  result: 'approved' | 'rejected';
  approveRemark?: string;
}

// 合同打印记录
export interface ContractPrintRecord {
  id: number;
  contractId: number;
  contractNo: string;
  printNo: string;
  templateId?: number;
  templateName?: string;
  printType: 'pdf' | 'paper';
  printCount: number;
  fileUrl?: string;
  printerId: number;
  printerName: string;
  printTime: string;
  remark?: string;
  createTime: string;
}

// 合同打印模板
export interface ContractPrintTemplate {
  id: number;
  templateName: string;
  templateCode: string;
  templateType: 'default' | 'custom';
  templateContent?: string;
  pageSize: string;
  pageOrientation: 'portrait' | 'landscape';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  isDefault: boolean;
  status: 'active' | 'inactive';
  sortOrder: number;
  remark?: string;
}

// 合同打印参数
export interface ContractPrintData {
  contractId: number;
  templateId?: number;
  printType?: 'pdf' | 'paper';
  printCount?: number;
  remark?: string;
}
