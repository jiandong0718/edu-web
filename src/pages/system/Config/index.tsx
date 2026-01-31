import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Tooltip,
  Row,
  Col,
  Tabs,
  Popconfirm,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ReloadOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { CommonTable } from '@/components/CommonTable';
import type {
  SystemConfig,
  ConfigQueryParams,
  ConfigFormData,
  ConfigType,
  ConfigCategory,
  ConfigStatistics,
} from '@/types/config';
import {
  getConfigList,
  createConfig,
  updateConfig,
  deleteConfig,
  updateConfigStatus,
  refreshConfigCache,
  getConfigStatistics,
  exportConfigList,
} from '@/api/config';

// 参数类型选项
const TYPE_OPTIONS = [
  { label: '文本', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: 'JSON', value: 'json' },
];

// 参数分类选项
const CATEGORY_OPTIONS = [
  { label: '系统配置', value: 'system' },
  { label: '上传配置', value: 'upload' },
  { label: '安全配置', value: 'security' },
  { label: '通知配置', value: 'notification' },
  { label: '业务配置', value: 'business' },
];

// 状态选项
const STATUS_OPTIONS = [
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
  categoryTab: {
    marginBottom: 20,
  },
};

// 分类配置
const categories = [
  { key: 'all', label: '全部', color: '#00d4ff' },
  { key: 'system', label: '系统配置', color: '#00ff88' },
  { key: 'upload', label: '上传配置', color: '#ffaa00' },
  { key: 'security', label: '安全配置', color: '#ff4d6a' },
  { key: 'notification', label: '通知配置', color: '#a855f7' },
  { key: 'business', label: '业务配置', color: '#06b6d4' },
];

export default function SystemConfigManagement() {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [statistics, setStatistics] = useState<ConfigStatistics>({
    total: 0,
    systemCount: 0,
    customCount: 0,
    enabledCount: 0,
    disabledCount: 0,
    categoryStats: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [form] = Form.useForm();
  const [queryParams, setQueryParams] = useState<ConfigQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 获取系统参数列表
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        category: selectedCategory === 'all' ? undefined : (selectedCategory as ConfigCategory),
      };
      const response = await getConfigList(params);
      setConfigs(response.data.list);
      setTotal(response.data.total);
    } catch (error) {
      message.error('获取系统参数列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const data = await getConfigStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [queryParams, selectedCategory]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // 表格列定义
  const columns: ColumnsType<SystemConfig> = [
    {
      title: '参数信息',
      key: 'info',
      width: 250,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ color: '#00d4ff', fontWeight: 500, marginBottom: 4, fontFamily: 'monospace' }}>
            {record.configKey}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, marginBottom: 2 }}>
            {record.configName}
          </div>
          {record.description && (
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '参数值',
      dataIndex: 'configValue',
      key: 'configValue',
      width: 200,
      ellipsis: true,
      render: (value: string, record) => {
        let displayValue = value;
        if (record.configType === 'boolean') {
          return (
            <Tag
              style={{
                background: value === 'true' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
                border: `1px solid ${value === 'true' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
                color: value === 'true' ? '#00ff88' : '#ff4d6a',
              }}
            >
              {value === 'true' ? '是' : '否'}
            </Tag>
          );
        }
        if (record.configType === 'json') {
          displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
        }
        return (
          <Tooltip title={value}>
            <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'monospace' }}>
              {displayValue}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      align: 'center',
      filters: CATEGORY_OPTIONS.map(opt => ({ text: opt.label, value: opt.value })),
      render: (category: ConfigCategory) => {
        const categoryConfig = categories.find(c => c.key === category);
        return (
          <Tag
            style={{
              background: `${categoryConfig?.color}15`,
              border: `1px solid ${categoryConfig?.color}40`,
              color: categoryConfig?.color,
            }}
          >
            {CATEGORY_OPTIONS.find(c => c.value === category)?.label}
          </Tag>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'configType',
      key: 'configType',
      width: 100,
      align: 'center',
      filters: TYPE_OPTIONS.map(opt => ({ text: opt.label, value: opt.value })),
      render: (type: ConfigType) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
            fontSize: 12,
          }}
        >
          {TYPE_OPTIONS.find(t => t.value === type)?.label}
        </Tag>
      ),
    },
    {
      title: '系统参数',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 100,
      align: 'center',
      filters: [
        { text: '是', value: true },
        { text: '否', value: false },
      ],
      render: (isSystem: boolean) => (
        <Tag
          style={{
            background: isSystem ? 'rgba(255, 170, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)',
            border: `1px solid ${isSystem ? 'rgba(255, 170, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
            color: isSystem ? '#ffaa00' : '#00ff88',
          }}
        >
          {isSystem ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      filters: [
        { text: '启用', value: 1 },
        { text: '禁用', value: 0 },
      ],
      render: (status: 0 | 1, record) => (
        <Switch
          checked={status === 1}
          disabled={record.isSystem}
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
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.sortOrder - b.sortOrder,
      render: (order: number) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{order}</span>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160,
      sorter: true,
      render: (time?: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
          {time || '-'}
        </span>
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
            description={`确定要删除参数"${record.configName}"吗？`}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.isSystem}
            okButtonProps={{
              style: {
                background: 'linear-gradient(135deg, #ff4d6a 0%, #ff1744 100%)',
                border: 'none',
              },
            }}
          >
            <Tooltip title={record.isSystem ? '系统参数不可删除' : '删除'}>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: record.isSystem ? 'rgba(255, 77, 106, 0.3)' : '#ff4d6a' }}
                disabled={record.isSystem}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setQueryParams({ ...queryParams, keyword, page: 1 });
  };

  // 处理筛选
  const handleFilter = (key: string, value: any) => {
    setQueryParams({ ...queryParams, [key]: value, page: 1 });
  };

  // 处理新增
  const handleAdd = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      configType: 'string',
      category: 'business',
      status: 1,
      sortOrder: 0,
    });
    setModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: SystemConfig) => {
    setEditingConfig(record);
    form.setFieldsValue({
      configKey: record.configKey,
      configName: record.configName,
      configValue: record.configValue,
      configType: record.configType,
      category: record.category,
      description: record.description,
      sortOrder: record.sortOrder,
      status: record.status,
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await deleteConfig(id);
      message.success('删除成功');
      fetchConfigs();
      fetchStatistics();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理状态变更
  const handleStatusChange = async (id: number, status: 0 | 1) => {
    try {
      await updateConfigStatus(id, status);
      message.success('状态更新成功');
      fetchConfigs();
      fetchStatistics();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: ConfigFormData = {
        ...values,
      };

      if (editingConfig) {
        await updateConfig(editingConfig.id, formData);
        message.success('更新成功');
      } else {
        await createConfig(formData);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchConfigs();
      fetchStatistics();
    } catch (error) {
      console.error('表单验证失败', error);
    }
  };

  // 处理刷新
  const handleRefresh = async () => {
    await fetchConfigs();
    await fetchStatistics();
  };

  // 处理刷新缓存
  const handleRefreshCache = async () => {
    try {
      await refreshConfigCache();
      message.success('缓存刷新成功');
    } catch (error) {
      message.error('缓存刷新失败');
    }
  };

  // 处理导出
  const handleExport = async () => {
    try {
      const params = {
        ...queryParams,
        category: selectedCategory === 'all' ? undefined : (selectedCategory as ConfigCategory),
      };
      await exportConfigList(params);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 处理分页变化
  const handleTableChange = (pagination: any, _filters: any, _sorter: any) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <SettingOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          系统参数配置
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={handleAdd}
          >
            新增参数
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefreshCache}
            style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#a855f7',
            }}
          >
            刷新缓存
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
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
              <div style={styles.statLabel}>总参数数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#ffaa00' }}>
                {statistics.systemCount}
              </div>
              <div style={styles.statLabel}>系统参数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#00ff88' }}>
                {statistics.customCount}
              </div>
              <div style={styles.statLabel}>自定义参数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#a855f7' }}>
                {statistics.enabledCount}
              </div>
              <div style={styles.statLabel}>启用参数</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card style={styles.card} bordered={false}>
        {/* 分类标签 */}
        <Tabs
          activeKey={selectedCategory}
          onChange={setSelectedCategory}
          items={categories.map((cat) => ({
            key: cat.key,
            label: (
              <span style={{ color: cat.color, fontWeight: 500 }}>
                {cat.label}
              </span>
            ),
          }))}
          style={styles.categoryTab}
        />

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索参数键、参数名称或说明"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            placeholder="选择类型"
            style={{ width: 140 }}
            allowClear
            options={[{ label: '全部类型', value: undefined }, ...TYPE_OPTIONS]}
            onChange={(value) => handleFilter('configType', value)}
          />
          <Select
            placeholder="选择状态"
            style={{ width: 140 }}
            allowClear
            options={[{ label: '全部状态', value: undefined }, ...STATUS_OPTIONS]}
            onChange={(value) => handleFilter('status', value)}
          />
        </div>

        {/* 表格 */}
        <CommonTable<SystemConfig>
          columns={columns}
          dataSource={configs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          showRefresh={false}
          exportable={true}
          onExport={handleExport}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            {editingConfig ? '编辑系统参数' : '新增系统参数'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
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
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>参数键</span>}
                  name="configKey"
                  rules={[
                    { required: true, message: '请输入参数键' },
                    { max: 100, message: '参数键不能超过100个字符' },
                    { pattern: /^[a-zA-Z0-9._-]+$/, message: '参数键只能包含字母、数字、点、下划线和横线' },
                  ]}
                >
                  <Input
                    placeholder="例如: system.name"
                    disabled={!!editingConfig}
                    style={{ fontFamily: 'monospace' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>参数名称</span>}
                  name="configName"
                  rules={[
                    { required: true, message: '请输入参数名称' },
                    { max: 100, message: '参数名称不能超过100个字符' },
                  ]}
                >
                  <Input placeholder="请输入参数名称" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>参数类型</span>}
                  name="configType"
                  rules={[{ required: true, message: '请选择参数类型' }]}
                >
                  <Select placeholder="请选择参数类型" options={TYPE_OPTIONS} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>参数分类</span>}
                  name="category"
                  rules={[{ required: true, message: '请选择参数分类' }]}
                >
                  <Select placeholder="请选择参数分类" options={CATEGORY_OPTIONS} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span style={{ color: '#fff' }}>参数值</span>}
              name="configValue"
              rules={[
                { required: true, message: '请输入参数值' },
                { max: 1000, message: '参数值不能超过1000个字符' },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="请输入参数值"
                showCount
                maxLength={1000}
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#fff' }}>参数说明</span>}
              name="description"
            >
              <Input.TextArea
                rows={2}
                placeholder="请输入参数说明"
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>排序</span>}
                  name="sortOrder"
                  rules={[
                    { required: true, message: '请输入排序' },
                    { type: 'number', min: 0, max: 9999, message: '排序范围0-9999' },
                  ]}
                >
                  <InputNumber
                    placeholder="请输入排序"
                    style={{ width: '100%' }}
                    min={0}
                    max={9999}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>状态</span>}
                  name="status"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="请选择状态" options={STATUS_OPTIONS} />
                </Form.Item>
              </Col>
            </Row>

            {editingConfig?.isSystem && (
              <div
                style={{
                  padding: 12,
                  background: 'rgba(255, 170, 0, 0.1)',
                  border: '1px solid rgba(255, 170, 0, 0.3)',
                  borderRadius: 8,
                  color: '#ffaa00',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ExclamationCircleOutlined />
                <span>此为系统参数，修改后可能影响系统功能，请谨慎操作</span>
              </div>
            )}
          </Form>
        </div>
      </Modal>
    </div>
  );
}
