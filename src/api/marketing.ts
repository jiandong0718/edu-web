import { http } from '@/utils/request';
import type {
  FunnelStatsResponse,
  FunnelQueryParams,
  ConsultantRankingResponse,
  ConsultantQueryParams,
} from '@/types/marketing';

// 获取招生漏斗统计数据
export const getFunnelStats = (params: FunnelQueryParams) => {
  return http.get<FunnelStatsResponse>('/marketing/stats/funnel', { params });
};

// 获取顾问业绩排行
export const getConsultantRanking = (params: ConsultantQueryParams) => {
  return http.get<ConsultantRankingResponse>('/marketing/stats/consultant-ranking', { params });
};
