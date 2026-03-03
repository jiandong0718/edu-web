import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Tag,
  Space,
  Button,
  Tabs,
  Table,
  Timeline,
  Spin,
  message,
} from 'antd';
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
import { getUserDetail, type User as ApiUser } from '@/api/user';
import { getLoginLogList, type LoginLog as ApiLoginLog } from '@/api/system';
import {
  getOperationLogList,
  type OperationLog as ApiOperationLog,
} from '@/api/operationLog';

interface UserDetailView {
  id: number;
  username: string;
  realName: string;
  avatar?: string;
  phone: string;
  email: string;
  roleIds: number[];
  status: 'active' | 'disabled';
  campus: string;
  createTime: string;
  updateTime: string;
  remark?: string;
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
    flexWrap: 'wrap' as const,
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

const normalizeUserDetail = (response: unknown): ApiUser | null => {
  if (!response) return null;

  const raw = response as { data?: ApiUser } | ApiUser;
  if ((raw as { data?: ApiUser }).data) {
    return (raw as { data?: ApiUser }).data || null;
  }

  return raw as ApiUser;
};

const normalizeLoginLogs = (response: unknown): ApiLoginLog[] => {
  const raw = response as
    | { list?: ApiLoginLog[]; data?: { list?: ApiLoginLog[] } }
    | undefined;

  if (Array.isArray(raw?.list)) {
    return raw.list;
  }

  if (raw?.data && Array.isArray(raw.data.list)) {
    return raw.data.list;
  }

  return [];
};

const normalizeOperationLogs = (response: unknown): ApiOperationLog[] => {
  const raw = response as
    | { list?: ApiOperationLog[]; data?: { list?: ApiOperationLog[] } }
    | undefined;

  if (Array.isArray(raw?.list)) {
    return raw.list;
  }

  if (raw?.data && Array.isArray(raw.data.list)) {
    return raw.data.list;
  }

  return [];
};

const mapUserToView = (user: ApiUser): UserDetailView => ({
  id: user.id,
  username: user.username,
  realName: user.realName,
  avatar: user.avatar,
  phone: user.phone,
  email: user.email,
  roleIds: Array.isArray(user.roleIds) ? user.roleIds : [],
  status: user.status === 1 ? 'active' : 'disabled',
  campus: user.campusName || '-',
  createTime: user.createTime,
  updateTime: user.updateTime,
  remark: user.remark,
});

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetailView | null>(null);
  const [loginLogs, setLoginLogs] = useState<ApiLoginLog[]>([]);
  const [operationLogs, setOperationLogs] = useState<ApiOperationLog[]>([]);

  const loadUserDetail = async () => {
    if (!id) {
      setUserDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userResponse = await getUserDetail(Number(id));
      const user = normalizeUserDetail(userResponse);

      if (!user) {
        setUserDetail(null);
        return;
      }

      const username = user.username;

      const [loginResponse, operationResponse] = await Promise.all([
        getLoginLogList({ page: 1, pageSize: 20, username }),
        getOperationLogList({ page: 1, pageSize: 20, username }),
      ]);

      setUserDetail(mapUserToView(user));
      setLoginLogs(normalizeLoginLogs(loginResponse));
      setOperationLogs(normalizeOperationLogs(operationResponse));
    } catch {
      message.error('加载用户详情失败');
      setUserDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUserDetail();
  }, [id]);

  const lastLogin = useMemo(() => loginLogs[0] || null, [loginLogs]);

  const loginLogColumns: ColumnsType<ApiLoginLog> = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '登录IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 150,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '登录地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text || '-'}</span>,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text || '-'}</span>,
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      render: (text) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text || '-'}</span>,
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={styles.backButton}>
            返回
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={styles.editButton}
            onClick={() => message.info('请在用户管理列表页进行编辑')}
          >
            编辑
          </Button>
        </Space>
      </div>

      <Card style={styles.card}>
        <div style={styles.userHeader}>
          <Avatar size={100} icon={<UserOutlined />} src={userDetail.avatar} style={styles.avatar} />
          <div style={styles.userInfo}>
            <div style={styles.userName}>{userDetail.realName}</div>
            <div style={styles.userMeta}>
              <div style={styles.metaItem}>
                <UserOutlined />
                <span>@{userDetail.username}</span>
              </div>
              <div style={styles.metaItem}>
                <PhoneOutlined />
                <span>{userDetail.phone || '-'}</span>
              </div>
              <div style={styles.metaItem}>
                <MailOutlined />
                <span>{userDetail.email || '-'}</span>
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
          <Descriptions.Item label="手机号">{userDetail.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{userDetail.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="所属校区">{userDetail.campus}</Descriptions.Item>
          <Descriptions.Item label="角色" span={2}>
            <Space wrap>
              {userDetail.roleIds.length > 0 ? (
                userDetail.roleIds.map((roleId) => (
                  <Tag
                    key={roleId}
                    style={{
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      color: '#00d4ff',
                    }}
                  >
                    角色#{roleId}
                  </Tag>
                ))
              ) : (
                <span style={{ color: 'rgba(255, 255, 255, 0.45)' }}>-</span>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{userDetail.createTime}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{userDetail.updateTime}</Descriptions.Item>
          <Descriptions.Item label="最后登录时间">{lastLogin?.loginTime || '-'}</Descriptions.Item>
          <Descriptions.Item label="最后登录IP">{lastLogin?.ip || '-'}</Descriptions.Item>
          {userDetail.remark && <Descriptions.Item label="备注" span={2}>{userDetail.remark}</Descriptions.Item>}
        </Descriptions>
      </Card>

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
                    showTotal: (value) => `共 ${value} 条记录`,
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
                          <strong>{log.module}</strong> - {log.operation}
                        </div>
                        <div style={{ ...styles.timelineItem, marginTop: 4 }}>
                          {log.method}
                        </div>
                        <div style={{ ...styles.timelineTime, marginTop: 4 }}>
                          {log.createTime} · {log.ip}
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
