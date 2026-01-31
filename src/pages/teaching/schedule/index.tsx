import { useState } from 'react';
import { Card, Tabs, message } from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import BatchScheduleForm from './components/BatchScheduleForm';
import ScheduleOperations from './components/ScheduleOperations';
import ScheduleCalendar from './components/ScheduleCalendar';

const { TabPane } = Tabs;

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
  },
};

function ScheduleManagement() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScheduleSuccess = () => {
    message.success('排课成功');
    setRefreshKey((prev) => prev + 1);
    setActiveTab('calendar');
  };

  const handleOperationSuccess = () => {
    message.success('操作成功');
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <CalendarOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          排课管理
        </div>
      </div>

      <Card style={styles.card} bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'calendar',
              label: (
                <span>
                  <EyeOutlined />
                  课表查看
                </span>
              ),
              children: <ScheduleCalendar key={refreshKey} />,
            },
            {
              key: 'batch',
              label: (
                <span>
                  <PlusOutlined />
                  批量排课
                </span>
              ),
              children: <BatchScheduleForm onSuccess={handleScheduleSuccess} />,
            },
            {
              key: 'operations',
              label: (
                <span>
                  <EditOutlined />
                  调课/代课/停课
                </span>
              ),
              children: (
                <ScheduleOperations
                  key={refreshKey}
                  onSuccess={handleOperationSuccess}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default ScheduleManagement;
