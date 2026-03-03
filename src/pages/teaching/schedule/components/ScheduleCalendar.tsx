import { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Space,
  Button,
  Calendar,
  Badge,
  Modal,
  Descriptions,
  Tag,
  Radio,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { Schedule } from '@/types/schedule';
import { getScheduleList } from '@/api/schedule';
import { getClassList } from '@/api/class';
import { getTeacherList } from '@/api/teacher';
import { getClassroomList } from '@/api/classroom';
import type { Class } from '@/types/class';
import type { Teacher } from '@/types/teacher';
import type { Classroom } from '@/types/classroom';

type ViewType = 'class' | 'teacher' | 'classroom';
type CalendarMode = 'month' | 'week';
type Option = { label: string; value: number };

// 样式定义
const styles = {
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 8,
    border: '1px solid rgba(0, 212, 255, 0.1)',
  },
  calendarCard: {
    background: 'rgba(0, 212, 255, 0.03)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 8,
  },
  scheduleItem: {
    padding: '4px 8px',
    marginBottom: 4,
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    transition: 'all 0.3s',
  },
  scheduleItemClass: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    color: '#00d4ff',
  },
  scheduleItemTeacher: {
    background: 'rgba(0, 255, 136, 0.1)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    color: '#00ff88',
  },
  scheduleItemClassroom: {
    background: 'rgba(255, 170, 0, 0.1)',
    border: '1px solid rgba(255, 170, 0, 0.3)',
    color: '#ffaa00',
  },
  weekView: {
    background: '#111827',
    borderRadius: 8,
    overflow: 'hidden',
  },
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: '80px repeat(7, 1fr)',
    background: 'rgba(0, 212, 255, 0.05)',
    borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
  },
  weekHeaderCell: {
    padding: 12,
    textAlign: 'center' as const,
    fontWeight: 600,
    color: '#00d4ff',
    borderRight: '1px solid rgba(0, 212, 255, 0.1)',
  },
  weekBody: {
    display: 'grid',
    gridTemplateColumns: '80px repeat(7, 1fr)',
  },
  timeSlot: {
    padding: 12,
    borderRight: '1px solid rgba(0, 212, 255, 0.05)',
    borderBottom: '1px solid rgba(0, 212, 255, 0.05)',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center' as const,
  },
  dayCell: {
    padding: 8,
    borderRight: '1px solid rgba(0, 212, 255, 0.05)',
    borderBottom: '1px solid rgba(0, 212, 255, 0.05)',
    minHeight: 80,
    position: 'relative' as const,
  },
};

// 状态配置
const statusConfig = {
  scheduled: { color: '#00d4ff', text: '已排课' },
  completed: { color: '#00ff88', text: '已完成' },
  cancelled: { color: '#ff4d6a', text: '已取消' },
  rescheduled: { color: '#ffaa00', text: '已调课' },
};

const normalizeScheduleList = (response: unknown): Schedule[] => {
  const raw = response as { list?: Schedule[]; data?: { list?: Schedule[] } } | undefined;
  if (Array.isArray(raw?.list)) {
    return raw.list;
  }
  if (raw?.data && Array.isArray(raw.data.list)) {
    return raw.data.list;
  }
  return [];
};

const normalizeClassList = (response: unknown): Class[] => {
  const raw = response as { list?: Class[]; data?: { list?: Class[] } } | undefined;
  if (Array.isArray(raw?.list)) {
    return raw.list;
  }
  if (raw?.data && Array.isArray(raw.data.list)) {
    return raw.data.list;
  }
  return [];
};

const normalizeTeacherList = (response: unknown): Teacher[] => {
  const raw = response as { list?: Teacher[]; data?: { list?: Teacher[] } } | undefined;
  if (Array.isArray(raw?.list)) {
    return raw.list;
  }
  if (raw?.data && Array.isArray(raw.data.list)) {
    return raw.data.list;
  }
  return [];
};

const normalizeClassroomList = (response: unknown): Classroom[] => {
  const raw = response as { list?: Classroom[]; data?: { list?: Classroom[] } } | undefined;
  if (Array.isArray(raw?.list)) {
    return raw.list;
  }
  if (raw?.data && Array.isArray(raw.data.list)) {
    return raw.data.list;
  }
  return [];
};

function ScheduleCalendar() {
  const [viewType, setViewType] = useState<ViewType>('class');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [classOptions, setClassOptions] = useState<Option[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<Option[]>([]);
  const [classroomOptions, setClassroomOptions] = useState<Option[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    void loadSchedules();
  }, [viewType, selectedId, selectedDate]);

  useEffect(() => {
    void loadOptions();
  }, []);

  const loadOptions = async () => {
    setOptionsLoading(true);
    try {
      const [classesResponse, teachersResponse, classroomsResponse] = await Promise.all([
        getClassList({ page: 1, pageSize: 500 }),
        getTeacherList({ page: 1, pageSize: 500 }),
        getClassroomList({ page: 1, pageSize: 500 }),
      ]);

      const classes = normalizeClassList(classesResponse);
      const teachers = normalizeTeacherList(teachersResponse);
      const classrooms = normalizeClassroomList(classroomsResponse);

      setClassOptions(classes.map((item) => ({ label: item.name, value: item.id })));
      setTeacherOptions(teachers.map((item) => ({ label: item.name, value: item.id })));
      setClassroomOptions(classrooms.map((item) => ({ label: item.name, value: item.id })));
    } catch {
      setClassOptions([]);
      setTeacherOptions([]);
      setClassroomOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        pageNum: 1,
        pageSize: 500,
        startDate: selectedDate.startOf('month').format('YYYY-MM-DD'),
        endDate: selectedDate.endOf('month').format('YYYY-MM-DD'),
      };

      if (viewType === 'class' && selectedId) {
        params.classId = selectedId;
      } else if (viewType === 'teacher' && selectedId) {
        params.teacherId = selectedId;
      } else if (viewType === 'classroom' && selectedId) {
        params.classroomId = selectedId;
      }

      const response = await getScheduleList(params);
      setSchedules(normalizeScheduleList(response));
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取选择器选项
  const getSelectOptions = () => {
    if (viewType === 'class') return classOptions;
    if (viewType === 'teacher') return teacherOptions;
    return classroomOptions;
  };

  // 获取选择器占位符
  const getSelectPlaceholder = () => {
    if (viewType === 'class') return '请选择班级';
    if (viewType === 'teacher') return '请选择教师';
    return '请选择教室';
  };

  // 获取日期的课程列表
  const getDateSchedules = (date: Dayjs) => {
    return schedules.filter((schedule) =>
      dayjs(schedule.startTime).isSame(date, 'day')
    );
  };

  // 渲染日历单元格内容
  const dateCellRender = (date: Dayjs) => {
    const dateSchedules = getDateSchedules(date);
    if (dateSchedules.length === 0) return null;

    return (
      <div style={{ padding: 4 }}>
        {dateSchedules.map((schedule) => (
          <div
            key={schedule.id}
            style={{
              ...styles.scheduleItem,
              ...(viewType === 'class'
                ? styles.scheduleItemClass
                : viewType === 'teacher'
                ? styles.scheduleItemTeacher
                : styles.scheduleItemClassroom),
            }}
            onClick={() => handleScheduleClick(schedule)}
          >
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {dayjs(schedule.startTime).format('HH:mm')} - {dayjs(schedule.endTime).format('HH:mm')}
            </div>
            <div style={{ opacity: 0.8 }}>
              {viewType === 'class' && schedule.courseName}
              {viewType === 'teacher' && schedule.className}
              {viewType === 'classroom' && schedule.className}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const weekStart = selectedDate.startOf('week');
    const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);

    return (
      <div style={styles.weekView}>
        <div style={styles.weekHeader}>
          <div style={styles.weekHeaderCell}>时间</div>
          {weekDays.map((day) => (
            <div key={day.format('YYYY-MM-DD')} style={styles.weekHeaderCell}>
              <div>{day.format('MM-DD')}</div>
              <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4 }}>
                周{['日', '一', '二', '三', '四', '五', '六'][day.day()]}
              </div>
            </div>
          ))}
        </div>
        <div style={styles.weekBody}>
          {timeSlots.map((time) => (
            <div key={`row-${time}`} style={{ display: 'contents' }}>
              <div key={`time-${time}`} style={styles.timeSlot}>
                {time}
              </div>
              {weekDays.map((day) => {
                const daySchedules = getDateSchedules(day).filter((schedule) => {
                  const hour = dayjs(schedule.startTime).hour();
                  const slotHour = parseInt(time.split(':')[0]);
                  return hour === slotHour;
                });

                return (
                  <div key={`${day.format('YYYY-MM-DD')}-${time}`} style={styles.dayCell}>
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        style={{
                          ...styles.scheduleItem,
                          ...(viewType === 'class'
                            ? styles.scheduleItemClass
                            : viewType === 'teacher'
                            ? styles.scheduleItemTeacher
                            : styles.scheduleItemClassroom),
                          marginBottom: 4,
                        }}
                        onClick={() => handleScheduleClick(schedule)}
                      >
                        <div style={{ fontWeight: 500 }}>
                          {dayjs(schedule.startTime).format('HH:mm')} -{' '}
                          {dayjs(schedule.endTime).format('HH:mm')}
                        </div>
                        <div style={{ marginTop: 2 }}>
                          {viewType === 'class' && schedule.courseName}
                          {viewType === 'teacher' && schedule.className}
                          {viewType === 'classroom' && schedule.className}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 点击课程详情
  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDetailModalVisible(true);
  };

  // 切换月份
  const handleMonthChange = (offset: number) => {
    setSelectedDate(selectedDate.add(offset, 'month'));
  };

  // 切换周
  const handleWeekChange = (offset: number) => {
    setSelectedDate(selectedDate.add(offset, 'week'));
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={styles.filterBar}>
        <Space size="large">
          <Radio.Group
            value={viewType}
            onChange={(e) => {
              setViewType(e.target.value);
              setSelectedId(undefined);
            }}
            buttonStyle="solid"
          >
            <Radio.Button value="class">
              <TeamOutlined /> 按班级
            </Radio.Button>
            <Radio.Button value="teacher">
              <UserOutlined /> 按教师
            </Radio.Button>
            <Radio.Button value="classroom">
              <HomeOutlined /> 按教室
            </Radio.Button>
          </Radio.Group>

          <Select
            style={{ width: 200 }}
            placeholder={getSelectPlaceholder()}
            options={getSelectOptions()}
            value={selectedId}
            onChange={setSelectedId}
            loading={optionsLoading}
            showSearch
            optionFilterProp="label"
            allowClear
          />

          <Radio.Group
            value={calendarMode}
            onChange={(e) => setCalendarMode(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="month">月视图</Radio.Button>
            <Radio.Button value="week">周视图</Radio.Button>
          </Radio.Group>
        </Space>

        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={() =>
              calendarMode === 'month' ? handleMonthChange(-1) : handleWeekChange(-1)
            }
          />
          <Button onClick={() => setSelectedDate(dayjs())}>今天</Button>
          <Button
            icon={<RightOutlined />}
            onClick={() =>
              calendarMode === 'month' ? handleMonthChange(1) : handleWeekChange(1)
            }
          />
          <span style={{ color: '#00d4ff', fontWeight: 600, fontSize: 16 }}>
            {calendarMode === 'month'
              ? selectedDate.format('YYYY年MM月')
              : `${selectedDate.startOf('week').format('MM-DD')} ~ ${selectedDate
                  .endOf('week')
                  .format('MM-DD')}`}
          </span>
        </Space>
      </div>

      <Card style={styles.calendarCard} bordered={false} loading={loading}>
        {!selectedId ? (
          <Empty
            description={`请先选择${
              viewType === 'class' ? '班级' : viewType === 'teacher' ? '教师' : '教室'
            }`}
            style={{ padding: '60px 0' }}
          />
        ) : calendarMode === 'month' ? (
          <Calendar
            value={selectedDate}
            onSelect={setSelectedDate}
            cellRender={dateCellRender}
            headerRender={() => null}
          />
        ) : (
          renderWeekView()
        )}
      </Card>

      <Modal
        title="课程详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedSchedule && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="班级" span={2}>
              <Tag
                style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  color: '#00d4ff',
                }}
              >
                {selectedSchedule.className}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="课程" span={2}>
              {selectedSchedule.courseName}
            </Descriptions.Item>
            <Descriptions.Item label="教师">
              <Space>
                <UserOutlined style={{ color: '#00d4ff' }} />
                {selectedSchedule.teacherName}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="教室">
              <Space>
                <HomeOutlined style={{ color: '#00d4ff' }} />
                {selectedSchedule.classroomName || '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="上课时间" span={2}>
              <Space>
                <ClockCircleOutlined style={{ color: '#00d4ff' }} />
                {dayjs(selectedSchedule.startTime).format('YYYY-MM-DD HH:mm')} -{' '}
                {dayjs(selectedSchedule.endTime).format('HH:mm')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <Tag
                style={{
                  background: `${statusConfig[selectedSchedule.status].color}20`,
                  border: `1px solid ${statusConfig[selectedSchedule.status].color}40`,
                  color: statusConfig[selectedSchedule.status].color,
                }}
              >
                {statusConfig[selectedSchedule.status].text}
              </Tag>
            </Descriptions.Item>
            {selectedSchedule.actualTeacherName && (
              <Descriptions.Item label="代课教师" span={2}>
                <Tag color="orange">{selectedSchedule.actualTeacherName}</Tag>
              </Descriptions.Item>
            )}
            {selectedSchedule.cancelReason && (
              <Descriptions.Item label="取消原因" span={2}>
                {selectedSchedule.cancelReason}
              </Descriptions.Item>
            )}
            {selectedSchedule.remark && (
              <Descriptions.Item label="备注" span={2}>
                {selectedSchedule.remark}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default ScheduleCalendar;
