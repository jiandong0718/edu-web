import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  DatePicker,
  message,
  Descriptions,
  Tabs,
} from 'antd';
import {
  FileTextOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getLeaveList,
  approveLeave,
  arrangeMakeup,
} from '@/api/attendance';
import type {
  LeaveApplication,
  LeaveStatus,
  LeaveQueryParams,
} from '@/types/attendance';

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
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
  },
  filterBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    width: 200,
    background: '#1a2332',
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  statsBar: {
    display: 'flex',
    gap: 24,
    marginBottom: 20,
    padding: '16px 20px',
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(0, 212, 255, 0.1)',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

// 状态配置
const statusConfig = {
  pending: {
    color: '#ffaa00',
    text: '待审批',
    bg: 'rgba(255, 170, 0, 0.1)',
  },
  approved: {
    color: '#00ff88',
    text: '已通过',
    bg: 'rgba(0, 255, 136, 0.1)',
  },
  rejected: {
    color: '#ff4d6a',
    text: '已拒绝',
    bg: 'rgba(255, 77, 106, 0.1)',
  },
};

function LeaveManagementPage() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<LeaveApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<LeaveQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = useState<LeaveStatus | 'all'>('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<LeaveApplication | null>(null);
  const [makeupForm] = Form.useForm();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        status: activeTab === 'all' ? undefined : activeTab,
      };
      const data = await getLeaveList(params);
      setDataSource(data.list);
      setTotal(data.total);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams, activeTab]);

  // 表格列定义
  const columns: ColumnsType<LeaveApplication> = [
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120,
      render: (name: string) => (
        <span style={{ color: '#fff', fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 150,
      render: (name: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{name}</span>
      ),
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 150,
      render: (name: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{name}</span>
      ),
    },
    {
      title: '请假日期',
      key: 'scheduleInfo',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            {record.scheduleDate}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.scheduleTime}
          </div>
        </div>
      ),
    },
    {
      title: '请假原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{reason}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: LeaveStatus) => {
        const config = statusConfig[status];
        return (
          <Tag
            style={{
              background: config.bg,
              border: `1px solid ${config.color}40`,
              color: config.color,
            }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '补课安排',
      key: 'makeup',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (record.makeupScheduleDate) {
          return (
            <Tag
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
              }}
            >
              已安排
            </Tag>
          );
        }
        return (
          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>未安排</span>
        );
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{time}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            style={{ color: '#00d4ff' }}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: '#00ff88' }}
                onClick={() => handleApprove(record, 'approved')}
              >
                通过
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                style={{ color: '#ff4d6a' }}
                onClick={() => handleApprove(record, 'rejected')}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && !record.makeupScheduleDate && (
            <Button
              type="text"
              size="small"
              icon={<CalendarOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleArrangeMakeup(record)}
            >
              安排补课
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 查看详情
  const handleViewDetail = (record: LeaveApplication) => {
    setCurrentRecord(record);
    setIsDetailModalOpen(true);
  };

  // 审批
  const handleApprove = async (record: LeaveApplication, status: 'approved' | 'rejected') => {
    Modal.confirm({
      title: `确认${status === 'approved' ? '通过' : '拒绝'}请假申请？`,
      content: `学员：${record.studentName}，课程：${record.courseName}`,
      onOk: async () => {
        try {
          await approveLeave({
            id: record.id,
            status,
          });
          message.success('操作成功');
          loadData();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  // 安排补课
  const handleArrangeMakeup = (record: LeaveApplication) => {
    setCurrentRecord(record);
    makeupForm.resetFields();
    setIsMakeupModalOpen(true);
  };

  // 提交补课安排
  const handleSubmitMakeup = async () => {
    if (!currentRecord) return;

    try {
      const values = await makeupForm.validateFields();
      await arrangeMakeup({
        id: currentRecord.id,
        makeupScheduleId: values.makeupScheduleId,
      });
      message.success('补课安排成功');
      setIsMakeupModalOpen(false);
      loadData();
    } catch (error) {
      message.error('补课安排失败');
    }
  };

  // 搜索
  const handleSearch = (value: string) => {
    setQueryParams({
      ...queryParams,
      page: 1,
      studentName: value,
    });
  };

  // 统计数据
  const stats = {
    total: dataSource.length,
    pending: dataSource.filter((item) => item.status === 'pending').length,
    approved: dataSource.filter((item) => item.status === 'approved').length,
    rejected: dataSource.filter((item) => item.status === 'rejected').length,
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <FileTextOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          请假管理
        </div>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>总申请数</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.pending}</div>
            <div style={styles.statLabel}>待审批</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.approved}</div>
            <div style={styles.statLabel}>已通过</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.rejected}</div>
            <div style={styles.statLabel}>已拒绝</div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索学员姓名"
            prefix={<SearchOutlined />}
            style={styles.searchInput}
            onPressEnter={(e) => handleSearch(e.currentTarget.value)}
          />
          <Input
            placeholder="搜索班级"
            style={styles.searchInput}
            onPressEnter={(e) =>
              setQueryParams({ ...queryParams, page: 1, className: e.currentTarget.value })
            }
          />
          <RangePicker
            style={{ width: 280 }}
            onChange={(dates) => {
              setQueryParams({
                ...queryParams,
                page: 1,
                startDate: dates?.[0]?.format('YYYY-MM-DD'),
                endDate: dates?.[1]?.format('YYYY-MM-DD'),
              });
            }}
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as LeaveStatus | 'all')}
          items={[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待审批' },
            { key: 'approved', label: '已通过' },
            { key: 'rejected', label: '已拒绝' },
          ]}
        />

        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, page, pageSize });
            },
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="请假详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="学员姓名">
              {currentRecord.studentName}
            </Descriptions.Item>
            <Descriptions.Item label="班级">
              {currentRecord.className}
            </Descriptions.Item>
            <Descriptions.Item label="课程">
              {currentRecord.courseName}
            </Descriptions.Item>
            <Descriptions.Item label="请假日期">
              {currentRecord.scheduleDate} {currentRecord.scheduleTime}
            </Descriptions.Item>
            <Descriptions.Item label="请假原因" span={2}>
              {currentRecord.reason}
            </Descriptions.Item>
            <Descriptions.Item label="申请时间" span={2}>
              {currentRecord.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="审批状态">
              <Tag
                style={{
                  background: statusConfig[currentRecord.status].bg,
                  border: `1px solid ${statusConfig[currentRecord.status].color}40`,
                  color: statusConfig[currentRecord.status].color,
                }}
              >
                {statusConfig[currentRecord.status].text}
              </Tag>
            </Descriptions.Item>
            {currentRecord.approveTime && (
              <Descriptions.Item label="审批时间">
                {currentRecord.approveTime}
              </Descriptions.Item>
            )}
            {currentRecord.approveBy && (
              <Descriptions.Item label="审批人">
                {currentRecord.approveBy}
              </Descriptions.Item>
            )}
            {currentRecord.approveRemark && (
              <Descriptions.Item label="审批备注" span={2}>
                {currentRecord.approveRemark}
              </Descriptions.Item>
            )}
            {currentRecord.makeupScheduleDate && (
              <Descriptions.Item label="补课安排" span={2}>
                {currentRecord.makeupScheduleDate} {currentRecord.makeupScheduleTime}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 安排补课弹窗 */}
      <Modal
        title="安排补课"
        open={isMakeupModalOpen}
        onCancel={() => setIsMakeupModalOpen(false)}
        onOk={handleSubmitMakeup}
        width={500}
      >
        <Form form={makeupForm} layout="vertical">
          <Form.Item
            label="补课课程"
            name="makeupScheduleId"
            rules={[{ required: true, message: '请选择补课课程' }]}
          >
            <Select
              placeholder="请选择补课课程"
              options={[
                { value: 1, label: '2024-02-05 09:00-11:00 - 少儿编程初级班' },
                { value: 2, label: '2024-02-06 14:00-16:00 - 少儿编程初级班' },
                { value: 3, label: '2024-02-07 09:00-11:00 - 少儿编程初级班' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default LeaveManagementPage;
