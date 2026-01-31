import { useState, useEffect } from 'react';
import {
  Form,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Button,
  Space,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Alert,
  Divider,
  Input,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type {
  BatchScheduleRequest,
  TimeSlot,
  SchedulePreviewItem,
} from '@/types/schedule';
import { batchScheduleEnhanced } from '@/api/schedule';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface BatchScheduleFormProps {
  onSuccess?: () => void;
}

// 样式定义
const styles = {
  formCard: {
    background: 'rgba(0, 212, 255, 0.03)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  previewCard: {
    background: 'rgba(0, 255, 136, 0.03)',
    border: '1px solid rgba(0, 255, 136, 0.1)',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#00d4ff',
    marginBottom: 16,
  },
  timeSlotCard: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
};

function BatchScheduleForm({ onSuccess }: BatchScheduleFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { startTime: '09:00', endTime: '10:30' },
  ]);
  const [previewData, setPreviewData] = useState<SchedulePreviewItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // 模拟数据
  const mockClasses = [
    { label: '少儿编程初级班', value: 1 },
    { label: '数学思维提升班', value: 2 },
    { label: '英语口语班', value: 3 },
  ];

  const mockCourses = [
    { label: 'Scratch编程基础', value: 1 },
    { label: '数学思维训练', value: 2 },
    { label: '英语口语交流', value: 3 },
  ];

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

  const repeatTypeOptions = [
    { label: '不重复', value: 'none' },
    { label: '每天', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' },
  ];

  const weekDayOptions = [
    { label: '周一', value: 1 },
    { label: '周二', value: 2 },
    { label: '周三', value: 3 },
    { label: '周四', value: 4 },
    { label: '周五', value: 5 },
    { label: '周六', value: 6 },
    { label: '周日', value: 7 },
  ];

  // 添加时间段
  const handleAddTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '09:00', endTime: '10:30' }]);
  };

  // 删除时间段
  const handleRemoveTimeSlot = (index: number) => {
    if (timeSlots.length === 1) {
      message.warning('至少保留一个时间段');
      return;
    }
    const newSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newSlots);
  };

  // 更新时间段
  const handleTimeSlotChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: Dayjs | null
  ) => {
    if (!value) return;
    const newSlots = [...timeSlots];
    newSlots[index][field] = value.format('HH:mm');
    setTimeSlots(newSlots);
  };

  // 生成预览数据
  const generatePreview = () => {
    const values = form.getFieldsValue();
    if (!values.startDate || !values.repeatType) {
      message.warning('请先填写开始日期和重复规则');
      return;
    }

    const preview: SchedulePreviewItem[] = [];
    const startDate = dayjs(values.startDate);
    const endDate = values.endDate ? dayjs(values.endDate) : null;
    const totalSessions = values.totalSessions || 10;
    const repeatType = values.repeatType;
    const repeatValue = values.repeatValue || [];
    const skipWeekends = values.skipWeekends || false;
    const skipHolidays = values.skipHolidays || false;

    let currentDate = startDate;
    let sessionCount = 0;
    const maxIterations = 365; // 防止无限循环
    let iterations = 0;

    while (
      sessionCount < totalSessions &&
      iterations < maxIterations &&
      (!endDate || currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day'))
    ) {
      iterations++;

      // 跳过周末
      if (skipWeekends && (currentDate.day() === 0 || currentDate.day() === 6)) {
        currentDate = currentDate.add(1, 'day');
        continue;
      }

      // 检查重复规则
      let shouldInclude = false;
      if (repeatType === 'none') {
        shouldInclude = currentDate.isSame(startDate, 'day');
      } else if (repeatType === 'daily') {
        shouldInclude = true;
      } else if (repeatType === 'weekly') {
        const dayOfWeek = currentDate.day() === 0 ? 7 : currentDate.day();
        shouldInclude = repeatValue.includes(dayOfWeek);
      } else if (repeatType === 'monthly') {
        shouldInclude = repeatValue.includes(currentDate.date());
      }

      if (shouldInclude) {
        timeSlots.forEach((slot) => {
          preview.push({
            date: currentDate.format('YYYY-MM-DD'),
            startTime: slot.startTime,
            endTime: slot.endTime,
            dayOfWeek: ['日', '一', '二', '三', '四', '五', '六'][currentDate.day()],
          });
        });
        sessionCount++;
      }

      if (repeatType === 'none') break;
      currentDate = currentDate.add(1, 'day');
    }

    setPreviewData(preview);
    setShowPreview(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const requestData: BatchScheduleRequest = {
        classId: values.classId,
        courseId: values.courseId,
        teacherId: values.teacherId,
        classroomId: values.classroomId,
        startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
        endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : undefined,
        totalSessions: values.totalSessions,
        repeatType: values.repeatType,
        repeatValue: values.repeatValue,
        timeSlots: timeSlots,
        skipHolidays: values.skipHolidays || false,
        skipWeekends: values.skipWeekends || false,
        remark: values.remark,
      };

      await batchScheduleEnhanced(requestData);
      message.success('批量排课成功');
      form.resetFields();
      setTimeSlots([{ startTime: '09:00', endTime: '10:30' }]);
      setPreviewData([]);
      setShowPreview(false);
      onSuccess?.();
    } catch (error) {
      console.error('批量排课失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 预览表格列
  const previewColumns: ColumnsType<SchedulePreviewItem> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string, record) => (
        <Space>
          <Tag
            color="cyan"
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
            }}
          >
            周{record.dayOfWeek}
          </Tag>
          <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{date}</span>
        </Space>
      ),
    },
    {
      title: '上课时间',
      key: 'time',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#00d4ff' }} />
          <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            {record.startTime} - {record.endTime}
          </span>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 0' }}>
      <Card style={styles.formCard} bordered={false}>
        <div style={styles.sectionTitle}>基本信息</div>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="选择班级"
                name="classId"
                rules={[{ required: true, message: '请选择班级' }]}
              >
                <Select
                  placeholder="请选择班级"
                  options={mockClasses}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="选择课程"
                name="courseId"
                rules={[{ required: true, message: '请选择课程' }]}
              >
                <Select
                  placeholder="请选择课程"
                  options={mockCourses}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="选择教师"
                name="teacherId"
                rules={[{ required: true, message: '请选择教师' }]}
              >
                <Select
                  placeholder="请选择教师"
                  options={mockTeachers}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="选择教室" name="classroomId">
                <Select
                  placeholder="请选择教室（可选）"
                  options={mockClassrooms}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }} />

          <div style={styles.sectionTitle}>时间设置</div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="开始日期"
                name="startDate"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="结束日期" name="endDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="重复规则"
                name="repeatType"
                rules={[{ required: true, message: '请选择重复规则' }]}
                initialValue="weekly"
              >
                <Select options={repeatTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.repeatType !== currentValues.repeatType
                }
              >
                {({ getFieldValue }) => {
                  const repeatType = getFieldValue('repeatType');
                  if (repeatType === 'weekly') {
                    return (
                      <Form.Item
                        label="选择星期"
                        name="repeatValue"
                        rules={[{ required: true, message: '请选择星期' }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="请选择星期"
                          options={weekDayOptions}
                        />
                      </Form.Item>
                    );
                  }
                  if (repeatType === 'monthly') {
                    return (
                      <Form.Item
                        label="选择日期"
                        name="repeatValue"
                        rules={[{ required: true, message: '请选择日期' }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="请选择日期"
                          options={Array.from({ length: 31 }, (_, i) => ({
                            label: `${i + 1}日`,
                            value: i + 1,
                          }))}
                        />
                      </Form.Item>
                    );
                  }
                  return null;
                }}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="总课次" name="totalSessions" initialValue={10}>
            <InputNumber
              min={1}
              max={365}
              style={{ width: '100%' }}
              placeholder="不填写则根据结束日期计算"
            />
          </Form.Item>

          <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }} />

          <div style={styles.sectionTitle}>上课时间段</div>

          {timeSlots.map((slot, index) => (
            <div key={index} style={styles.timeSlotCard}>
              <Row gutter={16} align="middle">
                <Col span={10}>
                  <TimePicker
                    value={dayjs(slot.startTime, 'HH:mm')}
                    format="HH:mm"
                    style={{ width: '100%' }}
                    onChange={(value) => handleTimeSlotChange(index, 'startTime', value)}
                  />
                </Col>
                <Col span={2} style={{ textAlign: 'center', color: '#00d4ff' }}>
                  至
                </Col>
                <Col span={10}>
                  <TimePicker
                    value={dayjs(slot.endTime, 'HH:mm')}
                    format="HH:mm"
                    style={{ width: '100%' }}
                    onChange={(value) => handleTimeSlotChange(index, 'endTime', value)}
                  />
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveTimeSlot(index)}
                    disabled={timeSlots.length === 1}
                  />
                </Col>
              </Row>
            </div>
          ))}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddTimeSlot}
            style={{
              width: '100%',
              marginTop: 8,
              borderColor: 'rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
            }}
          >
            添加时间段
          </Button>

          <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }} />

          <div style={styles.sectionTitle}>其他选项</div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="跳过节假日"
                name="skipHolidays"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="跳过周末"
                name="skipWeekends"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>

        <Space style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
          <Button
            type="primary"
            size="large"
            onClick={generatePreview}
            style={{
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid rgba(0, 212, 255, 0.5)',
              color: '#00d4ff',
            }}
          >
            生成预览
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleSubmit}
            loading={loading}
            disabled={!showPreview || previewData.length === 0}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
            }}
          >
            确认排课
          </Button>
        </Space>
      </Card>

      {showPreview && previewData.length > 0 && (
        <Card style={styles.previewCard} bordered={false}>
          <Alert
            message={`共生成 ${previewData.length} 节课程`}
            type="success"
            showIcon
            style={{
              marginBottom: 16,
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
            }}
          />
          <Table
            columns={previewColumns}
            dataSource={previewData}
            rowKey={(record, index) => `${record.date}-${record.startTime}-${index}`}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 节课`,
            }}
            scroll={{ y: 400 }}
          />
        </Card>
      )}
    </div>
  );
}

export default BatchScheduleForm;
