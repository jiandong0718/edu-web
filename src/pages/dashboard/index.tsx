import { Card, Row, Col, Statistic } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  DollarOutlined,
  ReadOutlined
} from '@ant-design/icons';

export function Component() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>工作台</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在读学生"
              value={1128}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月新增"
              value={93}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={112893}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日课程"
              value={28}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="待办事项">
            <p>暂无待办事项</p>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快捷操作">
            <p>新增学生</p>
            <p>新增线索</p>
            <p>排课管理</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
