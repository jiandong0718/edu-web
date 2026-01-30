import { useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

export interface CommonTableProps<T> extends Omit<TableProps<T>, 'onChange'> {
  // 是否显示导出按钮
  showExport?: boolean;
  // 导出文件名
  exportFileName?: string;
  // 导出处理函数
  onExport?: () => Promise<void> | void;
  // 是否显示刷新按钮
  showRefresh?: boolean;
  // 刷新处理函数
  onRefresh?: () => Promise<void> | void;
  // 表格变化回调（分页、筛选、排序）
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => void;
}

const styles = {
  container: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  button: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    color: '#00d4ff',
  },
  exportButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
};

export function CommonTable<T extends Record<string, any>>({
  showExport = false,
  exportFileName = 'export',
  onExport,
  showRefresh = true,
  onRefresh,
  onChange,
  pagination,
  ...restProps
}: CommonTableProps<T>) {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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
    }
  };

  // 处理导出
  const handleExport = async () => {
    if (onExport) {
      setExportLoading(true);
      try {
        await onExport();
        message.success('导出成功');
      } catch (error) {
        message.error('导出失败');
      } finally {
        setExportLoading(false);
      }
    }
  };

  // 处理表格变化
  const handleTableChange = (
    newPagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    if (onChange) {
      onChange(newPagination, filters, sorter);
    }
  };

  // 默认分页配置
  const defaultPagination: TablePaginationConfig = {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条记录`,
    pageSizeOptions: ['10', '20', '50', '100'],
    ...pagination,
  };

  return (
    <div style={styles.container}>
      {/* 工具栏 */}
      {(showRefresh || showExport) && (
        <div style={styles.toolbar}>
          <Space>
            {showRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                style={styles.button}
              >
                刷新
              </Button>
            )}
            {showExport && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exportLoading}
                style={styles.exportButton}
              >
                导出
              </Button>
            )}
          </Space>
        </div>
      )}

      {/* 表格 */}
      <Table<T>
        {...restProps}
        loading={loading || restProps.loading}
        pagination={defaultPagination}
        onChange={handleTableChange}
      />
    </div>
  );
}

export default CommonTable;
