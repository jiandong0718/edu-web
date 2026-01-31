import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  message,
  Modal,
  Checkbox,
  Tooltip,
  Badge,
  Empty,
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  FileExcelOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { ColumnType } from 'antd/es/table';
import type { CommonTableProps, FetchParams, ColumnConfig } from './types';
import { exportToExcel, formatFileName, debounce } from './utils';
import { styles } from './styles';

export type { CommonTableProps, FetchParams, PageResult, ExportConfig } from './types';

/**
 * 通用表格组件
 * 支持分页、筛选、排序、导出、搜索、列配置等功能
 */
export function CommonTable<T extends Record<string, any>>({
  columns: propColumns,
  dataSource: propDataSource,
  loading: propLoading,
  pagination: propPagination = {},
  onFetch,
  rowKey = 'id',
  exportable = false,
  exportFileName = 'export',
  exportConfig,
  onExport,
  searchable = false,
  searchPlaceholder = '请输入搜索关键词',
  onSearch,
  rowSelection: enableRowSelection = false,
  onSelectionChange,
  toolbarRender,
  showRefresh = true,
  onRefresh,
  showColumnSetting = false,
  onChange,
  autoLoad = true,
  ...restProps
}: CommonTableProps<T>) {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataSource, setDataSource] = useState<T[]>(propDataSource || []);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [columnSettingVisible, setColumnSettingVisible] = useState(false);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([]);

  // 分页状态
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
    pageSizeOptions: ['10', '20', '50', '100'],
    ...propPagination,
  });

  // 筛选和排序状态
  const [filters, setFilters] = useState<Record<string, FilterValue | null>>({});
  const [sorter, setSorter] = useState<SorterResult<T> | SorterResult<T>[]>();

  // 初始化列配置
  useEffect(() => {
    const configs: ColumnConfig[] = propColumns.map((col) => ({
      key: col.key as string || col.dataIndex as string,
      visible: true,
      fixed: col.fixed,
    }));
    setColumnConfigs(configs);
  }, [propColumns]);

  // 根据列配置过滤列
  const visibleColumns = useMemo(() => {
    return propColumns.filter((col) => {
      const key = col.key as string || col.dataIndex as string;
      const config = columnConfigs.find((c) => c.key === key);
      return config ? config.visible : true;
    });
  }, [propColumns, columnConfigs]);

  // 加载数据
  const loadData = useCallback(
    async (params?: Partial<FetchParams>) => {
      if (!onFetch) return;

      setLoading(true);
      try {
        const fetchParams: FetchParams = {
          current: pagination.current || 1,
          pageSize: pagination.pageSize || 10,
          filters,
          sorter,
          search: searchValue,
          ...params,
        };

        const result = await onFetch(fetchParams);

        setDataSource(result.data);
        setPagination((prev) => ({
          ...prev,
          current: result.current || fetchParams.current,
          pageSize: result.pageSize || fetchParams.pageSize,
          total: result.total,
        }));
      } catch (error) {
        console.error('加载数据失败:', error);
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    },
    [onFetch, pagination.current, pagination.pageSize, filters, sorter, searchValue]
  );

  // 自动加载数据
  useEffect(() => {
    if (autoLoad && onFetch) {
      loadData();
    }
  }, []);

  // 更新外部数据源
  useEffect(() => {
    if (propDataSource) {
      setDataSource(propDataSource);
    }
  }, [propDataSource]);

  // 处理表格变化
  const handleTableChange = (
    newPagination: TablePaginationConfig,
    newFilters: Record<string, FilterValue | null>,
    newSorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    setPagination(newPagination);
    setFilters(newFilters);
    setSorter(newSorter);

    if (onChange) {
      onChange(newPagination, newFilters, newSorter);
    }

    if (onFetch) {
      loadData({
        current: newPagination.current,
        pageSize: newPagination.pageSize,
        filters: newFilters,
        sorter: newSorter,
      });
    }
  };

  // 处理搜索
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchValue(value);
      if (onSearch) {
        onSearch(value);
      }
      if (onFetch) {
        loadData({
          current: 1,
          search: value,
        });
      }
    }, 500),
    [onSearch, onFetch, loadData]
  );

  // 处理刷新
  const handleRefresh = async () => {
    if (onRefresh) {
      setLoading(true);
      try {
        await onRefresh();
        message.success('刷新成功');
      } catch (error) {
        message.error('刷新失败');
      } finally {
        setLoading(false);
      }
    } else if (onFetch) {
      await loadData();
      message.success('刷新成功');
    }
  };

  // 处理导出
  const handleExport = async () => {
    setExportLoading(true);
    try {
      if (onExport) {
        // 使用自定义导出函数
        await onExport(dataSource, exportConfig);
      } else {
        // 使用默认导出
        const fileName = formatFileName(exportConfig?.fileName || exportFileName);
        await exportToExcel(dataSource, visibleColumns, {
          ...exportConfig,
          fileName,
        });
      }
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 处理行选择
  const handleSelectionChange = (keys: React.Key[], rows: T[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
    if (onSelectionChange) {
      onSelectionChange(keys, rows);
    }
  };

  // 行选择配置
  const rowSelectionConfig = enableRowSelection
    ? {
        selectedRowKeys,
        onChange: handleSelectionChange,
        preserveSelectedRowKeys: true,
      }
    : undefined;

  // 处理列配置变化
  const handleColumnConfigChange = (key: string, visible: boolean) => {
    setColumnConfigs((prev) =>
      prev.map((config) =>
        config.key === key ? { ...config, visible } : config
      )
    );
  };

  // 重置列配置
  const handleResetColumns = () => {
    setColumnConfigs((prev) =>
      prev.map((config) => ({ ...config, visible: true }))
    );
  };

  // 自定义空状态
  const emptyState = (
    <div style={styles.emptyState}>
      <InboxOutlined style={styles.emptyIcon} />
      <div style={styles.emptyText}>暂无数据</div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* 工具栏 */}
      <div style={styles.toolbar}>
        {/* 左侧工具栏 */}
        <div style={styles.toolbarLeft}>
          {/* 搜索框 */}
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={styles.searchInput}
            />
          )}

          {/* 选中提示 */}
          {enableRowSelection && selectedRowKeys.length > 0 && (
            <Badge
              count={selectedRowKeys.length}
              style={styles.badge}
              showZero
              overflowCount={999}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.65)', marginLeft: 8 }}>
                已选择
              </span>
            </Badge>
          )}

          {/* 自定义工具栏 */}
          {toolbarRender && toolbarRender()}
        </div>

        {/* 右侧工具栏 */}
        <div style={styles.toolbarRight}>
          <Space>
            {/* 刷新按钮 */}
            {showRefresh && (
              <Tooltip title="刷新">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                  style={styles.iconButton}
                />
              </Tooltip>
            )}

            {/* 导出按钮 */}
            {exportable && (
              <Tooltip title="导出Excel">
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={handleExport}
                  loading={exportLoading}
                  disabled={dataSource.length === 0}
                  style={styles.primaryButton}
                >
                  导出
                </Button>
              </Tooltip>
            )}

            {/* 列设置按钮 */}
            {showColumnSetting && (
              <Tooltip title="列设置">
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setColumnSettingVisible(true)}
                  style={styles.iconButton}
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>

      {/* 表格 */}
      <Table<T>
        {...restProps}
        columns={visibleColumns}
        dataSource={dataSource}
        loading={loading || propLoading}
        pagination={propPagination === false ? false : pagination}
        onChange={handleTableChange}
        rowKey={rowKey}
        rowSelection={rowSelectionConfig}
        locale={{
          emptyText: emptyState,
        }}
      />

      {/* 列设置弹窗 */}
      <Modal
        title="列设置"
        open={columnSettingVisible}
        onCancel={() => setColumnSettingVisible(false)}
        onOk={() => setColumnSettingVisible(false)}
        width={400}
        footer={[
          <Button key="reset" onClick={handleResetColumns}>
            重置
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => setColumnSettingVisible(false)}
          >
            确定
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {columnConfigs.map((config) => {
            const column = propColumns.find(
              (col) => (col.key as string || col.dataIndex as string) === config.key
            );
            return (
              <div key={config.key} style={styles.columnSettingItem}>
                <Checkbox
                  checked={config.visible}
                  onChange={(e) =>
                    handleColumnConfigChange(config.key, e.target.checked)
                  }
                >
                  {column?.title as string}
                </Checkbox>
              </div>
            );
          })}
        </Space>
      </Modal>
    </div>
  );
}

export default CommonTable;
