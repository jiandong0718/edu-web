import { useState, useEffect } from 'react';
import { Card, Descriptions, Avatar, Tag, Space, Button, Tabs, Table, Timeline, Spin, message } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  EditOutlined,
  SafetyOutlined,
  HistoryOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface UserDetail {
  id: number;
  username: string;
  realName: string;
  avatar?: string;
  phone: string;
  email: string;
  roles: Array<{ id: number; name: string; code: string }>;
  status: 'active' | 'disabled';
  campus: string;
  department: string;
  position: string;
  createTime: string;
  lastLoginTime: string;
  lastLoginIp: string;
  remark?: string;
}

interface LoginLog {
  id: number;
  loginTime: string;
  loginIp: string;
  loginLocation: string;
  browser: string;
  os: string;
  status: 'success' | 'failed';
}

interface OperationLog {
  id: number;
  operateTime: string;
  module: string;
  action: string;
  description: string;
  ip: string;
}

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
    marginBottom: 20,
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '24px 0',
  },
  avatar: {
    width: 100,
    height: 100,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: '3px solid rgba(0, 212, 255, 0.3)',
    boxShadow: '0 8px 24px rgba(0, 212, 255, 0.3)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  userMeta: {
    display: 'flex',
    gap: 24,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  statusTag: {
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 14,
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  editButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  timelineItem: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  timelineTime: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
  },
};

// 模拟数据
const mockUserDetail: UserDetail = {
  id: 1,
  username: 'admin',
  realName: '系统管理员',
  phone: '13800138000',
  email: 'admin@edu.com',
  roles: [
    { id: 1, name: '超级管理员', code: 'super_admin' },
    { id: 2, name: '系统管理员', code: 'system_admin' },
  ],
  status: 'active',
  campus: '总部校区',
  department: '技术部',
  position: '系统管理员',
  createTime: '2024-01-01 10:00:00',
  lastLoginTime: '2024-03-20 14:30:00',
  lastLoginIp: '192.168.1.100',
  remark: '系统超级管理员账号，拥有所有权限',
};

const mockLoginLogs: LoginLog[] = [
  {
    id: 1,
    loginTime: '2024-03-20 14:30:00',
    loginIp: '192.168.1.100',
    loginLocation: '广东省深圳市',
    browser: 'Chrome 122',
    os: 'Windows 10',
    status: 'success',
  },
  {
    id: 2,
    loginTime: '2024-03-19 09:15:00',
    loginIp: '192.168.1.100',
    loginLocation: '广东省深圳市',
    browser: 'Chrome 122',
    os: 'Windows 10',
    status: 'success',
  },
  {
    id: 3,
    loginTime: '2024-03-18 16:45:00',
    loginIp: '192.168.1.101',
    loginLocation: '广东省深圳市',
    browser: 'Chrome 122',
    os: 'Windows 10',
    status: 'failed',
  },
];

const mockOperationLogs: OperationLog[] = [
  {
    id: 1,
    operateTime: '2024-03-20 15:30:00',
    module: '用户管理',
    action: '新增',
    description: '新增用户：张三',
    ip: '192.168.1.100',
  },
  {
    id: 2,
    operateTime: '2024-03-20 14:45:00',
    module: '角色管理',
    action: '编辑',
    description: '修改角色：教师',
    ip: '192.168.1.100',
  },
  {
    id: 3,
    operateTime: '2024-03-20 10:20:00',
    module: '菜单管理',
    action: '新增',
    description: '新增菜单：学生管理',
    ip: '192.168.1.100',
  },
];

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);

  useEffect(() => {
    loadUserDetail();
  }, [id]);

  const loadUserDetail = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUserDetail(mockUserDetail);
      setLoginLogs(mockLoginLogs);
      setOperationLogs(mockOperationLogs);
    } catch (error) {
      message.error('加载用户详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loginLogColumns: ColumnsType<LoginLog> = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '登录IP',
      dataIndex: 'loginIp',
      key: 'loginIp',
      width: 150,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      width: 150,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
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
            background: status === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 'success' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: status === 'success' ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userDetail) {
    return (
      <Card style={styles.card}>
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'rgba(255, 255, 255, 0.45)' }}>
          用户不存在
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <SafetyOutlined style={{ color: '#00d4ff' }} />
          用户详情
        </div>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            返回
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={styles.editButton}
            onClick={() => message.info('编辑功能开发中')}
          >
            编辑
          </Button>
        </Space>
      </div>

      {/* 用户基本信息 */}
      <Card style={styles.card}>
        <div style={styles.userHeader}>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={userDetail.avatar}
            style={styles.avatar}
          />
          <div style={styles.userInfo}>
            <div style={styles.userName}>{userDetail.realName}</div>
            <div style={styles.userMeta}>
              <div style={styles.metaItem}>
                <UserOutlined />
                <span>@{userDetail.username}</span>
              </div>
              <div style={styles.metaItem}>
                <PhoneOutlined />
                <span>{userDetail.phone}</span>
              </div>
              <div style={styles.metaItem}>
                <MailOutlined />
                <span>{userDetail.email}</span>
              </div>
              <div style={styles.metaItem}>
                <EnvironmentOutlined />
                <span>{userDetail.campus}</span>
              </div>
            </div>
          </div>
          <Tag
            style={{
              ...styles.statusTag,
              background: userDetail.status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
              border: `1px solid ${userDetail.status === 'active' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
              color: userDetail.status === 'active' ? '#00ff88' : '#ff4d6a',
            }}
          >
            {userDetail.status === 'active' ? '正常' : '禁用'}
          </Tag>
        </div>

        <Descriptions column={2} bordered>
          <Descriptions.Item label="用户ID">{userDetail.id}</Descriptions.Item>
          <Descriptions.Item label="用户名">{userDetail.username}</Descriptions.Item>
          <Descriptions.Item label="真实姓名">{userDetail.realName}</Descriptions.Item>
          <Descriptions.Item label="手机号">{userDetail.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{userDetail.email}</Descriptions.Item>
          <Descriptions.Item label="所属校区">{userDetail.campus}</Descriptions.Item>
          <Descriptions.Item label="部门">{userDetail.department}</Descriptions.Item>
          <Descriptions.Item label="职位">{userDetail.position}</Descriptions.Item>
          <Descriptions.Item label="角色" span={2}>
            <Space wrap>
              {userDetail.roles.map((role) => (
                <Tag
                  key={role.id}
                  style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    color: '#00d4ff',
                  }}
                >
                  {role.name}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{userDetail.createTime}</Descriptions.Item>
          <Descriptions.Item label="最后登录时间">{userDetail.lastLoginTime}</Descriptions.Item>
          <Descriptions.Item label="最后登录IP" span={2}>{userDetail.lastLoginIp}</Descriptions.Item>
          {userDetail.remark && (
            <Descriptions.Item label="备注" span={2}>{userDetail.remark}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 详细信息标签页 */}
      <Card style={styles.card}>
        <Tabs
          defaultActiveKey="loginLog"
          items={[
            {
              key: 'loginLog',
              label: (
                <span>
                  <TeamOutlined />
                  登录日志
                </span>
              ),
              children: (
                <Table
                  columns={loginLogColumns}
                  dataSource={loginLogs}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条记录`,
                  }}
                />
              ),
            },
            {
              key: 'operationLog',
              label: (
                <span>
                  <HistoryOutlined />
                  操作日志
                </span>
              ),
              children: (
                <Timeline
                  items={operationLogs.map((log) => ({
                    children: (
                      <div>
                        <div style={styles.timelineItem}>
                          <strong>{log.module}</strong> - {log.action}
                        </div>
                        <div style={{ ...styles.timelineItem, marginTop: 4 }}>
                          {log.description}
                        </div>
                        <div style={{ ...styles.timelineTime, marginTop: 4 }}>
                          {log.operateTime} · {log.ip}
                        </div>
                      </div>
                    ),
                    color: '#00d4ff',
                  }))}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default Component;
