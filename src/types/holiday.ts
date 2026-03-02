// 节假日类型
export type HolidayType = 'legal' | 'compensatory' | 'company';

// 节假日状态
export type HolidayStatus = 'enabled' | 'disabled';

// 节假日实体
export interface Holiday {
  id: number;
  name: string;
  type: HolidayType;
  startDate: string;
  endDate: string;
  days: number;
  status: HolidayStatus;
  remark?: string;
  createTime: string;
  updateTime?: string;
}

// 节假日查询参数
export interface HolidayQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: HolidayType;
  status?: HolidayStatus;
  year?: number;
  startDate?: string;
  endDate?: string;
}

// 节假日列表响应
export interface HolidayListResponse {
  code: number;
  msg: string;
  data: {
    list: Holiday[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 节假日表单数据
export interface HolidayFormData {
  name: string;
  type: HolidayType;
  startDate: string;
  endDate: string;
  status?: HolidayStatus;
  remark?: string;
}

// 节假日统计数据
export interface HolidayStatistics {
  total: number;
  legalCount: number;
  compensatoryCount: number;
  companyCount: number;
  totalDays: number;
}
