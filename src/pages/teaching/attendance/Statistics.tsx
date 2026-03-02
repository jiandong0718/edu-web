import { useState, useEffect } from 'react';
import {
  Card,
  Select,
  DatePicker,
  Button,
  Space,
  Table,
  Row,
  Col,
  Statistic,
  Progress,
  message,
  Tabs,
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getAttendanceStats, exportAttendanceStats } from '@/api/attendance';
import type {
  AttendanceStatsParams,
  ClassAttendanceStats,
  StudentAttendanceStats,
} from '@/types/attendance';

const { RangePicker } = DatePicker;

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
    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 255, 0.05) 100%)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    height: '100%',
  },
  chartCard: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    height: 400,
  },
  barContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 280,
    marginTop: 20,
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: 60,
    background: 'linear-gradient(180deg, #00d4ff 0%, #0099ff 100%)',
    borderRadius: '8px 8px 0 0',
    position: 'relative' as const,
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  barValue: {
    position: 'absolute' as const,
    top: -30,
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#00d4ff',
    fontWeight: 700,
    fontSize: 16,
  },
  barLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
  },
  pieContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginTop: 20,
    gap: 40,
  },
  pieChart: {
    width: 200,
    height: 200,
    borderRadius: '50%',
    position: 'relative' as const,
    background: 'conic-gradient(from 0deg, #00ff88 0deg, #00ff88 var(--present-deg), #ff4d6a var(--present-deg), #ff4d6a var(--absent-deg), #ffaa00 var(--absent-deg), #ffaa00 var(--late-deg), #00d4ff var(--late-deg), #00d4ff 360deg)',
    boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
  },
  pieCenter: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: '#111827',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieLegend: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
  },
  legendValue: {
    color: '#00d4ff',
    fontWeight: 600,
    marginLeft: 'auto',
  },
};

function AttendanceStatisticsPage() {
  const [loading, setLoading] = useState(false);
  const [classStats, setClassStats] = useState<ClassAttendanceStats[]>([]);
  const [studentStats, setStudentStats] = useState<StudentAttendanceStats[]>([]);
  const [summary, setSummary] = useState({
    totalSchedules: 0,
    totalAttendances: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    leaveCount: 0,
    attendanceRate: 0,
  });
  const [queryParams, setQueryParams] = useState<AttendanceStatsParams>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAttendanceStats(queryParams);
      setClassStats(data.classStat);
      setStudentStats(data.studentStats);
      setSummary(data.summary);
    } catch (error) {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 班级统计表格列
  const classColumns: ColumnsType<ClassAttendanceStats> = [
    {
      title: '班级名称',
      dataIndex: 'className',
      key: 'className',
      render: (name: string) => (
        <span style={{ color: '#fff', fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: '学员人数',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '总课次',
      dataIndex: 'totalSchedules',
      key: 'totalSchedules',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{count}</span>
      ),
    },
    {
      title: '出勤',
      dataIndex: 'presentCount',
      key: 'presentCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#00ff88', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '缺勤',
      dataIndex: 'absentCount',
      key: 'absentCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#ff4d6a', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '迟到',
      dataIndex: 'lateCount',
      key: 'lateCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#ffaa00', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '请假',
      dataIndex: 'leaveCount',
      key: 'leaveCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 150,
      align: 'center',
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor={{
            '0%': '#00d4ff',
            '100%': '#0099ff',
          }}
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  // 学员统计表格列
  const studentColumns: ColumnsType<StudentAttendanceStats> = [
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string) => (
        <span style={{ color: '#fff', fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      render: (name: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{name}</span>
      ),
    },
    {
      title: '总课次',
      dataIndex: 'totalSchedules',
      key: 'totalSchedules',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{count}</span>
      ),
    },
    {
      title: '出勤',
      dataIndex: 'presentCount',
      key: 'presentCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#00ff88', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '缺勤',
      dataIndex: 'absentCount',
      key: 'absentCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#ff4d6a', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '迟到',
      dataIndex: 'lateCount',
      key: 'lateCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#ffaa00', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '请假',
      dataIndex: 'leaveCount',
      key: 'leaveCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>{count}</span>
      ),
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 150,
      align: 'center',
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor={{
            '0%': '#00d4ff',
            '100%': '#0099ff',
          }}
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  // 导出统计
  const handleExport = async () => {
    try {
      await exportAttendanceStats(queryParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 计算饼图角度
  const total = summary.presentCount + summary.absentCount + summary.lateCount + summary.leaveCount;
  const presentDeg = total > 0 ? (summary.presentCount / total) * 360 : 0;
  const absentDeg = total > 0 ? presentDeg + (summary.absentCount / total) * 360 : 0;
  const lateDeg = total > 0 ? absentDeg + (summary.lateCount / total) * 360 : 0;

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <BarChartOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          考勤统计
        </div>
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            style={styles.actionButton}
            onClick={handleExport}
          >
            导出报表
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 筛选条件 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <RangePicker
            value={[dayjs(queryParams.startDate), dayjs(queryParams.endDate)]}
            onChange={(dates) => {
              if (dates) {
                setQueryParams({
                  ...queryParams,
                  startDate: dates[0]?.format('YYYY-MM-DD') || '',
                  endDate: dates[1]?.format('YYYY-MM-DD') || '',
                });
              }
            }}
          />
          <Select
            placeholder="选择班级"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setQueryParams({ ...queryParams, classId: value })}
            options={[
              { value: 1, label: '少儿编程初级班' },
              { value: 2, label: '数学思维提升班' },
              { value: 3, label: '英语口语班' },
            ]}
          />
        </div>
      </Card>

      {/* 总体统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>总课次</span>}
              value={summary.totalSchedules}
              valueStyle={{ color: '#00d4ff', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>出勤</span>}
              value={summary.presentCount}
              valueStyle={{ color: '#00ff88', fontWeight: 700 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>缺勤</span>}
              value={summary.absentCount}
              valueStyle={{ color: '#ff4d6a', fontWeight: 700 }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>出勤率</span>}
              value={summary.attendanceRate}
              suffix="%"
              valueStyle={{ color: '#00d4ff', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表展示 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card
            title={<span style={{ color: '#fff' }}>考勤状态分布（柱状图）</span>}
            style={styles.card}
            bordered={false}
          >
            <div style={styles.barContainer}>
              <div style={styles.barItem}>
                <div
                  style={{
                    ...styles.bar,
                    height: total > 0 ? `${(summary.presentCount / total) * 250}px` : '0px',
                    background: 'linear-gradient(180deg, #00ff88 0%, #00cc66 100%)',
                  }}
                >
                  <div style={styles.barValue}>{summary.presentCount}</div>
                </div>
                <div style={styles.barLabel}>
                  <CheckCircleOutlined style={{ color: '#00ff88', marginRight: 4 }} />
                  出勤
                </div>
              </div>
              <div style={styles.barItem}>
                <div
                  style={{
                    ...styles.bar,
                    height: total > 0 ? `${(summary.absentCount / total) * 250}px` : '0px',
                    background: 'linear-gradient(180deg, #ff4d6a 0%, #ff1a47 100%)',
                  }}
                >
                  <div style={styles.barValue}>{summary.absentCount}</div>
                </div>
                <div style={styles.barLabel}>
                  <CloseCircleOutlined style={{ color: '#ff4d6a', marginRight: 4 }} />
                  缺勤
                </div>
              </div>
              <div style={styles.barItem}>
                <div
                  style={{
                    ...styles.bar,
                    height: total > 0 ? `${(summary.lateCount / total) * 250}px` : '0px',
                    background: 'linear-gradient(180deg, #ffaa00 0%, #ff8800 100%)',
                  }}
                >
                  <div style={styles.barValue}>{summary.lateCount}</div>
                </div>
                <div style={styles.barLabel}>
                  <ClockCircleOutlined style={{ color: '#ffaa00', marginRight: 4 }} />
                  迟到
                </div>
              </div>
              <div style={styles.barItem}>
                <div
                  style={{
                    ...styles.bar,
                    height: total > 0 ? `${(summary.leaveCount / total) * 250}px` : '0px',
                  }}
                >
                  <div style={styles.barValue}>{summary.leaveCount}</div>
                </div>
                <div style={styles.barLabel}>
                  <FileTextOutlined style={{ color: '#00d4ff', marginRight: 4 }} />
                  请假
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={<span style={{ color: '#fff' }}>考勤状态占比（饼图）</span>}
            style={styles.card}
            bordered={false}
          >
            <div style={styles.pieContainer}>
              <div
                style={{
                  ...styles.pieChart,
                  // @ts-ignore
                  '--present-deg': `${presentDeg}deg`,
                  '--absent-deg': `${absentDeg}deg`,
                  '--late-deg': `${lateDeg}deg`,
                }}
              >
                <div style={styles.pieCenter}>
                  <div style={{ color: '#00d4ff', fontSize: 24, fontWeight: 700 }}>
                    {summary.attendanceRate}%
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                    出勤率
                  </div>
                </div>
              </div>
              <div style={styles.pieLegend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendColor, background: '#00ff88' }} />
                  <span style={styles.legendText}>出勤</span>
                  <span style={styles.legendValue}>{summary.presentCount}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendColor, background: '#ff4d6a' }} />
                  <span style={styles.legendText}>缺勤</span>
                  <span style={styles.legendValue}>{summary.absentCount}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendColor, background: '#ffaa00' }} />
                  <span style={styles.legendText}>迟到</span>
                  <span style={styles.legendValue}>{summary.lateCount}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendColor, background: '#00d4ff' }} />
                  <span style={styles.legendText}>请假</span>
                  <span style={styles.legendValue}>{summary.leaveCount}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 详细统计表格 */}
      <Card style={styles.card} bordered={false}>
        <Tabs
          items={[
            {
              key: 'class',
              label: '按班级统计',
              children: (
                <Table
                  columns={classColumns}
                  dataSource={classStats}
                  rowKey="classId"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              ),
            },
            {
              key: 'student',
              label: '按学员统计',
              children: (
                <Table
                  columns={studentColumns}
                  dataSource={studentStats}
                  rowKey="studentId"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default AttendanceStatisticsPage;
