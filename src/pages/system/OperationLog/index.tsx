import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Select,
  DatePicker,
  message,
  Tooltip,
  Row,
  Col,
  Descriptions,
  Drawer,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { Dayjs } from 'dayjs';
import { CommonTable } from '@/components/CommonTable';
import {
  getOperationLogList,
  getOperationLogDetail,
  deleteOperationLog,
  batchDeleteOperationLog,
  exportOperationLog,
  getOperationModules,
  type OperationLog,
  type OperationLogQuery,
} from '@/api/operationLog';

const { RangePicker } = DatePicker;

const operationTypeMap: Record<string, { label: string; color: string }> = {
  CREATE: { label: '新增', color: '#00ff88' },
  UPDATE: { label: '修改', color: '#00d4ff' },
  DELETE: { label: '删除', color: '#ff4d6a' },
  QUERY: { label: '查询', color: '#ffa940' },
  EXPORT: { label: '导出', color: '#9254de' },
  IMPORT: { label: '导入', color: '#13c2c2' },
  OTHER: { label: '其他', color: '#8c8c8c' },
};

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
  },
  filterBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  dangerButton: {
    background: 'linear-gradient(135deg, #ff4d6a 0%, #ff1744 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(255, 77, 106, 0.3)',
  },
  statCard: {
    background: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

const initialQueryParams: OperationLogQuery = {
  page: 1,
  pageSize: 10,
  keyword: '',
  module: undefined,
  operationType: undefined,
  status: undefined,
  username: undefined,
  startTime: undefined,
  endTime: undefined,
};

const normalizeOperationLogPage = (response: unknown): { list: OperationLog[]; total: number } => {
  const raw = response as
    | { list?: OperationLog[]; total?: number; data?: { list?: OperationLog[]; total?: number } }
    | undefined;

  const payload = raw?.data && Array.isArray(raw.data.list) ? raw.data : raw;
  const list = Array.isArray(payload?.list) ? payload.list : [];
  const total = typeof payload?.total === 'number' ? payload.total : list.length;

  return { list, total };
};

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [modules, setModules] = useState<string[]>([]);

  const [queryParams, setQueryParams] = useState<OperationLogQuery>(initialQueryParams);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getOperationLogList(queryParams);
      const pageResult = normalizeOperationLogPage(response);
      setLogs(pageResult.list);
      setTotal(pageResult.total);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [queryParams]);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const res = await getOperationModules();
        const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
        setModules(list);
      } catch {
        setModules([]);
      }
    };

    void loadModules();
  }, []);

  const handleRefresh = () => {
    void loadData();
  };

  const handleSearch = () => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      keyword: searchKeyword.trim(),
      module: moduleFilter || undefined,
      status: statusFilter || undefined,
      startTime: dateRange ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: dateRange ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : undefined,
    }));
  };

  const handleReset = () => {
    setSearchKeyword('');
    setModuleFilter('');
    setStatusFilter('');
    setDateRange(null);
    setQueryParams(initialQueryParams);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条操作日志吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteOperationLog(id);
          message.success('删除成功');
          setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
          await loadData();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的日志');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条日志吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await batchDeleteOperationLog(selectedRowKeys);
          message.success(`已删除 ${selectedRowKeys.length} 条日志`);
          setSelectedRowKeys([]);
          await loadData();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      await exportOperationLog(queryParams);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  const handleOpenDetail = async (record: OperationLog) => {
    setDrawerVisible(true);
    setSelectedLog(record);

    try {
      const detail = await getOperationLogDetail(record.id);
      const rawDetail = detail as { data?: OperationLog } | OperationLog;
      const normalizedDetail =
        (rawDetail as { data?: OperationLog })?.data &&
        typeof (rawDetail as { data?: OperationLog }).data === 'object'
          ? (rawDetail as { data?: OperationLog }).data
          : (rawDetail as OperationLog);
      setSelectedLog(normalizedDetail || record);
    } catch {
      // 列表数据作为兜底展示
      setSelectedLog(record);
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<OperationLog> | SorterResult<OperationLog>[]
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const columns: ColumnsType<OperationLog> = [
    {
      title: '用户信息',
      key: 'user',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>
            {record.realName}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            @{record.username}
          </div>
        </div>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (module: string) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
          }}
        >
          {module}
        </Tag>
      ),
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 100,
      align: 'center',
      render: (type: keyof typeof operationTypeMap) => {
        const config = operationTypeMap[type] || operationTypeMap.OTHER;
        return (
          <Tag
            style={{
              background: `${config.color}15`,
              border: `1px solid ${config.color}40`,
              color: config.color,
            }}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '操作描述',
      dataIndex: 'operation',
      key: 'operation',
      width: 180,
      render: (op: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{op}</span>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
      render: (ip: string, record) => (
        <Tooltip title={record.location}>
          <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{ip}</span>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => (
        <Tag
          icon={status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          style={{
            background: status === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 'success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: status === 'success' ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      align: 'center',
      render: (duration: number) => (
        <span style={{ color: duration > 1000 ? '#ff4d6a' : '#00ff88' }}>
          {duration}ms
        </span>
      ),
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{time}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => void handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d6a' }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const { successCount, failureCount, successRate } = useMemo(() => {
    const success = logs.filter((item) => item.status === 'success').length;
    const failure = logs.filter((item) => item.status === 'failure').length;
    const rate = logs.length > 0 ? ((success / logs.length) * 100).toFixed(1) : '0.0';
    return { successCount: success, failureCount: failure, successRate: rate };
  }, [logs]);

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <FileTextOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          操作日志
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            style={styles.actionButton}
          >
            导出
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{total}</div>
              <div style={styles.statLabel}>总操作数</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{successCount}</div>
              <div style={styles.statLabel}>成功操作</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{failureCount}</div>
              <div style={styles.statLabel}>失败操作</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{successRate}%</div>
              <div style={styles.statLabel}>成功率</div>
            </div>
          </Col>
        </Row>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索用户名、模块、操作"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="模块"
            style={{ width: 160 }}
            value={moduleFilter || undefined}
            onChange={(value) => setModuleFilter(value || '')}
            allowClear
            options={modules.map((module) => ({ label: module, value: module }))}
          />
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || '')}
            allowClear
            options={[
              { label: '成功', value: 'success' },
              { label: '失败', value: 'failure' },
            ]}
          />
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
                return;
              }
              setDateRange(null);
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              style={styles.dangerButton}
              onClick={handleBatchDelete}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </div>

        <CommonTable
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (value) => `共 ${value} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
          onChange={handleTableChange}
          showRefresh={false}
          exportable={false}
        />
      </Card>

      <Drawer
        title="操作详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedLog && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="用户">
              {selectedLog.realName} (@{selectedLog.username})
            </Descriptions.Item>
            <Descriptions.Item label="模块">{selectedLog.module}</Descriptions.Item>
            <Descriptions.Item label="操作">{selectedLog.operation}</Descriptions.Item>
            <Descriptions.Item label="操作类型">
              {operationTypeMap[selectedLog.operationType]?.label || selectedLog.operationType}
            </Descriptions.Item>
            <Descriptions.Item label="请求方法">{selectedLog.method}</Descriptions.Item>
            <Descriptions.Item label="请求参数">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {selectedLog.requestParams || '-'}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="响应结果">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {selectedLog.responseResult || '-'}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {selectedLog.status === 'success' ? '成功' : '失败'}
            </Descriptions.Item>
            {selectedLog.errorMsg && (
              <Descriptions.Item label="错误信息">{selectedLog.errorMsg}</Descriptions.Item>
            )}
            <Descriptions.Item label="IP地址">{selectedLog.ip}</Descriptions.Item>
            <Descriptions.Item label="位置">{selectedLog.location}</Descriptions.Item>
            <Descriptions.Item label="浏览器">{selectedLog.browser}</Descriptions.Item>
            <Descriptions.Item label="操作系统">{selectedLog.os}</Descriptions.Item>
            <Descriptions.Item label="耗时">{selectedLog.duration}ms</Descriptions.Item>
            <Descriptions.Item label="操作时间">{selectedLog.createTime}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
