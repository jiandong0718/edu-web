import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Select,
  Space,
  message,
  Table,
  Tag,
  Alert,
  Form,
} from 'antd';
import {
  UserSwitchOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Lead, LeadQueryParams } from '@/types/lead';
import { getLeadList, assignLeads } from '@/api/lead';

const { Option } = Select;

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
    marginBottom: 24,
  },
  formCard: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  statCard: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#00d4ff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
  },
};

// 线索状态映射
const statusMap: Record<string, { text: string; color: string }> = {
  new: { text: '新线索', color: '#00d4ff' },
  contacted: { text: '已联系', color: '#00ff88' },
  qualified: { text: '已确认', color: '#0099ff' },
  converted: { text: '已转化', color: '#9d4edd' },
  lost: { text: '已流失', color: '#ff4d6a' },
};

// 线索来源映射
const sourceMap: Record<string, string> = {
  online: '线上',
  offline: '线下',
  referral: '转介绍',
  event: '活动',
  other: '其他',
};

export function Component() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [queryParams, setQueryParams] = useState<LeadQueryParams>({
    page: 1,
    pageSize: 10,
    status: 'new', // 默认只显示新线索
  });
  const [assigneeId, setAssigneeId] = useState<number>();
  const [assigning, setAssigning] = useState(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getLeadList(queryParams);
      setDataSource(res.list);
      setTotal(res.total);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 分配线索
  const handleAssign = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要分配的线索');
      return;
    }
    if (!assigneeId) {
      message.warning('请选择分配对象');
      return;
    }

    setAssigning(true);
    try {
      await assignLeads({
        leadIds: selectedRowKeys,
        assigneeId,
      });
      message.success(`成功分配 ${selectedRowKeys.length} 条线索`);
      setSelectedRowKeys([]);
      setAssigneeId(undefined);
      loadData();
    } catch (error: any) {
      message.error(error.message || '分配失败');
    } finally {
      setAssigning(false);
    }
  };

  // 快速分配（平均分配）
  const handleQuickAssign = async (_count: number) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要分配的线索');
      return;
    }
    // TODO: 实现快速分配逻辑
    message.info('快速分配功能开发中');
  };

  // 表格列定义
  const columns: ColumnsType<Lead> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <span style={{ color: '#fff' }}>{text}</span>,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '家长姓名',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 120,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '家长电话',
      dataIndex: 'parentPhone',
      key: 'parentPhone',
      width: 130,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      render: (text: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text || '-'}</span>
      ),
    },
    {
      title: '线索来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
          }}
        >
          {sourceMap[source]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status];
        return (
          <Tag
            style={{
              background: `${statusInfo.color}20`,
              border: `1px solid ${statusInfo.color}`,
              color: statusInfo.color,
            }}
          >
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: '所属校区',
      dataIndex: 'campusName',
      key: 'campusName',
      width: 120,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '当前负责人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      width: 120,
      render: (text: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text || '未分配'}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as number[]);
    },
  };

  return (
    <div>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <UserSwitchOutlined />
          线索分配
        </div>
      </div>

      {/* 统计信息 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{total}</div>
          <div style={styles.statLabel}>待分配线索</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{selectedRowKeys.length}</div>
          <div style={styles.statLabel}>已选择</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>今日已分配</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>本月已分配</div>
        </div>
      </div>

      {/* 分配表单 */}
      <div style={styles.formCard}>
        <Alert
          message="分配说明"
          description="选择要分配的线索，然后选择分配对象，点击确认分配即可。支持批量分配和快速平均分配。"
          type="info"
          showIcon
          style={{
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            marginBottom: 24,
          }}
        />

        <Form layout="inline">
          <Form.Item label="分配给">
            <Select
              placeholder="请选择分配对象"
              style={{ width: 200 }}
              value={assigneeId}
              onChange={setAssigneeId}
            >
              {/* TODO: 从接口获取顾问列表 */}
              <Option value={1}>张三（顾问）</Option>
              <Option value={2}>李四（顾问）</Option>
              <Option value={3}>王五（顾问）</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleAssign}
                loading={assigning}
                disabled={selectedRowKeys.length === 0 || !assigneeId}
                style={styles.actionButton}
              >
                确认分配 ({selectedRowKeys.length})
              </Button>
              <Button
                icon={<TeamOutlined />}
                onClick={() => handleQuickAssign(3)}
                disabled={selectedRowKeys.length === 0}
              >
                快速分配
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      {/* 筛选栏 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="线索状态"
            style={{ width: 120 }}
            value={queryParams.status}
            onChange={(value) => setQueryParams({ ...queryParams, status: value, page: 1 })}
          >
            <Option value="">全部</Option>
            <Option value="new">新线索</Option>
            <Option value="contacted">已联系</Option>
            <Option value="qualified">已确认</Option>
          </Select>
          <Select
            placeholder="线索来源"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setQueryParams({ ...queryParams, source: value, page: 1 })}
          >
            <Option value="online">线上</Option>
            <Option value="offline">线下</Option>
            <Option value="referral">转介绍</Option>
            <Option value="event">活动</Option>
            <Option value="other">其他</Option>
          </Select>
          <Select
            placeholder="所属校区"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setQueryParams({ ...queryParams, campusId: value, page: 1 })}
          >
            {/* TODO: 从接口获取校区列表 */}
            <Option value={1}>总部校区</Option>
            <Option value={2}>分部校区</Option>
          </Select>
        </Space>
      </div>

      {/* 表格 */}
      <Card style={styles.card} bordered={false}>
        <Table<Lead>
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, page, pageSize });
            },
          }}
          scroll={{ x: 1400 }}
          style={{
            background: '#111827',
          }}
        />
      </Card>
    </div>
  );
}

export default Component;
