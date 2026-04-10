import { http } from '@/utils/request';
import type {
  FunnelStatsResponse,
  FunnelQueryParams,
  ConsultantPerformance,
  ConsultantRankingResponse,
  ConsultantQueryParams,
} from '@/types/marketing';

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object') {
    const envelope = payload as ApiEnvelope<T>;
    if (Object.prototype.hasOwnProperty.call(envelope, 'data') && Object.prototype.hasOwnProperty.call(envelope, 'code')) {
      return envelope.data as T;
    }
  }
  return payload as T;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const toStartTime = (date?: string) => (date ? `${date} 00:00:00` : undefined);
const toEndTime = (date?: string) => (date ? `${date} 23:59:59` : undefined);

const mapOrderBy = (sortBy?: ConsultantQueryParams['sortBy']) => {
  switch (sortBy) {
    case 'leadCount':
      return 'totalLeadCount';
    case 'revenue':
      return 'conversionAmount';
    case 'conversionRate':
      return 'conversionRate';
    case 'conversionCount':
    default:
      return 'conversionCount';
  }
};

const normalizeFunnel = (raw: unknown): FunnelStatsResponse => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const newLeadCount = toNumber(data.newLeadCount);
  const followingCount = toNumber(data.followingCount);
  const appointedCount = toNumber(data.appointedCount);
  const trialedCount = toNumber(data.trialedCount);
  const convertedCount = toNumber(data.convertedCount);
  const lostCount = toNumber(data.lostCount);

  const stages = [
    { stage: '新线索', count: newLeadCount },
    { stage: '跟进中', count: followingCount },
    { stage: '已预约', count: appointedCount },
    { stage: '已试听', count: trialedCount },
    { stage: '已成交', count: convertedCount },
  ];

  const funnelData = stages.map((item, index) => {
    if (index === 0) return { ...item, rate: 100 };
    const prevCount = stages[index - 1].count;
    const rate = prevCount > 0 ? Number(((item.count / prevCount) * 100).toFixed(1)) : 0;
    return { ...item, rate };
  });

  const totalLeads = newLeadCount + followingCount + appointedCount + trialedCount + convertedCount + lostCount;

  return {
    funnelData,
    totalLeads,
    totalTrials: trialedCount,
    totalConversions: convertedCount,
    overallConversionRate: toNumber(data.overallRate),
  };
};

const normalizeRanking = (raw: unknown, params: ConsultantQueryParams): ConsultantRankingResponse => {
  const list = Array.isArray(raw) ? raw : [];

  const normalized: ConsultantPerformance[] = list.map((item) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      advisorId: toNumber(row.advisorId),
      advisorName: String(row.advisorName ?? ''),
      campusName: String(row.campusName ?? ''),
      leadCount: toNumber(row.totalLeadCount ?? row.leadCount),
      trialCount: toNumber(row.trialCount),
      conversionCount: toNumber(row.conversionCount),
      conversionRate: toNumber(row.conversionRate),
      revenue: toNumber(row.conversionAmount ?? row.revenue),
    };
  });

  const sortBy = params.sortBy ?? 'conversionCount';
  const sortOrder = params.sortOrder ?? 'desc';
  const sorted = [...normalized].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortOrder === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
  });

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const rankings = sorted.slice(start, start + pageSize);

  return {
    rankings,
    total: sorted.length,
  };
};

// 获取招生漏斗统计数据
export const getFunnelStats = async (params: FunnelQueryParams): Promise<FunnelStatsResponse> => {
  const response = await http.get<unknown>('/marketing/statistics/conversion-funnel', {
    params: {
      campusId: params.campusId,
      startTime: toStartTime(params.startDate),
      endTime: toEndTime(params.endDate),
    },
  });
  return normalizeFunnel(unwrap<unknown>(response));
};

// 获取顾问业绩排行
export const getConsultantRanking = async (params: ConsultantQueryParams): Promise<ConsultantRankingResponse> => {
  const response = await http.get<unknown>('/marketing/statistics/advisor-performance', {
    params: {
      campusId: params.campusId,
      startTime: toStartTime(params.startDate),
      endTime: toEndTime(params.endDate),
      orderBy: mapOrderBy(params.sortBy),
      orderDirection: params.sortOrder ?? 'desc',
    },
  });
  return normalizeRanking(unwrap<unknown>(response), params);
};
