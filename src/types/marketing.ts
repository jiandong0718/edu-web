// 营销统计类型定义

// 招生漏斗数据
export interface FunnelData {
  stage: string; // 阶段名称
  count: number; // 数量
  rate: number; // 转化率（相对于上一阶段）
}

// 招生漏斗统计响应
export interface FunnelStatsResponse {
  funnelData: FunnelData[];
  totalLeads: number; // 总线索数
  totalTrials: number; // 总试听数
  totalConversions: number; // 总转化数
  overallConversionRate: number; // 整体转化率
}

// 招生漏斗查询参数
export interface FunnelQueryParams {
  startDate?: string;
  endDate?: string;
  campusId?: number;
}

// 顾问业绩数据
export interface ConsultantPerformance {
  advisorId: number;
  advisorName: string;
  campusName: string;
  leadCount: number; // 线索数
  trialCount: number; // 试听数
  conversionCount: number; // 转化数
  conversionRate: number; // 转化率
  revenue: number; // 营收金额
}

// 顾问业绩排行响应
export interface ConsultantRankingResponse {
  rankings: ConsultantPerformance[];
  total: number;
}

// 顾问业绩查询参数
export interface ConsultantQueryParams {
  startDate?: string;
  endDate?: string;
  campusId?: number;
  sortBy?: 'conversionCount' | 'conversionRate' | 'revenue' | 'leadCount'; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
  page?: number;
  pageSize?: number;
}
