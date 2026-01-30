import { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Progress, Table, Tag, Space, Button, Tooltip } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  DollarOutlined,
  ReadOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  FireOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

// 动画数字组件
const AnimatedNumber: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({
  value,
  duration = 1500,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

// 迷你图表组件
const MiniChart: React.FC<{ data: number[]; color: string; height?: number }> = ({
  data,
  color,
  height = 40,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    ctx.clearRect(0, 0, width, h);

    // 绘制渐变区域
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.moveTo(0, h);

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = h - ((value - min) / range) * h * 0.8 - h * 0.1;
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(width, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制线条
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = h - ((value - min) / range) * h * 0.8 - h * 0.1;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制最后一个点
    const lastX = width;
    const lastY = h - ((data[data.length - 1] - min) / range) * h * 0.8 - h * 0.1;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
    ctx.strokeStyle = color + '60';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [data, color]);

  return <canvas ref={canvasRef} width={120} height={height} style={{ display: 'block' }} />;
};

// 环形进度图组件
const RingProgress: React.FC<{ percent: number; color: string; size?: number }> = ({
  percent,
  color,
  size = 120,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1500, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setAnimatedPercent(easeOutQuart * percent);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [percent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    const lineWidth = 8;

    ctx.clearRect(0, 0, size, size);

    // 背景圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // 进度圆环
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + 'aa');

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + (animatedPercent / 100) * Math.PI * 2
    );
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 发光效果
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + (animatedPercent / 100) * Math.PI * 2
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [animatedPercent, color, size]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <canvas ref={canvasRef} width={size} height={size} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
          {Math.round(animatedPercent)}%
        </div>
      </div>
    </div>
  );
};

// 样式定义
const styles = {
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statCard: {
    background: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
    position: 'relative' as const,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  statCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 212, 255, 0.1)',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  decorLine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: '12px 12px 0 0',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

// 统计卡片数据
const statCards = [
  {
    key: 'students',
    icon: <TeamOutlined />,
    label: '在读学生',
    value: 1128,
    trend: 12.5,
    trendUp: true,
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 153, 255, 0.1) 100%)',
    chartData: [65, 72, 68, 85, 78, 92, 88],
  },
  {
    key: 'newStudents',
    icon: <UserAddOutlined />,
    label: '本月新增',
    value: 93,
    trend: 8.2,
    trendUp: true,
    color: '#00ff88',
    gradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.1) 100%)',
    chartData: [45, 52, 48, 65, 58, 72, 93],
  },
  {
    key: 'revenue',
    icon: <DollarOutlined />,
    label: '本月收入',
    value: 112893,
    trend: 15.3,
    trendUp: true,
    color: '#ffaa00',
    gradient: 'linear-gradient(135deg, rgba(255, 170, 0, 0.2) 0%, rgba(255, 136, 0, 0.1) 100%)',
    chartData: [8500, 9200, 8800, 10500, 9800, 11200, 11289],
    prefix: '¥',
  },
  {
    key: 'courses',
    icon: <ReadOutlined />,
    label: '今日课程',
    value: 28,
    trend: 5.1,
    trendUp: false,
    color: '#ff6b6b',
    gradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 77, 106, 0.1) 100%)',
    chartData: [32, 28, 35, 30, 26, 33, 28],
  },
];

// 待办事项数据
const todoItems = [
  { id: 1, title: '审核新学员报名申请', count: 5, priority: 'high' },
  { id: 2, title: '处理退费申请', count: 2, priority: 'high' },
  { id: 3, title: '确认明日课程安排', count: 8, priority: 'medium' },
  { id: 4, title: '跟进意向学员', count: 12, priority: 'low' },
];

// 快捷操作
const quickActions = [
  { icon: <UserAddOutlined />, label: '新增学生', color: '#00d4ff' },
  { icon: <CalendarOutlined />, label: '排课管理', color: '#00ff88' },
  { icon: <DollarOutlined />, label: '收费登记', color: '#ffaa00' },
  { icon: <TeamOutlined />, label: '考勤管理', color: '#ff6b6b' },
];

// 课程排行数据
const courseRankData = [
  { rank: 1, name: '少儿编程入门班', students: 45, rate: 98 },
  { rank: 2, name: '数学思维训练班', students: 38, rate: 95 },
  { rank: 3, name: '英语口语强化班', students: 35, rate: 92 },
  { rank: 4, name: '美术创意班', students: 32, rate: 90 },
  { rank: 5, name: '钢琴基础班', students: 28, rate: 88 },
];

// 最近动态数据
const recentActivities = [
  { time: '10:30', content: '张三 完成了 少儿编程入门班 的报名', type: 'success' },
  { time: '10:15', content: '李四 提交了退费申请，待审核', type: 'warning' },
  { time: '09:45', content: '王五 的试听课程已安排', type: 'info' },
  { time: '09:30', content: '赵六 完成了本月课时消耗', type: 'success' },
  { time: '09:00', content: '系统自动生成了本周排课表', type: 'info' },
];

export function Component() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div>
      <div style={styles.pageTitle}>
        <ThunderboltOutlined style={{ color: '#00d4ff' }} />
        数据看板
      </div>

      {/* 统计卡片 */}
      <Row gutter={[20, 20]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.key}>
            <div
              style={{
                ...styles.statCard,
                ...(hoveredCard === card.key ? styles.statCardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(card.key)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* 顶部装饰线 */}
              <div
                style={{
                  ...styles.decorLine,
                  background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ ...styles.statIcon, background: card.gradient, color: card.color }}>
                    {card.icon}
                  </div>
                  <div style={styles.statValue}>
                    <AnimatedNumber value={card.value} prefix={card.prefix} />
                  </div>
                  <div style={styles.statLabel}>{card.label}</div>
                  <div
                    style={{
                      ...styles.statTrend,
                      color: card.trendUp ? '#00ff88' : '#ff4d6a',
                    }}
                  >
                    {card.trendUp ? <RiseOutlined /> : <FallOutlined />}
                    <span>{card.trend}%</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>较上月</span>
                  </div>
                </div>
                <MiniChart data={card.chartData} color={card.color} />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 第二行 */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        {/* 待办事项 */}
        <Col xs={24} lg={16}>
          <Card
            style={styles.card}
            title={
              <div style={styles.cardTitle}>
                <ClockCircleOutlined style={{ color: '#00d4ff' }} />
                待办事项
                <Tag color="cyan" style={{ marginLeft: 8 }}>
                  {todoItems.reduce((acc, item) => acc + item.count, 0)} 项
                </Tag>
              </div>
            }
            extra={
              <Button type="link" style={{ color: '#00d4ff' }}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            <Table
              dataSource={todoItems}
              rowKey="id"
              pagination={false}
              showHeader={false}
              columns={[
                {
                  dataIndex: 'title',
                  render: (text, record) => (
                    <Space>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background:
                            record.priority === 'high'
                              ? '#ff4d6a'
                              : record.priority === 'medium'
                              ? '#ffaa00'
                              : '#00d4ff',
                          display: 'inline-block',
                          boxShadow: `0 0 8px ${
                            record.priority === 'high'
                              ? 'rgba(255, 77, 106, 0.5)'
                              : record.priority === 'medium'
                              ? 'rgba(255, 170, 0, 0.5)'
                              : 'rgba(0, 212, 255, 0.5)'
                          }`,
                        }}
                      />
                      <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>
                    </Space>
                  ),
                },
                {
                  dataIndex: 'count',
                  width: 80,
                  align: 'right',
                  render: (count) => (
                    <Tag
                      style={{
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        color: '#00d4ff',
                      }}
                    >
                      {count} 项
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 快捷操作 */}
        <Col xs={24} lg={8}>
          <Card
            style={styles.card}
            title={
              <div style={styles.cardTitle}>
                <FireOutlined style={{ color: '#ffaa00' }} />
                快捷操作
              </div>
            }
          >
            {quickActions.map((action, index) => (
              <div
                key={index}
                style={{
                  ...styles.quickAction,
                  borderBottom: index === quickActions.length - 1 ? 'none' : styles.quickAction.borderBottom,
                }}
                className="quick-action-item"
              >
                <Space>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: action.color,
                      fontSize: 18,
                    }}
                  >
                    {action.icon}
                  </div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{action.label}</span>
                </Space>
                <ArrowRightOutlined style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 第三行 */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        {/* 课程排行 */}
        <Col xs={24} lg={12}>
          <Card
            style={styles.card}
            title={
              <div style={styles.cardTitle}>
                <TrophyOutlined style={{ color: '#ffaa00' }} />
                热门课程排行
              </div>
            }
          >
            {courseRankData.map((course) => (
              <div
                key={course.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: course.rank < 5 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background:
                      course.rank <= 3
                        ? `linear-gradient(135deg, ${
                            course.rank === 1 ? '#ffaa00' : course.rank === 2 ? '#c0c0c0' : '#cd7f32'
                          } 0%, ${
                            course.rank === 1 ? '#ff8800' : course.rank === 2 ? '#a0a0a0' : '#a06020'
                          } 100%)`
                        : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: course.rank <= 3 ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                    marginRight: 12,
                  }}
                >
                  {course.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>{course.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
                      {course.students} 名学员
                    </span>
                    <Progress
                      percent={course.rate}
                      size="small"
                      strokeColor={{
                        '0%': '#00d4ff',
                        '100%': '#0099ff',
                      }}
                      trailColor="rgba(255, 255, 255, 0.1)"
                      style={{ width: 100, marginBottom: 0 }}
                      format={(percent) => (
                        <span style={{ color: '#00d4ff', fontSize: 12 }}>{percent}%</span>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </Col>

        {/* 最近动态 */}
        <Col xs={24} lg={12}>
          <Card
            style={styles.card}
            title={
              <div style={styles.cardTitle}>
                <ClockCircleOutlined style={{ color: '#00d4ff' }} />
                最近动态
              </div>
            }
            extra={
              <Button type="link" style={{ color: '#00d4ff' }}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px 0',
                  borderBottom: index < recentActivities.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background:
                      activity.type === 'success'
                        ? '#00ff88'
                        : activity.type === 'warning'
                        ? '#ffaa00'
                        : '#00d4ff',
                    marginTop: 6,
                    marginRight: 12,
                    boxShadow: `0 0 8px ${
                      activity.type === 'success'
                        ? 'rgba(0, 255, 136, 0.5)'
                        : activity.type === 'warning'
                        ? 'rgba(255, 170, 0, 0.5)'
                        : 'rgba(0, 212, 255, 0.5)'
                    }`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4 }}>
                    {activity.content}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 第四行 - 数据概览 */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={8}>
          <Card
            style={styles.card}
            title={
              <div style={styles.cardTitle}>
                <TeamOutlined style={{ color: '#00d4ff' }} />
                学员转化率
              </div>
            }
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <RingProgress percent={78} color="#00d4ff" />
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
              本月试听转正式学员比例
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            style={styles.card}
            title={
              <div style={styles.cardTitle}>
                <ReadOutlined style={{ color: '#00ff88' }} />
                课程完成率
              </div>
            }
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <RingProgress percent={92} color="#00ff88" />
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
              本月课程按时完成比例
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            style={styles.card}
            title={
              <div style={styles.cardTitle}>
                <DollarOutlined style={{ color: '#ffaa00' }} />
                收费达成率
              </div>
            }
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <RingProgress percent={85} color="#ffaa00" />
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
              本月收费目标完成比例
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
