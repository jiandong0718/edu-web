import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  ReadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import { getCourseList } from '@/api/course';
import type { Course, CourseQueryParams } from '@/types/course';

const categoryColors: Record<string, string> = {
  编程: '#00d4ff',
  数学: '#00ff88',
  英语: '#ffaa00',
  艺术: '#ff6b9d',
  音乐: '#a855f7',
};

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

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStatus = (value: unknown): Course['status'] => {
  if (value === 1 || value === '1' || value === 'active' || value === 'enabled') {
    return 'active';
  }
  return 'inactive';
};

const normalizeCourse = (item: Record<string, unknown>): Course => {
  const id = toNumber(item.id, 0);
  const name = typeof item.name === 'string' ? item.name : `课程#${id}`;
  const category =
    typeof item.category === 'string'
      ? item.category
      : typeof item.categoryName === 'string'
        ? item.categoryName
        : '未分类';

  return {
    id,
    name,
    category,
    price: toNumber(item.price),
    totalHours: toNumber(item.totalHours ?? item.hours ?? item.classHours),
    studentCount: toNumber(item.studentCount ?? item.currentStudents),
    status: normalizeStatus(item.status),
    description: typeof item.description === 'string' ? item.description : '',
    createTime:
      typeof item.createTime === 'string'
        ? item.createTime
        : typeof item.createdAt === 'string'
          ? item.createdAt
          : '-',
  };
};

const normalizeCoursePage = (response: unknown): { list: Course[]; total: number } => {
  const raw = response as
    | {
      list?: unknown[];
      total?: number;
      data?: { list?: unknown[]; total?: number } | unknown[];
    }
    | unknown[]
    | undefined;

  const payload =
    raw && !Array.isArray(raw) && raw.data && !Array.isArray(raw.data) && Array.isArray(raw.data.list)
      ? raw.data
      : raw;

  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { list?: unknown[] } | undefined)?.list)
      ? (payload as { list: unknown[] }).list
      : raw && !Array.isArray(raw) && Array.isArray(raw.data)
        ? raw.data
        : [];

  const list = rawList
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(normalizeCourse);

  const total =
    !Array.isArray(payload) && typeof (payload as { total?: number } | undefined)?.total === 'number'
      ? (payload as { total: number }).total
      : list.length;

  return { list, total };
};

function CourseList() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params: CourseQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };

      if (queryKeyword) {
        params.name = queryKeyword;
      }

      const response = await getCourseList(params);
      const pageResult = normalizeCoursePage(response);
      setCourses(pageResult.list);
      setTotal(pageResult.total);
    } catch {
      message.error('加载课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [pagination.current, pagination.pageSize, queryKeyword]);

  const stats = useMemo(() => {
    const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
    const activeCount = courses.filter((c) => c.status === 'active').length;

    return {
      totalCourses: total || courses.length,
      activeCount,
      totalStudents,
    };
  }, [courses, total]);

  const columns: ColumnsType<Course> = [
    {
      title: '课程名称',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.description || '-'}
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string | undefined) => {
        const displayCategory = category || '未分类';
        const color = categoryColors[displayCategory] || '#00d4ff';
        return (
          <Tag
            style={{
              background: `${color}15`,
              border: `1px solid ${color}40`,
              color,
            }}
          >
            {displayCategory}
          </Tag>
        );
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <span style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
          ¥{price.toLocaleString()}
        </span>
      ),
    },
    {
      title: '课时',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 100,
      align: 'center',
      render: (hours: number) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#00d4ff' }} />
          <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{hours} 课时</span>
        </Space>
      ),
    },
    {
      title: '学员数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 150,
      sorter: (a, b) => a.studentCount - b.studentCount,
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={Math.min(count * 2, 100)}
            size="small"
            strokeColor={{
              '0%': '#00d4ff',
              '100%': '#0099ff',
            }}
            trailColor="rgba(255, 255, 255, 0.1)"
            showInfo={false}
            style={{ width: 60, marginBottom: 0 }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.85)', marginLeft: 8 }}>{count}</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: Course['status']) => (
        <Tag
          style={{
            background: status === 'active' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: `1px solid ${status === 'active' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 77, 106, 0.3)'}`,
            color: status === 'active' ? '#00ff88' : '#ff4d6a',
          }}
        >
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (date: string | undefined) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{date || '-'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => message.info(`查看: ${record.name}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00ff88' }}
              onClick={() => message.info(`编辑: ${record.name}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setQueryKeyword(searchInput.trim());
  };

  const handleRefresh = () => {
    void loadData();
  };

  const handleTableChange = (pager: TablePaginationConfig) => {
    setPagination({
      current: pager.current || 1,
      pageSize: pager.pageSize || 10,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <ReadOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          课程管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={() => message.info('请先在后端完成课程新增接口联调')}
          >
            新增课程
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.totalCourses}</div>
            <div style={styles.statLabel}>总课程数</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.activeCount}</div>
            <div style={styles.statLabel}>当前页启用课程</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.totalStudents}</div>
            <div style={styles.statLabel}>当前页总学员数</div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索课程名称"
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ width: 280 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
          }}
        />
      </Card>
    </div>
  );
}

export default CourseList;
