import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  message,
  Select,
  DatePicker,
  Table,
  Progress,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getTeachingOverview,
  getAttendanceRateTrend,
  getClassStats,
  getTeacherStats,
  getCourseConsumption,
  getClassStatusDistribution,
} from '@/api/dashboard';
import type {
  TeachingOverview,
  AttendanceRateItem,
  ClassStatsItem,
  TeacherStatsItem,
  CourseConsumptionItem,
  ClassStatusDistribution,
} from '@/types/dashboard';

const { RangePicker } = DatePicker;

// 统计卡片样式
const cardStyle = {
  background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 212, 255, 0.2)',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

const statisticStyle = {
  color: '#fff',
};

const valueStyle = {
  color: '#00d4ff',
  fontSize: 28,
  fontWeight: 700,
};

// 折线图组件
const LineChart = ({ data, height = 200 }: { data: AttendanceRateItem[]; height?: number }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.45)' }}>
        暂无数据
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.rate));
  const min = Math.min(...data.map(d => d.rate));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.rate - min) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ position: 'relative', height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0099ff" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 212, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 212, 255, 0.05)" />
          </linearGradient>
        </defs>
        <polyline
          points={`0,100 ${points} 100,100`}
          fill="url(#areaGradient)"
          stroke="none"
        />
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div style={{
        position: 'absolute',
        bottom: -20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.45)',
      }}>
        {data.map((d, i) => (
          i % Math.ceil(data.length / 5) === 0 && (
            <span key={i}>{d.date.substring(5)}</span>
          )
        ))}
      </div>
    </div>
  );
};

// 饼图组件
const PieChart = ({ data }: { data: ClassStatusDistribution[] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'rgba(255, 255, 255, 0.45)' }}>
        暂无数据
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  let currentAngle = -90;

  const colors = ['#00d4ff', '#0099ff', '#00ffaa', '#ff6b9d', '#ffd700'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map((d, i) => {
          const percentage = d.count / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 60 + 50 * Math.cos(startRad);
          const y1 = 60 + 50 * Math.sin(startRad);
          const x2 = 60 + 50 * Math.cos(endRad);
          const y2 = 60 + 50 * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[i % colors.length]}
              opacity={0.8}
            />
          );
        })}
        <circle cx="60" cy="60" r="25" fill="rgba(17, 24, 39, 0.95)" />
      </svg>
      <div style={{ flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: colors[i % colors.length],
                marginRight: 8,
              }}
            />
            <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12, flex: 1 }}>
              {d.statusName}
            </span>
            <span style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600 }}>
              {d.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 柱状图组件
const BarChart = ({ data, height = 200 }: { data: CourseConsumptionItem[]; height?: number }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.45)' }}>
        暂无数据
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.consumptionRate));

  return (
    <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 8px' }}>
      {data.map((d, i) => {
        const barHeight = (d.consumptionRate / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: '#00d4ff', marginBottom: 4, height: 16 }}>
              {d.consumptionRate.toFixed(1)}%
            </div>
            <div
              style={{
                width: '100%',
                height: `${barHeight}%`,
                background: 'linear-gradient(180deg, #00d4ff 0%, #0099ff 100%)',
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.3s ease',
              }}
            />
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.45)', marginTop: 4, textAlign: 'center', wordBreak: 'break-all' }}>
              {d.courseName.length > 6 ? d.courseName.substring(0, 6) + '...' : d.courseName}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TeachingDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [campusId, setCampusId] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'day'),
    dayjs(),
  ]);

  const [overview, setOverview] = useState<TeachingOverview | null>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceRateItem[]>([]);
  const [classStats, setClassStats] = useState<ClassStatsItem[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStatsItem[]>([]);
  const [courseConsumption, setCourseConsumption] = useState<CourseConsumptionItem[]>([]);
  const [classDistribution, setClassDistribution] = useState<ClassStatusDistribution[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [campusId]);

  useEffect(() => {
    fetchAttendanceTrend();
  }, [campusId, dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchAttendanceTrend(),
        fetchClassStats(),
        fetchTeacherStats(),
        fetchCourseConsumption(),
        fetchClassDistribution(),
      ]);
    } catch (error) {
      message.error('获取教学数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const result = await getTeachingOverview(campusId);
      setOverview(result.data);
    } catch (error) {
      console.error('获取教学概览失败:', error);
    }
  };

  const fetchAttendanceTrend = async () => {
    try {
      const result = await getAttendanceRateTrend({
        campusId,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      });
      setAttendanceTrend(result.data || []);
    } catch (error) {
      console.error('获取考勤率趋势失败:', error);
    }
  };

  const fetchClassStats = async () => {
    try {
      const result = await getClassStats({ campusId });
      setClassStats(result.data || []);
    } catch (error) {
      console.error('获取班级统计失败:', error);
    }
  };

  const fetchTeacherStats = async () => {
    try {
      const result = await getTeacherStats(campusId);
      setTeacherStats(result.data || []);
    } catch (error) {
      console.error('获取教师统计失败:', error);
    }
  };

  const fetchCourseConsumption = async () => {
    try {
      const result = await getCourseConsumption({ campusId, limit: 10 });
      setCourseConsumption(result.data || []);
    } catch (error) {
      console.error('获取课程消耗失败:', error);
    }
  };

  const fetchClassDistribution = async () => {
    try {
      const result = await getClassStatusDistribution(campusId);
      setClassDistribution(result.data || []);
    } catch (error) {
      console.error('获取班级状态分布失败:', error);
    }
  };

  // 班级统计表格列
  const classColumns: ColumnsType<ClassStatsItem> = [
    {
      title: '班级名称',
      dataIndex: 'className',
      key: 'className',
      width: 150,
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 80,
      render: (text: string, record: ClassStatsItem) => {
        const colorMap: Record<string, string> = {
          pending: '#ffd700',
          ongoing: '#00d4ff',
          completed: '#00ffaa',
          suspended: '#ff6b9d',
        };
        return (
          <span style={{ color: colorMap[record.status] || '#fff' }}>
            {text}
          </span>
        );
      },
    },
    {
      title: '学员数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 100,
      render: (count: number, record: ClassStatsItem) => (
        <span>
          {count}/{record.capacity}
        </span>
      ),
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 120,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor="#00d4ff"
          trailColor="rgba(255, 255, 255, 0.1)"
        />
      ),
    },
    {
      title: '课节进度',
      key: 'progress',
      width: 100,
      render: (_, record: ClassStatsItem) => (
        <span>
          {record.completedLessons}/{record.totalLessons}
        </span>
      ),
    },
  ];

  // 教师统计表格列
  const teacherColumns: ColumnsType<TeacherStatsItem> = [
    {
      title: '教师姓名',
      dataIndex: 'teacherName',
      key: 'teacherName',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'teacherTypeName',
      key: 'teacherTypeName',
      width: 80,
      render: (text: string, record: TeacherStatsItem) => {
        const color = record.teacherType === 'full_time' ? '#00d4ff' : '#ffd700';
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: '负责班级',
      dataIndex: 'classCount',
      key: 'classCount',
      width: 100,
    },
    {
      title: '本周课节',
      dataIndex: 'weekScheduleCount',
      key: 'weekScheduleCount',
      width: 100,
    },
    {
      title: '本月课节',
      dataIndex: 'monthScheduleCount',
      key: 'monthScheduleCount',
      width: 100,
    },
    {
      title: '学员数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 100,
    },
    {
      title: '平均出勤率',
      dataIndex: 'averageAttendanceRate',
      key: 'averageAttendanceRate',
      width: 120,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor="#00d4ff"
          trailColor="rgba(255, 255, 255, 0.1)"
        />
      ),
    },
  ];

  if (loading && !overview) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 筛选器 */}
      <Card style={{ ...cardStyle, marginBottom: 16 }} bordered={false}>
        <Row gutter={16}>
          <Col>
            <span style={{ color: 'rgba(255, 255, 255, 0.85)', marginRight: 8 }}>校区筛选：</span>
            <Select
              style={{ width: 200 }}
              placeholder="全部校区"
              allowClear
              value={campusId}
              onChange={setCampusId}
              options={[
                { label: '全部校区', value: undefined },
                // TODO: 从接口获取校区列表
              ]}
            />
          </Col>
          <Col>
            <span style={{ color: 'rgba(255, 255, 255, 0.85)', marginRight: 8 }}>时间范围：</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="YYYY-MM-DD"
            />
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>在读学员数</span>}
              value={overview?.activeStudentCount || 0}
              valueStyle={valueStyle}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>试听</div>
                <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                  {overview?.trialStudentCount || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>潜在</div>
                <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                  {overview?.potentialStudentCount || 0}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>进行中班级数</span>}
              value={overview?.ongoingClassCount || 0}
              valueStyle={valueStyle}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>总班级</div>
                <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                  {overview?.totalClassCount || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>已满员</div>
                <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                  {overview?.fullClassCount || 0}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>在职教师数</span>}
              value={overview?.totalTeacherCount || 0}
              valueStyle={valueStyle}
              prefix={<BookOutlined />}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>全职</div>
                <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                  {overview?.fullTimeTeacherCount || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>兼职</div>
                <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                  {overview?.partTimeTeacherCount || 0}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>平均出勤率</span>}
              value={overview?.averageAttendanceRate || 0}
              valueStyle={valueStyle}
              prefix={<TrophyOutlined />}
              suffix="%"
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>完课率</div>
                <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                  {overview?.averageCompletionRate || 0}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>续费率</div>
                <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                  {overview?.renewalRate || 0}%
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* 考勤率趋势图 */}
        <Col xs={24} lg={12}>
          <Card
            style={cardStyle}
            bordered={false}
            title={
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                <RiseOutlined style={{ marginRight: 8, color: '#00d4ff' }} />
                考勤率趋势
              </span>
            }
          >
            <LineChart data={attendanceTrend} height={250} />
          </Card>
        </Col>

        {/* 班级状态饼图 */}
        <Col xs={24} lg={12}>
          <Card
            style={cardStyle}
            bordered={false}
            title={
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ marginRight: 8, color: '#00d4ff' }} />
                班级状态分布
              </span>
            }
          >
            <div style={{ padding: '20px 0' }}>
              <PieChart data={classDistribution} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 课程消耗柱状图 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card
            style={cardStyle}
            bordered={false}
            title={
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                <BookOutlined style={{ marginRight: 8, color: '#00d4ff' }} />
                课程消耗统计（TOP 10）
              </span>
            }
          >
            <BarChart data={courseConsumption} height={250} />
          </Card>
        </Col>
      </Row>

      {/* 班级统计表格 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card
            style={cardStyle}
            bordered={false}
            title={
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ marginRight: 8, color: '#00d4ff' }} />
                班级统计
              </span>
            }
          >
            <Table
              columns={classColumns}
              dataSource={classStats}
              rowKey="classId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
              style={{
                '--table-bg': 'transparent',
                '--table-header-bg': 'rgba(0, 212, 255, 0.1)',
              } as React.CSSProperties}
            />
          </Card>
        </Col>
      </Row>

      {/* 教师工作量统计表格 */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            style={cardStyle}
            bordered={false}
            title={
              <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                <TrophyOutlined style={{ marginRight: 8, color: '#00d4ff' }} />
                教师工作量统计
              </span>
            }
          >
            <Table
              columns={teacherColumns}
              dataSource={teacherStats}
              rowKey="teacherId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
              style={{
                '--table-bg': 'transparent',
                '--table-header-bg': 'rgba(0, 212, 255, 0.1)',
              } as React.CSSProperties}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeachingDashboard;
