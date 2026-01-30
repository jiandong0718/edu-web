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
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Contract {
  id: number;
  contractNo: string;
  studentName: string;
  courseName: string;
  totalAmount: number;
  paidAmount: number;
  totalHours: number;
  remainingHours: number;
  status: 'active' | 'expired' | 'terminated';
  signDate: string;
  expireDate: string;
}

const mockContracts: Contract[] = [
  {
    id: 1,
    contractNo: 'HT202401001',
    studentName: '张小明',
    courseName: '少儿编程入门班',
    totalAmount: 3999,
    paidAmount: 3999,
    totalHours: 48,
    remainingHours: 36,
    status: 'active',
    signDate: '2024-01-15',
    expireDate: '2025-01-15',
  },
  {
    id: 2,
    contractNo: 'HT202401002',
    studentName: '李小红',
    courseName: '英语口语强化班',
    totalAmount: 4599,
    paidAmount: 2300,
    totalHours: 60,
    remainingHours: 45,
    status: 'active',
    signDate: '2024-02-01',
    expireDate: '2025-02-01',
  },
  {
    id: 3,
    contractNo: 'HT202312001',
    studentName: '王小刚',
    courseName: '钢琴基础班',
    totalAmount: 5999,
    paidAmount: 5999,
    totalHours: 48,
    remainingHours: 0,
    status: 'expired',
    signDate: '2023-12-01',
    expireDate: '2024-12-01',
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

const statusConfig = {
  active: { color: '#00ff88', text: '生效中', bg: 'rgba(0, 255, 136, 0.1)' },
  expired: { color: '#ffaa00', text: '已到期', bg: 'rgba(255, 170, 0, 0.1)' },
  terminated: { color: '#ff4d6a', text: '已终止', bg: 'rgba(255, 77, 106, 0.1)' },
};

export function Component() {
  const [loading, setLoading] = useState(false);

  const columns: ColumnsType<Contract> = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 140,
      render: (no: string) => (
        <span style={{ color: '#00d4ff', fontWeight: 500 }}>{no}</span>
      ),
    },
    {
      title: '学生信息',
      key: 'student',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            size={36}
            icon={<UserOutlined />}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500 }}>{record.studentName}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              {record.courseName}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '合同金额',
      key: 'amount',
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
            ¥{record.totalAmount.toLocaleString()}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            已付: ¥{record.paidAmount.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '课时情况',
      key: 'hours',
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            总课时: {record.totalHours}
          </div>
          <div style={{
            color: record.remainingHours > 10 ? '#00ff88' : record.remainingHours > 0 ? '#ffaa00' : '#ff4d6a',
            fontSize: 12
          }}>
            剩余: {record.remainingHours} 课时
          </div>
        </div>
      ),
    },
    {
      title: '有效期',
      key: 'date',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12 }}>
            签约: {record.signDate}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            到期: {record.expireDate}
          </div>
        </div>
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
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => message.info(`查看: ${record.contractNo}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#ffaa00' }}
              onClick={() => message.info(`编辑: ${record.contractNo}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const stats = {
    total: mockContracts.length,
    active: mockContracts.filter((c) => c.status === 'active').length,
    totalAmount: mockContracts.reduce((acc, c) => acc + c.totalAmount, 0),
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
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <FileTextOutlined style={{ color: '#00d4ff' }} />
          合同管理
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} style={styles.actionButton}>
            新增合同
          </Button>
        </Space>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>全部合同</div>
        </div>
        <div style={{ width: 1, background: 'rgba(0, 212, 255, 0.2)' }} />
        <div style={styles.statItem}>
          <div style={{ ...styles.statValue, color: '#00ff88' }}>{stats.active}</div>
          <div style={styles.statLabel}>生效中</div>
        </div>
        <div style={{ width: 1, background: 'rgba(0, 212, 255, 0.2)' }} />
        <div style={styles.statItem}>
          <div style={{ ...styles.statValue, color: '#ffaa00' }}>
            ¥{stats.totalAmount.toLocaleString()}
          </div>
          <div style={styles.statLabel}>合同总额</div>
        </div>
      </div>

      <Card style={styles.card} bodyStyle={{ padding: 20 }}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索合同编号、学生姓名..."
            prefix={<SearchOutlined style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}
            style={{ width: 300 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={mockContracts}
          rowKey="id"
          loading={loading}
          pagination={{
            total: mockContracts.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
}
