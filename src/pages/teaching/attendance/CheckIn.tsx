import { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  Radio,
  message,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getClassCourseInfo, checkIn, batchCheckIn } from '@/api/attendance';
import type {
  StudentCheckInInfo,
  AttendanceStatus,
  ClassCourseInfo,
} from '@/types/attendance';

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
  infoBar: {
    display: 'flex',
    gap: 24,
    marginBottom: 20,
    padding: '16px 20px',
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(0, 212, 255, 0.1)',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 600,
    color: '#00d4ff',
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
};

// 状态配置
const statusConfig = {
  present: {
    color: '#00ff88',
    text: '出勤',
    icon: <CheckCircleOutlined />,
    bg: 'rgba(0, 255, 136, 0.1)',
  },
  absent: {
    color: '#ff4d6a',
    text: '缺勤',
    icon: <CloseCircleOutlined />,
    bg: 'rgba(255, 77, 106, 0.1)',
  },
  late: {
    color: '#ffaa00',
    text: '迟到',
    icon: <ClockCircleOutlined />,
    bg: 'rgba(255, 170, 0, 0.1)',
  },
  leave: {
    color: '#00d4ff',
    text: '请假',
    icon: <FileTextOutlined />,
    bg: 'rgba(0, 212, 255, 0.1)',
  },
};

function CheckInPage() {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [classId, setClassId] = useState<number>();
  const [scheduleId, setScheduleId] = useState<number>();
  const [courseInfo, setCourseInfo] = useState<ClassCourseInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentCheckInInfo | null>(null);
  const [form] = Form.useForm();

  // 模拟班级和课程数据
  const mockClasses = [
    { value: 1, label: '少儿编程初级班' },
    { value: 2, label: '数学思维提升班' },
    { value: 3, label: '英语口语班' },
  ];

  const mockSchedules = [
    { value: 1, label: '2024-01-31 09:00-11:00' },
    { value: 2, label: '2024-01-31 14:00-16:00' },
    { value: 3, label: '2024-02-01 09:00-11:00' },
  ];

  // 加载班级课程信息
  const loadCourseInfo = async () => {
    if (!classId || !scheduleId) {
      return;
    }

    setLoading(true);
    try {
      const data = await getClassCourseInfo(classId, scheduleId);
      setCourseInfo(data);
    } catch (error) {
      message.error('加载课程信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseInfo();
  }, [classId, scheduleId]);

  // 表格列定义
  const columns: ColumnsType<StudentCheckInInfo> = [
    {
      title: '学员信息',
      key: 'info',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar
            size={44}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500 }}>
              {record.studentName}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              ID: {record.studentId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '考勤状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: AttendanceStatus | undefined) => {
        if (!status) {
          return (
            <Tag
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              未签到
            </Tag>
          );
        }
        const config = statusConfig[status];
        return (
          <Tag
            icon={config.icon}
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
      title: '签到时间',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      width: 160,
      render: (time: string | undefined) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          {time || '-'}
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (remark: string | undefined) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          {remark || '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          style={styles.actionButton}
          onClick={() => handleSingleCheckIn(record)}
        >
          签到
        </Button>
      ),
    },
  ];

  // 单个签到
  const handleSingleCheckIn = (student: StudentCheckInInfo) => {
    setCurrentStudent(student);
    form.setFieldsValue({
      status: 'present',
      remark: '',
    });
    setIsModalOpen(true);
  };

  // 批量签到
  const handleBatchCheckIn = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要签到的学员');
      return;
    }
    setCurrentStudent(null);
    form.setFieldsValue({
      status: 'present',
      remark: '',
    });
    setIsModalOpen(true);
  };

  // 提交签到
  const handleSubmit = async () => {
    if (!scheduleId) {
      message.error('请选择课程');
      return;
    }

    try {
      const values = await form.validateFields();

      if (currentStudent) {
        // 单个签到
        await checkIn({
          scheduleId,
          studentId: currentStudent.studentId,
          status: values.status,
          remark: values.remark,
        });
        message.success('签到成功');
      } else {
        // 批量签到
        await batchCheckIn({
          scheduleId,
          studentIds: selectedRowKeys as number[],
          status: values.status,
          remark: values.remark,
        });
        message.success(`批量签到成功，共 ${selectedRowKeys.length} 人`);
        setSelectedRowKeys([]);
      }

      setIsModalOpen(false);
      loadCourseInfo();
    } catch (error) {
      message.error('签到失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <CheckCircleOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          课堂签到
        </div>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Select
            placeholder="选择班级"
            style={{ width: 200 }}
            options={mockClasses}
            value={classId}
            onChange={setClassId}
          />
          <Select
            placeholder="选择课程"
            style={{ width: 240 }}
            options={mockSchedules}
            value={scheduleId}
            onChange={setScheduleId}
            disabled={!classId}
          />
          <Button
            type="primary"
            icon={<CheckOutlined />}
            style={styles.actionButton}
            onClick={handleBatchCheckIn}
            disabled={!courseInfo || selectedRowKeys.length === 0}
          >
            批量签到 ({selectedRowKeys.length})
          </Button>
        </div>

        {courseInfo && (
          <div style={styles.infoBar}>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>班级</div>
              <div style={styles.infoValue}>{courseInfo.className}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>课程</div>
              <div style={styles.infoValue}>{courseInfo.courseName}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>上课时间</div>
              <div style={styles.infoValue}>
                {courseInfo.scheduleDate} {courseInfo.scheduleTime}
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>学员人数</div>
              <div style={styles.infoValue}>{courseInfo.students.length}</div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>已签到</div>
              <div style={styles.infoValue}>
                {courseInfo.students.filter((s) => s.status).length}
              </div>
            </div>
          </div>
        )}

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={courseInfo?.students || []}
            rowKey="studentId"
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: (record) => ({
                disabled: !!record.status, // 已签到的不能再选
              }),
            }}
            pagination={false}
            locale={{
              emptyText: '请选择班级和课程',
            }}
          />
        </Spin>
      </Card>

      {/* 签到弹窗 */}
      <Modal
        title={currentStudent ? `签到 - ${currentStudent.studentName}` : '批量签到'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="考勤状态"
            name="status"
            rules={[{ required: true, message: '请选择考勤状态' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <Radio key={key} value={key}>
                    <Space>
                      <span style={{ color: config.color }}>{config.icon}</span>
                      <span style={{ color: config.color }}>{config.text}</span>
                    </Space>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea
              rows={3}
              placeholder="请输入备注信息（可选）"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CheckInPage;
