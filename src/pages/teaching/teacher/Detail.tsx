import { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
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
  TimePicker,
  message,
  Popconfirm,
  Spin,
} from 'antd';
import {
  UserOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Teacher, Certificate, Schedule, CertificateFormData, ScheduleFormData } from '@/types/teacher';
import {
  getTeacherDetail,
  getTeacherCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getTeacherSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '@/api/teacher';
import { FileUpload } from '@/components/FileUpload';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;

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
    display: 'flex',
    gap: 24,
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: '3px solid rgba(0, 212, 255, 0.3)',
  },
  infoContent: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  tabCard: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
  },
};

// 星期映射
const weekDayMap: Record<number, string> = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
};

export function Component() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const teacherId = Number(id);

  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState<Teacher>();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [certModalVisible, setCertModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate>();
  const [editingSchedule, setEditingSchedule] = useState<Schedule>();

  const [certForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [certFileUrl, setCertFileUrl] = useState<string>();

  // 加载教师详情
  const loadTeacherDetail = async () => {
    setLoading(true);
    try {
      const data = await getTeacherDetail(teacherId);
      setTeacher(data);
    } catch (error) {
      message.error('加载教师信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载证书列表
  const loadCertificates = async () => {
    try {
      const data = await getTeacherCertificates(teacherId);
      setCertificates(data);
    } catch (error) {
      message.error('加载证书列表失败');
    }
  };

  // 加载排班列表
  const loadSchedules = async () => {
    try {
      const data = await getTeacherSchedules(teacherId);
      setSchedules(data);
    } catch (error) {
      message.error('加载排班列表失败');
    }
  };

  useEffect(() => {
    loadTeacherDetail();
    loadCertificates();
    loadSchedules();
  }, [teacherId]);

  // 返回列表
  const handleBack = () => {
    navigate('/teaching/teacher');
  };

  // 新增证书
  const handleAddCert = () => {
    setEditingCert(undefined);
    setCertFileUrl(undefined);
    certForm.resetFields();
    setCertModalVisible(true);
  };

  // 编辑证书
  const handleEditCert = (cert: Certificate) => {
    setEditingCert(cert);
    setCertFileUrl(cert.fileUrl);
    certForm.setFieldsValue({
      ...cert,
      issueDate: cert.issueDate ? dayjs(cert.issueDate) : undefined,
      expiryDate: cert.expiryDate ? dayjs(cert.expiryDate) : undefined,
    });
    setCertModalVisible(true);
  };

  // 删除证书
  const handleDeleteCert = async (certId: number) => {
    try {
      await deleteCertificate(certId);
      message.success('删除成功');
      loadCertificates();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 提交证书表单
  const handleCertSubmit = async () => {
    try {
      const values = await certForm.validateFields();
      const formData: CertificateFormData = {
        ...values,
        teacherId,
        fileUrl: certFileUrl,
        issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
      };

      if (editingCert) {
        await updateCertificate(editingCert.id, formData);
        message.success('更新成功');
      } else {
        await createCertificate(formData);
        message.success('创建成功');
      }
      setCertModalVisible(false);
      loadCertificates();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 新增排班
  const handleAddSchedule = () => {
    setEditingSchedule(undefined);
    scheduleForm.resetFields();
    setScheduleModalVisible(true);
  };

  // 编辑排班
  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    scheduleForm.setFieldsValue({
      ...schedule,
      startTime: schedule.startTime ? dayjs(schedule.startTime, 'HH:mm') : undefined,
      endTime: schedule.endTime ? dayjs(schedule.endTime, 'HH:mm') : undefined,
    });
    setScheduleModalVisible(true);
  };

  // 删除排班
  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await deleteSchedule(scheduleId);
      message.success('删除成功');
      loadSchedules();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 提交排班表单
  const handleScheduleSubmit = async () => {
    try {
      const values = await scheduleForm.validateFields();
      const formData: ScheduleFormData = {
        ...values,
        teacherId,
        startTime: values.startTime ? values.startTime.format('HH:mm') : undefined,
        endTime: values.endTime ? values.endTime.format('HH:mm') : undefined,
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, formData);
        message.success('更新成功');
      } else {
        await createSchedule(formData);
        message.success('创建成功');
      }
      setScheduleModalVisible(false);
      loadSchedules();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 证书表格列
  const certColumns: ColumnsType<Certificate> = [
    {
      title: '证书名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ color: '#fff' }}>{text}</span>,
    },
    {
      title: '颁发机构',
      dataIndex: 'issuer',
      key: 'issuer',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '证书编号',
      dataIndex: 'certificateNo',
      key: 'certificateNo',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '颁发日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (text: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text || '长期有效'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#00d4ff' }}
            onClick={() => handleEditCert(record)}
          />
          <Popconfirm
            title="确定要删除这个证书吗？"
            onConfirm={() => handleDeleteCert(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d6a' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 排班表格列
  const scheduleColumns: ColumnsType<Schedule> = [
    {
      title: '星期',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day: number) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
          }}
        >
          {weekDayMap[day]}
        </Tag>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '校区',
      dataIndex: 'campusName',
      key: 'campusName',
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#00d4ff' }}
            onClick={() => handleEditSchedule(record)}
          />
          <Popconfirm
            title="确定要删除这个排班吗？"
            onConfirm={() => handleDeleteSchedule(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d6a' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading || !teacher) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={styles.pageHeader}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={styles.backButton}>
          返回列表
        </Button>
      </div>

      {/* 基本信息卡片 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.infoCard}>
          <Avatar size={120} icon={<UserOutlined />} src={teacher.avatar} style={styles.avatar} />
          <div style={styles.infoContent}>
            <div style={styles.name}>{teacher.name}</div>
            <Descriptions column={3}>
              <Descriptions.Item label="性别">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  {teacher.gender === 'male' ? '男' : '女'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.phone}</span>
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.email}</span>
              </Descriptions.Item>
              <Descriptions.Item label="身份证号">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.idCard}</span>
              </Descriptions.Item>
              <Descriptions.Item label="出生日期">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.birthday}</span>
              </Descriptions.Item>
              <Descriptions.Item label="教师类型">
                <Tag
                  style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    color: '#00d4ff',
                  }}
                >
                  {teacher.teacherType === 'full_time'
                    ? '全职'
                    : teacher.teacherType === 'part_time'
                    ? '兼职'
                    : '实习'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  style={{
                    background:
                      teacher.status === 'active'
                        ? 'rgba(0, 255, 136, 0.1)'
                        : teacher.status === 'inactive'
                        ? 'rgba(255, 170, 0, 0.1)'
                        : 'rgba(255, 77, 106, 0.1)',
                    border: `1px solid ${
                      teacher.status === 'active'
                        ? '#00ff88'
                        : teacher.status === 'inactive'
                        ? '#ffaa00'
                        : '#ff4d6a'
                    }`,
                    color:
                      teacher.status === 'active'
                        ? '#00ff88'
                        : teacher.status === 'inactive'
                        ? '#ffaa00'
                        : '#ff4d6a',
                  }}
                >
                  {teacher.status === 'active' ? '在职' : teacher.status === 'inactive' ? '停职' : '离职'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所属校区">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.campusName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="教师等级">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.level}</span>
              </Descriptions.Item>
              <Descriptions.Item label="教授科目" span={3}>
                <Space wrap>
                  {teacher.subjects.map((subject, index) => (
                    <Tag
                      key={index}
                      style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        color: '#00ff88',
                      }}
                    >
                      {subject}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="入职日期">
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.joinDate}</span>
              </Descriptions.Item>
              {teacher.leaveDate && (
                <Descriptions.Item label="离职日期">
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.leaveDate}</span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="地址" span={3}>
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{teacher.address}</span>
              </Descriptions.Item>
              {teacher.remark && (
                <Descriptions.Item label="备注" span={3}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{teacher.remark}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </div>
      </Card>

      {/* 证书和排班 */}
      <div style={styles.tabCard}>
        <Tabs defaultActiveKey="certificates">
          <TabPane
            tab={
              <span>
                <SafetyCertificateOutlined />
                证书管理
              </span>
            }
            key="certificates"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCert}
                style={styles.actionButton}
              >
                新增证书
              </Button>
            </div>
            <Table
              columns={certColumns}
              dataSource={certificates}
              rowKey="id"
              pagination={false}
              style={{
                background: '#111827',
              }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                排班管理
              </span>
            }
            key="schedules"
          >
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSchedule}
                style={styles.actionButton}
              >
                新增排班
              </Button>
            </div>
            <Table
              columns={scheduleColumns}
              dataSource={schedules}
              rowKey="id"
              pagination={false}
              style={{
                background: '#111827',
              }}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* 证书表单弹窗 */}
      <Modal
        title={editingCert ? '编辑证书' : '新增证书'}
        open={certModalVisible}
        onOk={handleCertSubmit}
        onCancel={() => setCertModalVisible(false)}
        width={600}
        okText="提交"
        cancelText="取消"
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        <Form form={certForm} layout="vertical">
          <Form.Item
            label="证书名称"
            name="name"
            rules={[{ required: true, message: '请输入证书名称' }]}
          >
            <Input placeholder="请输入证书名称" />
          </Form.Item>
          <Form.Item
            label="颁发机构"
            name="issuer"
            rules={[{ required: true, message: '请输入颁发机构' }]}
          >
            <Input placeholder="请输入颁发机构" />
          </Form.Item>
          <Form.Item
            label="证书编号"
            name="certificateNo"
            rules={[{ required: true, message: '请输入证书编号' }]}
          >
            <Input placeholder="请输入证书编号" />
          </Form.Item>
          <Form.Item
            label="颁发日期"
            name="issueDate"
            rules={[{ required: true, message: '请选择颁发日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择颁发日期" />
          </Form.Item>
          <Form.Item label="有效期至" name="expiryDate">
            <DatePicker style={{ width: '100%' }} placeholder="请选择有效期（不填表示长期有效）" />
          </Form.Item>
          <Form.Item label="证书文件">
            <FileUpload
              onChange={(fileList) => {
                if (fileList && fileList.length > 0) {
                  setCertFileUrl(fileList[0].url || fileList[0].response?.url);
                } else {
                  setCertFileUrl(undefined);
                }
              }}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 排班表单弹窗 */}
      <Modal
        title={editingSchedule ? '编辑排班' : '新增排班'}
        open={scheduleModalVisible}
        onOk={handleScheduleSubmit}
        onCancel={() => setScheduleModalVisible(false)}
        width={500}
        okText="提交"
        cancelText="取消"
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        <Form form={scheduleForm} layout="vertical">
          <Form.Item
            label="星期"
            name="dayOfWeek"
            rules={[{ required: true, message: '请选择星期' }]}
          >
            <Select placeholder="请选择星期">
              {Object.entries(weekDayMap).map(([key, value]) => (
                <Option key={key} value={Number(key)}>
                  {value}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="开始时间"
            name="startTime"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="请选择开始时间" />
          </Form.Item>
          <Form.Item
            label="结束时间"
            name="endTime"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="请选择结束时间" />
          </Form.Item>
          <Form.Item
            label="校区"
            name="campusId"
            rules={[{ required: true, message: '请选择校区' }]}
          >
            <Select placeholder="请选择校区">
              {/* TODO: 从接口获取校区列表 */}
              <Option value={1}>总部校区</Option>
              <Option value={2}>分部校区</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Component;
