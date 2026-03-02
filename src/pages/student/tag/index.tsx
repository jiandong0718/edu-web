import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Popconfirm,
  ColorPicker,
  Select,
  Switch,
  Card,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { CommonTable } from '@/components/CommonTable';
import type { ColumnsType } from 'antd/es/table';
import type { StudentTag, StudentTagQueryParams, StudentTagFormData } from '@/types/student';
import {
  getStudentTagList,
  createStudentTag,
  updateStudentTag,
  deleteStudentTag,
} from '@/api/student';
import type { Color } from 'antd/es/color-picker';

const { Search } = Input;
const { TextArea } = Input;

// 预设颜色
const PRESET_COLORS = [
  { label: '青色', value: '#00d4ff' },
  { label: '蓝色', value: '#0099ff' },
  { label: '绿色', value: '#00ff88' },
  { label: '橙色', value: '#ffaa00' },
  { label: '红色', value: '#ff4d6a' },
  { label: '紫色', value: '#9d4edd' },
  { label: '薄荷绿', value: '#06ffa5' },
  { label: '粉红', value: '#ff006e' },
  { label: '天蓝', value: '#06b6d4' },
  { label: '金色', value: '#fbbf24' },
  { label: '玫红', value: '#ec4899' },
  { label: '靛蓝', value: '#6366f1' },
];

// 状态选项
const STATUS_OPTIONS = [
  { label: '全部状态', value: undefined },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
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
    marginBottom: 20,
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
  statCard: {
    background: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#00d4ff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalContent: {
    background: '#1a1f2e',
    padding: 24,
    borderRadius: 8,
  },
  colorPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    border: '2px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};

export function Component() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<StudentTag[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<StudentTagQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<number>();
  const [form] = Form.useForm();
  const [tagColor, setTagColor] = useState<string>('#00d4ff');
  const [statistics, setStatistics] = useState({
    total: 0,
    enabled: 0,
    disabled: 0,
    totalUsage: 0,
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStudentTagList(queryParams);
      setDataSource(res.list);
      setTotal(res.total);

      // 计算统计数据
      const enabled = res.list.filter(tag => tag.status === 1).length;
      const disabled = res.list.filter(tag => tag.status === 0).length;
      const totalUsage = res.list.reduce((sum, tag) => sum + (tag.usageCount || 0), 0);

      setStatistics({
        total: res.total,
        enabled,
        disabled,
        totalUsage,
      });
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 搜索
  const handleSearch = (value: string) => {
    setQueryParams({ ...queryParams, name: value, page: 1 });
  };

  // 筛选状态
  const handleStatusFilter = (status: 0 | 1 | undefined) => {
    setQueryParams({ ...queryParams, status, page: 1 });
  };

  // 重置
  const handleReset = () => {
    setQueryParams({ page: 1, pageSize: 10 });
  };

  // 新增
  const handleAdd = () => {
    setEditingId(undefined);
    setTagColor('#00d4ff');
    form.resetFields();
    form.setFieldsValue({ status: 1 }); // 默认启用
    setFormVisible(true);
  };

  // 编辑
  const handleEdit = (record: StudentTag) => {
    setEditingId(record.id);
    setTagColor(record.color);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      status: record.status ?? 1,
    });
    setFormVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteStudentTag(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 切换状态
  const handleStatusChange = async (id: number, status: 0 | 1) => {
    try {
      await updateStudentTag(id, { status } as StudentTagFormData);
      message.success('状态更新成功');
      loadData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: StudentTagFormData = {
        ...values,
        color: tagColor,
      };

      if (editingId) {
        await updateStudentTag(editingId, formData);
        message.success('更新成功');
      } else {
        await createStudentTag(formData);
        message.success('创建成功');
      }
      setFormVisible(false);
      loadData();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error.message || '操作失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<StudentTag> = [
    {
      title: '标签信息',
      key: 'info',
      width: 250,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <Tag
            style={{
              background: `${record.color}20`,
              border: `1px solid ${record.color}`,
              color: record.color,
              fontSize: 14,
              padding: '6px 14px',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            {record.name}
          </Tag>
          {record.description && (
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 4 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 150,
      align: 'center',
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: color,
              borderRadius: 6,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `0 0 10px ${color}40`,
            }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontFamily: 'monospace' }}>
            {color}
          </span>
        </div>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.usageCount || 0) - (b.usageCount || 0),
      render: (count: number = 0) => (
        <Tooltip title={`${count} 名学员使用此标签`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <UserOutlined style={{ color: '#00d4ff', fontSize: 16 }} />
            <span
              style={{
                color: count > 0 ? '#00ff88' : 'rgba(255, 255, 255, 0.3)',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {count}
            </span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      filters: [
        { text: '启用', value: 1 },
        { text: '禁用', value: 0 },
      ],
      render: (status: 0 | 1 = 1, record) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record.id, checked ? 1 : 0)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          style={{
            background: status === 1 ? '#00ff88' : 'rgba(255, 255, 255, 0.2)',
          }}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true,
      render: (text: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>{text}</span>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      sorter: true,
      render: (text?: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>{text || '-'}</span>
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
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description={
              record.usageCount && record.usageCount > 0
                ? `该标签被 ${record.usageCount} 名学员使用，删除后将从学员信息中移除，确定要删除吗？`
                : '确定要删除这个标签吗？'
            }
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{
              style: {
                background: 'linear-gradient(135deg, #ff4d6a 0%, #ff1744 100%)',
                border: 'none',
              },
            }}
          >
            <Tooltip title="删除">
              <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d6a' }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <TagsOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          学员标签管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={styles.actionButton}
          >
            新增标签
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{statistics.total}</div>
              <div style={styles.statLabel}>标签总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#00ff88' }}>{statistics.enabled}</div>
              <div style={styles.statLabel}>启用标签</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#ff4d6a' }}>{statistics.disabled}</div>
              <div style={styles.statLabel}>禁用标签</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#a855f7' }}>{statistics.totalUsage}</div>
              <div style={styles.statLabel}>总使用次数</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索标签名称"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            placeholder="选择状态"
            style={{ width: 140 }}
            allowClear
            options={STATUS_OPTIONS}
            onChange={handleStatusFilter}
          />
          <Button onClick={handleReset}>重置</Button>
        </div>

        {/* 表格 */}
        <CommonTable<StudentTag>
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, page, pageSize });
            },
          }}
          showRefresh={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑表单 */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            {editingId ? '编辑标签' : '新增标签'}
          </div>
        }
        open={formVisible}
        onOk={handleSubmit}
        onCancel={() => setFormVisible(false)}
        width={600}
        okText="保存"
        cancelText="取消"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
            border: 'none',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
          },
        }}
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <div style={styles.modalContent}>
          <Form form={form} layout="vertical">
            <Form.Item
              label={<span style={{ color: '#fff' }}>标签名称</span>}
              name="name"
              rules={[
                { required: true, message: '请输入标签名称' },
                { max: 20, message: '标签名称不能超过20个字符' },
              ]}
            >
              <Input placeholder="请输入标签名称" maxLength={20} showCount />
            </Form.Item>

            <Form.Item label={<span style={{ color: '#fff' }}>标签颜色</span>} required>
              <div style={styles.colorPreview}>
                <ColorPicker
                  value={tagColor}
                  onChange={(color: Color) => setTagColor(color.toHexString())}
                  showText
                  presets={[
                    {
                      label: '推荐颜色',
                      colors: PRESET_COLORS.map((c) => c.value),
                    },
                  ]}
                />
                <div
                  style={{
                    ...styles.colorSwatch,
                    background: tagColor,
                    boxShadow: `0 0 15px ${tagColor}60`,
                  }}
                />
                <Tag
                  style={{
                    background: `${tagColor}20`,
                    border: `1px solid ${tagColor}`,
                    color: tagColor,
                    fontSize: 14,
                    padding: '6px 14px',
                    fontWeight: 500,
                  }}
                >
                  预览效果
                </Tag>
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PRESET_COLORS.map((preset) => (
                  <Tooltip key={preset.value} title={preset.label}>
                    <div
                      style={{
                        ...styles.colorSwatch,
                        width: 32,
                        height: 32,
                        background: preset.value,
                        border:
                          tagColor === preset.value
                            ? `2px solid ${preset.value}`
                            : '2px solid rgba(255, 255, 255, 0.1)',
                        boxShadow:
                          tagColor === preset.value ? `0 0 10px ${preset.value}80` : 'none',
                      }}
                      onClick={() => setTagColor(preset.value)}
                    />
                  </Tooltip>
                ))}
              </div>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#fff' }}>标签描述</span>}
              name="description"
              rules={[{ max: 100, message: '描述不能超过100个字符' }]}
            >
              <TextArea rows={3} placeholder="请输入标签描述" maxLength={100} showCount />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#fff' }}>状态</span>}
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
              initialValue={1}
            >
              <Select
                options={[
                  { label: '启用', value: 1 },
                  { label: '禁用', value: 0 },
                ]}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

export default Component;
