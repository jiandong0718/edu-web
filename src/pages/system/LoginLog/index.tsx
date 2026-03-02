import { useState, useEffect } from 'react';
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
import { CommonTable } from '@/components/CommonTable';
import {
  exportLoginLog,
  type LoginLog,
  type LoginLogQueryParams,
} from '@/api/system';
import { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// 模拟登录日志数据（用于开发测试）
const mockLogs: LoginLog[] = [
  {
    id: 1,
    username: 'admin',
    realName: '管理员',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    status: 'success',
    loginTime: '2024-01-30 10:30:25',
  },
  {
    id: 2,
    username: 'teacher01',
    realName: '张老师',
    ip: '192.168.1.105',
    location: '广东深圳',
    browser: 'Firefox 121',
    os: 'macOS 14',
    status: 'success',
    loginTime: '2024-01-30 10:25:18',
  },
  {
    id: 3,
    username: 'student01',
    realName: '李同学',
    ip: '192.168.1.120',
    location: '广东广州',
    browser: 'Safari 17',
    os: 'iOS 17',
    status: 'failure',
    message: '密码错误',
    loginTime: '2024-01-30 10:20:45',
  },
  {
    id: 4,
    username: 'teacher02',
    realName: '王老师',
    ip: '192.168.1.108',
    location: '广东深圳',
    browser: 'Edge 120',
    os: 'Windows 11',
    status: 'success',
    loginTime: '2024-01-30 10:15:32',
  },
  {
    id: 5,
    username: 'admin',
    realName: '管理员',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    status: 'success',
    loginTime: '2024-01-30 10:10:15',
  },
  {
    id: 6,
    username: 'student02',
    realName: '赵同学',
    ip: '192.168.1.125',
    location: '广东东莞',
    browser: 'Chrome 120',
    os: 'Android 14',
    status: 'failure',
    message: '账号已被锁定',
    loginTime: '2024-01-30 10:05:50',
  },
  {
    id: 7,
    username: 'teacher01',
    realName: '张老师',
    ip: '192.168.1.105',
    location: '广东深圳',
    browser: 'Firefox 121',
    os: 'macOS 14',
    status: 'success',
    loginTime: '2024-01-30 10:00:28',
  },
  {
    id: 8,
    username: 'admin',
    realName: '管理员',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    status: 'success',
    loginTime: '2024-01-30 09:55:42',
  },
  {
    id: 9,
    username: 'student03',
    realName: '孙同学',
    ip: '192.168.1.130',
    location: '广东佛山',
    browser: 'Chrome 120',
    os: 'Windows 10',
    status: 'failure',
    message: '验证码错误',
    loginTime: '2024-01-30 09:50:15',
  },
  {
    id: 10,
    username: 'teacher03',
    realName: '周老师',
    ip: '192.168.1.110',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'macOS 14',
    status: 'success',
    loginTime: '2024-01-30 09:45:30',
  },
];

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
  chartCard: {
    background: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // 查询参数
  const [queryParams, setQueryParams] = useState<LoginLogQueryParams>({
    page: 1,
    pageSize: 10,
    username: '',
    ip: '',
    status: '',
    startTime: '',
    endTime: '',
  });

  // 筛选表单值
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [queryParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 实际项目中调用API
      // const response = await getLoginLogList(queryParams);
      // setLogs(response.list);
      // setTotal(response.total);

      // 开发阶段使用模拟数据
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 模拟筛选
      let filteredLogs = [...mockLogs];

      if (queryParams.username) {
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.username.includes(queryParams.username || '') ||
            log.realName.includes(queryParams.username || '')
        );
      }

      if (queryParams.ip) {
        filteredLogs = filteredLogs.filter((log) =>
          log.ip.includes(queryParams.ip || '')
        );
      }

      if (queryParams.status) {
        filteredLogs = filteredLogs.filter((log) => log.status === queryParams.status);
      }

      setLogs(filteredLogs);
      setTotal(filteredLogs.length);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

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
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{browser}</span>
      ),
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      render: (os: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{os}</span>
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
    loadData();
  };

  // 搜索
  const handleSearch = () => {
    setQueryParams({
      ...queryParams,
      page: 1,
      username: searchKeyword,
      ip: searchKeyword,
      status: statusFilter as 'success' | 'failure' | '',
      startTime: dateRange ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : '',
      endTime: dateRange ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : '',
    });
  };

  // 重置筛选
  const handleReset = () => {
    setSearchKeyword('');
    setStatusFilter('');
    setDateRange(null);
    setQueryParams({
      page: 1,
      pageSize: 10,
      username: '',
      ip: '',
      status: '',
      startTime: '',
      endTime: '',
    });
  };

  // 删除单条日志
  const handleDelete = async (_id: number) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这条登录日志吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // await deleteLoginLog(id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 批量删除
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
          // await batchDeleteLoginLog(selectedRowKeys);
          message.success(`已删除 ${selectedRowKeys.length} 条日志`);
          setSelectedRowKeys([]);
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 导出
  const handleExport = async () => {
    try {
      await exportLoginLog(queryParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 分页变化
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    _sorter: SorterResult<LoginLog> | SorterResult<LoginLog>[]
  ) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    });
  };

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failureCount = logs.filter((l) => l.status === 'failure').length;
  const successRate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : '0.0';

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
              <div style={styles.statValue}>{logs.length}</div>
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
                percent={parseFloat(successRate)}
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
            onChange={setStatusFilter}
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
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            placeholder={['开始时间', '结束时间']}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
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
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
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
