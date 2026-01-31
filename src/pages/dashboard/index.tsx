import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Spin,
  message,
  Progress,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import {
  getEnrollmentDashboard,
  getRevenueDashboard,
  getTeachingDashboard,
} from '@/api/dashboard';
import type { EnrollmentData, RevenueData, TeachingData } from '@/types/dashboard';

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

// 简单的折线图组件
const LineChart = ({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 80;
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
          i % Math.ceil(data.length / 5) === 0 && <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

// 简单的饼图组件
const PieChart = ({ data }: { data: { name: string; value: number }[] }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;

  const colors = ['#00d4ff', '#0099ff', '#00ffaa', '#ff6b9d', '#ffd700'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map((d, i) => {
          const percentage = d.value / total;
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
              {d.name}
            </span>
            <span style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600 }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 简单的柱状图组件
const BarChart = ({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));

  return (
    <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 8px' }}>
      {data.map((d, i) => {
        const barHeight = (d.value / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: '#00d4ff', marginBottom: 4, height: 16 }}>
              {d.value}%
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
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.45)', marginTop: 4 }}>
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 招生数据看板
const EnrollmentDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EnrollmentData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getEnrollmentDashboard();
      setData(result.data || result);
    } catch (error) {
      message.error('获取招生数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  const conversionRate = data.leadStats.total > 0
    ? ((data.leadStats.converted / data.leadStats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 线索统计卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>线索总数</span>}
              value={data.leadStats.total}
              valueStyle={valueStyle}
              prefix={<PhoneOutlined />}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>待跟进</div>
                <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                  {data.leadStats.pending}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>已转化</div>
                <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                  {data.leadStats.converted}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 试听统计卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>试听总数</span>}
              value={data.trialStats.total}
              valueStyle={valueStyle}
              prefix={<BookOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>已完成</span>
                  <span style={{ fontSize: 12, color: '#00d4ff' }}>{data.trialStats.completed}</span>
                </div>
                <Progress
                  percent={(data.trialStats.completed / data.trialStats.total) * 100}
                  showInfo={false}
                  strokeColor="#00d4ff"
                  trailColor="rgba(255, 255, 255, 0.1)"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>已转化</span>
                  <span style={{ fontSize: 12, color: '#00ffaa' }}>{data.trialStats.converted}</span>
                </div>
                <Progress
                  percent={(data.trialStats.converted / data.trialStats.total) * 100}
                  showInfo={false}
                  strokeColor="#00ffaa"
                  trailColor="rgba(255, 255, 255, 0.1)"
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* 转化率卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>整体转化率</span>}
              value={conversionRate}
              valueStyle={valueStyle}
              prefix={<RiseOutlined />}
              suffix="%"
            />
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
              试听转化率: {data.trialStats.total > 0
                ? ((data.trialStats.converted / data.trialStats.total) * 100).toFixed(1)
                : '0.0'}%
            </div>
          </Card>
        </Col>

        {/* 转化率趋势图 */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#fff' }}>转化率趋势</span>}
            style={cardStyle}
            bordered={false}
          >
            <LineChart
              data={data.conversionTrend.map(item => ({
                label: item.date.slice(5),
                value: item.rate,
              }))}
              height={250}
            />
          </Card>
        </Col>

        {/* 线索来源分布 */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#fff' }}>线索来源分布</span>}
            style={cardStyle}
            bordered={false}
          >
            <PieChart
              data={data.leadSourceDistribution.map(item => ({
                name: item.source,
                value: item.count,
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 营收数据看板
const RevenueDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getRevenueDashboard();
      setData(result.data || result);
    } catch (error) {
      message.error('获取营收数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 收入统计卡片 */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>今日收入</span>}
              value={data.revenueStats.today}
              valueStyle={{ ...valueStyle, fontSize: 24 }}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>本周收入</span>}
              value={data.revenueStats.week}
              valueStyle={{ ...valueStyle, fontSize: 24 }}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>本月收入</span>}
              value={data.revenueStats.month}
              valueStyle={{ ...valueStyle, fontSize: 24 }}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>本年收入</span>}
              value={data.revenueStats.year}
              valueStyle={{ ...valueStyle, fontSize: 24 }}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>

        {/* 欠费统计 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>欠费总额</span>}
              value={data.arrearsStats.totalArrears}
              valueStyle={{ ...valueStyle, color: '#ff6b9d' }}
              prefix="¥"
              precision={2}
            />
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
              欠费学员: {data.arrearsStats.studentCount} 人
            </div>
          </Card>
        </Col>

        {/* 收入趋势图 */}
        <Col xs={24} lg={16}>
          <Card
            title={<span style={{ color: '#fff' }}>收入趋势（最近30天）</span>}
            style={cardStyle}
            bordered={false}
          >
            <LineChart
              data={data.revenueTrend.map(item => ({
                label: item.date.slice(5),
                value: item.amount,
              }))}
              height={200}
            />
          </Card>
        </Col>

        {/* 收款方式分布 */}
        <Col xs={24}>
          <Card
            title={<span style={{ color: '#fff' }}>收款方式分布</span>}
            style={cardStyle}
            bordered={false}
          >
            <Row gutter={16}>
              {data.paymentMethodDistribution.map((item, index) => {
                const total = data.paymentMethodDistribution.reduce((sum, d) => sum + d.amount, 0);
                const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0.0';
                return (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.65)', marginBottom: 8 }}>
                        {item.method}
                      </div>
                      <div style={{ fontSize: 24, color: '#00d4ff', fontWeight: 700, marginBottom: 4 }}>
                        {formatCurrency(item.amount)}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>
                        占比 {percentage}%
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 教学数据看板
const TeachingDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TeachingData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getTeachingDashboard();
      setData(result.data || result);
    } catch (error) {
      message.error('获取教学数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 学员统计卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>在读学员</span>}
              value={data.studentStats.active}
              valueStyle={valueStyle}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>试听学员</div>
                <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                  {data.studentStats.trial}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>潜在学员</div>
                <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                  {data.studentStats.potential}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 班级统计卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>班级总数</span>}
              value={data.classStats.total}
              valueStyle={valueStyle}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>活跃班级</div>
                <div style={{ fontSize: 18, color: '#00d4ff', fontWeight: 600 }}>
                  {data.classStats.active}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>满员班级</div>
                <div style={{ fontSize: 18, color: '#ff6b9d', fontWeight: 600 }}>
                  {data.classStats.full}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 教师统计卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={cardStyle} bordered={false}>
            <Statistic
              title={<span style={statisticStyle}>教师总数</span>}
              value={data.teacherStats.total}
              valueStyle={valueStyle}
              prefix={<TrophyOutlined />}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>全职教师</div>
                <div style={{ fontSize: 18, color: '#00d4ff', fontWeight: 600 }}>
                  {data.teacherStats.fullTime}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>兼职教师</div>
                <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                  {data.teacherStats.partTime}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 考勤率图表 */}
        <Col xs={24}>
          <Card
            title={<span style={{ color: '#fff' }}>考勤率统计（最近7天）</span>}
            style={cardStyle}
            bordered={false}
          >
            <BarChart
              data={data.attendanceRate.map(item => ({
                label: item.date.slice(5),
                value: item.rate,
              }))}
              height={250}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

function Dashboard() {
  const items: TabsProps['items'] = [
    {
      key: 'enrollment',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PhoneOutlined />
          招生数据
        </span>
      ),
      children: <EnrollmentDashboard />,
    },
    {
      key: 'revenue',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarOutlined />
          营收数据
        </span>
      ),
      children: <RevenueDashboard />,
    },
    {
      key: 'teaching',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined />
          教学数据
        </span>
      ),
      children: <TeachingDashboard />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          color: '#fff',
          fontSize: 28,
          fontWeight: 700,
          margin: 0,
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          数据看板
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.45)', margin: '8px 0 0 0' }}>
          实时监控机构运营数据
        </p>
      </div>

      <Tabs
        items={items}
        defaultActiveKey="enrollment"
        size="large"
        style={{
          '--tabs-card-gutter': '16px',
        } as React.CSSProperties}
      />
    </div>
  );
}

export default Dashboard;
