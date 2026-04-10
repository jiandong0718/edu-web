import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Progress,
  Modal,
  Form,
  InputNumber,
  Select,
  Popconfirm,
  Descriptions,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ReadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { getCourseList, getCourseDetail, createCourse, updateCourse, deleteCourse } from '@/api/course';
import type { Course, CourseQueryParams, CourseFormData } from '@/types/course';

const categoryColors: Record<string, string> = {
  编程: '#00d4ff',
  数学: '#00ff88',
  英语: '#ffaa00',
  艺术: '#ff6b9d',
  音乐: '#a855f7',
};

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
  statsBar: {
    display: 'flex',
    gap: 24,
    marginBottom: 20,
    padding: '16px 20px',
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(0, 212, 255, 0.1)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

function CourseList() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 详情弹窗
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<Course | null>(null);

  // 表单弹窗
  const [formVisible, setFormVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form] = Form.useForm<CourseFormData>();

  const loadData = async () => {
    setLoading(true);
    try {
      const params: CourseQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };

      if (queryKeyword) {
        params.name = queryKeyword;
      }

      const response = await getCourseList(params);
      setCourses(response.list);
      setTotal(response.total);
    } catch {
      message.error('加载课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [pagination.current, pagination.pageSize, queryKeyword]);

  const stats = useMemo(() => {
    const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
    const activeCount = courses.filter((c) => c.status === 'active').length;

    return {
      totalCourses: total || courses.length,
      activeCount,
      totalStudents,
    };
  }, [courses, total]);

  // 查看详情
  const handleViewDetail = async (record: Course) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const data = await getCourseDetail(record.id);
      setDetailData(data);
    } catch {
      message.error('加载课程详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 新增
  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setFormVisible(true);
  };

  // 编辑
  const handleEdit = (record: Course) => {
    setEditingCourse(record);
    form.setFieldsValue({
      name: record.name,
      category: record.category,
      price: record.price,
      totalHours: record.totalHours,
      status: record.status,
      description: record.description,
    });
    setFormVisible(true);
  };

  // 提交表单
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormLoading(true);
      if (editingCourse) {
        await updateCourse(editingCourse.id, values);
        message.success('更新成功');
      } else {
        await createCourse(values);
        message.success('创建成功');
      }
      setFormVisible(false);
      void loadData();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error('操作失败');
    } finally {
      setFormLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteCourse(id);
      message.success('删除成功');
      void loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Course> = [
    {
      title: '课程名称',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.description || '-'}
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string | undefined) => {
        const displayCategory = category || '未分类';
        const color = categoryColors[displayCategory] || '#00d4ff';
        return (
          <Tag
            style={{
              background: `${color}15`,
              border: `1px solid ${color}40`,
              color,
            }}
          >
            {displayCategory}
          </Tag>
        );
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <span style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
          ¥{price.toLocaleString()}
        </span>
      ),
    },
    {
      title: '课时',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 100,
      align: 'center',
      render: (hours: number) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#00d4ff' }} />
          <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{hours} 课时</span>
        </Space>
      ),
    },
    {
      title: '学员数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 150,
      sorter: (a, b) => a.studentCount - b.studentCount,
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={Math.min(count * 2, 100)}
            size="small"
            strokeColor={{
              '0%': '#00d4ff',
              '100%': '#0099ff',
            }}
            trailColor="rgba(255, 255, 255, 0.1)"
            showInfo={false}
            style={{ width: 60, marginBottom: 0 }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.85)', marginLeft: 8 }}>{count}</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: Course['status']) => (
        <Tag
          style={{
            background: status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 'active' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: status === 'active' ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (date: string | undefined) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{date || '-'}</span>
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
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00ff88' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除该课程吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
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

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setQueryKeyword(searchInput.trim());
  };

  const handleRefresh = () => {
    void loadData();
  };

  const handleTableChange = (pager: TablePaginationConfig) => {
    setPagination({
      current: pager.current || 1,
      pageSize: pager.pageSize || 10,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <ReadOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          课程管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={handleAdd}
          >
            新增课程
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.totalCourses}</div>
            <div style={styles.statLabel}>总课程数</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.activeCount}</div>
            <div style={styles.statLabel}>当前页启用课程</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.totalStudents}</div>
            <div style={styles.statLabel}>当前页总学员数</div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索课程名称"
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
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={courses}
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

      {/* 详情弹窗 */}
      <Modal
        title="课程详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : detailData ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="课程名称">{detailData.name}</Descriptions.Item>
            <Descriptions.Item label="分类">{detailData.category || '-'}</Descriptions.Item>
            <Descriptions.Item label="价格">¥{detailData.price?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="总课时">{detailData.totalHours} 课时</Descriptions.Item>
            <Descriptions.Item label="学员数">{detailData.studentCount}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={detailData.status === 'active' ? 'green' : 'red'}>
                {detailData.status === 'active' ? '启用' : '停用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{detailData.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>{detailData.createTime || '-'}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCourse ? '编辑课程' : '新增课程'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleFormSubmit}
        confirmLoading={formLoading}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="课程名称" name="name" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input placeholder="请输入课程名称" />
          </Form.Item>
          <Form.Item label="分类" name="category">
            <Select placeholder="请选择分类" allowClear>
              {Object.keys(categoryColors).map((cat) => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="价格" name="price" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入价格" addonAfter="元" />
          </Form.Item>
          <Form.Item label="总课时" name="totalHours" rules={[{ required: true, message: '请输入总课时' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入总课时" addonAfter="课时" />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入课程描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CourseList;
