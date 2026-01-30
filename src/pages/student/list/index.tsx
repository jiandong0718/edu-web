import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Dropdown,
  Modal,
  Form,
  Row,
  Col,
  DatePicker,
  message,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 学生数据类型
interface Student {
  id: number;
  name: string;
  avatar?: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  courses: string[];
  remainingHours: number;
  enrollDate: string;
  campus: string;
}

// 模拟数据
const mockStudents: Student[] = [
  {
    id: 1,
    name: '张小明',
    gender: 'male',
    age: 10,
    phone: '13800138001',
    parentName: '张伟',
    parentPhone: '13800138000',
    status: 'active',
    courses: ['少儿编程', '数学思维'],
    remainingHours: 48,
    enrollDate: '2024-03-15',
    campus: '总部校区',
  },
  {
    id: 2,
    name: '李小红',
    gender: 'female',
    age: 8,
    phone: '13900139001',
    parentName: '李强',
    parentPhone: '13900139000',
    status: 'active',
    courses: ['英语口语', '美术创意'],
    remainingHours: 32,
    enrollDate: '2024-02-20',
    campus: '分部校区',
  },
  {
    id: 3,
    name: '王小刚',
    gender: 'male',
    age: 12,
    phone: '13700137001',
    parentName: '王磊',
    parentPhone: '13700137000',
    status: 'inactive',
    courses: ['钢琴基础'],
    remainingHours: 0,
    enrollDate: '2023-09-01',
    campus: '总部校区',
  },
  {
    id: 4,
    name: '赵小美',
    gender: 'female',
    age: 9,
    phone: '13600136001',
    parentName: '赵军',
    parentPhone: '13600136000',
    status: 'active',
    courses: ['少儿编程', '英语口语', '数学思维'],
    remainingHours: 96,
    enrollDate: '2024-01-10',
    campus: '分部校区',
  },
  {
    id: 5,
    name: '孙小龙',
    gender: 'male',
    age: 11,
    phone: '13500135001',
    parentName: '孙涛',
    parentPhone: '13500135000',
    status: 'suspended',
    courses: ['数学思维'],
    remainingHours: 16,
    enrollDate: '2024-04-05',
    campus: '总部校区',
  },
];

// 样式定义
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
  searchInput: {
    width: 280,
    background: '#1a2332',
  },
  select: {
    width: 140,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  statsBar: {
    display: 'flex',
    gap: 24,
    marginBottom: 20,
    padding: '16px 20px',
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(0, 212, 255, 0.1)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

// 状态配置
const statusConfig = {
  active: { color: '#00ff88', text: '在读', bg: 'rgba(0, 255, 136, 0.1)' },
  inactive: { color: '#ff4d6a', text: '停课', bg: 'rgba(255, 77, 106, 0.1)' },
  graduated: { color: '#00d4ff', text: '结业', bg: 'rgba(0, 212, 255, 0.1)' },
  suspended: { color: '#ffaa00', text: '休学', bg: 'rgba(255, 170, 0, 0.1)' },
};

export function Component() {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 表格列定义
  const columns: ColumnsType<Student> = [
    {
      title: '学生信息',
      key: 'info',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar
            size={44}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{
              background: record.gender === 'male'
                ? 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)'
                : 'linear-gradient(135deg, #ff6b9d 0%, #ff4d6a 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500, marginBottom: 2 }}>
              {record.name}
              <Tag
                style={{
                  marginLeft: 8,
                  background: record.gender === 'male' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 107, 157, 0.1)',
                  border: `1px solid ${record.gender === 'male' ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 107, 157, 0.3)'}`,
                  color: record.gender === 'male' ? '#00d4ff' : '#ff6b9d',
                  fontSize: 11,
                }}
              >
                {record.gender === 'male' ? '男' : '女'}
              </Tag>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              {record.age}岁 | {record.campus}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 6, color: '#00d4ff' }} />
            {record.parentPhone}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            家长: {record.parentName}
          </div>
        </div>
      ),
    },
    {
      title: '报读课程',
      dataIndex: 'courses',
      key: 'courses',
      width: 200,
      render: (courses: string[]) => (
        <Space size={[4, 4]} wrap>
          {courses.map((course, index) => (
            <Tag
              key={index}
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                color: '#00d4ff',
                margin: 0,
              }}
            >
              {course}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '剩余课时',
      dataIndex: 'remainingHours',
      key: 'remainingHours',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.remainingHours - b.remainingHours,
      render: (hours: number) => (
        <span
          style={{
            color: hours > 20 ? '#00ff88' : hours > 0 ? '#ffaa00' : '#ff4d6a',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {hours}
          <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>课时</span>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      filters: [
        { text: '在读', value: 'active' },
        { text: '停课', value: 'inactive' },
        { text: '休学', value: 'suspended' },
        { text: '结业', value: 'graduated' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        return (
          <Tag
            style={{
              background: config.bg,
              border: `1px solid ${config.color}40`,
              color: config.color,
              fontWeight: 500,
              boxShadow: `0 0 8px ${config.color}30`,
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '入学日期',
      dataIndex: 'enrollDate',
      key: 'enrollDate',
      width: 120,
      sorter: (a, b) => new Date(a.enrollDate).getTime() - new Date(b.enrollDate).getTime(),
      render: (date: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{date}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => message.info(`查看学生: ${record.name}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#ffaa00' }}
              onClick={() => message.info(`编辑学生: ${record.name}`)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'attendance', label: '考勤记录' },
                { key: 'consumption', label: '课时消耗' },
                { key: 'contract', label: '合同信息' },
                { type: 'divider' },
                { key: 'delete', label: '删除', danger: true },
              ],
              onClick: ({ key }) => message.info(`${key}: ${record.name}`),
            }}
          >
            <Button type="text" icon={<MoreOutlined />} style={{ color: 'rgba(255, 255, 255, 0.65)' }} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 统计数据
  const stats = {
    total: mockStudents.length,
    active: mockStudents.filter((s) => s.status === 'active').length,
    inactive: mockStudents.filter((s) => s.status === 'inactive' || s.status === 'suspended').length,
    lowHours: mockStudents.filter((s) => s.remainingHours > 0 && s.remainingHours <= 10).length,
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据已刷新');
    }, 1000);
  };

  return (
    <div>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <TeamOutlined style={{ color: '#00d4ff' }} />
          学生管理
        </div>
        <Space>
          <Button icon={<ExportOutlined />}>导出</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={() => setIsModalOpen(true)}
          >
            新增学生
          </Button>
        </Space>
      </div>

      {/* 统计栏 */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>全部学生</div>
        </div>
        <div style={{ width: 1, background: 'rgba(0, 212, 255, 0.2)' }} />
        <div style={styles.statItem}>
          <div style={{ ...styles.statValue, color: '#00ff88' }}>{stats.active}</div>
          <div style={styles.statLabel}>在读学生</div>
        </div>
        <div style={{ width: 1, background: 'rgba(0, 212, 255, 0.2)' }} />
        <div style={styles.statItem}>
          <div style={{ ...styles.statValue, color: '#ff4d6a' }}>{stats.inactive}</div>
          <div style={styles.statLabel}>停课/休学</div>
        </div>
        <div style={{ width: 1, background: 'rgba(0, 212, 255, 0.2)' }} />
        <div style={styles.statItem}>
          <Badge count={stats.lowHours} offset={[10, 0]} style={{ background: '#ffaa00' }}>
            <div style={{ ...styles.statValue, color: '#ffaa00' }}>{stats.lowHours}</div>
          </Badge>
          <div style={styles.statLabel}>课时不足</div>
        </div>
      </div>

      {/* 主卡片 */}
      <Card style={styles.card} bodyStyle={{ padding: 20 }}>
        {/* 筛选栏 */}
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索学生姓名、手机号..."
            prefix={<SearchOutlined style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}
            style={styles.searchInput}
            allowClear
          />
          <Select
            placeholder="学生状态"
            style={styles.select}
            allowClear
            options={[
              { value: 'active', label: '在读' },
              { value: 'inactive', label: '停课' },
              { value: 'suspended', label: '休学' },
              { value: 'graduated', label: '结业' },
            ]}
          />
          <Select
            placeholder="所属校区"
            style={styles.select}
            allowClear
            options={[
              { value: '1', label: '总部校区' },
              { value: '2', label: '分部校区' },
            ]}
          />
          <Select
            placeholder="报读课程"
            style={{ width: 160 }}
            allowClear
            options={[
              { value: '1', label: '少儿编程' },
              { value: '2', label: '数学思维' },
              { value: '3', label: '英语口语' },
              { value: '4', label: '美术创意' },
              { value: '5', label: '钢琴基础' },
            ]}
          />
          <Button icon={<FilterOutlined />}>更多筛选</Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={mockStudents}
          rowKey="id"
          loading={loading}
          pagination={{
            total: mockStudents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
        />

        {/* 批量操作 */}
        {selectedRowKeys.length > 0 && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1a2332',
              padding: '12px 24px',
              borderRadius: 10,
              border: '1px solid rgba(0, 212, 255, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              zIndex: 100,
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              已选择 <span style={{ color: '#00d4ff', fontWeight: 600 }}>{selectedRowKeys.length}</span> 项
            </span>
            <Button size="small">批量编辑</Button>
            <Button size="small">批量导出</Button>
            <Button size="small" danger>
              批量删除
            </Button>
            <Button type="link" size="small" onClick={() => setSelectedRowKeys([])}>
              取消选择
            </Button>
          </div>
        )}
      </Card>

      {/* 新增学生弹窗 */}
      <Modal
        title={
          <span style={{ color: '#fff', fontSize: 18 }}>
            <UserOutlined style={{ marginRight: 8, color: '#00d4ff' }} />
            新增学生
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" style={styles.actionButton}>
            确认添加
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="学生姓名" name="name" rules={[{ required: true }]}>
                <Input placeholder="请输入学生姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
                <Select
                  placeholder="请选择性别"
                  options={[
                    { value: 'male', label: '男' },
                    { value: 'female', label: '女' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="出生日期" name="birthday" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属校区" name="campus" rules={[{ required: true }]}>
                <Select
                  placeholder="请选择校区"
                  options={[
                    { value: '1', label: '总部校区' },
                    { value: '2', label: '分部校区' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="家长姓名" name="parentName" rules={[{ required: true }]}>
                <Input placeholder="请输入家长姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="家长电话" name="parentPhone" rules={[{ required: true }]}>
                <Input placeholder="请输入家长电话" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="报读课程" name="courses">
                <Select
                  mode="multiple"
                  placeholder="请选择报读课程"
                  options={[
                    { value: '1', label: '少儿编程' },
                    { value: '2', label: '数学思维' },
                    { value: '3', label: '英语口语' },
                    { value: '4', label: '美术创意' },
                    { value: '5', label: '钢琴基础' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
