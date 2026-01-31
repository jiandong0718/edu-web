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
  Table,
  Button,
  Tag,
  Avatar,
} from 'antd';
import {
  TrophyOutlined,
  ReloadOutlined,
  UserOutlined,
  RiseOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { getConsultantRanking } from '@/api/marketing';
import type { ConsultantPerformance, ConsultantQueryParams } from '@/types/marketing';

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
};

// 柱状图组件
const BarChart = ({ data, field }: { data: ConsultantPerformance[]; field: keyof ConsultantPerformance }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255, 255, 255, 0.45)' }}>
        暂无数据
      </div>
    );
  }

  const topData = data.slice(0, 10); // 只显示前10名
  const maxValue = Math.max(...topData.map(d => Number(d[field])));

  const getColor = (index: number) => {
    if (index === 0) return '#ffd700'; // 金色
    if (index === 1) return '#c0c0c0'; // 银色
    if (index === 2) return '#cd7f32'; // 铜色
    return '#00d4ff'; // 默认青色
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {topData.map((item, index) => {
        const value = Number(item[field]);
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = getColor(index);

        return (
          <div key={item.advisorId} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 6,
              }}
            >
              {/* 排名 */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: index < 3 ? color : 'rgba(0, 212, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: index < 3 ? '#000' : color,
                  flexShrink: 0,
                }}
              >
                {index < 3 ? <CrownOutlined /> : index + 1}
              </div>

              {/* 顾问信息 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                    {item.advisorName}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.45)' }}>
                    {item.campusName}
                  </span>
                </div>

                {/* 进度条 */}
                <div
                  style={{
                    width: '100%',
                    height: 24,
                    background: 'rgba(0, 212, 255, 0.05)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
                      transition: 'width 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#000', fontWeight: 600 }}>
                      {field === 'conversionRate' ? `${value.toFixed(1)}%` : value}
                    </span>
                  </div>
                </div>
              </div>

              {/* 数值 */}
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color,
                  minWidth: 80,
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {field === 'revenue'
                  ? `¥${value.toLocaleString()}`
                  : field === 'conversionRate'
                  ? `${value.toFixed(1)}%`
                  : value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function ConsultantRankingPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConsultantPerformance[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<ConsultantQueryParams>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    sortBy: 'conversionCount',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20,
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getConsultantRanking(queryParams);
      setData(res.rankings);
      setTotal(res.total);
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
        page: 1,
      });
    }
  };

  // 处理校区变化
  const handleCampusChange = (campusId: number | undefined) => {
    setQueryParams({
      ...queryParams,
      campusId,
      page: 1,
    });
  };

  // 处理排序变化
  const handleSortChange = (sortBy: ConsultantQueryParams['sortBy']) => {
    setQueryParams({
      ...queryParams,
      sortBy,
      page: 1,
    });
  };

  // 表格列定义
  const columns: ColumnsType<ConsultantPerformance> = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (_: any, __: any, index: number) => {
        const rank = (queryParams.page! - 1) * queryParams.pageSize! + index + 1;
        if (rank <= 3) {
          const colors = ['#ffd700', '#c0c0c0', '#cd7f32'];
          return (
            <Avatar
              size={32}
              style={{
                background: colors[rank - 1],
                color: '#000',
                fontWeight: 700,
              }}
              icon={<CrownOutlined />}
            />
          );
        }
        return (
          <span style={{ fontSize: 16, fontWeight: 600, color: '#00d4ff' }}>
            {rank}
          </span>
        );
      },
    },
    {
      title: '顾问姓名',
      dataIndex: 'advisorName',
      key: 'advisorName',
      width: 120,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={32} icon={<UserOutlined />} style={{ background: '#00d4ff' }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </div>
      ),
    },
    {
      title: '所属校区',
      dataIndex: 'campusName',
      key: 'campusName',
      width: 120,
    },
    {
      title: '线索数',
      dataIndex: 'leadCount',
      key: 'leadCount',
      width: 100,
      align: 'center',
      sorter: true,
      render: (count: number) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: '#00d4ff' }}>
          {count}
        </span>
      ),
    },
    {
      title: '试听数',
      dataIndex: 'trialCount',
      key: 'trialCount',
      width: 100,
      align: 'center',
      sorter: true,
      render: (count: number) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: '#0099ff' }}>
          {count}
        </span>
      ),
    },
    {
      title: '转化数',
      dataIndex: 'conversionCount',
      key: 'conversionCount',
      width: 100,
      align: 'center',
      sorter: true,
      render: (count: number) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: '#00ffaa' }}>
          {count}
        </span>
      ),
    },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      width: 120,
      align: 'center',
      sorter: true,
      render: (rate: number) => {
        let color = '#00d4ff';
        if (rate >= 50) color = '#00ffaa';
        else if (rate >= 30) color = '#ffaa00';
        else if (rate < 20) color = '#ff6b9d';

        return (
          <Tag
            color={color}
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: '4px 12px',
              border: 'none',
            }}
          >
            {rate.toFixed(1)}%
          </Tag>
        );
      },
    },
    {
      title: '营收金额',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 140,
      align: 'right',
      sorter: true,
      render: (revenue: number) => (
        <span style={{ fontSize: 16, fontWeight: 600, color: '#ffd700' }}>
          ¥{revenue.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>
            <TrophyOutlined style={{ marginRight: 12 }} />
            顾问业绩排行
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.45)', margin: '8px 0 0 0' }}>
            展示顾问招生业绩和转化效果
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
          <Space size="middle" wrap>
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
            <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>排序:</span>
            <Select
              value={queryParams.sortBy}
              onChange={handleSortChange}
              style={{ width: 150 }}
            >
              <Select.Option value="conversionCount">按转化数</Select.Option>
              <Select.Option value="conversionRate">按转化率</Select.Option>
              <Select.Option value="revenue">按营收金额</Select.Option>
              <Select.Option value="leadCount">按线索数</Select.Option>
            </Select>
          </Space>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* 图表展示 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ color: '#00ffaa' }} />
                      <span style={{ color: '#fff' }}>转化数排行 TOP 10</span>
                    </Space>
                  }
                  style={styles.card}
                  bordered={false}
                >
                  <BarChart data={data} field="conversionCount" />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <RiseOutlined style={{ color: '#ffd700' }} />
                      <span style={{ color: '#fff' }}>转化率排行 TOP 10</span>
                    </Space>
                  }
                  style={styles.card}
                  bordered={false}
                >
                  <BarChart data={data} field="conversionRate" />
                </Card>
              </Col>
            </Row>

            {/* 详细表格 */}
            <Card
              title={<span style={{ color: '#fff' }}>详细排行榜</span>}
              style={styles.card}
              bordered={false}
            >
              <Table
                rowKey="advisorId"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{
                  current: queryParams.page,
                  pageSize: queryParams.pageSize,
                  total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条`,
                  onChange: (page, pageSize) => {
                    setQueryParams({ ...queryParams, page, pageSize });
                  },
                }}
              />
            </Card>
          </>
        )}
      </Card>
    </div>
  );
}

export default ConsultantRankingPage;
