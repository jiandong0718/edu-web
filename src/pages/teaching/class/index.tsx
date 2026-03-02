import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  message,
  Tooltip,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Class, ClassQueryParams, ClassStatus, ClassType } from '@/types/class';
import { getClassList, deleteClass } from '@/api/class';

const { Search } = Input;
const { Option } = Select;

const styles = {
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
  },
  searchBar: {
    marginBottom: 16,
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
};

// 班级状态映射
const classStatusMap: Record<string, { text: string; color: string; bgColor: string }> = {
  pending: { text: '未开班', color: '#ffaa00', bgColor: 'rgba(255, 170, 0, 0.1)' },
  active: { text: '进行中', color: '#00ff88', bgColor: 'rgba(0, 255, 136, 0.1)' },
  completed: { text: '已结业', color: '#00d4ff', bgColor: 'rgba(0, 212, 255, 0.1)' },
  cancelled: { text: '已取消', color: '#ff4d6a', bgColor: 'rgba(255, 77, 106, 0.1)' },
};

// 班级类型映射
const classTypeMap: Record<string, string> = {
  regular: '常规班',
  trial: '试听班',
  intensive: '集训班',
};

export default function Component() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Class[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<ClassQueryParams>({
    page: 1,
    pageSize: 10,
  });

  // 加载班级列表
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getClassList(queryParams);
      setDataSource(response.list);
      setTotal(response.total);
    } catch (error) {
      message.error('加载班级列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 搜索
  const handleSearch = (value: string) => {
    setQueryParams({
      ...queryParams,
      name: value,
      page: 1,
    });
  };

  // 状态筛选
  const handleStatusChange = (value: string) => {
    setQueryParams({
      ...queryParams,
      status: (value || undefined) as ClassStatus | undefined,
      page: 1,
    });
  };

  // 类型筛选
  const handleTypeChange = (value: string) => {
    setQueryParams({
      ...queryParams,
      type: (value || undefined) as ClassType | undefined,
      page: 1,
    });
  };

  // 重置
  const handleReset = () => {
    setQueryParams({
      page: 1,
      pageSize: 10,
    });
  };

  // 查看详情
  const handleView = (record: Class) => {
    navigate(`/teaching/class/${record.id}`);
  };

  // 编辑
  const handleEdit = (record: Class) => {
    navigate(`/teaching/class/edit/${record.id}`);
  };

  // 删除
  const handleDelete = async (record: Class) => {
    try {
      await deleteClass(record.id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 新增
  const handleAdd = () => {
    navigate('/teaching/class/add');
  };

  // 表格列
  const columns: ColumnsType<Class> = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text: string) => <span style={{ color: '#fff', fontWeight: 600 }}>{text}</span>,
    },
    {
      title: '班级编号',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 150,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '授课教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
      width: 120,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '班级类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
          }}
        >
          {classTypeMap[type]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = classStatusMap[status];
        return (
          <Tag
            style={{
              background: statusInfo.bgColor,
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
      title: '班级人数',
      key: 'students',
      width: 120,
      render: (_, record) => (
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>
          {record.currentStudents} / {record.capacity}
        </span>
      ),
    },
    {
      title: '课程进度',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        const percent = record.totalHours > 0
          ? Math.round((record.completedHours / record.totalHours) * 100)
          : 0;
        return (
          <div style={{ width: 120 }}>
            <Progress
              percent={percent}
              size="small"
              strokeColor={{
                '0%': '#00d4ff',
                '100%': '#0099ff',
              }}
              format={(p) => (
                <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12 }}>
                  {record.completedHours}/{record.totalHours}h
                </span>
              )}
            />
          </div>
        );
      },
    },
    {
      title: '开班日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '校区',
      dataIndex: 'campusName',
      key: 'campusName',
      width: 120,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{text}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d6a' }}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>班级管理</span>}
      style={styles.card}
      bordered={false}
    >
      {/* 搜索栏 */}
      <div style={styles.searchBar}>
        <Search
          placeholder="搜索班级名称或编号"
          allowClear
          enterButton={<SearchOutlined />}
          style={{ width: 300 }}
          onSearch={handleSearch}
        />
        <Select
          placeholder="班级状态"
          allowClear
          style={{ width: 150 }}
          onChange={handleStatusChange}
          value={queryParams.status}
        >
          <Option value="">全部状态</Option>
          <Option value="pending">未开班</Option>
          <Option value="active">进行中</Option>
          <Option value="completed">已结业</Option>
          <Option value="cancelled">已取消</Option>
        </Select>
        <Select
          placeholder="班级类型"
          allowClear
          style={{ width: 150 }}
          onChange={handleTypeChange}
          value={queryParams.type}
        >
          <Option value="">全部类型</Option>
          <Option value="regular">常规班</Option>
          <Option value="trial">试听班</Option>
          <Option value="intensive">集训班</Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          重置
        </Button>
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={styles.actionButton}
        >
          新增班级
        </Button>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setQueryParams({
              ...queryParams,
              page,
              pageSize,
            });
          },
        }}
        style={{
          background: '#111827',
        }}
      />
    </Card>
  );
}
