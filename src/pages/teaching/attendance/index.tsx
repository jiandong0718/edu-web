import { useState } from 'react';
import { Card, Tabs } from 'antd';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import CheckInPage from './CheckIn';
import LeaveManagementPage from './LeaveManagement';
import AttendanceStatisticsPage from './Statistics';

// 样式定义
const styles = {
  container: {
    padding: 24,
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
  },
};

function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState('checkin');

  const tabItems = [
    {
      key: 'checkin',
      label: (
        <span>
          <CheckCircleOutlined />
          课堂签到
        </span>
      ),
      children: <CheckInPage />,
    },
    {
      key: 'leave',
      label: (
        <span>
          <FileTextOutlined />
          请假管理
        </span>
      ),
      children: <LeaveManagementPage />,
    },
    {
      key: 'statistics',
      label: (
        <span>
          <BarChartOutlined />
          考勤统计
        </span>
      ),
      children: <AttendanceStatisticsPage />,
    },
  ];

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
}

export default AttendanceManagement;
