import { http } from '@/utils/request';
import type { Campus } from '@/components/CampusSwitch';

// 校区列表响应
export interface CampusListResponse {
  list: Campus[];
  total: number;
}

// 获取校区列表（全量，用于下拉选择）
export const getCampusList = () => {
  return http.get<CampusListResponse>('/campus/list', {
    params: { pageSize: 999, status: 'active' },
  });
};
