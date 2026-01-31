import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Input,
  message,
  Tag,
  Alert,
  Descriptions,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  SwapOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { Schedule, ConflictInfo } from '@/types/schedule';
import {
  getScheduleList,
  rescheduleClass,
  substituteTeacher,
  cancelSchedule,
  checkConflict,
} from '@/api/schedule';

const { TextArea } = Input;

interface ScheduleOperationsProps {
  onSuccess?: () => void;
}

type OperationType = 'reschedule' | 'substitute' | 'cancel';

// 样式定义
const styles = {
  operationCard: {
    background: 'rgba(0, 212, 255, 0.03)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  conflictAlert: {
    background: 'rgba(255, 77, 106, 0.1)',
    border: '1px solid rgba(255, 77, 106, 0.3)',
    marginBottom: 16,
  },
  scheduleInfo: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
};

// 状态配置
const statusConfig = {
  scheduled: { color: '#00d4ff', text: '已排课' },
  completed: { color: '#00ff88', text: '已完成' },
  cancelled: { color: '#ff4d6a', text: '已取消' },
  rescheduled: { color: '#ffaa00', text: '已调课' },
};

function ScheduleOperations({ onSuccess }: ScheduleOperationsProps) {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [operationType, setOperationType] = useState<OperationType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [form] = Form.useForm();

  // 模拟教师和教室数据
  const mockTeachers = [
    { label: '张老师', value: 1 },
    { label: '李老师', value: 2 },
    { label: '王老师', value: 3 },
  ];

  const mockClassrooms = [
    { label: '101教室', value: 1 },
    { label: '102教室', value: 2 },
    { label: '201教室', value: 3 },
  ];

  // 模拟课表数据
  const mockSchedules: Schedule[] = [
    {
      id: 1,
      classId: 1,
      className: '少儿编程初级班',
      courseId: 1,
      courseName: 'Scratch编程基础',
      teacherId: 1,
      teacherName: '张老师',
      classroomId: 1,
      classroomName: '101教室',
      startTime: '2026-02-01 09:00:00',
      endTime: '2026-02-01 10:30:00',
      status: 'scheduled',
      createdAt: '2026-01-31 10:00:00',
      updatedAt: '2026-01-31 10:00:00',
    },
    {
      id: 2,
      classId: 2,
      className: '数学思维提升班',
      courseId: 2,
      courseName: '数学思维训练',
      teacherId: 2,
      teacherName: '李老师',
      classroomId: 2,
      classroomName: '102教室',
      startTime: '2026-02-01 14:00:00',
      endTime: '2026-02-01 15:30:00',
      status: 'scheduled',
      createdAt: '2026-01-31 10:00:00',
      updatedAt: '2026-01-31 10:00:00',
    },
    {
      id: 3,
      classId: 3,
      className: '英语口语班',
      courseId: 3,
      courseName: '英语口语交流',
      teacherId: 3,
      teacherName: '王老师',
      classroomId: 3,
      classroomName: '201教室',
      startTime: '2026-02-02 10:00:00',
      endTime: '2026-02-02 11:30:00',
      status: 'scheduled',
      createdAt: '2026-01-31 10:00:00',
      updatedAt: '2026-01-31 10:00:00',
    },
  ];

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      // 实际项目中调用 API
      // const response = await getScheduleList({ status: 'scheduled' });
      // setSchedules(response.list);

      // 使用模拟数据
      setTimeout(() => {
        setSchedules(mockSchedules);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('加载课表失败:', error);
      setLoading(false);
    }
  };

  // 打开操作弹窗
  const handleOpenModal = (schedule: Schedule, type: OperationType) => {
    setSelectedSchedule(schedule);
    setOperationType(type);
    setConflicts([]);
    form.resetFields();

    if (type === 'reschedule') {
      form.setFieldsValue({
        newStartTime: dayjs(schedule.startTime),
        newEndTime: dayjs(schedule.endTime),
        newTeacherId: schedule.teacherId,
        newClassroomId: schedule.classroomId,
      });
    }

    setModalVisible(true);
  };

  // 冲突检测
  const handleCheckConflict = async () => {
    if (operationType !== 'reschedule') return;

    try {
      const values = form.getFieldsValue();
      const response = await checkConflict({
        teacherId: values.newTeacherId,
        classroomId: values.newClassroomId,
        classId: selectedSchedule?.classId,
        startTime: dayjs(values.newStartTime).format('YYYY-MM-DD HH:mm:ss'),
        endTime: dayjs(values.newEndTime).format('YYYY-MM-DD HH:mm:ss'),
        excludeScheduleId: selectedSchedule?.id,
      });

      if (response.hasConflict) {
        setConflicts(response.conflicts);
        message.warning('检测到时间冲突，请调整时间或资源');
      } else {
        setConflicts([]);
        message.success('无冲突，可以提交');
      }
    } catch (error) {
      console.error('冲突检测失败:', error);
    }
  };

  // 提交操作
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (operationType === 'reschedule') {
        await rescheduleClass({
          scheduleId: selectedSchedule!.id,
          newStartTime: dayjs(values.newStartTime).format('YYYY-MM-DD HH:mm:ss'),
          newEndTime: dayjs(values.newEndTime).format('YYYY-MM-DD HH:mm:ss'),
          newTeacherId: values.newTeacherId,
          newClassroomId: values.newClassroomId,
          reason: values.reason,
        });
        message.success('调课成功');
      } else if (operationType === 'substitute') {
        await substituteTeacher({
          scheduleId: selectedSchedule!.id,
          substituteTeacherId: values.substituteTeacherId,
          reason: values.reason,
        });
        message.success('代课设置成功');
      } else if (operationType === 'cancel') {
        await cancelSchedule({
          scheduleId: selectedSchedule!.id,
          reason: values.reason,
        });
        message.success('停课成功');
      }

      setModalVisible(false);
      loadSchedules();
      onSuccess?.();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  // 表格列定义
  const columns: ColumnsType<Schedule> = [
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 150,
      render: (text: string) => (
        <span style={{ color: '#00d4ff', fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 150,
    },
    {
      title: '教师',
      key: 'teacher',
      width: 120,
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#00d4ff' }} />
          <span>{record.teacherName}</span>
          {record.actualTeacherName && (
            <Tag
              color="orange"
              style={{
                background: 'rgba(255, 170, 0, 0.1)',
                border: '1px solid rgba(255, 170, 0, 0.3)',
                color: '#ffaa00',
              }}
            >
              代课: {record.actualTeacherName}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '教室',
      key: 'classroom',
      width: 100,
      render: (_, record) => (
        <Space>
          <HomeOutlined style={{ color: '#00d4ff' }} />
          <span>{record.classroomName || '-'}</span>
        </Space>
      ),
    },
    {
      title: '上课时间',
      key: 'time',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            {dayjs(record.startTime).format('YYYY-MM-DD')}
          </span>
          <Space>
            <ClockCircleOutlined style={{ color: '#00d4ff' }} />
            <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 12 }}>
              {dayjs(record.startTime).format('HH:mm')} -{' '}
              {dayjs(record.endTime).format('HH:mm')}
            </span>
          </Space>
        </Space>
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
              background: `${config.color}20`,
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
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record, 'reschedule')}
            style={{ color: '#00d4ff' }}
          >
            调课
          </Button>
          <Button
            type="link"
            icon={<SwapOutlined />}
            onClick={() => handleOpenModal(record, 'substitute')}
            style={{ color: '#00ff88' }}
          >
            代课
          </Button>
          <Button
            type="link"
            icon={<StopOutlined />}
            onClick={() => handleOpenModal(record, 'cancel')}
            danger
          >
            停课
          </Button>
        </Space>
      ),
    },
  ];

  // 渲染弹窗标题
  const getModalTitle = () => {
    const titles = {
      reschedule: '调课',
      substitute: '代课',
      cancel: '停课',
    };
    return titles[operationType!];
  };

  // 渲染表单内容
  const renderFormContent = () => {
    if (!selectedSchedule) return null;

    return (
      <>
        <div style={styles.scheduleInfo}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="班级">{selectedSchedule.className}</Descriptions.Item>
            <Descriptions.Item label="课程">{selectedSchedule.courseName}</Descriptions.Item>
            <Descriptions.Item label="教师">{selectedSchedule.teacherName}</Descriptions.Item>
            <Descriptions.Item label="教室">
              {selectedSchedule.classroomName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="原定时间" span={2}>
              {dayjs(selectedSchedule.startTime).format('YYYY-MM-DD HH:mm')} -{' '}
              {dayjs(selectedSchedule.endTime).format('HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {conflicts.length > 0 && (
          <Alert
            message="检测到时间冲突"
            description={
              <div>
                {conflicts.map((conflict, index) => (
                  <div key={index} style={{ marginTop: 8 }}>
                    <Tag color="error">{conflict.type === 'teacher' ? '教师' : conflict.type === 'classroom' ? '教室' : '班级'}冲突</Tag>
                    {conflict.className} - {conflict.courseName} ({conflict.teacherName})
                    <br />
                    时间: {dayjs(conflict.startTime).format('HH:mm')} - {dayjs(conflict.endTime).format('HH:mm')}
                  </div>
                ))}
              </div>
            }
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={styles.conflictAlert}
          />
        )}

        <Form form={form} layout="vertical">
          {operationType === 'reschedule' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="新开始时间"
                    name="newStartTime"
                    rules={[{ required: true, message: '请选择开始时间' }]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="新结束时间"
                    name="newEndTime"
                    rules={[{ required: true, message: '请选择结束时间' }]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="新教师" name="newTeacherId">
                    <Select
                      placeholder="不修改则保持原教师"
                      options={mockTeachers}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="新教室" name="newClassroomId">
                    <Select
                      placeholder="不修改则保持原教室"
                      options={mockClassrooms}
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Button
                type="dashed"
                onClick={handleCheckConflict}
                style={{
                  width: '100%',
                  marginBottom: 16,
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  color: '#00d4ff',
                }}
              >
                检测冲突
              </Button>
            </>
          )}

          {operationType === 'substitute' && (
            <Form.Item
              label="代课教师"
              name="substituteTeacherId"
              rules={[{ required: true, message: '请选择代课教师' }]}
            >
              <Select placeholder="请选择代课教师" options={mockTeachers} />
            </Form.Item>
          )}

          <Form.Item
            label="原因说明"
            name="reason"
            rules={[{ required: true, message: '请输入原因说明' }]}
          >
            <TextArea
              rows={4}
              placeholder={`请输入${getModalTitle()}原因`}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </>
    );
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <Card style={styles.operationCard} bordered={false}>
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={getModalTitle()}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
        okText="确认"
        cancelText="取消"
        okButtonProps={{
          disabled: conflicts.length > 0,
        }}
      >
        {renderFormContent()}
      </Modal>
    </div>
  );
}

export default ScheduleOperations;
