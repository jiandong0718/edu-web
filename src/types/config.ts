// 系统参数类型
export type ConfigType = 'string' | 'number' | 'boolean' | 'json';

// 系统参数分类
export type ConfigCategory = 'system' | 'upload' | 'security' | 'notification' | 'business';

// 系统参数实体
export interface SystemConfig {
  id: number;
  configKey: string;
  configValue: string;
  configName: string;
  configType: ConfigType;
  category: ConfigCategory;
  description?: string;
  isSystem: boolean;
  sortOrder: number;
  status: 0 | 1; // 0-禁用 1-启用
  createTime: string;
  updateTime?: string;
}

// 系统参数查询参数
export interface ConfigQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: ConfigCategory;
  configType?: ConfigType;
  status?: 0 | 1;
}

// 系统参数列表响应
export interface ConfigListResponse {
  code: number;
  msg: string;
  data: {
    list: SystemConfig[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 系统参数表单数据
export interface ConfigFormData {
  configKey: string;
  configValue: string;
  configName: string;
  configType: ConfigType;
  category: ConfigCategory;
  description?: string;
  sortOrder?: number;
  status?: 0 | 1;
}

// 系统参数统计数据
export interface ConfigStatistics {
  total: number;
  systemCount: number;
  customCount: number;
  enabledCount: number;
  disabledCount: number;
  categoryStats: {
    category: ConfigCategory;
    count: number;
  }[];
}
