import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Tooltip,
  message,
  Modal,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { CommonTable } from '@/components/CommonTable';
import type { ColumnsType } from 'antd/es/table';
import type { Teacher, TeacherQueryParams, TeacherStatus } from '@/types/teacher';
import {
  getTeacherList,
  deleteTeacher,
  exportTeacherList,
} from '@/api/teacher';
import { useNavigate } from 'react-router-dom';
import TeacherForm from './TeacherForm';

const { Search } = Input;
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
    marginBottom: 20,
  },
  filterBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  statCard: {
    background: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#00d4ff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

// 教师状态映射
const statusMap: Record<TeacherStatus, { text: string; color: string; bgColor: string }> = {
  active: { text: '在职', color: '#00ff88', bgColor: 'rgba(0, 255, 136, 0.1)' },
  inactive: { text: '休假', color: '#ffaa00', bgColor: 'rgba(255, 170, 0, 0.1)' },
  leave: { text: '离职', color: '#ff4d6a', bgColor: 'rgba(255, 77, 106, 0.1)' },
};

// 统计数据接口
interface TeacherStatistics {
  total: number;
  active: number;
  inactive: number;
  leave: number;
}

export function Component() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState<TeacherStatistics>({
    total: 0,
    active: 0,
    inactive: 0,
    leave: 0,
  });
  const [queryParams, setQueryParams] = useState<TeacherQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<number>();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTeacherList(queryParams);
      setDataSource(res.list);
      setTotal(res.total);

      // 计算统计数据
      const stats: TeacherStatistics = {
        total: res.total,
        active: res.list.filter(t => t.status === 'active').length,
        inactive: res.list.filter(t => t.status === 'inactive').length,
        leave: res.list.filter(t => t.status === 'leave').length,
      };
      setStatistics(stats);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 搜索
  const handleSearch = (value: string) => {
    setQueryParams({ ...queryParams, name: value, page: 1 });
  };

  // 筛选
  const handleFilter = (key: string, value: any) => {
    setQueryParams({ ...queryParams, [key]: value, page: 1 });
  };

  // 重置
  const handleReset = () => {
    setQueryParams({ page: 1, pageSize: 10 });
  };

  // 新增
  const handleAdd = () => {
    setEditingId(undefined);
    setFormVisible(true);
  };

  // 编辑
  const handleEdit = (id: number) => {
    setEditingId(id);
    setFormVisible(true);
  };

  // 查看详情
  const handleView = (id: number) => {
    navigate(`/teaching/teacher/${id}`);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteTeacher(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 导出
  const handleExport = async () => {
    try {
      await exportTeacherList(queryParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 刷新
  const handleRefresh = () => {
    loadData();
  };

  // 统计卡片点击筛选
  const handleStatClick = (status?: TeacherStatus) => {
    setQueryParams({ ...queryParams, status, page: 1 });
  };

  // 表格列定义
  const columns: ColumnsType<Teacher> = [
    {
      title: '教师信息',
      key: 'info',
      width: 240,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar
            size={44}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: '2px solid rgba(0, 212, 255, 0.3)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500 }}>{record.name}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              工号: {record.id.toString().padStart(6, '0')}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      align: 'center',
      render: (gender: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
          {gender === 'male' ? '男' : '女'}
        </span>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{phone}</span>
      ),
    },
    {
      title: '教授科目',
      dataIndex: 'subjects',
      key: 'subjects',
      width: 200,
      render: (subjects: string[]) => (
        <Space wrap>
          {subjects?.slice(0, 3).map((subject, index) => (
            <Tag
              key={index}
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                color: '#00ff88',
                fontSize: 11,
              }}
            >
              {subject}
            </Tag>
          ))}
          {subjects?.length > 3 && (
            <Tag
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
                fontSize: 11,
              }}
            >
              +{subjects.length - 3}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: TeacherStatus) => {
        const cfg = statusMap[status];
        return (
          <Tag
            style={{
              background: cfg.bgColor,
              border: `1px solid ${cfg.color}40`,
              color: cfg.color,
            }}
          >
            {cfg.text}
          </Tag>
        );
      },
    },
    {
      title: '入职时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
      render: (date: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{date}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description={`确定要删除教师"${record.name}"吗？`}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{
              style: {
                background: 'linear-gradient(135deg, #ff4d6a 0%, #ff1744 100%)',
                border: 'none',
              },
            }}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: '#ff4d6a' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <TeamOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          教师管理
        </div>
        <Space>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
            }}
          >
            导出
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={styles.actionButton}
          >
            新增教师
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onClick={() => handleStatClick(undefined)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 212, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.statValue}>{statistics.total}</div>
              <div style={styles.statLabel}>教师总数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onClick={() => handleStatClick('active')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 255, 136, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ ...styles.statValue, color: '#00ff88' }}>
                {statistics.active}
              </div>
              <div style={styles.statLabel}>在职教师</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onClick={() => handleStatClick('inactive')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 170, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ ...styles.statValue, color: '#ffaa00' }}>
                {statistics.inactive}
              </div>
              <div style={styles.statLabel}>休假教师</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={styles.card} bordered={false}>
            <div
              style={styles.statCard}
              onClick={() => handleStatClick('leave')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 106, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ ...styles.statValue, color: '#ff4d6a' }}>
                {statistics.leave}
              </div>
              <div style={styles.statLabel}>离职教师</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选栏和表格 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Search
            placeholder="搜索教师姓名或工号"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            onSearch={handleSearch}
          />
          <Input
            placeholder="手机号"
            allowClear
            style={{ width: 160 }}
            onChange={(e) => handleFilter('phone', e.target.value)}
          />
          <Select
            placeholder="教授科目"
            allowClear
            style={{ width: 140 }}
            onChange={(value) => handleFilter('subject', value)}
          >
            <Option value="语文">语文</Option>
            <Option value="数学">数学</Option>
            <Option value="英语">英语</Option>
            <Option value="物理">物理</Option>
            <Option value="化学">化学</Option>
            <Option value="生物">生物</Option>
            <Option value="历史">历史</Option>
            <Option value="地理">地理</Option>
            <Option value="政治">政治</Option>
          </Select>
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 120 }}
            value={queryParams.status}
            onChange={(value) => handleFilter('status', value)}
          >
            <Option value="active">在职</Option>
            <Option value="inactive">休假</Option>
            <Option value="leave">离职</Option>
          </Select>
          <Button onClick={handleReset}>重置</Button>
        </div>

        {/* 表格 */}
        <CommonTable<Teacher>
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={(pagination) => {
            setQueryParams({
              ...queryParams,
              page: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            });
          }}
          scroll={{ x: 1400 }}
          showRefresh={false}
          exportable={false}
        />
      </Card>

      {/* 新增/编辑表单 */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            {editingId ? '编辑教师' : '新增教师'}
          </div>
        }
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
        styles={{
          body: { background: '#1a1f2e', padding: 0 },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <TeacherForm
          id={editingId}
          onSuccess={() => {
            setFormVisible(false);
            loadData();
          }}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>
    </div>
  );
}

export default Component;
