import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Row,
  Col,
  message,
  Tooltip,
  Descriptions,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
  TeamOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { StudentBatchImport } from '@/components/StudentBatchImport';
import { getStudentList, getStudentDetail, deleteStudent, createStudent, updateStudent, exportStudentList } from '@/api/student';
import type { Student as ApiStudent, StudentFormData, StudentQueryParams } from '@/types/student';
import { getCampusList } from '@/api/campus';
import type { Campus } from '@/components/CampusSwitch';

// 学生数据类型
interface StudentRow {
  id: number;
  name: string;
  avatar?: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  courses: string[];
  remainingHours: number;
  createTime: string;
  campusId: number;
  campus: string;
}

interface StudentFormValues {
  name: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  parentName: string;
  parentPhone: string;
  campusId: number;
}

// 样式定义
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
  searchInput: {
    width: 280,
    background: '#1a2332',
  },
  select: {
    width: 140,
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

// 状态配置
const statusConfig = {
  active: { color: '#00ff88', text: '在读', bg: 'rgba(0, 255, 136, 0.1)' },
  inactive: { color: '#ff4d6a', text: '停课', bg: 'rgba(255, 77, 106, 0.1)' },
  graduated: { color: '#00d4ff', text: '结业', bg: 'rgba(0, 212, 255, 0.1)' },
  suspended: { color: '#ffaa00', text: '休学', bg: 'rgba(255, 170, 0, 0.1)' },
};

const mapStatusToRow = (status: ApiStudent['status']): StudentRow['status'] => {
  if (status === 'dropout') return 'suspended';
  return status;
};

const mapApiStudentToRow = (student: ApiStudent): StudentRow => ({
  id: student.id,
  name: student.name,
  avatar: student.avatar,
  gender: student.gender,
  age: student.birthday ? dayjs().diff(dayjs(student.birthday), 'year') : 0,
  phone: student.phone,
  parentName: student.parentName,
  parentPhone: student.parentPhone,
  status: mapStatusToRow(student.status),
  courses: [],
  remainingHours: 0,
  createTime: student.createTime,
  campusId: student.campusId,
  campus: student.campusName || '',
});

function StudentList() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [campusFilter, setCampusFilter] = useState<number | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [form] = Form.useForm();

  // 详情弹窗
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<ApiStudent | null>(null);

  // 动态校区列表
  const [campusOptions, setCampusOptions] = useState<Campus[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: StudentQueryParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      if (searchKeyword) params.name = searchKeyword;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter as StudentQueryParams['status'];
      if (typeof campusFilter === 'number') params.campusId = campusFilter;
      const res = await getStudentList(params);
      const list = Array.isArray(res.list) ? res.list : [];
      setStudents(list.map(mapApiStudentToRow));
      setTotal(res.total || 0);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [pagination, searchKeyword, statusFilter, campusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    getCampusList().then(res => setCampusOptions(res.list)).catch(() => message.error('加载校区列表失败'));
  }, []);

  const handleViewDetail = async (record: StudentRow) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const data = await getStudentDetail(record.id);
      setDetailData(data);
    } catch {
      message.error('加载学生详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<StudentRow> = [
    {
      title: '学生信息',
      key: 'info',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar
            size={44}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{
              background: record.gender === 'male'
                ? 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)'
                : 'linear-gradient(135deg, #ff6b9d 0%, #ff4d6a 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500, marginBottom: 2 }}>
              {record.name}
              <Tag
                style={{
                  marginLeft: 8,
                  background: record.gender === 'male' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 107, 157, 0.1)',
                  border: `1px solid ${record.gender === 'male' ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 107, 157, 0.3)'}`,
                  color: record.gender === 'male' ? '#00d4ff' : '#ff6b9d',
                  fontSize: 11,
                }}
              >
                {record.gender === 'male' ? '男' : '女'}
              </Tag>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              {record.age}岁 · {record.phone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '家长信息',
      key: 'parent',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>
            {record.parentName}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.parentPhone}
          </div>
        </div>
      ),
    },
    {
      title: '课程',
      dataIndex: 'courses',
      key: 'courses',
      render: (courses: string[]) => (
        <Space wrap>
          {courses.map((course, index) => (
            <Tag
              key={index}
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
                fontSize: 11,
              }}
            >
              {course}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '剩余课时',
      dataIndex: 'remainingHours',
      key: 'remainingHours',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.remainingHours - b.remainingHours,
      render: (hours: number) => (
        <Tag
          style={{
            background: hours > 20 ? 'rgba(0, 255, 136, 0.1)' : hours > 0 ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${hours > 20 ? 'rgba(0, 255, 136, 0.3)' : hours > 0 ? 'rgba(255, 170, 0, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: hours > 20 ? '#00ff88' : hours > 0 ? '#ffaa00' : '#ff4d6a',
            fontWeight: 600,
          }}
        >
          {hours} 课时
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        return (
          <Tag
            style={{
              background: config.bg,
              border: `1px solid ${config.color}40`,
              color: config.color,
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '建档时间',
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
      width: 150,
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
              onClick={() => {
                setEditingStudent(record);
                form.setFieldsValue(record);
                setIsModalOpen(true);
              }}
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

  const handleRefresh = () => {
    loadData();
  };

  const handleDelete = async (record: StudentRow) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除学生 ${record.name} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteStudent(record.id);
          message.success('删除成功');
          loadData();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      const params: StudentQueryParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      if (searchKeyword) params.name = searchKeyword;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter as StudentQueryParams['status'];
      if (typeof campusFilter === 'number') params.campusId = campusFilter;
      await exportStudentList(params);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  // 导入成功回调
  const handleImportSuccess = () => {
    loadData();
  };

  const handleSaveStudent = async () => {
    try {
      const values = (await form.validateFields()) as StudentFormValues;
      const payload: StudentFormData = {
        name: values.name,
        gender: values.gender,
        phone: values.phone,
        parentName: values.parentName,
        parentPhone: values.parentPhone,
        birthday: dayjs().subtract(values.age, 'year').format('YYYY-MM-DD'),
        address: '',
        school: '',
        grade: '',
        status: 'active',
        campusId: values.campusId,
        // 后端当前未开放独立入学日期字段，前端不再暴露可编辑输入
        enrollDate: editingStudent?.createTime
          ? dayjs(editingStudent.createTime).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
      };

      if (editingStudent) {
        await updateStudent(editingStudent.id, payload);
        message.success('更新成功');
      } else {
        await createStudent(payload);
        message.success('新增成功');
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      form.resetFields();
      loadData();
    } catch (error) {
      if ((error as { errorFields?: unknown }).errorFields) {
        return;
      }
      message.error('保存失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <TeamOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          学生管理
        </div>
        <Space>
          <Button
            icon={<ImportOutlined />}
            onClick={() => setIsImportModalOpen(true)}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
            }}
          >
            批量导入
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={() => {
              setEditingStudent(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            新增学生
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{total}</div>
            <div style={styles.statLabel}>总学生数</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {students.filter((s) => s.status === 'active').length}
            </div>
            <div style={styles.statLabel}>在读学生</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {students.reduce((sum, s) => sum + s.remainingHours, 0)}
            </div>
            <div style={styles.statLabel}>总剩余课时</div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索学生姓名、手机号"
            prefix={<SearchOutlined />}
            style={styles.searchInput}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => setPagination((prev) => ({ ...prev, page: 1 }))}
            allowClear
          />
          <Select
            placeholder="状态"
            style={styles.select}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { label: '全部', value: 'all' },
              { label: '在读', value: 'active' },
              { label: '停课', value: 'inactive' },
              { label: '结业', value: 'graduated' },
              { label: '休学', value: 'dropout' },
            ]}
            allowClear
          />
          <Select
            placeholder="校区"
            style={styles.select}
            value={campusFilter}
            onChange={(value) => setCampusFilter(value)}
            options={campusOptions.map((c) => ({ label: c.name, value: c.id }))}
            allowClear
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
          >
            应用筛选
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
        </div>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: pagination.page,
            total,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ page, pageSize });
            },
          }}
        />
      </Card>

      <Modal
        title={editingStudent ? '编辑学生' : '新增学生'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
          form.resetFields();
        }}
        onOk={handleSaveStudent}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="学生姓名" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '男', value: 'male' },
                    { label: '女', value: 'female' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="年龄" name="age" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="手机号" name="phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="家长姓名" name="parentName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="家长手机" name="parentPhone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="所属校区" name="campusId" rules={[{ required: true, message: '请选择所属校区' }]}>
            <Select
              placeholder="请选择校区"
              options={campusOptions.map((campus) => ({ label: campus.name, value: campus.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导入弹窗 */}
      <StudentBatchImport
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* 学生详情弹窗 */}
      <Modal
        title="学生详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : detailData ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名">{detailData.name}</Descriptions.Item>
            <Descriptions.Item label="性别">{detailData.gender === 'male' ? '男' : '女'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{detailData.phone}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{detailData.idCard || '-'}</Descriptions.Item>
            <Descriptions.Item label="生日">{detailData.birthday || '-'}</Descriptions.Item>
            <Descriptions.Item label="学校">{detailData.school || '-'}</Descriptions.Item>
            <Descriptions.Item label="年级">{detailData.grade || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={detailData.status === 'active' ? 'green' : detailData.status === 'graduated' ? 'blue' : 'red'}>
                {detailData.status === 'active' ? '在读' : detailData.status === 'graduated' ? '结业' : detailData.status === 'inactive' ? '停课' : '休学'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="家长姓名">{detailData.parentName}</Descriptions.Item>
            <Descriptions.Item label="家长电话">{detailData.parentPhone}</Descriptions.Item>
            <Descriptions.Item label="校区">{detailData.campusName || '-'}</Descriptions.Item>
            <Descriptions.Item label="建档时间">{detailData.createTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{detailData.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{detailData.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>{detailData.createTime || '-'}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  );
}

export default StudentList;
