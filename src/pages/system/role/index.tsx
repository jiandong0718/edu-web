import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Tree,
  message,
  Tooltip,
  Select,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
  ReloadOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { assignRolePermissions, createRole, deleteRole, getPermissionTree, getRoleList, getRolePermissionIds, updateRole } from '@/api/role';
import type { Permission, Role, RoleQueryParams, RoleStatus } from '@/types/role';

interface RoleFormValues {
  name: string;
  code: string;
  description?: string;
  status: RoleStatus;
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
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeRoleStatus = (value: unknown): RoleStatus => {
  if (value === 1 || value === '1' || value === 'active' || value === 'enabled') {
    return 'active';
  }
  return 'disabled';
};

const normalizeRole = (item: Record<string, unknown>): Role => {
  const id = toNumber(item.id, 0);

  return {
    id,
    name: typeof item.name === 'string' ? item.name : `角色#${id}`,
    code: typeof item.code === 'string' ? item.code : '',
    description: typeof item.description === 'string' ? item.description : '',
    status: normalizeRoleStatus(item.status),
    userCount: toNumber(item.userCount),
    createTime:
      typeof item.createTime === 'string'
        ? item.createTime
        : typeof item.createdAt === 'string'
          ? item.createdAt
          : '-',
    permissionIds: Array.isArray(item.permissionIds)
      ? item.permissionIds.map((permissionId) => toNumber(permissionId)).filter((permissionId) => permissionId > 0)
      : [],
  };
};

const normalizeRolePage = (response: unknown): { list: Role[]; total: number } => {
  const raw = response as
    | {
      list?: unknown[];
      total?: number;
      data?: { list?: unknown[]; total?: number } | unknown[];
    }
    | unknown[]
    | undefined;

  const payload =
    raw && !Array.isArray(raw) && raw.data && !Array.isArray(raw.data) && Array.isArray(raw.data.list)
      ? raw.data
      : raw;

  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { list?: unknown[] } | undefined)?.list)
      ? (payload as { list: unknown[] }).list
      : raw && !Array.isArray(raw) && Array.isArray(raw.data)
        ? raw.data
        : [];

  const list = rawList
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(normalizeRole);

  const total =
    !Array.isArray(payload) && typeof (payload as { total?: number } | undefined)?.total === 'number'
      ? (payload as { total: number }).total
      : list.length;

  return { list, total };
};

const normalizePermissionTree = (response: unknown): Permission[] => {
  const raw = response as
    | Permission[]
    | {
      data?: Permission[] | { list?: Permission[] };
      list?: Permission[];
    }
    | undefined;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (Array.isArray(raw?.list)) {
    return raw.list;
  }

  if (Array.isArray(raw?.data)) {
    return raw.data;
  }

  if (raw?.data && Array.isArray(raw.data.list)) {
    return raw.data.list;
  }

  return [];
};

const normalizePermissionIds = (response: unknown): number[] => {
  if (Array.isArray(response)) {
    return response.map((id) => toNumber(id)).filter((id) => id > 0);
  }

  const raw = response as { permissionIds?: unknown[]; data?: { permissionIds?: unknown[] } } | undefined;
  const ids = Array.isArray(raw?.permissionIds)
    ? raw.permissionIds
    : Array.isArray(raw?.data?.permissionIds)
      ? raw.data.permissionIds
      : [];

  return ids.map((id) => toNumber(id)).filter((id) => id > 0);
};

const toTreeData = (permissions: Permission[]): DataNode[] => {
  return permissions.map((permission) => ({
    title: permission.name,
    key: permission.id,
    children: Array.isArray(permission.children) ? toTreeData(permission.children) : undefined,
  }));
};

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [permissionSubmitting, setPermissionSubmitting] = useState(false);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionTree, setPermissionTree] = useState<Permission[]>([]);
  const [checkedPermissionKeys, setCheckedPermissionKeys] = useState<number[]>([]);

  const [form] = Form.useForm<RoleFormValues>();

  const loadRoles = async () => {
    setLoading(true);
    try {
      const params: RoleQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };

      if (queryKeyword) {
        params.keyword = queryKeyword;
      }

      const response = await getRoleList(params);
      const pageResult = normalizeRolePage(response);
      setRoles(pageResult.list);
      setTotal(pageResult.total);
    } catch {
      message.error('加载角色数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissionData = async () => {
    try {
      const response = await getPermissionTree();
      setPermissionTree(normalizePermissionTree(response));
    } catch {
      message.error('加载权限树失败');
    }
  };

  useEffect(() => {
    void loadRoles();
  }, [pagination.current, pagination.pageSize, queryKeyword]);

  useEffect(() => {
    void loadPermissionData();
  }, []);

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
    void loadRoles();
  };

  const openCreateModal = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setModalVisible(true);
  };

  const openEditModal = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingRole) {
        await updateRole(editingRole.id, values);
        message.success('角色更新成功');
      } else {
        await createRole(values);
        message.success('角色创建成功');
      }

      setModalVisible(false);
      await loadRoles();
    } catch {
      // form validate or request error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (record: Role) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除角色“${record.name}”吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteRole(record.id);
          message.success('删除成功');
          await loadRoles();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const openPermissionModal = async (record: Role) => {
    setEditingRole(record);
    setPermissionModalVisible(true);

    try {
      const response = await getRolePermissionIds(record.id);
      setCheckedPermissionKeys(normalizePermissionIds(response));
    } catch {
      setCheckedPermissionKeys(Array.isArray(record.permissionIds) ? record.permissionIds : []);
    }
  };

  const handlePermissionOk = async () => {
    if (!editingRole) {
      setPermissionModalVisible(false);
      return;
    }

    try {
      setPermissionSubmitting(true);
      await assignRolePermissions(
        editingRole.id,
        checkedPermissionKeys.map((id) => toNumber(id)).filter((id) => id > 0)
      );
      message.success('权限分配成功');
      setPermissionModalVisible(false);
    } catch {
      message.error('权限分配失败');
    } finally {
      setPermissionSubmitting(false);
    }
  };

  const handleTableChange = (pager: TablePaginationConfig) => {
    setPagination({
      current: pager.current || 1,
      pageSize: pager.pageSize || 10,
    });
  };

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (name: string) => <div style={{ color: '#fff', fontWeight: 500 }}>{name}</div>,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 170,
      render: (code: string) => <span style={{ color: '#00d4ff', fontFamily: 'monospace' }}>{code}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | undefined) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{desc || '-'}</span>
      ),
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      align: 'center',
      render: (count: number | undefined) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
          }}
        >
          {count || 0}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: RoleStatus) => (
        <Tag
          style={{
            background: status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 'active' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: status === 'active' ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (date: string | undefined) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{date || '-'}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="分配权限">
            <Button
              type="text"
              icon={<KeyOutlined />}
              style={{ color: '#00ff88' }}
              onClick={() => {
                void openPermissionModal(record);
              }}
            />
          </Tooltip>
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
          <SafetyOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          角色管理
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} style={styles.actionButton} onClick={openCreateModal}>
            新增角色
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索角色名称或编码"
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 280 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </div>

        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => {
          void handleModalOk();
        }}
        confirmLoading={submitting}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色编码" name="code" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input disabled={!!editingRole} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select
              options={[
                { label: '启用', value: 'active' },
                { label: '禁用', value: 'disabled' },
              ]}
            />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRole ? `分配权限 - ${editingRole.name}` : '分配权限'}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onOk={() => {
          void handlePermissionOk();
        }}
        confirmLoading={permissionSubmitting}
        width={600}
      >
        <Tree
          checkable
          defaultExpandAll
          treeData={toTreeData(permissionTree)}
          checkedKeys={checkedPermissionKeys}
          onCheck={(checkedKeysValue) => {
            const keys = Array.isArray(checkedKeysValue)
              ? checkedKeysValue
              : checkedKeysValue.checked;

            setCheckedPermissionKeys(
              keys
                .map((key) => toNumber(key))
                .filter((id) => id > 0)
            );
          }}
        />
      </Modal>
    </div>
  );
}
