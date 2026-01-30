import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Tooltip,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface User {
  id: number;
  username: string;
  realName: string;
  avatar?: string;
  phone: string;
  email: string;
  roles: string[];
  status: 'active' | 'disabled';
  campus: string;
  createTime: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    phone: '13800138000',
    email: 'admin@edu.com',
    roles: ['超级管理员'],
    status: 'active',
    campus: '总部校区',
    createTime: '2024-01-01',
  },
  {
    id: 2,
    username: 'teacher01',
    realName: '张老师',
    phone: '13900139000',
    email: 'zhang@edu.com',
    roles: ['教师'],
    status: 'active',
    campus: '总部校区',
    createTime: '2024-02-15',
  },
  {
    id: 3,
    username: 'sales01',
    realName: '李销售',
    phone: '13700137000',
    email: 'li@edu.com',
    roles: ['销售'],
    status: 'active',
    campus: '分部校区',
    createTime: '2024-03-20',
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
};

export function Component() {
  const [loading, setLoading] = useState(false);

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'info',
      width: 240,
      render: (_, record) => (
        <Space>
          <Avatar
            size={44}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: '2px solid rgba(0, 212, 255, 0.3)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500 }}>{record.realName}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              @{record.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{record.phone}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map((role, index) => (
            <Tag
              key={index}
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
              }}
            >
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '所属校区',
      dataIndex: 'campus',
      key: 'campus',
      width: 120,
      render: (campus: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{campus}</span>
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
          {status === 'active' ? '正常' : '禁用'}
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
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => message.info(`编辑: ${record.realName}`)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d6a' }}
              onClick={() => message.info(`删除: ${record.realName}`)}
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
    <div>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <SafetyOutlined style={{ color: '#00d4ff' }} />
          用户管理
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} style={styles.actionButton}>
            新增用户
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bodyStyle={{ padding: 20 }}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索用户名、姓名、手机号..."
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
          dataSource={mockUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: mockUsers.length,
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
}
