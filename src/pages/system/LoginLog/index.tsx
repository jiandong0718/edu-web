import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Select,
  DatePicker,
  message,
  Tooltip,
  Row,
  Col,
  Progress,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  LoginOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { Dayjs } from 'dayjs';
import { CommonTable } from '@/components/CommonTable';
import {
  getLoginLogList,
  deleteLoginLog,
  batchDeleteLoginLog,
  exportLoginLog,
  type LoginLog,
  type LoginLogQueryParams,
} from '@/api/system';

const { RangePicker } = DatePicker;

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

const initialQueryParams: LoginLogQueryParams = {
  page: 1,
  pageSize: 10,
  username: '',
  ip: '',
  status: '',
  startTime: '',
  endTime: '',
};

const isIpKeyword = (keyword: string) => /^\d{1,3}(?:\.\d{1,3}){1,3}$/.test(keyword);

const normalizeLoginLogPage = (response: unknown): { list: LoginLog[]; total: number } => {
  const raw = response as
    | { list?: LoginLog[]; total?: number; data?: { list?: LoginLog[]; total?: number } }
    | undefined;

  const payload = raw?.data && Array.isArray(raw.data.list) ? raw.data : raw;
  const list = Array.isArray(payload?.list) ? payload.list : [];
  const total = typeof payload?.total === 'number' ? payload.total : list.length;

  return { list, total };
};

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const [queryParams, setQueryParams] = useState<LoginLogQueryParams>(initialQueryParams);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getLoginLogList(queryParams);
      const pageResult = normalizeLoginLogPage(response);
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

  const columns: ColumnsType<LoginLog> = [
    {
      title: '用户信息',
      key: 'user',
      width: 200,
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
      title: 'IP地址',
      key: 'ip',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{record.ip}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.location}
          </div>
        </div>
      ),
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      render: (browser: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{browser || '-'}</span>
      ),
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      render: (os: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{os || '-'}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string, record) => (
        <Tooltip title={record.message}>
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
        </Tooltip>
      ),
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 160,
      render: (time: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{time}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="删除">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: '#ff4d6a' }}
            onClick={() => handleDelete(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  const handleRefresh = () => {
    void loadData();
  };

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    const isIp = keyword !== '' && isIpKeyword(keyword);

    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      username: isIp ? '' : keyword,
      ip: isIp ? keyword : '',
      status: statusFilter as 'success' | 'failure' | '',
      startTime: dateRange ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : '',
      endTime: dateRange ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : '',
    }));
  };

  const handleReset = () => {
    setSearchKeyword('');
    setStatusFilter('');
    setDateRange(null);
    setQueryParams(initialQueryParams);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这条登录日志吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteLoginLog(id);
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
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 条日志吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await batchDeleteLoginLog(selectedRowKeys);
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
      await exportLoginLog(queryParams);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<LoginLog> | SorterResult<LoginLog>[]
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

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
          <LoginOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          登录日志
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
              <div style={styles.statLabel}>总登录次数</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{successCount}</div>
              <div style={styles.statLabel}>成功次数</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{failureCount}</div>
              <div style={styles.statLabel}>失败次数</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{successRate}%</div>
              <div style={styles.statLabel}>成功率</div>
              <Progress
                percent={Number(successRate)}
                strokeColor="#00ff88"
                trailColor="rgba(255, 255, 255, 0.1)"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </div>
          </Col>
        </Row>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索用户名、真实姓名、IP地址"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="登录状态"
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || '')}
            allowClear
            options={[
              { label: '全部', value: '' },
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
            placeholder={['开始时间', '结束时间']}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
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
    </div>
  );
}
