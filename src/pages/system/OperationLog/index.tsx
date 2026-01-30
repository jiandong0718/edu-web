import { useState, useEffect } from 'react';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { CommonTable } from '@/components/CommonTable';
import type { OperationLog, OperationLogQuery } from '@/api/operationLog';

const { RangePicker } = DatePicker;

// 操作类型映射
const operationTypeMap: Record<string, { label: string; color: string }> = {
  CREATE: { label: '新增', color: '#00ff88' },
  UPDATE: { label: '修改', color: '#00d4ff' },
  DELETE: { label: '删除', color: '#ff4d6a' },
  QUERY: { label: '查询', color: '#ffa940' },
  EXPORT: { label: '导出', color: '#9254de' },
  IMPORT: { label: '导入', color: '#13c2c2' },
  OTHER: { label: '其他', color: '#8c8c8c' },
};

// 模拟操作日志数据
const mockLogs: OperationLog[] = [
  {
    id: 1,
    username: 'admin',
    realName: '管理员',
    module: '用户管理',
    operation: '新增用户',
    operationType: 'CREATE',
    method: 'POST /api/user/add',
    requestParams: '{"username":"test001","realName":"测试用户","phone":"13800138000"}',
    responseResult: '{"code":200,"msg":"操作成功","data":{"id":101}}',
    status: 'success',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    duration: 125,
    createTime: '2024-01-30 10:30:25',
  },
  {
    id: 2,
    username: 'admin',
    realName: '管理员',
    module: '角色管理',
    operation: '编辑角色',
    operationType: 'UPDATE',
    method: 'PUT /api/role/update',
    requestParams: '{"id":1,"name":"超级管理员","permissions":[1,2,3,4,5]}',
    responseResult: '{"code":200,"msg":"操作成功"}',
    status: 'success',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    duration: 98,
    createTime: '2024-01-30 10:25:18',
  },
  {
    id: 3,
    username: 'teacher01',
    realName: '张老师',
    module: '课程管理',
    operation: '删除课程',
    operationType: 'DELETE',
    method: 'DELETE /api/course/delete',
    requestParams: '{"id":10}',
    errorMsg: '课程已有学生报名，无法删除',
    status: 'failure',
    ip: '192.168.1.105',
    location: '广东深圳',
    browser: 'Firefox 121',
    os: 'macOS 14',
    duration: 56,
    createTime: '2024-01-30 10:20:45',
  },
  {
    id: 4,
    username: 'admin',
    realName: '管理员',
    module: '系统配置',
    operation: '修改配置',
    operationType: 'UPDATE',
    method: 'PUT /api/config/update',
    requestParams: '{"key":"system.name","value":"教育管理系统"}',
    responseResult: '{"code":200,"msg":"操作成功"}',
    status: 'success',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    duration: 78,
    createTime: '2024-01-30 10:15:32',
  },
  {
    id: 5,
    username: 'teacher02',
    realName: '李老师',
    module: '学生管理',
    operation: '导入学生',
    operationType: 'IMPORT',
    method: 'POST /api/student/import',
    requestParams: '{"file":"students.xlsx","count":50}',
    responseResult: '{"code":200,"msg":"导入成功","data":{"success":48,"failed":2}}',
    status: 'success',
    ip: '192.168.1.108',
    location: '广东深圳',
    browser: 'Edge 120',
    os: 'Windows 11',
    duration: 2345,
    createTime: '2024-01-30 10:10:15',
  },
  {
    id: 6,
    username: 'admin',
    realName: '管理员',
    module: '菜单管理',
    operation: '新增菜单',
    operationType: 'CREATE',
    method: 'POST /api/menu/add',
    requestParams: '{"name":"系统监控","path":"/monitor","icon":"monitor"}',
    responseResult: '{"code":200,"msg":"操作成功","data":{"id":25}}',
    status: 'success',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    duration: 112,
    createTime: '2024-01-30 10:05:50',
  },
  {
    id: 7,
    username: 'teacher01',
    realName: '张老师',
    module: '教室管理',
    operation: '预约教室',
    operationType: 'CREATE',
    method: 'POST /api/classroom/reserve',
    requestParams: '{"classroomId":5,"date":"2024-02-01","timeSlot":"09:00-11:00"}',
    errorMsg: '该时间段教室已被预约',
    status: 'failure',
    ip: '192.168.1.105',
    location: '广东深圳',
    browser: 'Firefox 121',
    os: 'macOS 14',
    duration: 89,
    createTime: '2024-01-30 10:00:28',
  },
  {
    id: 8,
    username: 'admin',
    realName: '管理员',
    module: '数据字典',
    operation: '删除字典',
    operationType: 'DELETE',
    method: 'DELETE /api/dict/delete',
    requestParams: '{"id":15}',
    responseResult: '{"code":200,"msg":"操作成功"}',
    status: 'success',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    duration: 67,
    createTime: '2024-01-30 09:55:42',
  },
  {
    id: 9,
    username: 'teacher02',
    realName: '李老师',
    module: '学生管理',
    operation: '导出学生列表',
    operationType: 'EXPORT',
    method: 'GET /api/student/export',
    requestParams: '{"status":"active","campus":"总部校区"}',
    responseResult: '{"code":200,"msg":"导出成功","data":{"count":150}}',
    status: 'success',
    ip: '192.168.1.108',
    location: '广东深圳',
    browser: 'Edge 120',
    os: 'Windows 11',
    duration: 1567,
    createTime: '2024-01-30 09:50:20',
  },
  {
    id: 10,
    username: 'admin',
    realName: '管理员',
    module: '用户管理',
    operation: '查询用户列表',
    operationType: 'QUERY',
    method: 'GET /api/user/list',
    requestParams: '{"page":1,"pageSize":10}',
    responseResult: '{"code":200,"msg":"查询成功","data":{"total":50,"list":[...]}}',
    status: 'success',
    ip: '192.168.1.100',
    location: '广东深圳',
    browser: 'Chrome 120',
    os: 'Windows 10',
    duration: 45,
    createTime: '2024-01-30 09:45:15',
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

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>(mockLogs);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  // const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  // const [filterVisible, setFilterVisible] = useState(false);

  // 查询参数
  const [queryParams, _setQueryParams] = useState<OperationLogQuery>({
    page: 1,
    pageSize: 10,
    keyword: '',
    module: undefined,
    operationType: undefined,
    status: undefined,
    username: undefined,
    startTime: undefined,
    endTime: undefined,
  });
  // const [total, setTotal] = useState(mockLogs.length);
  // const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [queryParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      // 这里应该调用真实API: const result = await getOperationLogList(queryParams);
      setLogs(mockLogs);
      // setTotal(mockLogs.length);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  // 刷新
  const handleRefresh = () => {
    loadData();
  };

  // 删除
  const handleDelete = (_id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条操作日志吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 真实调用: await deleteOperationLog(id);
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
      content: `确定要删除选中的 ${selectedRowKeys.length} 条日志吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 真实调用: await batchDeleteOperationLog(selectedRowKeys);
          message.success(`已删除 ${selectedRowKeys.length} 条日志`);
          setSelectedRowKeys([]);
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
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
      width: 150,
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
              onClick={() => {
                setSelectedLog(record);
                setDrawerVisible(true);
              }}
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

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failureCount = logs.filter((l) => l.status === 'failure').length;

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
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{logs.length}</div>
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
              <div style={styles.statValue}>
                {((successCount / logs.length) * 100).toFixed(1)}%
              </div>
              <div style={styles.statLabel}>成功率</div>
            </div>
          </Col>
        </Row>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索用户名、模块、操作"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
          />
          <Select
            placeholder="模块"
            style={{ width: 140 }}
            options={[
              { label: '全部', value: 'all' },
              { label: '用户管理', value: '用户管理' },
              { label: '角色管理', value: '角色管理' },
              { label: '课程管理', value: '课程管理' },
            ]}
          />
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            options={[
              { label: '全部', value: 'all' },
              { label: '成功', value: 'success' },
              { label: '失败', value: 'failure' },
            ]}
          />
          <RangePicker />
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
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
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
            <Descriptions.Item label="用户">{selectedLog.realName} (@{selectedLog.username})</Descriptions.Item>
            <Descriptions.Item label="模块">{selectedLog.module}</Descriptions.Item>
            <Descriptions.Item label="操作">{selectedLog.operation}</Descriptions.Item>
            <Descriptions.Item label="请求方法">{selectedLog.method}</Descriptions.Item>
            <Descriptions.Item label="请求参数">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {selectedLog.requestParams}
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
