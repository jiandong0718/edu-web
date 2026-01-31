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
  Space,
} from 'antd';
import {
  PhoneOutlined,
  BookOutlined,
  RiseOutlined,
  DollarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getEnrollmentOverview,
  getEnrollmentTrend,
  getEnrollmentFunnel,
  getEnrollmentSource,
  getEnrollmentAdvisorRanking,
} from '@/api/dashboard';

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

// 饼图组件
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

// 漏斗图组件
const FunnelChart = ({ data }: { data: { name: string; value: number; rate: number }[] }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{ padding: '20px 0' }}>
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100;
        return (
          <div key={index} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 14 }}>
                {item.name}
              </span>
              <span style={{ color: '#00d4ff', fontSize: 14, fontWeight: 600 }}>
                {item.value} ({item.rate.toFixed(1)}%)
              </span>
            </div>
            <div
              style={{
                width: `${width}%`,
                height: 40,
                background: `linear-gradient(90deg, rgba(0, 212, 255, ${0.8 - index * 0.15}) 0%, rgba(0, 153, 255, ${0.8 - index * 0.15}) 100%)`,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
            >
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 柱状图组件
const BarChart = ({ data }: { data: { label: string; value: number; amount?: number }[] }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{ padding: '20px 0' }}>
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100;
        return (
          <div key={index} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 14 }}>
                {index + 1}. {item.label}
              </span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#00d4ff', fontSize: 14, fontWeight: 600, marginRight: 8 }}>
                  {item.value}单
                </span>
                {item.amount && (
                  <span style={{ color: '#00ffaa', fontSize: 12 }}>
                    ¥{item.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                width: `${width}%`,
                height: 32,
                background: 'linear-gradient(90deg, #00d4ff 0%, #0099ff 100%)',
                borderRadius: 4,
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

function EnrollmentDashboard() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('month');
  const [customDates, setCustomDates] = useState<[string, string] | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [source, setSource] = useState<any>(null);
  const [advisorRanking, setAdvisorRanking] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [timeRange, customDates]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { timeRange };
      if (timeRange === 'custom' && customDates) {
        params.startDate = customDates[0];
        params.endDate = customDates[1];
      }

      const [overviewRes, trendRes, funnelRes, sourceRes, advisorRes] = await Promise.all([
        getEnrollmentOverview(params),
        getEnrollmentTrend({ days: 30 }),
        getEnrollmentFunnel(params),
        getEnrollmentSource(params),
        getEnrollmentAdvisorRanking({ ...params, limit: 10 }),
      ]);

      setOverview(overviewRes.data);
      setTrend(trendRes.data);
      setFunnel(funnelRes.data);
      setSource(sourceRes.data);
      setAdvisorRanking(advisorRes.data);
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

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
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
            招生数据看板
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.45)', margin: '8px 0 0 0' }}>
            实时监控招生转化数据
          </p>
        </div>

        {/* 时间范围选择器 */}
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
            options={[
              { label: '今日', value: 'today' },
              { label: '本周', value: 'week' },
              { label: '本月', value: 'month' },
              { label: '自定义', value: 'custom' },
            ]}
          />
          {timeRange === 'custom' && (
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setCustomDates([
                    dates[0]!.format('YYYY-MM-DD'),
                    dates[1]!.format('YYYY-MM-DD'),
                  ]);
                }
              }}
            />
          )}
        </Space>
      </div>

      {overview && (
        <>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle} bordered={false}>
                <Statistic
                  title={<span style={statisticStyle}>总线索数</span>}
                  value={overview.leadStats?.total || 0}
                  valueStyle={valueStyle}
                  prefix={<PhoneOutlined />}
                />
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>新增</div>
                    <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                      {overview.leadStats?.newLeads || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>待跟进</div>
                    <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 600 }}>
                      {overview.leadStats?.pending || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle} bordered={false}>
                <Statistic
                  title={<span style={statisticStyle}>试听总数</span>}
                  value={overview.trialStats?.total || 0}
                  valueStyle={valueStyle}
                  prefix={<BookOutlined />}
                />
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>已预约</div>
                    <div style={{ fontSize: 18, color: '#00d4ff', fontWeight: 600 }}>
                      {overview.trialStats?.scheduled || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>已完成</div>
                    <div style={{ fontSize: 18, color: '#00ffaa', fontWeight: 600 }}>
                      {overview.trialStats?.completed || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle} bordered={false}>
                <Statistic
                  title={<span style={statisticStyle}>试听转化率</span>}
                  value={overview.trialStats?.conversionRate || 0}
                  valueStyle={valueStyle}
                  prefix={<RiseOutlined />}
                  suffix="%"
                  precision={1}
                />
                <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
                  成交转化率: {overview.conversionStats?.dealConversionRate?.toFixed(1) || 0}%
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card style={cardStyle} bordered={false}>
                <Statistic
                  title={<span style={statisticStyle}>成交金额</span>}
                  value={overview.dealStats?.amount || 0}
                  valueStyle={{ ...valueStyle, fontSize: 24 }}
                  prefix={<DollarOutlined />}
                  suffix="元"
                  precision={0}
                />
                <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
                  成交数: {overview.dealStats?.count || 0} 单
                </div>
              </Card>
            </Col>
          </Row>

          {/* 招生趋势图 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={16}>
              <Card
                title={<span style={{ color: '#fff' }}>招生趋势（最近30天）</span>}
                style={cardStyle}
                bordered={false}
              >
                {trend && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ color: '#00d4ff', marginRight: 16 }}>● 线索</span>
                      <span style={{ color: '#00ffaa', marginRight: 16 }}>● 试听</span>
                      <span style={{ color: '#ffd700' }}>● 成交</span>
                    </div>
                    <LineChart
                      data={trend.leadTrend?.map((item: any) => ({
                        label: item.date.slice(5),
                        value: item.count,
                      })) || []}
                      height={250}
                    />
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={<span style={{ color: '#fff' }}>线索来源分布</span>}
                style={cardStyle}
                bordered={false}
              >
                {source && (
                  <PieChart
                    data={source.sources?.map((item: any) => ({
                      name: item.source,
                      value: item.count,
                    })) || []}
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* 转化漏斗 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={12}>
              <Card
                title={<span style={{ color: '#fff' }}>转化漏斗</span>}
                style={cardStyle}
                bordered={false}
              >
                {funnel && (
                  <FunnelChart
                    data={funnel.stages?.map((item: any) => ({
                      name: item.name,
                      value: item.count,
                      rate: item.conversionRate,
                    })) || []}
                  />
                )}
              </Card>
            </Col>

            {/* 顾问排行榜 */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span style={{ color: '#fff' }}>
                    <TrophyOutlined style={{ marginRight: 8 }} />
                    顾问业绩排行 TOP 10
                  </span>
                }
                style={cardStyle}
                bordered={false}
              >
                {advisorRanking && (
                  <BarChart
                    data={advisorRanking.advisors?.map((item: any) => ({
                      label: item.advisorName,
                      value: item.dealCount,
                      amount: item.dealAmount,
                    })) || []}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

export default EnrollmentDashboard;
