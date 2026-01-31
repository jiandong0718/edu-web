import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Table, Spin } from 'antd';
import { Column, Pie, Line } from '@ant-design/plots';
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import {
  getRevenueOverview,
  getRevenueTrend,
  getPaymentMethodDistribution,
  getArrearsList,
  getCourseRevenueRanking,
} from '@/api/dashboard';
import type {
  RevenueOverview,
  RevenueTrendItem,
  PaymentMethodItem,
  ArrearsItem,
  CourseRevenueItem,
} from '@/types/dashboard';
import './index.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<RevenueOverview | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [arrearsList, setArrearsList] = useState<ArrearsItem[]>([]);
  const [courseRevenue, setCourseRevenue] = useState<CourseRevenueItem[]>([]);
  const [campusId, setCampusId] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ]);
  const [trendDays, setTrendDays] = useState(30);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 并行加载所有数据
      const [overviewRes, trendRes, paymentRes, arrearsRes, courseRes] = await Promise.all([
        getRevenueOverview(campusId),
        getRevenueTrend({ campusId, days: trendDays }),
        getPaymentMethodDistribution({
          campusId,
          startDate: dateRange[0],
          endDate: dateRange[1],
        }),
        getArrearsList({ campusId, limit: 20 }),
        getCourseRevenueRanking({
          campusId,
          startDate: dateRange[0],
          endDate: dateRange[1],
          limit: 10,
        }),
      ]);

      setOverview(overviewRes.data);
      setRevenueTrend(trendRes.data || []);
      setPaymentMethods(paymentRes.data || []);
      setArrearsList(arrearsRes.data || []);
      setCourseRevenue(courseRes.data || []);
    } catch (error) {
      console.error('加载营收数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [campusId, dateRange, trendDays]);

  // 格式化金额
  const formatMoney = (value: number) => {
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 欠费列表表格列
  const arrearsColumns: ColumnsType<ArrearsItem> = [
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100,
    },
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 150,
    },
    {
      title: '应付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      render: (value: number) => formatMoney(value),
    },
    {
      title: '已付金额',
      dataIndex: 'receivedAmount',
      key: 'receivedAmount',
      width: 120,
      render: (value: number) => formatMoney(value),
    },
    {
      title: '欠费金额',
      dataIndex: 'arrearsAmount',
      key: 'arrearsAmount',
      width: 120,
      render: (value: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{formatMoney(value)}</span>
      ),
      sorter: (a, b) => a.arrearsAmount - b.arrearsAmount,
    },
    {
      title: '校区',
      dataIndex: 'campusName',
      key: 'campusName',
      width: 100,
    },
    {
      title: '签约日期',
      dataIndex: 'signDate',
      key: 'signDate',
      width: 110,
    },
    {
      title: '到期日期',
      dataIndex: 'expireDate',
      key: 'expireDate',
      width: 110,
    },
  ];

  // 营收趋势图配置
  const trendConfig = {
    data: revenueTrend,
    xField: 'date',
    yField: 'amount',
    smooth: true,
    color: '#00d4ff',
    lineStyle: {
      lineWidth: 3,
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: '#00d4ff',
        stroke: '#0099ff',
        lineWidth: 2,
      },
    },
    areaStyle: {
      fill: 'l(270) 0:#00d4ff33 1:#00d4ff00',
    },
    xAxis: {
      label: {
        style: {
          fill: '#8c8c8c',
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `¥${Number(v).toLocaleString()}`,
        style: {
          fill: '#8c8c8c',
        },
      },
    },
    tooltip: {
      formatter: (datum: RevenueTrendItem) => {
        return {
          name: '收入',
          value: formatMoney(datum.amount),
        };
      },
    },
  };

  // 收款方式饼图配置
  const paymentPieConfig = {
    data: paymentMethods,
    angleField: 'amount',
    colorField: 'methodName',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
      style: {
        fill: '#8c8c8c',
      },
    },
    statistic: {
      title: {
        content: '总金额',
        style: {
          color: '#8c8c8c',
        },
      },
      content: {
        content: formatMoney(
          paymentMethods.reduce((sum, item) => sum + item.amount, 0)
        ),
        style: {
          color: '#00d4ff',
          fontSize: '20px',
        },
      },
    },
    legend: {
      position: 'bottom' as const,
      itemName: {
        style: {
          fill: '#8c8c8c',
        },
      },
    },
    tooltip: {
      formatter: (datum: PaymentMethodItem) => {
        return {
          name: datum.methodName,
          value: `${formatMoney(datum.amount)} (${datum.percentage.toFixed(1)}%)`,
        };
      },
    },
  };

  // 课程营收排行柱状图配置
  const courseRevenueConfig = {
    data: courseRevenue,
    xField: 'revenue',
    yField: 'courseName',
    seriesField: 'courseName',
    color: '#00d4ff',
    barStyle: {
      radius: [0, 4, 4, 0],
    },
    xAxis: {
      label: {
        formatter: (v: string) => `¥${Number(v).toLocaleString()}`,
        style: {
          fill: '#8c8c8c',
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: '#8c8c8c',
        },
      },
    },
    tooltip: {
      formatter: (datum: CourseRevenueItem) => {
        return {
          name: datum.courseName,
          value: `${formatMoney(datum.revenue)} (${datum.contractCount}个合同, ${datum.studentCount}名学员)`,
        };
      },
    },
    legend: false,
  };

  return (
    <div className="revenue-dashboard">
      <div className="dashboard-header">
        <h2>营收数据看板</h2>
        <div className="dashboard-filters">
          <Select
            placeholder="选择校区"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setCampusId(value)}
          >
            <Option value={undefined}>全部校区</Option>
          </Select>
          <RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={(dates) => {
              if (dates) {
                setDateRange([
                  dates[0]!.format('YYYY-MM-DD'),
                  dates[1]!.format('YYYY-MM-DD'),
                ]);
              }
            }}
          />
          <Select
            value={trendDays}
            style={{ width: 150 }}
            onChange={(value) => setTrendDays(value)}
          >
            <Option value={7}>近7天</Option>
            <Option value={30}>近30天</Option>
            <Option value={90}>近90天</Option>
          </Select>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="今日收入"
                value={overview?.incomeToday || 0}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="元"
                valueStyle={{ color: '#00d4ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="本月收入"
                value={overview?.incomeThisMonth || 0}
                precision={2}
                prefix={<RiseOutlined />}
                suffix="元"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="总欠费金额"
                value={overview?.totalArrears || 0}
                precision={2}
                prefix={<ExclamationCircleOutlined />}
                suffix="元"
                valueStyle={{ color: '#ff4d4f' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                {overview?.arrearsStudentCount || 0}人 / {overview?.arrearsContractCount || 0}个合同
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="退费率"
                value={overview?.refundRate || 0}
                precision={2}
                prefix={<FallOutlined />}
                suffix="%"
                valueStyle={{ color: '#faad14' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                本月退费: {formatMoney(overview?.refundThisMonth || 0)}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 营收趋势图 */}
        <Card title="营收趋势" style={{ marginBottom: 16 }} className="chart-card">
          <Line {...trendConfig} height={300} />
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {/* 收款方式分布 */}
          <Col xs={24} lg={12}>
            <Card title="收款方式分布" className="chart-card">
              <Pie {...paymentPieConfig} height={350} />
            </Card>
          </Col>

          {/* 课程营收排行 */}
          <Col xs={24} lg={12}>
            <Card title="课程营收排行 TOP 10" className="chart-card">
              <Column {...courseRevenueConfig} height={350} />
            </Card>
          </Col>
        </Row>

        {/* 欠费统计表格 */}
        <Card title="欠费统计" className="table-card">
          <Table
            columns={arrearsColumns}
            dataSource={arrearsList}
            rowKey="contractId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default RevenueDashboard;
