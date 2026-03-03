import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Avatar,
  Modal,
  Form,
  InputNumber,
  Select,
  Timeline,
  Alert,
  Row,
  Col,
  Statistic,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  GiftOutlined,
  MinusCircleOutlined,
  RollbackOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import {
  getClassHourAccountList,
  adjustClassHour,
  getAccountAdjustRecords,
  getClassHourStatistics,
  exportClassHourAccountList,
} from '@/api/classHour';
import type {
  ClassHourAccount,
  ClassHourAdjustType,
  ClassHourAdjustRecord,
  ClassHourAdjustFormData,
  ClassHourAccountQueryParams,
  ClassHourStatistics,
} from '@/types/classHour';

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
    marginBottom: 24,
  },
  filterBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  statCard: {
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(0, 212, 255, 0.1)',
    padding: '20px',
  },
};

const statusConfig = {
  active: { color: '#00ff88', text: '正常', bg: 'rgba(0, 255, 136, 0.1)' },
  warning: { color: '#ffaa00', text: '预警', bg: 'rgba(255, 170, 0, 0.1)' },
  expired: { color: '#999', text: '已过期', bg: 'rgba(153, 153, 153, 0.1)' },
  frozen: { color: '#ff4d6a', text: '已冻结', bg: 'rgba(255, 77, 106, 0.1)' },
};

const adjustTypeConfig: Record<
  ClassHourAdjustType,
  { color: string; text: string; icon: ReactNode }
> = {
  gift: { color: '#00ff88', text: '赠送', icon: <GiftOutlined /> },
  deduct: { color: '#ff4d6a', text: '扣减', icon: <MinusCircleOutlined /> },
  revoke: { color: '#ffaa00', text: '撤销', icon: <RollbackOutlined /> },
};

const normalizeAccountPage = (response: unknown): { list: ClassHourAccount[]; total: number } => {
  const raw = response as
    | {
        list?: ClassHourAccount[];
        total?: number;
        data?: { list?: ClassHourAccount[]; total?: number };
      }
    | undefined;

  const payload = raw?.data && Array.isArray(raw.data.list) ? raw.data : raw;
  const list = Array.isArray(payload?.list) ? payload.list : [];
  const total = typeof payload?.total === 'number' ? payload.total : list.length;

  return { list, total };
};

const normalizeAdjustRecords = (response: unknown): ClassHourAdjustRecord[] => {
  if (Array.isArray(response)) {
    return response as ClassHourAdjustRecord[];
  }

  const raw = response as
    | { list?: ClassHourAdjustRecord[]; data?: ClassHourAdjustRecord[] | { list?: ClassHourAdjustRecord[] } }
    | undefined;

  if (Array.isArray(raw?.data)) {
    return raw.data;
  }

  if (Array.isArray(raw?.list)) {
    return raw.list;
  }

  if (raw?.data && Array.isArray((raw.data as { list?: ClassHourAdjustRecord[] }).list)) {
    return (raw.data as { list?: ClassHourAdjustRecord[] }).list || [];
  }

  return [];
};

const normalizeStatistics = (response: unknown): ClassHourStatistics | null => {
  const raw = response as { data?: ClassHourStatistics } | ClassHourStatistics | undefined;
  if (!raw) return null;

  if ((raw as { data?: ClassHourStatistics }).data) {
    return (raw as { data?: ClassHourStatistics }).data || null;
  }

  return raw as ClassHourStatistics;
};

function ClassHourAdjust() {
  const [tableLoading, setTableLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [accounts, setAccounts] = useState<ClassHourAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ClassHourStatistics | null>(null);

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ClassHourAccount | null>(null);
  const [adjustRecords, setAdjustRecords] = useState<ClassHourAdjustRecord[]>([]);

  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentPhoneInput, setStudentPhoneInput] = useState('');
  const [campusFilter, setCampusFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<ClassHourAccount['status'] | undefined>(undefined);

  const [query, setQuery] = useState<ClassHourAccountQueryParams>({
    page: 1,
    pageSize: 10,
  });

  const [form] = Form.useForm();

  const loadStatistics = async () => {
    try {
      const response = await getClassHourStatistics();
      const normalized = normalizeStatistics(response);
      setStats(normalized);
    } catch {
      setStats(null);
    }
  };

  const loadData = async () => {
    setTableLoading(true);
    try {
      const response = await getClassHourAccountList(query);
      const pageResult = normalizeAccountPage(response);
      setAccounts(pageResult.list);
      setTotal(pageResult.total);
    } catch {
      message.error('加载课时账户失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [query]);

  useEffect(() => {
    void loadStatistics();
  }, []);

  const handleSearch = () => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      studentName: studentNameInput.trim() || undefined,
      studentPhone: studentPhoneInput.trim() || undefined,
      campusId: campusFilter,
      status: statusFilter,
    }));
  };

  const handleReset = () => {
    setStudentNameInput('');
    setStudentPhoneInput('');
    setCampusFilter(undefined);
    setStatusFilter(undefined);
    setQuery({
      page: 1,
      pageSize: query.pageSize,
    });
  };

  const handleRefresh = async () => {
    await Promise.all([loadData(), loadStatistics()]);
    message.success('数据已刷新');
  };

  const handleExport = async () => {
    try {
      await exportClassHourAccountList(query);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  const handleOpenAdjustModal = (account: ClassHourAccount) => {
    setSelectedAccount(account);
    setAdjustModalVisible(true);
    form.resetFields();
  };

  const handleOpenRecordModal = async (account: ClassHourAccount) => {
    setSelectedAccount(account);
    setRecordModalVisible(true);

    try {
      const response = await getAccountAdjustRecords(account.id);
      setAdjustRecords(normalizeAdjustRecords(response));
    } catch {
      message.error('加载调整记录失败');
      setAdjustRecords([]);
    }
  };

  const handleAdjustSubmit = async () => {
    if (!selectedAccount) {
      message.warning('请先选择账户');
      return;
    }

    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      const payload: ClassHourAdjustFormData = {
        accountId: selectedAccount.id,
        adjustType: values.adjustType,
        adjustHours: values.adjustHours,
        reason: values.reason,
        remark: values.remark,
      };

      await adjustClassHour(payload);
      message.success('课时调整成功');
      setAdjustModalVisible(false);
      form.resetFields();

      await Promise.all([loadData(), loadStatistics()]);

      if (recordModalVisible && selectedAccount) {
        const records = await getAccountAdjustRecords(selectedAccount.id);
        setAdjustRecords(normalizeAdjustRecords(records));
      }
    } catch {
      // form validate or request failed
    } finally {
      setSubmitLoading(false);
    }
  };

  const getWarningMessage = (account: ClassHourAccount | null) => {
    if (!account) return null;

    if (account.remainingHours <= 0) {
      return (
        <Alert
          message="课时不足"
          description="该学员课时已用完，无法继续上课"
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      );
    }

    if (account.remainingHours <= 10) {
      return (
        <Alert
          message="课时预警"
          description={`该学员剩余课时不足，仅剩 ${account.remainingHours} 课时`}
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      );
    }

    const expireDate = new Date(account.expireDate);
    const daysUntilExpire = Math.ceil((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpire <= 30 && daysUntilExpire > 0) {
      return (
        <Alert
          message="即将到期"
          description={`该课时账户将在 ${daysUntilExpire} 天后到期`}
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      );
    }

    return null;
  };

  const statistics = useMemo(() => {
    if (stats) {
      return stats;
    }

    return {
      totalAccounts: total,
      activeAccounts: accounts.filter((item) => item.status === 'active').length,
      warningAccounts: accounts.filter((item) => item.status === 'warning').length,
      expiredAccounts: accounts.filter((item) => item.status === 'expired').length,
      totalHours: accounts.reduce((sum, item) => sum + item.totalHours, 0),
      usedHours: accounts.reduce((sum, item) => sum + item.usedHours, 0),
      remainingHours: accounts.reduce((sum, item) => sum + item.remainingHours, 0),
      giftHours: accounts.reduce((sum, item) => sum + item.giftHours, 0),
    };
  }, [accounts, stats, total]);

  const columns: ColumnsType<ClassHourAccount> = [
    {
      title: '学员信息',
      key: 'student',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record.studentAvatar}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500 }}>{record.studentName}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              {record.studentPhone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 180,
      render: (text: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>
      ),
    },
    {
      title: '校区',
      dataIndex: 'campusName',
      key: 'campusName',
      width: 120,
      render: (text: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>
      ),
    },
    {
      title: '总课时',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 100,
      align: 'center',
      render: (hours: number) => (
        <span style={{ color: '#00d4ff', fontWeight: 600, fontSize: 16 }}>
          {hours}
        </span>
      ),
    },
    {
      title: '已用课时',
      dataIndex: 'usedHours',
      key: 'usedHours',
      width: 100,
      align: 'center',
      render: (hours: number) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{hours}</span>
      ),
    },
    {
      title: '剩余课时',
      dataIndex: 'remainingHours',
      key: 'remainingHours',
      width: 120,
      align: 'center',
      render: (hours: number, record) => {
        let color = '#00ff88';
        if (hours <= 0) color = '#999';
        else if (hours <= 10) color = '#ff4d6a';
        else if (hours <= 20) color = '#ffaa00';

        return (
          <div>
            <div style={{ color, fontWeight: 700, fontSize: 18 }}>{hours}</div>
            {record.giftHours > 0 && (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>
                含赠送 {record.giftHours}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '到期日期',
      dataIndex: 'expireDate',
      key: 'expireDate',
      width: 120,
      render: (date: string) => {
        const isExpiringSoon = new Date(date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <span style={{ color: isExpiringSoon ? '#ffaa00' : 'rgba(255, 255, 255, 0.65)' }}>
            {date}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: ClassHourAccount['status']) => {
        const config = statusConfig[status];
        return (
          <Tag
            style={{
              background: config.bg,
              border: `1px solid ${config.color}40`,
              color: config.color,
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="调整课时">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleOpenAdjustModal(record)}
              disabled={record.status === 'expired'}
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00ff88' }}
              onClick={() => message.info(`账户ID: ${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="调整记录">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              style={{ color: '#ffaa00' }}
              onClick={() => void handleOpenRecordModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <ClockCircleOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          课时调整管理
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出列表
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => void handleRefresh()}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={styles.statCard}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>总账户数</span>}
                value={statistics.totalAccounts}
                valueStyle={{ color: '#00d4ff', fontWeight: 700 }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>正常账户</span>}
                value={statistics.activeAccounts}
                valueStyle={{ color: '#00ff88', fontWeight: 700 }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>预警账户</span>}
                value={statistics.warningAccounts}
                valueStyle={{ color: '#ffaa00', fontWeight: 700 }}
                prefix={<Badge status="warning" />}
              />
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>剩余总课时</span>}
                value={statistics.remainingHours}
                valueStyle={{ color: '#00d4ff', fontWeight: 700 }}
                suffix={<span style={{ fontSize: 14 }}>课时</span>}
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索学员姓名"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={studentNameInput}
            onChange={(e) => setStudentNameInput(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Input
            placeholder="搜索手机号"
            prefix={<SearchOutlined />}
            style={{ width: 180 }}
            value={studentPhoneInput}
            onChange={(e) => setStudentPhoneInput(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择校区"
            style={{ width: 150 }}
            allowClear
            value={campusFilter}
            onChange={setCampusFilter}
            options={[
              { label: '总部校区', value: 1 },
              { label: '分校区', value: 2 },
            ]}
          />
          <Select
            placeholder="选择状态"
            style={{ width: 120 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '正常', value: 'active' },
              { label: '预警', value: 'warning' },
              { label: '已过期', value: 'expired' },
              { label: '已冻结', value: 'frozen' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          loading={tableLoading}
          scroll={{ x: 1400 }}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (value) => `共 ${value} 条`,
          }}
          onChange={(pager: TablePaginationConfig) => {
            setQuery((prev) => ({
              ...prev,
              page: pager.current || 1,
              pageSize: pager.pageSize || 10,
            }));
          }}
        />
      </Card>

      <Modal
        title={<span style={{ color: '#00d4ff', fontSize: 18, fontWeight: 600 }}>课时调整</span>}
        open={adjustModalVisible}
        onOk={() => void handleAdjustSubmit()}
        onCancel={() => {
          setAdjustModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={submitLoading}
        width={600}
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
          footer: { background: '#111827', borderTop: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        {getWarningMessage(selectedAccount)}

        {selectedAccount && (
          <div
            style={{
              padding: 16,
              background: 'rgba(0, 212, 255, 0.05)',
              borderRadius: 8,
              marginBottom: 20,
              border: '1px solid rgba(0, 212, 255, 0.1)',
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: 4 }}>学员姓名</div>
                <div style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>
                  {selectedAccount.studentName}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: 4 }}>课程名称</div>
                <div style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>
                  {selectedAccount.courseName}
                </div>
              </Col>
              <Col span={8} style={{ marginTop: 12 }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: 4 }}>总课时</div>
                <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: 18 }}>
                  {selectedAccount.totalHours}
                </div>
              </Col>
              <Col span={8} style={{ marginTop: 12 }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: 4 }}>已用课时</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600, fontSize: 18 }}>
                  {selectedAccount.usedHours}
                </div>
              </Col>
              <Col span={8} style={{ marginTop: 12 }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: 4 }}>剩余课时</div>
                <div style={{ color: '#00ff88', fontWeight: 600, fontSize: 18 }}>
                  {selectedAccount.remainingHours}
                </div>
              </Col>
            </Row>
          </div>
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="adjustType"
            label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>调整类型</span>}
            rules={[{ required: true, message: '请选择调整类型' }]}
          >
            <Select
              placeholder="请选择调整类型"
              options={[
                {
                  label: (
                    <Space>
                      <GiftOutlined style={{ color: '#00ff88' }} />
                      <span>赠送课时</span>
                    </Space>
                  ),
                  value: 'gift',
                },
                {
                  label: (
                    <Space>
                      <MinusCircleOutlined style={{ color: '#ff4d6a' }} />
                      <span>扣减课时</span>
                    </Space>
                  ),
                  value: 'deduct',
                },
                {
                  label: (
                    <Space>
                      <RollbackOutlined style={{ color: '#ffaa00' }} />
                      <span>撤销调整</span>
                    </Space>
                  ),
                  value: 'revoke',
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="adjustHours"
            label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>调整课时数</span>}
            rules={[
              { required: true, message: '请输入调整课时数' },
              { type: 'number', min: 1, message: '课时数必须大于0' },
            ]}
          >
            <InputNumber
              placeholder="请输入调整课时数"
              style={{ width: '100%' }}
              min={1}
              precision={0}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>调整原因</span>}
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <Input.TextArea placeholder="请输入调整原因" rows={4} maxLength={200} showCount />
          </Form.Item>

          <Form.Item name="remark" label={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>备注</span>}>
            <Input.TextArea placeholder="请输入备注信息（可选）" rows={3} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span style={{ color: '#00d4ff', fontSize: 18, fontWeight: 600 }}>调整历史记录</span>}
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        footer={null}
        width={800}
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        {selectedAccount && (
          <div
            style={{
              padding: 16,
              background: 'rgba(0, 212, 255, 0.05)',
              borderRadius: 8,
              marginBottom: 20,
              border: '1px solid rgba(0, 212, 255, 0.1)',
            }}
          >
            <Space size="large">
              <div>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>学员: </span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{selectedAccount.studentName}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>课程: </span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{selectedAccount.courseName}</span>
              </div>
            </Space>
          </div>
        )}

        {adjustRecords.length > 0 ? (
          <Timeline
            items={adjustRecords.map((record) => {
              const config = adjustTypeConfig[record.adjustType];
              return {
                color: config.color,
                dot: config.icon,
                children: (
                  <div
                    style={{
                      padding: 16,
                      background: 'rgba(0, 212, 255, 0.03)',
                      borderRadius: 8,
                      border: '1px solid rgba(0, 212, 255, 0.08)',
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Space>
                        <Tag
                          style={{
                            background: `${config.color}20`,
                            border: `1px solid ${config.color}40`,
                            color: config.color,
                          }}
                        >
                          {config.text}
                        </Tag>
                        <span style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>
                          {record.adjustHours > 0 ? '+' : ''}
                          {record.adjustHours} 课时
                        </span>
                      </Space>
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: 8 }}>
                      {record.beforeHours} → {record.afterHours} 课时
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 8 }}>
                      原因: {record.reason}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                      操作人: {record.operatorName} | 时间: {record.operateTime}
                    </div>
                  </div>
                ),
              };
            })}
          />
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            暂无调整记录
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ClassHourAdjust;
