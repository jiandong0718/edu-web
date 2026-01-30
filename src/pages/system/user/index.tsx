import { Card, Table, Button, Space, Input, Form, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

export function Component() {
  return (
    <Card title="用户管理">
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col>
            <Form.Item name="username" label="用户名">
              <Input placeholder="请输入用户名" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="realName" label="姓名">
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
              <Button icon={<ReloadOutlined />}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />}>新增用户</Button>
      </Space>

      <Table
        columns={[
          { title: '用户名', dataIndex: 'username', key: 'username' },
          { title: '姓名', dataIndex: 'realName', key: 'realName' },
          { title: '手机号', dataIndex: 'phone', key: 'phone' },
          { title: '状态', dataIndex: 'status', key: 'status' },
          { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
          { title: '操作', key: 'action', render: () => (
            <Space>
              <a>编辑</a>
              <a>删除</a>
            </Space>
          )},
        ]}
        dataSource={[]}
        rowKey="id"
      />
    </Card>
  );
}
