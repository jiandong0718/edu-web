import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Row,
  Col,
  DatePicker,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
  TeamOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { StudentBatchImport } from '@/components/StudentBatchImport';

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

function StudentList() {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
              {record.age}岁 · {record.phone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '家长信息',
      key: 'parent',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>
            {record.parentName}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.parentPhone}
          </div>
        </div>
      ),
    },
    {
      title: '课程',
      dataIndex: 'courses',
      key: 'courses',
      render: (courses: string[]) => (
        <Space wrap>
          {courses.map((course, index) => (
            <Tag
              key={index}
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
                fontSize: 11,
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
      width: 120,
      align: 'center',
      sorter: (a, b) => a.remainingHours - b.remainingHours,
      render: (hours: number) => (
        <Tag
          style={{
            background: hours > 20 ? 'rgba(0, 255, 136, 0.1)' : hours > 0 ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${hours > 20 ? 'rgba(0, 255, 136, 0.3)' : hours > 0 ? 'rgba(255, 170, 0, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: hours > 20 ? '#00ff88' : hours > 0 ? '#ffaa00' : '#ff4d6a',
            fontWeight: 600,
          }}
        >
          {hours} 课时
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: keyof typeof statusConfig) => {
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
      title: '入学日期',
      dataIndex: 'enrollDate',
      key: 'enrollDate',
      width: 120,
      render: (date: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{date}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => message.info(`查看: ${record.name}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00ff88' }}
              onClick={() => {
                setIsModalOpen(true);
                form.setFieldsValue(record);
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d6a' }}
              onClick={() => message.info(`删除: ${record.name}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据已刷新');
    }, 1000);
  };

  // 导入成功回调
  const handleImportSuccess = () => {
    handleRefresh();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <TeamOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          学生管理
        </div>
        <Space>
          <Button
            icon={<ImportOutlined />}
            onClick={() => setIsImportModalOpen(true)}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
            }}
          >
            批量导入
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={() => setIsModalOpen(true)}
          >
            新增学生
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{mockStudents.length}</div>
            <div style={styles.statLabel}>总学生数</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {mockStudents.filter((s) => s.status === 'active').length}
            </div>
            <div style={styles.statLabel}>在读学生</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {mockStudents.reduce((sum, s) => sum + s.remainingHours, 0)}
            </div>
            <div style={styles.statLabel}>总剩余课时</div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索学生姓名、手机号"
            prefix={<SearchOutlined />}
            style={styles.searchInput}
          />
          <Select
            placeholder="状态"
            style={styles.select}
            options={[
              { label: '全部', value: 'all' },
              { label: '在读', value: 'active' },
              { label: '停课', value: 'inactive' },
              { label: '结业', value: 'graduated' },
              { label: '休学', value: 'suspended' },
            ]}
          />
          <Select
            placeholder="校区"
            style={styles.select}
            options={[
              { label: '全部', value: 'all' },
              { label: '总部校区', value: '总部校区' },
              { label: '分部校区', value: '分部校区' },
            ]}
          />
          <Button icon={<FilterOutlined />}>高级筛选</Button>
          <Button icon={<ExportOutlined />}>导出</Button>
        </div>

        <Table
          columns={columns}
          dataSource={mockStudents}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            total: mockStudents.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title="新增学生"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success('保存成功');
            setIsModalOpen(false);
          });
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="学生姓名" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '男', value: 'male' },
                    { label: '女', value: 'female' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="年龄" name="age" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="手机号" name="phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="家长姓名" name="parentName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="家长手机" name="parentPhone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="入学日期" name="enrollDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导入弹窗 */}
      <StudentBatchImport
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}

export default StudentList;
