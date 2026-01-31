import type { TableProps, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { ColumnType } from 'antd/es/table';

/**
 * 分页配置
 */
export interface PaginationConfig extends TablePaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
}

/**
 * 请求参数
 */
export interface FetchParams {
  current: number;
  pageSize: number;
  filters?: Record<string, FilterValue | null>;
  sorter?: SorterResult<any> | SorterResult<any>[];
  search?: string;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  data: T[];
  total: number;
  current?: number;
  pageSize?: number;
}

/**
 * 列配置项
 */
export interface ColumnConfig {
  key: string;
  visible: boolean;
  fixed?: 'left' | 'right' | boolean;
}

/**
 * 导出配置
 */
export interface ExportConfig {
  fileName?: string;
  sheetName?: string;
  columns?: string[]; // 要导出的列key
}

/**
 * CommonTable组件Props
 */
export interface CommonTableProps<T extends Record<string, any>> extends Omit<TableProps<T>, 'onChange' | 'rowSelection'> {
  // 列定义
  columns: ColumnType<T>[];

  // 数据源（静态数据）
  dataSource?: T[];

  // 加载状态
  loading?: boolean;

  // 分页配置
  pagination?: PaginationConfig | false;

  // 数据获取函数（动态数据）
  onFetch?: (params: FetchParams) => Promise<PageResult<T>>;

  // 行key
  rowKey?: string | ((record: T) => string);

  // 是否可导出
  exportable?: boolean;

  // 导出文件名
  exportFileName?: string;

  // 导出配置
  exportConfig?: ExportConfig;

  // 自定义导出函数
  onExport?: (data: T[], config?: ExportConfig) => Promise<void> | void;

  // 是否显示搜索框
  searchable?: boolean;

  // 搜索框占位符
  searchPlaceholder?: string;

  // 搜索回调
  onSearch?: (value: string) => void;

  // 是否支持行选择
  rowSelection?: boolean | TableProps<T>['rowSelection'];

  // 选择变化回调
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;

  // 自定义工具栏
  toolbarRender?: () => React.ReactNode;

  // 是否显示刷新按钮
  showRefresh?: boolean;

  // 刷新回调
  onRefresh?: () => Promise<void> | void;

  // 是否显示列设置
  showColumnSetting?: boolean;

  // 表格变化回调
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => void;

  // 是否自动加载数据
  autoLoad?: boolean;
}
