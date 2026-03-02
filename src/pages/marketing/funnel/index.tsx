import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Spin,
  message,
  Statistic,
  Button,
} from 'antd';
import {
  FunnelPlotOutlined,
  ReloadOutlined,
  RiseOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { getFunnelStats } from '@/api/marketing';
import type { FunnelStatsResponse, FunnelQueryParams } from '@/types/marketing';

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
    margin: 0,
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
  },
  filterBar: {
    marginBottom: 16,
    padding: 16,
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 8,
  },
  statisticCard: {
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  valueStyle: {
    color: '#00d4ff',
    fontSize: 28,
    fontWeight: 700,
  },
};

// 漏斗图组件
const FunnelChart = ({ data }: { data: FunnelStatsResponse | null }) => {
  if (!data || !data.funnelData || data.funnelData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255, 255, 255, 0.45)' }}>
        暂无数据
      </div>
    );
  }

  const maxCount = Math.max(...data.funnelData.map(d => d.count));
  const colors = ['#00d4ff', '#0099ff', '#00ffaa', '#ffd700'];

  return (
    <div style={{ padding: '40px 20px' }}>
      {data.funnelData.map((item, index) => {
        const widthPercent = (item.count / maxCount) * 100;
        const minWidth = 30; // 最小宽度百分比
        const actualWidth = Math.max(widthPercent, minWidth);

        return (
          <div key={index} style={{ marginBottom: 24 }}>
            {/* 阶段标题和数据 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>
                  {item.stage}
                </span>
                {index > 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      color: item.rate >= 50 ? '#00ffaa' : item.rate >= 30 ? '#ffaa00' : '#ff6b9d',
                      background: `${item.rate >= 50 ? 'rgba(0, 255, 170, 0.1)' : item.rate >= 30 ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 107, 157, 0.1)'}`,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    转化率 {item.rate.toFixed(1)}%
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 24, color: colors[index % colors.length], fontWeight: 700 }}>
                  {item.count}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>
                  占比 {((item.count / data.totalLeads) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 漏斗条 */}
            <div
              style={{
                width: '100%',
                height: 60,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${actualWidth}%`,
                  height: '100%',
                  background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 20px ${colors[index % colors.length]}40`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 光泽效果 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
                    borderRadius: '8px 8px 0 0',
                  }}
                />
              </div>
            </div>

            {/* 连接线 */}
            {index < data.funnelData.length - 1 && (
              <div
                style={{
                  width: 2,
                  height: 20,
                  background: 'rgba(0, 212, 255, 0.3)',
                  margin: '0 auto',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

function FunnelPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FunnelStatsResponse | null>(null);
  const [queryParams, setQueryParams] = useState<FunnelQueryParams>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFunnelStats(queryParams);
      setData(res);
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setQueryParams({
        ...queryParams,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  // 处理校区变化
  const handleCampusChange = (campusId: number | undefined) => {
    setQueryParams({
      ...queryParams,
      campusId,
    });
  };

  return (
    <div>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>
            <FunnelPlotOutlined style={{ marginRight: 12 }} />
            招生漏斗图表
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.45)', margin: '8px 0 0 0' }}>
            可视化展示线索转化全流程
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadData}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {/* 筛选栏 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Space size="middle">
            <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>时间范围:</span>
            <RangePicker
              value={[
                queryParams.startDate ? dayjs(queryParams.startDate) : null,
                queryParams.endDate ? dayjs(queryParams.endDate) : null,
              ]}
              onChange={handleDateRangeChange}
              style={{ width: 280 }}
              presets={[
                { label: '最近7天', value: [dayjs().subtract(7, 'day'), dayjs()] },
                { label: '最近30天', value: [dayjs().subtract(30, 'day'), dayjs()] },
                { label: '最近90天', value: [dayjs().subtract(90, 'day'), dayjs()] },
                { label: '本月', value: [dayjs().startOf('month'), dayjs()] },
                { label: '上月', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
              ]}
            />
            <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>校区:</span>
            <Select
              placeholder="全部校区"
              style={{ width: 150 }}
              allowClear
              value={queryParams.campusId}
              onChange={handleCampusChange}
            >
              <Select.Option value={1}>总部校区</Select.Option>
              <Select.Option value={2}>分校区A</Select.Option>
              <Select.Option value={3}>分校区B</Select.Option>
            </Select>
          </Space>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card style={styles.statisticCard} bordered={false}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>总线索数</span>}
                    value={data?.totalLeads || 0}
                    valueStyle={styles.valueStyle}
                    prefix={<PhoneOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={styles.statisticCard} bordered={false}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>总试听数</span>}
                    value={data?.totalTrials || 0}
                    valueStyle={{ ...styles.valueStyle, color: '#0099ff' }}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={styles.statisticCard} bordered={false}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>总转化数</span>}
                    value={data?.totalConversions || 0}
                    valueStyle={{ ...styles.valueStyle, color: '#00ffaa' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={styles.statisticCard} bordered={false}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>整体转化率</span>}
                    value={data?.overallConversionRate || 0}
                    valueStyle={{ ...styles.valueStyle, color: '#ffd700' }}
                    prefix={<RiseOutlined />}
                    suffix="%"
                    precision={1}
                  />
                </Card>
              </Col>
            </Row>

            {/* 漏斗图 */}
            <Card
              title={<span style={{ color: '#fff', fontSize: 16 }}>转化漏斗</span>}
              style={styles.card}
              bordered={false}
            >
              <FunnelChart data={data} />
            </Card>
          </>
        )}
      </Card>
    </div>
  );
}

export default FunnelPage;
