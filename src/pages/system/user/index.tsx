import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  InputNumber,
  Space,
  Tag,
  Avatar,
  Tooltip,
  message,
  Modal,
  Form,
  Select,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUser,
  type User,
  type UserQueryParams,
} from '@/api/user';

interface UserFormValues {
  username: string;
  realName: string;
  phone: string;
  email: string;
  gender: number;
  status: number;
  campusId?: number;
  remark?: string;
  password?: string;
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
};

const normalizeUserPage = (response: unknown): { list: User[]; total: number } => {
  const raw = response as
    | { list?: User[]; total?: number; data?: { list?: User[]; total?: number } }
    | undefined;

  const payload = raw?.data && Array.isArray(raw.data.list) ? raw.data : raw;
  const list = Array.isArray(payload?.list) ? payload.list : [];
  const total = typeof payload?.total === 'number' ? payload.total : list.length;

  return { list, total };
};

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormValues>();

  const loadData = async () => {
    setLoading(true);
    try {
      const params: UserQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };

      if (queryKeyword) {
        params.username = queryKeyword;
      }

      const response = await getUserList(params);
      const pageResult = normalizeUserPage(response);
      setUsers(pageResult.list);
      setTotal(pageResult.total);
    } catch {
      message.error('加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [pagination.current, pagination.pageSize, queryKeyword]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setQueryKeyword(searchInput.trim());
  };

  const handleReset = () => {
    setSearchInput('');
    setQueryKeyword('');
    setPagination({ current: 1, pageSize: 10 });
  };

  const handleRefresh = () => {
    void loadData();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      gender: 1,
      status: 1,
    });
    setModalVisible(true);
  };

  const openEditModal = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      realName: record.realName,
      phone: record.phone,
      email: record.email,
      gender: record.gender,
      status: record.status,
      campusId: record.campusId,
      remark: record.remark,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: UserFormValues = {
        ...values,
        campusId: typeof values.campusId === 'number' ? values.campusId : undefined,
      };
      setSubmitting(true);

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        message.success('用户更新成功');
      } else {
        await createUser(payload);
        message.success('用户创建成功');
      }

      setModalVisible(false);
      await loadData();
    } catch {
      // validate error or request error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除用户“${record.realName}”吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success('删除成功');
          setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));
          await loadData();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的用户');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定删除选中的 ${selectedRowKeys.length} 个用户吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await batchDeleteUser(selectedRowKeys);
          message.success(`已删除 ${selectedRowKeys.length} 个用户`);
          setSelectedRowKeys([]);
          await loadData();
        } catch {
          message.error('批量删除失败');
        }
      },
    });
  };

  const handleTableChange = (pager: TablePaginationConfig) => {
    setPagination({
      current: pager.current || 1,
      pageSize: pager.pageSize || 10,
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'info',
      width: 260,
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
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{record.phone || '-'}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>{record.email || '-'}</div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roleIds',
      key: 'roleIds',
      width: 180,
      render: (roleIds?: number[]) => {
        if (!Array.isArray(roleIds) || roleIds.length === 0) {
          return <span style={{ color: 'rgba(255, 255, 255, 0.45)' }}>-</span>;
        }

        return (
          <Space wrap>
            {roleIds.map((roleId) => (
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
            ))}
          </Space>
        );
      },
    },
    {
      title: '所属校区',
      dataIndex: 'campusName',
      key: 'campusName',
      width: 140,
      render: (campusName?: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{campusName || '-'}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <Tag
          style={{
            background: status === 1 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 1 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: status === 1 ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (createTime: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{createTime || '-'}</span>
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
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d6a' }}
              onClick={() => handleDelete(record)}
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
          <UserOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          用户管理
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} style={styles.actionButton} onClick={openCreateModal}>
            新增用户
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索用户名"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
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

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (value) => `共 ${value} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="初始密码"
              name="password"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}

          <Form.Item
            label="姓名"
            name="realName"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item label="性别" name="gender" rules={[{ required: true, message: '请选择性别' }]}> 
            <Select
              options={[
                { label: '男', value: 1 },
                { label: '女', value: 2 },
              ]}
            />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}> 
            <Select
              options={[
                { label: '正常', value: 1 },
                { label: '禁用', value: 0 },
              ]}
            />
          </Form.Item>

          <Form.Item label="校区ID" name="campusId">
            <InputNumber style={{ width: '100%' }} placeholder="请输入校区ID（可选）" />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
