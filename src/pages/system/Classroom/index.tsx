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
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { CommonTable } from '@/components/CommonTable';
import type {
  Classroom,
  ClassroomQueryParams,
  ClassroomFormData,
  ClassroomStatus,
  ClassroomStatistics,
} from '@/types/classroom';
import {
  getClassroomList,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  updateClassroomStatus,
  getClassroomStatistics,
  exportClassroomList,
} from '@/api/classroom';

// 设施选项
const FACILITY_OPTIONS = [
  { label: '投影仪', value: '投影仪' },
  { label: '白板', value: '白板' },
  { label: '空调', value: '空调' },
  { label: '音响', value: '音响' },
  { label: '电脑', value: '电脑' },
  { label: '电视', value: '电视' },
  { label: '麦克风', value: '麦克风' },
  { label: 'WiFi', value: 'WiFi' },
];

// 状态选项
const STATUS_OPTIONS = [
  { label: '空闲', value: 'available' },
  { label: '使用中', value: 'occupied' },
  { label: '维护中', value: 'maintenance' },
];

// 校区选项（实际应该从接口获取）
const CAMPUS_OPTIONS = [
  { label: '总部校区', value: 1 },
  { label: '分部校区', value: 2 },
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
};

export default function ClassroomManagement() {
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [statistics, setStatistics] = useState<ClassroomStatistics>({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    totalCapacity: 0,
    totalArea: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [form] = Form.useForm();
  const [queryParams, setQueryParams] = useState<ClassroomQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  // 获取教室列表
  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const response = await getClassroomList(queryParams);
      setClassrooms(response.data.list);
      setTotal(response.data.total);
    } catch (error) {
      message.error('获取教室列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const data = await getClassroomStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  useEffect(() => {
    fetchClassrooms();
    fetchStatistics();
  }, [queryParams]);

  // 表格列定义
  const columns: ColumnsType<Classroom> = [
    {
      title: '教室信息',
      key: 'info',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            编码: {record.code}
          </div>
        </div>
      ),
    },
    {
      title: '位置信息',
      key: 'location',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>
            <EnvironmentOutlined style={{ marginRight: 4, color: '#00d4ff' }} />
            {record.campusName}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.building} {record.floor}楼
          </div>
        </div>
      ),
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.capacity - b.capacity,
      render: (capacity: number) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
            fontSize: 13,
          }}
        >
          {capacity}人
        </Tag>
      ),
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.area - b.area,
      render: (area: number) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{area}㎡</span>
      ),
    },
    {
      title: '设施',
      dataIndex: 'facilities',
      key: 'facilities',
      width: 280,
      render: (facilities: string[]) => (
        <Space wrap>
          {facilities.map((facility, index) => (
            <Tag
              key={index}
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                color: '#00ff88',
                fontSize: 11,
              }}
            >
              {facility}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      filters: [
        { text: '空闲', value: 'available' },
        { text: '使用中', value: 'occupied' },
        { text: '维护中', value: 'maintenance' },
      ],
      render: (status: ClassroomStatus) => {
        const config = {
          available: { text: '空闲', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)' },
          occupied: { text: '使用中', color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.1)' },
          maintenance: { text: '维护中', color: '#ff4d6a', bg: 'rgba(255, 77, 106, 0.1)' },
        };
        const cfg = config[status];
        return (
          <Tag
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.color}40`,
              color: cfg.color,
            }}
          >
            {cfg.text}
          </Tag>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
      render: (remark?: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {remark || '-'}
        </span>
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
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="更改状态">
            <Button
              type="text"
              icon={<ExclamationCircleOutlined />}
              style={{ color: '#ffaa00' }}
              onClick={() => handleStatusChange(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description={`确定要删除教室"${record.name}"吗？`}
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
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: '#ff4d6a' }}
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
    setEditingClassroom(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: Classroom) => {
    setEditingClassroom(record);
    form.setFieldsValue({
      ...record,
      campusId: record.campusId,
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await deleteClassroom(id);
      message.success('删除成功');
      fetchClassrooms();
      fetchStatistics();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理状态变更
  const handleStatusChange = (record: Classroom) => {
    Modal.confirm({
      title: '更改教室状态',
      content: (
        <Form
          id="statusForm"
          initialValues={{ status: record.status }}
          style={{ marginTop: 20 }}
        >
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const form = document.getElementById('statusForm') as any;
        const formData = new FormData(form);
        const status = formData.get('status') as ClassroomStatus;
        try {
          await updateClassroomStatus(record.id, status);
          message.success('状态更新成功');
          fetchClassrooms();
          fetchStatistics();
        } catch (error) {
          message.error('状态更新失败');
        }
      },
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: ClassroomFormData = {
        ...values,
        facilities: values.facilities || [],
      };

      if (editingClassroom) {
        await updateClassroom(editingClassroom.id, formData);
        message.success('更新成功');
      } else {
        await createClassroom(formData);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchClassrooms();
      fetchStatistics();
    } catch (error) {
      console.error('表单验证失败', error);
    }
  };

  // 处理刷新
  const handleRefresh = async () => {
    await fetchClassrooms();
    await fetchStatistics();
  };

  // 处理导出
  const handleExport = async () => {
    try {
      await exportClassroomList(queryParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
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
          <HomeOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          教室管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={handleAdd}
          >
            新增教室
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
              <div style={styles.statLabel}>总教室数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#00ff88' }}>
                {statistics.available}
              </div>
              <div style={styles.statLabel}>空闲教室</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#ffaa00' }}>
                {statistics.occupied}
              </div>
              <div style={styles.statLabel}>使用中</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#ff4d6a' }}>
                {statistics.maintenance}
              </div>
              <div style={styles.statLabel}>维护中</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索教室名称或编码"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            placeholder="选择校区"
            style={{ width: 160 }}
            allowClear
            options={[{ label: '全部校区', value: undefined }, ...CAMPUS_OPTIONS]}
            onChange={(value) => handleFilter('campusId', value)}
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
        <CommonTable<Classroom>
          columns={columns}
          dataSource={classrooms}
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            {editingClassroom ? '编辑教室' : '新增教室'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={800}
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
                  label={<span style={{ color: '#fff' }}>教室名称</span>}
                  name="name"
                  rules={[
                    { required: true, message: '请输入教室名称' },
                    { max: 50, message: '教室名称不能超过50个字符' },
                  ]}
                >
                  <Input placeholder="请输入教室名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>教室编码</span>}
                  name="code"
                  rules={[
                    { required: true, message: '请输入教室编码' },
                    { max: 30, message: '教室编码不能超过30个字符' },
                  ]}
                >
                  <Input placeholder="请输入教室编码" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>所属校区</span>}
                  name="campusId"
                  rules={[{ required: true, message: '请选择所属校区' }]}
                >
                  <Select placeholder="请选择所属校区" options={CAMPUS_OPTIONS} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>所属楼栋</span>}
                  name="building"
                  rules={[
                    { required: true, message: '请输入所属楼栋' },
                    { max: 30, message: '楼栋名称不能超过30个字符' },
                  ]}
                >
                  <Input placeholder="请输入所属楼栋" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>楼层</span>}
                  name="floor"
                  rules={[
                    { required: true, message: '请输入楼层' },
                    { type: 'number', min: 1, max: 99, message: '楼层范围1-99' },
                  ]}
                >
                  <InputNumber
                    placeholder="请输入楼层"
                    style={{ width: '100%' }}
                    min={1}
                    max={99}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>容量(人)</span>}
                  name="capacity"
                  rules={[
                    { required: true, message: '请输入容量' },
                    { type: 'number', min: 1, max: 999, message: '容量范围1-999' },
                  ]}
                >
                  <InputNumber
                    placeholder="请输入容量"
                    style={{ width: '100%' }}
                    min={1}
                    max={999}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<span style={{ color: '#fff' }}>面积(㎡)</span>}
                  name="area"
                  rules={[
                    { required: true, message: '请输入面积' },
                    { type: 'number', min: 1, max: 9999, message: '面积范围1-9999' },
                  ]}
                >
                  <InputNumber
                    placeholder="请输入面积"
                    style={{ width: '100%' }}
                    min={1}
                    max={9999}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span style={{ color: '#fff' }}>设施</span>}
              name="facilities"
            >
              <Select
                mode="multiple"
                placeholder="请选择设施"
                options={FACILITY_OPTIONS}
                maxTagCount="responsive"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#fff' }}>状态</span>}
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
              initialValue="available"
            >
              <Select placeholder="请选择状态" options={STATUS_OPTIONS} />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#fff' }}>备注</span>}
              name="remark"
            >
              <Input.TextArea
                rows={3}
                placeholder="请输入备注信息"
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
