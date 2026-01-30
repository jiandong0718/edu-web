import { useState } from 'react';
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
import type { DataNode } from 'antd/es/tree';

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'disabled';
  userCount: number;
  createTime: string;
}

interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button';
  parentId: number | null;
  children?: Permission[];
}

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    status: 'active',
    userCount: 1,
    createTime: '2024-01-01',
  },
  {
    id: 2,
    name: '系统管理员',
    code: 'system_admin',
    description: '系统管理相关权限',
    status: 'active',
    userCount: 3,
    createTime: '2024-01-15',
  },
  {
    id: 3,
    name: '教师',
    code: 'teacher',
    description: '教学相关权限',
    status: 'active',
    userCount: 25,
    createTime: '2024-02-01',
  },
  {
    id: 4,
    name: '销售',
    code: 'sales',
    description: '销售相关权限',
    status: 'active',
    userCount: 15,
    createTime: '2024-02-10',
  },
];

// 模拟权限树数据
const mockPermissions: Permission[] = [
  {
    id: 1,
    name: '系统管理',
    code: 'system',
    type: 'menu',
    parentId: null,
    children: [
      {
        id: 11,
        name: '用户管理',
        code: 'system:user',
        type: 'menu',
        parentId: 1,
        children: [
          { id: 111, name: '查看', code: 'system:user:view', type: 'button', parentId: 11 },
          { id: 112, name: '新增', code: 'system:user:add', type: 'button', parentId: 11 },
          { id: 113, name: '编辑', code: 'system:user:edit', type: 'button', parentId: 11 },
          { id: 114, name: '删除', code: 'system:user:delete', type: 'button', parentId: 11 },
        ],
      },
      {
        id: 12,
        name: '角色管理',
        code: 'system:role',
        type: 'menu',
        parentId: 1,
        children: [
          { id: 121, name: '查看', code: 'system:role:view', type: 'button', parentId: 12 },
          { id: 122, name: '新增', code: 'system:role:add', type: 'button', parentId: 12 },
          { id: 123, name: '编辑', code: 'system:role:edit', type: 'button', parentId: 12 },
          { id: 124, name: '删除', code: 'system:role:delete', type: 'button', parentId: 12 },
          { id: 125, name: '分配权限', code: 'system:role:permission', type: 'button', parentId: 12 },
        ],
      },
      {
        id: 13,
        name: '菜单管理',
        code: 'system:menu',
        type: 'menu',
        parentId: 1,
        children: [
          { id: 131, name: '查看', code: 'system:menu:view', type: 'button', parentId: 13 },
          { id: 132, name: '新增', code: 'system:menu:add', type: 'button', parentId: 13 },
          { id: 133, name: '编辑', code: 'system:menu:edit', type: 'button', parentId: 13 },
          { id: 134, name: '删除', code: 'system:menu:delete', type: 'button', parentId: 13 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: '学生管理',
    code: 'student',
    type: 'menu',
    parentId: null,
    children: [
      {
        id: 21,
        name: '学生列表',
        code: 'student:list',
        type: 'menu',
        parentId: 2,
        children: [
          { id: 211, name: '查看', code: 'student:list:view', type: 'button', parentId: 21 },
          { id: 212, name: '新增', code: 'student:list:add', type: 'button', parentId: 21 },
          { id: 213, name: '编辑', code: 'student:list:edit', type: 'button', parentId: 21 },
          { id: 214, name: '删除', code: 'student:list:delete', type: 'button', parentId: 21 },
        ],
      },
      {
        id: 22,
        name: '学生档案',
        code: 'student:profile',
        type: 'menu',
        parentId: 2,
        children: [
          { id: 221, name: '查看', code: 'student:profile:view', type: 'button', parentId: 22 },
          { id: 222, name: '编辑', code: 'student:profile:edit', type: 'button', parentId: 22 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: '教学管理',
    code: 'teaching',
    type: 'menu',
    parentId: null,
    children: [
      {
        id: 31,
        name: '课程管理',
        code: 'teaching:course',
        type: 'menu',
        parentId: 3,
        children: [
          { id: 311, name: '查看', code: 'teaching:course:view', type: 'button', parentId: 31 },
          { id: 312, name: '新增', code: 'teaching:course:add', type: 'button', parentId: 31 },
          { id: 313, name: '编辑', code: 'teaching:course:edit', type: 'button', parentId: 31 },
          { id: 314, name: '删除', code: 'teaching:course:delete', type: 'button', parentId: 31 },
        ],
      },
      {
        id: 32,
        name: '排课管理',
        code: 'teaching:schedule',
        type: 'menu',
        parentId: 3,
        children: [
          { id: 321, name: '查看', code: 'teaching:schedule:view', type: 'button', parentId: 32 },
          { id: 322, name: '新增', code: 'teaching:schedule:add', type: 'button', parentId: 32 },
          { id: 323, name: '编辑', code: 'teaching:schedule:edit', type: 'button', parentId: 32 },
          { id: 324, name: '删除', code: 'teaching:schedule:delete', type: 'button', parentId: 32 },
        ],
      },
      {
        id: 33,
        name: '考勤管理',
        code: 'teaching:attendance',
        type: 'menu',
        parentId: 3,
        children: [
          { id: 331, name: '查看', code: 'teaching:attendance:view', type: 'button', parentId: 33 },
          { id: 332, name: '签到', code: 'teaching:attendance:checkin', type: 'button', parentId: 33 },
        ],
      },
    ],
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

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => (
        <div style={{ color: '#fff', fontWeight: 500 }}>{name}</div>
      ),
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code: string) => (
        <span style={{ color: '#00d4ff', fontFamily: 'monospace' }}>{code}</span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{desc}</span>
      ),
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
          }}
        >
          {count}
        </Tag>
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
          {status === 'active' ? '启用' : '禁用'}
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
                setEditingRole(record);
                setPermissionModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => {
                setEditingRole(record);
                setModalVisible(true);
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

  const convertToTreeData = (permissions: Permission[]): DataNode[] => {
    return permissions.map((perm) => ({
      title: perm.name,
      key: perm.id,
      children: perm.children ? convertToTreeData(perm.children) : undefined,
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <SafetyOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          角色管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={() => {
              setEditingRole(null);
              setModalVisible(true);
              form.resetFields();
            }}
          >
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
            style={{ width: 280 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={mockRoles}
          rowKey="id"
          loading={loading}
          pagination={{
            total: mockRoles.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success('保存成功');
            setModalVisible(false);
          });
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色编码" name="code" rules={[{ required: true }]}>
            <Input disabled={!!editingRole} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配权限"
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        onOk={() => {
          message.success('权限分配成功');
          setPermissionModalVisible(false);
        }}
        width={600}
      >
        <Tree
          checkable
          defaultExpandAll
          treeData={convertToTreeData(mockPermissions)}
        />
      </Modal>
    </div>
  );
}
