import { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Tabs,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Spin,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Tooltip,
  Badge,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  Class,
  ClassStudent,
  AssignStudentParams,
  RemoveStudentParams,
  CompleteClassParams,
} from '@/types/class';
import type { Student } from '@/types/student';
import {
  getClassDetail,
  getClassStudents,
  assignStudents,
  removeStudent,
  completeClass,
  exportClassStudents,
  updateClass,
} from '@/api/class';
import { getStudentList } from '@/api/student';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Text } = Typography;

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    color: '#00d4ff',
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoCard: {
    padding: 24,
  },
  statsRow: {
    marginBottom: 24,
  },
  statCard: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
    textAlign: 'center' as const,
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
  tabCard: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
  },
};

// 班级状态映射
const classStatusMap: Record<string, { text: string; color: string; bgColor: string }> = {
  pending: { text: '未开班', color: '#ffaa00', bgColor: 'rgba(255, 170, 0, 0.1)' },
  active: { text: '进行中', color: '#00ff88', bgColor: 'rgba(0, 255, 136, 0.1)' },
  completed: { text: '已结业', color: '#00d4ff', bgColor: 'rgba(0, 212, 255, 0.1)' },
  cancelled: { text: '已取消', color: '#ff4d6a', bgColor: 'rgba(255, 77, 106, 0.1)' },
};

// 班级类型映射
const classTypeMap: Record<string, string> = {
  regular: '常规班',
  trial: '试听班',
  intensive: '集训班',
};

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [loading, setLoading] = useState(false);
  const [classInfo, setClassInfo] = useState<Class>();
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [removeStudentModalVisible, setRemoveStudentModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent>();

  const [addStudentForm] = Form.useForm();
  const [removeStudentForm] = Form.useForm();
  const [completeForm] = Form.useForm();

  // 加载班级详情
  const loadClassDetail = async () => {
    setLoading(true);
    try {
      const data = await getClassDetail(classId);
      setClassInfo(data);
    } catch (error) {
      message.error('加载班级信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载学员列表
  const loadStudents = async () => {
    try {
      const data = await getClassStudents(classId);
      setStudents(data);
    } catch (error) {
      message.error('加载学员列表失败');
    }
  };

  // 加载可添加的学员列表
  const loadAvailableStudents = async () => {
    try {
      const response = await getStudentList({
        page: 1,
        pageSize: 1000,
        status: 'active',
      });
      setAvailableStudents(response.list);
    } catch (error) {
      message.error('加载学员列表失败');
    }
  };

  useEffect(() => {
    loadClassDetail();
    loadStudents();
  }, [classId]);

  // 返回列表
  const handleBack = () => {
    navigate('/teaching/class');
  };

  // 编辑班级
  const handleEdit = () => {
    navigate(`/teaching/class/edit/${classId}`);
  };

  // 打开添加学员弹窗
  const handleAddStudent = () => {
    loadAvailableStudents();
    addStudentForm.resetFields();
    addStudentForm.setFieldsValue({
      joinDate: dayjs(),
    });
    setAddStudentModalVisible(true);
  };

  // 提交添加学员
  const handleAddStudentSubmit = async () => {
    try {
      const values = await addStudentForm.validateFields();
      const params: AssignStudentParams = {
        classId,
        studentIds: values.studentIds,
        joinDate: values.joinDate.format('YYYY-MM-DD'),
        remark: values.remark,
      };
      await assignStudents(params);
      message.success('添加学员成功');
      setAddStudentModalVisible(false);
      loadStudents();
      loadClassDetail();
    } catch (error: any) {
      message.error(error.message || '添加学员失败');
    }
  };

  // 打开移除学员弹窗
  const handleRemoveStudent = (student: ClassStudent) => {
    setSelectedStudent(student);
    removeStudentForm.resetFields();
    removeStudentForm.setFieldsValue({
      leaveDate: dayjs(),
    });
    setRemoveStudentModalVisible(true);
  };

  // 提交移除学员
  const handleRemoveStudentSubmit = async () => {
    if (!selectedStudent) return;

    try {
      const values = await removeStudentForm.validateFields();
      const params: RemoveStudentParams = {
        classId,
        studentId: selectedStudent.studentId,
        leaveDate: values.leaveDate.format('YYYY-MM-DD'),
        reason: values.reason,
      };
      await removeStudent(params);
      message.success('移除学员成功');
      setRemoveStudentModalVisible(false);
      loadStudents();
      loadClassDetail();
    } catch (error: any) {
      message.error(error.message || '移除学员失败');
    }
  };

  // 打开结业弹窗
  const handleComplete = () => {
    completeForm.resetFields();
    completeForm.setFieldsValue({
      completeDate: dayjs(),
    });
    setCompleteModalVisible(true);
  };

  // 提交结业
  const handleCompleteSubmit = async () => {
    try {
      const values = await completeForm.validateFields();
      const params: CompleteClassParams = {
        classId,
        completeDate: values.completeDate.format('YYYY-MM-DD'),
        remark: values.remark,
      };
      await completeClass(params);
      message.success('班级结业成功');
      setCompleteModalVisible(false);
      loadClassDetail();
    } catch (error: any) {
      message.error(error.message || '班级结业失败');
    }
  };

  // 导出学员列表
  const handleExport = async () => {
    try {
      await exportClassStudents(classId);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 更新班级状态
  const handleUpdateStatus = async (status: string) => {
    if (!classInfo) return;

    try {
      await updateClass(classId, {
        ...classInfo,
        status: status as any,
      });
      message.success('状态更新成功');
      loadClassDetail();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 学员表格列
  const studentColumns: ColumnsType<ClassStudent> = [
    {
      title: '学员',
      key: 'student',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record.studentAvatar}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: '2px solid rgba(0, 212, 255, 0.3)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{record.studentName}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
              {record.studentPhone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '家长电话',
      dataIndex: 'parentPhone',
      key: 'parentPhone',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '加入日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      render: (rate: number) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={rate}
            size="small"
            strokeColor={{
              '0%': '#00d4ff',
              '100%': '#0099ff',
            }}
            format={(percent) => (
              <span style={{ color: rate >= 80 ? '#00ff88' : rate >= 60 ? '#ffaa00' : '#ff4d6a' }}>
                {percent}%
              </span>
            )}
          />
        </div>
      ),
    },
    {
      title: '已完成课时',
      dataIndex: 'completedHours',
      key: 'completedHours',
      render: (hours: number) => (
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>{hours}h</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          style={{
            background: status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 'active' ? '#00ff88' : '#ff4d6a'}`,
            color: status === 'active' ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 'active' ? '在读' : '已退班'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => navigate(`/student/${record.studentId}`)}
            />
          </Tooltip>
          {record.status === 'active' && (
            <Popconfirm
              title="确定要移除该学员吗？"
              description="移除后学员将不再属于该班级"
              onConfirm={() => handleRemoveStudent(record)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="移除学员">
                <Button type="text" icon={<UserDeleteOutlined />} style={{ color: '#ff4d6a' }} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (loading || !classInfo) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const statusInfo = classStatusMap[classInfo.status];
  const completionRate = classInfo.totalHours > 0
    ? Math.round((classInfo.completedHours / classInfo.totalHours) * 100)
    : 0;
  const occupancyRate = classInfo.capacity > 0
    ? Math.round((classInfo.currentStudents / classInfo.capacity) * 100)
    : 0;

  return (
    <div>
      {/* 页面头部 */}
      <div style={styles.pageHeader}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={styles.backButton}>
          返回列表
        </Button>
        <Space>
          {classInfo.status === 'pending' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateStatus('active')}
              style={styles.actionButton}
            >
              开班
            </Button>
          )}
          {classInfo.status === 'active' && (
            <Button
              type="primary"
              icon={<TrophyOutlined />}
              onClick={handleComplete}
              style={styles.actionButton}
            >
              结业
            </Button>
          )}
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            编辑班级
          </Button>
        </Space>
      </div>

      {/* 基本信息卡片 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.infoCard}>
          <Row gutter={24} style={styles.statsRow}>
            <Col span={6}>
              <div style={styles.statCard}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>班级人数</span>}
                  value={classInfo.currentStudents}
                  suffix={`/ ${classInfo.capacity}`}
                  valueStyle={{ color: '#00d4ff', fontSize: 32, fontWeight: 700 }}
                  prefix={<TeamOutlined />}
                />
                <Progress
                  percent={occupancyRate}
                  size="small"
                  strokeColor={{
                    '0%': '#00d4ff',
                    '100%': '#0099ff',
                  }}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={styles.statCard}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>课程进度</span>}
                  value={classInfo.completedHours}
                  suffix={`/ ${classInfo.totalHours}h`}
                  valueStyle={{ color: '#00ff88', fontSize: 32, fontWeight: 700 }}
                  prefix={<ClockCircleOutlined />}
                />
                <Progress
                  percent={completionRate}
                  size="small"
                  strokeColor={{
                    '0%': '#00ff88',
                    '100%': '#00cc66',
                  }}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={styles.statCard}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>开班日期</span>}
                  value={classInfo.startDate}
                  valueStyle={{ color: '#ffaa00', fontSize: 20, fontWeight: 600 }}
                  prefix={<CalendarOutlined />}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={styles.statCard}>
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>结束日期</span>}
                  value={classInfo.endDate}
                  valueStyle={{ color: '#ffaa00', fontSize: 20, fontWeight: 600 }}
                  prefix={<CalendarOutlined />}
                />
              </div>
            </Col>
          </Row>

          <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
            {classInfo.name}
            <Tag
              style={{
                background: statusInfo.bgColor,
                border: `1px solid ${statusInfo.color}`,
                color: statusInfo.color,
                marginLeft: 12,
              }}
            >
              {statusInfo.text}
            </Tag>
            <Tag
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
                marginLeft: 8,
              }}
            >
              {classTypeMap[classInfo.type]}
            </Tag>
          </Title>

          <Descriptions column={3}>
            <Descriptions.Item label="班级编号">
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{classInfo.code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="课程">
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{classInfo.courseName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="授课教师">
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{classInfo.teacherName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="所属校区">
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{classInfo.campusName}</span>
            </Descriptions.Item>
            {classInfo.classroomName && (
              <Descriptions.Item label="教室">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{classInfo.classroomName}</span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="上课时间" span={classInfo.classroomName ? 1 : 2}>
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{classInfo.schedule}</span>
            </Descriptions.Item>
            {classInfo.remark && (
              <Descriptions.Item label="备注" span={3}>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{classInfo.remark}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      </Card>

      {/* 学员列表 */}
      <div style={styles.tabCard}>
        <Tabs defaultActiveKey="students">
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                学员列表 <Badge count={students.length} style={{ marginLeft: 8 }} />
              </span>
            }
            key="students"
          >
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleAddStudent}
                  style={styles.actionButton}
                  disabled={classInfo.status === 'completed' || classInfo.status === 'cancelled'}
                >
                  添加学员
                </Button>
                <Button icon={<ExportOutlined />} onClick={handleExport}>
                  导出学员
                </Button>
                <Text style={{ color: 'rgba(255, 255, 255, 0.45)', marginLeft: 16 }}>
                  共 {students.length} 名学员
                </Text>
              </Space>
            </div>
            <Table
              columns={studentColumns}
              dataSource={students}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              style={{
                background: '#111827',
              }}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* 添加学员弹窗 */}
      <Modal
        title="添加学员"
        open={addStudentModalVisible}
        onOk={handleAddStudentSubmit}
        onCancel={() => setAddStudentModalVisible(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        <Form form={addStudentForm} layout="vertical">
          <Form.Item
            label="选择学员"
            name="studentIds"
            rules={[{ required: true, message: '请选择学员' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择学员"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableStudents
                .filter((s) => !students.some((cs) => cs.studentId === s.id && cs.status === 'active'))
                .map((s) => ({
                  label: `${s.name} - ${s.phone}`,
                  value: s.id,
                }))}
            />
          </Form.Item>
          <Form.Item
            label="加入日期"
            name="joinDate"
            rules={[{ required: true, message: '请选择加入日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择加入日期" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 移除学员弹窗 */}
      <Modal
        title="移除学员"
        open={removeStudentModalVisible}
        onOk={handleRemoveStudentSubmit}
        onCancel={() => setRemoveStudentModalVisible(false)}
        width={500}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        <Form form={removeStudentForm} layout="vertical">
          <div style={{ marginBottom: 16, color: 'rgba(255, 255, 255, 0.65)' }}>
            确定要移除学员 <Text style={{ color: '#00d4ff' }}>{selectedStudent?.studentName}</Text> 吗？
          </div>
          <Form.Item
            label="退班日期"
            name="leaveDate"
            rules={[{ required: true, message: '请选择退班日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择退班日期" />
          </Form.Item>
          <Form.Item
            label="退班原因"
            name="reason"
            rules={[{ required: true, message: '请输入退班原因' }]}
          >
            <TextArea rows={3} placeholder="请输入退班原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 结业弹窗 */}
      <Modal
        title="班级结业"
        open={completeModalVisible}
        onOk={handleCompleteSubmit}
        onCancel={() => setCompleteModalVisible(false)}
        width={500}
        okText="确定"
        cancelText="取消"
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        <Form form={completeForm} layout="vertical">
          <div style={{ marginBottom: 16, color: 'rgba(255, 255, 255, 0.65)' }}>
            确定要将班级 <Text style={{ color: '#00d4ff' }}>{classInfo.name}</Text> 标记为结业吗？
          </div>
          <Form.Item
            label="结业日期"
            name="completeDate"
            rules={[{ required: true, message: '请选择结业日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择结业日期" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Component;
