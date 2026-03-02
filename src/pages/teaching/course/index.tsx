import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  ReadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Course {
  id: number;
  name: string;
  category: string;
  price: number;
  totalHours: number;
  studentCount: number;
  status: 'active' | 'inactive';
  description: string;
  createTime: string;
}

const mockCourses: Course[] = [
  {
    id: 1,
    name: '少儿编程入门班',
    category: '编程',
    price: 3999,
    totalHours: 48,
    studentCount: 45,
    status: 'active',
    description: '适合6-12岁儿童的编程启蒙课程',
    createTime: '2024-01-15',
  },
  {
    id: 2,
    name: '数学思维训练班',
    category: '数学',
    price: 2999,
    totalHours: 36,
    studentCount: 38,
    status: 'active',
    description: '培养逻辑思维和数学能力',
    createTime: '2024-02-01',
  },
  {
    id: 3,
    name: '英语口语强化班',
    category: '英语',
    price: 4599,
    totalHours: 60,
    studentCount: 35,
    status: 'active',
    description: '外教一对一口语训练',
    createTime: '2024-01-20',
  },
  {
    id: 4,
    name: '美术创意班',
    category: '艺术',
    price: 2599,
    totalHours: 32,
    studentCount: 32,
    status: 'active',
    description: '激发创意思维的美术课程',
    createTime: '2024-03-01',
  },
  {
    id: 5,
    name: '钢琴基础班',
    category: '音乐',
    price: 5999,
    totalHours: 48,
    studentCount: 28,
    status: 'inactive',
    description: '零基础钢琴入门课程',
    createTime: '2024-02-15',
  },
];

const categoryColors: Record<string, string> = {
  '编程': '#00d4ff',
  '数学': '#00ff88',
  '英语': '#ffaa00',
  '艺术': '#ff6b9d',
  '音乐': '#a855f7',
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

function CourseList() {
  const [loading, setLoading] = useState(false);

  const columns: ColumnsType<Course> = [
    {
      title: '课程名称',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag
          style={{
            background: `${categoryColors[category]}15`,
            border: `1px solid ${categoryColors[category]}40`,
            color: categoryColors[category],
          }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <span style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
          ¥{price.toLocaleString()}
        </span>
      ),
    },
    {
      title: '课时',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 100,
      align: 'center',
      render: (hours: number) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#00d4ff' }} />
          <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{hours} 课时</span>
        </Space>
      ),
    },
    {
      title: '学员数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 150,
      sorter: (a, b) => a.studentCount - b.studentCount,
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={Math.min(count * 2, 100)}
            size="small"
            strokeColor={{
              '0%': '#00d4ff',
              '100%': '#0099ff',
            }}
            trailColor="rgba(255, 255, 255, 0.1)"
            showInfo={false}
            style={{ width: 60, marginBottom: 0 }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.85)', marginLeft: 8 }}>
            {count}
          </span>
        </div>
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
          style={{
            background: status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 'active' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: status === 'active' ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
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
              onClick={() => message.info(`编辑: ${record.name}`)}
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

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <ReadOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          课程管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
          >
            新增课程
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{mockCourses.length}</div>
            <div style={styles.statLabel}>总课程数</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {mockCourses.filter((c) => c.status === 'active').length}
            </div>
            <div style={styles.statLabel}>启用课程</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {mockCourses.reduce((sum, c) => sum + c.studentCount, 0)}
            </div>
            <div style={styles.statLabel}>总学员数</div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索课程名称"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={mockCourses}
          rowKey="id"
          loading={loading}
          pagination={{
            total: mockCourses.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
}

export default CourseList;
