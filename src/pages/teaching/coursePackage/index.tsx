import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
  Modal,
  Form,
  InputNumber,
  Transfer,
  Row,
  Col,
  Divider,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { CommonTable } from '@/components/CommonTable';
import type { ColumnsType } from 'antd/es/table';
import type {
  CoursePackage,
  CoursePackageQueryParams,
  CoursePackageFormData,
  CourseInfo,
  CoursePackageStatus,
} from '@/types/coursePackage';
import {
  getCoursePackageList,
  createCoursePackage,
  updateCoursePackage,
  deleteCoursePackage,
  updateCoursePackageStatus,
  getAvailableCourses,
  exportCoursePackageList,
} from '@/api/coursePackage';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

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
    transition: 'all 0.3s ease',
    cursor: 'pointer',
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
  priceCard: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  courseTag: {
    background: 'rgba(0, 255, 136, 0.1)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    color: '#00ff88',
    marginBottom: 8,
  },
};

// 课程包状态映射
const statusMap: Record<CoursePackageStatus, { text: string; color: string; bgColor: string }> = {
  active: { text: '上架', color: '#00ff88', bgColor: 'rgba(0, 255, 136, 0.1)' },
  inactive: { text: '下架', color: '#ff4d6a', bgColor: 'rgba(255, 77, 106, 0.1)' },
};

// 统计数据接口
interface PackageStatistics {
  total: number;
  active: number;
  inactive: number;
  totalRevenue: number;
}

export function Component() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<CoursePackage[]>([]);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState<PackageStatistics>({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
  });
  const [queryParams, setQueryParams] = useState<CoursePackageQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<number>();
  const [availableCourses, setAvailableCourses] = useState<CourseInfo[]>([]);
  const [selectedCourseKeys, setSelectedCourseKeys] = useState<number[]>([]);
  const [form] = Form.useForm();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getCoursePackageList(queryParams);
      setDataSource(res.list);
      setTotal(res.total);

      // 计算统计数据
      const stats: PackageStatistics = {
        total: res.total,
        active: res.list.filter((p) => p.status === 'active').length,
        inactive: res.list.filter((p) => p.status === 'inactive').length,
        totalRevenue: res.list.reduce((sum, p) => sum + p.price, 0),
      };
      setStatistics(stats);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载可用课程
  const loadAvailableCourses = async () => {
    try {
      const courses = await getAvailableCourses();
      setAvailableCourses(courses);
    } catch (error) {
      message.error('加载课程列表失败');
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  useEffect(() => {
    loadAvailableCourses();
  }, []);

  // 搜索
  const handleSearch = (value: string) => {
    setQueryParams({ ...queryParams, name: value, page: 1 });
  };

  // 筛选
  const handleFilter = (key: string, value: any) => {
    setQueryParams({ ...queryParams, [key]: value, page: 1 });
  };

  // 重置
  const handleReset = () => {
    setQueryParams({ page: 1, pageSize: 10 });
  };

  // 新增
  const handleAdd = () => {
    setEditingId(undefined);
    setSelectedCourseKeys([]);
    form.resetFields();
    setFormVisible(true);
  };

  // 编辑
  const handleEdit = async (record: CoursePackage) => {
    setEditingId(record.id);
    setSelectedCourseKeys(record.courses.map((c) => c.id));
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      originalPrice: record.originalPrice,
      price: record.price,
      validDays: record.validDays,
      status: record.status,
    });
    setFormVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteCoursePackage(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新状态
  const handleUpdateStatus = async (id: number, status: CoursePackageStatus) => {
    try {
      await updateCoursePackageStatus(id, status);
      message.success('状态更新成功');
      loadData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 导出
  const handleExport = async () => {
    try {
      await exportCoursePackageList(queryParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 刷新
  const handleRefresh = () => {
    loadData();
  };

  // 统计卡片点击筛选
  const handleStatClick = (status?: CoursePackageStatus) => {
    setQueryParams({ ...queryParams, status, page: 1 });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: CoursePackageFormData = {
        ...values,
        courseIds: selectedCourseKeys,
      };

      if (editingId) {
        await updateCoursePackage(editingId, formData);
        message.success('更新成功');
      } else {
        await createCoursePackage(formData);
        message.success('创建成功');
      }
      setFormVisible(false);
      loadData();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 计算折扣
  const calculateDiscount = () => {
    const originalPrice = form.getFieldValue('originalPrice');
    const price = form.getFieldValue('price');
    if (originalPrice && price && originalPrice > 0) {
      const discount = ((price / originalPrice) * 10).toFixed(1);
      return `${discount}折`;
    }
    return '-';
  };

  // 表格列定义
  const columns: ColumnsType<CoursePackage> = [
    {
      title: '课程包名称',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>
            {record.name}
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
      title: '价格',
      key: 'price',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
            ¥{record.price.toLocaleString()}
          </div>
          {record.originalPrice > record.price && (
            <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
              <span style={{ textDecoration: 'line-through' }}>
                ¥{record.originalPrice.toLocaleString()}
              </span>
              <Tag
                style={{
                  background: 'rgba(255, 77, 106, 0.1)',
                  border: '1px solid rgba(255, 77, 106, 0.3)',
                  color: '#ff4d6a',
                  marginLeft: 8,
                  fontSize: 11,
                }}
              >
                {record.discount ? `${record.discount}折` : '优惠'}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '包含课程',
      dataIndex: 'courses',
      key: 'courses',
      width: 250,
      render: (courses: CourseInfo[]) => (
        <Space wrap>
          {courses.slice(0, 3).map((course) => (
            <Tag key={course.id} style={styles.courseTag}>
              {course.name}
            </Tag>
          ))}
          {courses.length > 3 && (
            <Tag
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
              }}
            >
              +{courses.length - 3}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '有效期',
      dataIndex: 'validDays',
      key: 'validDays',
      width: 100,
      align: 'center',
      render: (days: number) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{days} 天</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: CoursePackageStatus) => {
        const cfg = statusMap[status];
        return (
          <Tag
            style={{
              background: cfg.bgColor,
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (date: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{date}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => message.info('查看详情功能开发中')}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="下架">
              <Popconfirm
                title="确认下架"
                description={`确定要下架课程包"${record.name}"吗？`}
                onConfirm={() => handleUpdateStatus(record.id, 'inactive')}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  style={{ color: '#ffaa00' }}
                />
              </Popconfirm>
            </Tooltip>
          ) : (
            <Tooltip title="上架">
              <Popconfirm
                title="确认上架"
                description={`确定要上架课程包"${record.name}"吗？`}
                onConfirm={() => handleUpdateStatus(record.id, 'active')}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#00ff88' }}
                />
              </Popconfirm>
            </Tooltip>
          )}
          <Popconfirm
            title="确认删除"
            description={`确定要删除课程包"${record.name}"吗？`}
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

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <GiftOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          课程包管理
        </div>
        <Space>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
            }}
          >
            导出
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={styles.actionButton}
          >
            新增课程包
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onClick={() => handleStatClick(undefined)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 212, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.statValue}>{statistics.total}</div>
              <div style={styles.statLabel}>课程包总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onClick={() => handleStatClick('active')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 255, 136, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ ...styles.statValue, color: '#00ff88' }}>
                {statistics.active}
              </div>
              <div style={styles.statLabel}>上架中</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onClick={() => handleStatClick('inactive')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 106, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ ...styles.statValue, color: '#ff4d6a' }}>
                {statistics.inactive}
              </div>
              <div style={styles.statLabel}>已下架</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 170, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ ...styles.statValue, color: '#ffaa00' }}>
                ¥{statistics.totalRevenue.toLocaleString()}
              </div>
              <div style={styles.statLabel}>总价值</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选栏和表格 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Search
            placeholder="搜索课程包名称"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            onSearch={handleSearch}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 120 }}
            value={queryParams.status}
            onChange={(value) => handleFilter('status', value)}
          >
            <Option value="active">上架</Option>
            <Option value="inactive">下架</Option>
          </Select>
          <InputNumber
            placeholder="最低价格"
            style={{ width: 140 }}
            min={0}
            prefix="¥"
            onChange={(value) => handleFilter('minPrice', value)}
          />
          <InputNumber
            placeholder="最高价格"
            style={{ width: 140 }}
            min={0}
            prefix="¥"
            onChange={(value) => handleFilter('maxPrice', value)}
          />
          <Button onClick={handleReset}>重置</Button>
        </div>

        {/* 表格 */}
        <CommonTable<CoursePackage>
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
          }}
          onChange={(pagination) => {
            setQueryParams({
              ...queryParams,
              page: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            });
          }}
          scroll={{ x: 1400 }}
          showRefresh={false}
          showExport={false}
        />
      </Card>

      {/* 新增/编辑表单 */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            {editingId ? '编辑课程包' : '新增课程包'}
          </div>
        }
        open={formVisible}
        onOk={handleSubmit}
        onCancel={() => setFormVisible(false)}
        width={900}
        okText="提交"
        cancelText="取消"
        destroyOnClose
        styles={{
          body: { background: '#111827', maxHeight: '70vh', overflowY: 'auto' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="课程包名称"
            name="name"
            rules={[{ required: true, message: '请输入课程包名称' }]}
          >
            <Input placeholder="请输入课程包名称" />
          </Form.Item>

          <Form.Item label="课程包描述" name="description">
            <TextArea rows={3} placeholder="请输入课程包描述" />
          </Form.Item>

          <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }} />

          <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
            价格配置
          </Title>

          <div style={styles.priceCard}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="原价（元）"
                  name="originalPrice"
                  rules={[{ required: true, message: '请输入原价' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="请输入原价"
                    prefix="¥"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="优惠价（元）"
                  name="price"
                  rules={[{ required: true, message: '请输入优惠价' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="请输入优惠价"
                    prefix="¥"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="折扣">
                  <Input
                    value={calculateDiscount()}
                    disabled
                    style={{
                      background: 'rgba(255, 77, 106, 0.1)',
                      border: '1px solid rgba(255, 77, 106, 0.3)',
                      color: '#ff4d6a',
                      fontWeight: 600,
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item
            label="有效期（天）"
            name="validDays"
            rules={[{ required: true, message: '请输入有效期' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="请输入有效期天数"
              addonAfter="天"
            />
          </Form.Item>

          <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }} />

          <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
            选择课程
          </Title>

          <Transfer
            dataSource={availableCourses.map((course) => ({
              key: course.id,
              title: course.name,
              description: `${course.category} | ¥${course.price} | ${course.totalHours}课时`,
            }))}
            targetKeys={selectedCourseKeys.map(String)}
            onChange={(targetKeys) => {
              setSelectedCourseKeys(targetKeys.map(Number));
            }}
            render={(item) => (
              <div>
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>
                  {item.description}
                </div>
              </div>
            )}
            listStyle={{
              width: 380,
              height: 400,
            }}
            titles={['可选课程', '已选课程']}
            showSearch
            filterOption={(inputValue, item) =>
              item.title!.toLowerCase().includes(inputValue.toLowerCase())
            }
          />

          <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }} />

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="active"
          >
            <Select placeholder="请选择状态">
              <Option value="active">上架</Option>
              <Option value="inactive">下架</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Component;
