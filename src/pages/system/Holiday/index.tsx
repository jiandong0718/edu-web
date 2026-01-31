import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Tooltip,
  Row,
  Col,
  Calendar,
  Badge,
  Radio,
  Popconfirm,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ReloadOutlined,
  TableOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { CommonTable } from '@/components/CommonTable';
import type {
  Holiday,
  HolidayQueryParams,
  HolidayFormData,
  HolidayType,
  HolidayStatus,
  HolidayStatistics,
} from '@/types/holiday';
import {
  getHolidayPage,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  exportHolidayList,
  importHolidays,
} from '@/api/holiday';

const { RangePicker } = DatePicker;

// 节假日类型选项
const TYPE_OPTIONS = [
  { label: '法定节假日', value: 'legal' },
  { label: '调休', value: 'compensatory' },
  { label: '公司假期', value: 'company' },
];

// 状态选项
const STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
];

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
    marginBottom: 20,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  viewSwitch: {
    marginBottom: 20,
  },
  calendarCard: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  modalContent: {
    background: '#1a1f2e',
    padding: 24,
    borderRadius: 8,
  },
};

export default function HolidayManagement() {
  const [loading, setLoading] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [statistics, setStatistics] = useState<HolidayStatistics>({
    total: 0,
    legalCount: 0,
    compensatoryCount: 0,
    companyCount: 0,
    totalDays: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [form] = Form.useForm();
  const [queryParams, setQueryParams] = useState<HolidayQueryParams>({
    page: 1,
    pageSize: 10,
    year: new Date().getFullYear(),
  });
  const [total, setTotal] = useState(0);

  // 获取节假日列表
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await getHolidayPage(queryParams);
      setHolidays(response.data.list);
      setTotal(response.data.total);

      // 计算统计数据
      const stats: HolidayStatistics = {
        total: response.data.list.length,
        legalCount: response.data.list.filter((h) => h.type === 'legal').length,
        compensatoryCount: response.data.list.filter((h) => h.type === 'compensatory').length,
        companyCount: response.data.list.filter((h) => h.type === 'company').length,
        totalDays: response.data.list.reduce((sum, h) => sum + h.days, 0),
      };
      setStatistics(stats);
    } catch (error) {
      message.error('获取节假日列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [queryParams]);

  const columns: ColumnsType<Holiday> = [
    {
      title: '节假日名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string) => (
        <div style={{ color: '#fff', fontWeight: 500 }}>{name}</div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'center',
      filters: [
        { text: '法定节假日', value: 'legal' },
        { text: '调休', value: 'compensatory' },
        { text: '公司假期', value: 'company' },
      ],
      render: (type: HolidayType) => {
        const config = {
          legal: { text: '法定节假日', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)', border: 'rgba(0, 255, 136, 0.3)' },
          compensatory: { text: '调休', color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.1)', border: 'rgba(255, 170, 0, 0.3)' },
          company: { text: '公司假期', color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)', border: 'rgba(0, 212, 255, 0.3)' },
        };
        const cfg = config[type];
        return (
          <Tag
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
            }}
          >
            {cfg.text}
          </Tag>
        );
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{date}</span>
      ),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{date}</span>
      ),
    },
    {
      title: '天数',
      dataIndex: 'days',
      key: 'days',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.days - b.days,
      render: (days: number) => (
        <Tag
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
          }}
        >
          {days}天
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      filters: [
        { text: '启用', value: 'enabled' },
        { text: '禁用', value: 'disabled' },
      ],
      render: (status: HolidayStatus) => {
        const config = {
          enabled: { text: '启用', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)' },
          disabled: { text: '禁用', color: '#ff4d6a', bg: 'rgba(255, 77, 106, 0.1)' },
        };
        const cfg = config[status];
        return (
          <Tag
            style={{
              background: cfg.bg,
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{remark || '-'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description={`确定要删除节假日"${record.name}"吗？`}
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

  // 处理搜索
  const handleSearch = (name: string) => {
    setQueryParams({ ...queryParams, name, page: 1 });
  };

  // 处理筛选
  const handleFilter = (key: string, value: any) => {
    setQueryParams({ ...queryParams, [key]: value, page: 1 });
  };

  // 处理新增
  const handleAdd = () => {
    setEditingHoliday(null);
    form.resetFields();
    form.setFieldsValue({ status: 'enabled' });
    setModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record: Holiday) => {
    setEditingHoliday(record);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      status: record.status,
      remark: record.remark,
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await deleteHoliday(id);
      message.success('删除成功');
      fetchHolidays();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange;

      const formData: HolidayFormData = {
        name: values.name,
        type: values.type,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        status: values.status || 'enabled',
        remark: values.remark,
      };

      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, formData);
        message.success('更新成功');
      } else {
        await createHoliday(formData);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchHolidays();
    } catch (error) {
      console.error('表单验证失败', error);
    }
  };

  // 处理刷新
  const handleRefresh = async () => {
    await fetchHolidays();
  };

  // 处理导出
  const handleExport = async () => {
    try {
      await exportHolidayList(queryParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 处理导入
  const handleImport = async (file: File) => {
    try {
      await importHolidays(file);
      message.success('导入成功');
      setImportModalVisible(false);
      fetchHolidays();
    } catch (error) {
      message.error('导入失败');
    }
    return false; // 阻止自动上传
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // 处理年份变化
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setQueryParams({ ...queryParams, year, page: 1 });
  };

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const holiday = holidays.find(
      (h) => dateStr >= h.startDate && dateStr <= h.endDate && h.status === 'enabled'
    );
    if (holiday) {
      const typeMap = {
        legal: 'success',
        compensatory: 'warning',
        company: 'processing',
      };
      return [{ type: typeMap[holiday.type] || 'default', content: holiday.name }];
    }
    return [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge
              status={item.type as any}
              text={item.content}
              style={{ fontSize: 11 }}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <CalendarOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          节假日管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={handleAdd}
          >
            新增节假日
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setImportModalVisible(true)}
          >
            批量导入
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{statistics.total}</div>
              <div style={styles.statLabel}>节假日总数</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#00ff88' }}>
                {statistics.legalCount}
              </div>
              <div style={styles.statLabel}>法定节假日</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: '#ffaa00' }}>
                {statistics.compensatoryCount}
              </div>
              <div style={styles.statLabel}>调休</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {statistics.totalDays}
              </div>
              <div style={styles.statLabel}>总天数</div>
            </div>
          </Col>
        </Row>

        <div style={styles.viewSwitch}>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="table">
              <TableOutlined /> 列表视图
            </Radio.Button>
            <Radio.Button value="calendar">
              <CalendarOutlined /> 日历视图
            </Radio.Button>
          </Radio.Group>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            style={{ width: 120, marginLeft: 12 }}
            options={[
              { label: '2023年', value: 2023 },
              { label: '2024年', value: 2024 },
              { label: '2025年', value: 2025 },
              { label: '2026年', value: 2026 },
            ]}
          />
        </div>

        {viewMode === 'table' ? (
          <>
            <div style={styles.filterBar}>
              <Input
                placeholder="搜索节假日名称"
                prefix={<SearchOutlined />}
                style={{ width: 280 }}
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Select
                placeholder="选择类型"
                style={{ width: 160 }}
                allowClear
                options={[{ label: '全部类型', value: undefined }, ...TYPE_OPTIONS]}
                onChange={(value) => handleFilter('type', value)}
              />
              <Select
                placeholder="选择状态"
                style={{ width: 140 }}
                allowClear
                options={[{ label: '全部状态', value: undefined }, ...STATUS_OPTIONS]}
                onChange={(value) => handleFilter('status', value)}
              />
            </div>
            <CommonTable<Holiday>
              columns={columns}
              dataSource={holidays}
              rowKey="id"
              loading={loading}
              pagination={{
                current: queryParams.page,
                pageSize: queryParams.pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              onChange={handleTableChange}
              showRefresh={false}
              exportable={true}
              onExport={handleExport}
              scroll={{ x: 1200 }}
            />
          </>
        ) : (
          <div style={styles.calendarCard}>
            <Calendar
              cellRender={dateCellRender}
              value={dayjs(`${selectedYear}-01-01`)}
            />
          </div>
        )}
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            {editingHoliday ? '编辑节假日' : '新增节假日'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
        okText="保存"
        cancelText="取消"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
            border: 'none',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
          },
        }}
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <div style={styles.modalContent}>
          <Form form={form} layout="vertical">
            <Form.Item
              label={<span style={{ color: '#fff' }}>节假日名称</span>}
              name="name"
              rules={[
                { required: true, message: '请输入节假日名称' },
                { max: 50, message: '节假日名称不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入节假日名称" />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#fff' }}>类型</span>}
              name="type"
              rules={[{ required: true, message: '请选择类型' }]}
            >
              <Select placeholder="请选择类型" options={TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#fff' }}>日期范围</span>}
              name="dateRange"
              rules={[{ required: true, message: '请选择日期范围' }]}
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#fff' }}>状态</span>}
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
              initialValue="enabled"
            >
              <Select placeholder="请选择状态" options={STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: '#fff' }}>备注</span>}
              name="remark"
            >
              <Input.TextArea
                rows={3}
                placeholder="请输入备注信息"
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal
        title={
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
            批量导入节假日
          </div>
        }
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={500}
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <div style={styles.modalContent}>
          <Upload.Dragger
            name="file"
            accept=".xlsx,.xls"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ color: '#00d4ff', fontSize: 48 }} />
            </p>
            <p className="ant-upload-text" style={{ color: '#fff' }}>
              点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              支持 .xlsx 和 .xls 格式文件
            </p>
          </Upload.Dragger>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => {
                // 下载模板
                message.info('下载模板功能待实现');
              }}
            >
              下载导入模板
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
