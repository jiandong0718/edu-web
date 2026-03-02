import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ImportOutlined,
  UserAddOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { getLeadList, batchAssignLeads, autoAssignLeads, deleteLead } from '@/api/lead';
import { getAdvisorList } from '@/api/user';
import type { Lead, LeadQueryParams } from '@/types/lead';
import type { User } from '@/api/user';

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
  },
  card: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
  },
  searchBar: {
    marginBottom: 16,
    padding: 16,
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 8,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
};

const statusMap: Record<string, { text: string; color: string }> = {
  new: { text: '新线索', color: '#00d4ff' },
  following: { text: '跟进中', color: '#0099ff' },
  appointed: { text: '已预约', color: '#00ff88' },
  trialed: { text: '已试听', color: '#ffaa00' },
  converted: { text: '已成交', color: '#00ff00' },
  lost: { text: '已流失', color: '#ff4d6a' },
};

const sourceMap: Record<string, string> = {
  offline: '地推',
  referral: '转介绍',
  online_ad: '线上广告',
  walk_in: '自然到访',
  phone: '电话咨询',
};

const intentLevelMap: Record<string, { text: string; color: string }> = {
  high: { text: '高', color: '#ff4d6a' },
  medium: { text: '中', color: '#ffaa00' },
  low: { text: '低', color: '#00d4ff' },
};

export function Component() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [autoAssignModalVisible, setAutoAssignModalVisible] = useState(false);
  const [advisorList, setAdvisorList] = useState<User[]>([]);
  const [form] = Form.useForm();
  const [autoAssignForm] = Form.useForm();

  const [queryParams, setQueryParams] = useState<LeadQueryParams>({
    page: 1,
    pageSize: 10,
  });

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getLeadList(queryParams);
      setDataSource(res.list);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载顾问列表
  const loadAdvisors = async () => {
    try {
      const res = await getAdvisorList();
      setAdvisorList(res);
    } catch (error: any) {
      message.error('加载顾问列表失败');
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  useEffect(() => {
    loadAdvisors();
  }, []);

  // 搜索
  const handleSearch = (values: any) => {
    setQueryParams({
      ...queryParams,
      page: 1,
      ...values,
    });
  };

  // 重置
  const handleReset = () => {
    setQueryParams({
      page: 1,
      pageSize: 10,
    });
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteLead(id);
      message.success('删除成功');
      loadData();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 打开分配弹窗
  const handleOpenAssignModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要分配的线索');
      return;
    }
    setAssignModalVisible(true);
  };

  // 手动分配
  const handleAssign = async () => {
    try {
      const values = await form.validateFields();
      await batchAssignLeads(selectedRowKeys as number[], values.advisorId);
      message.success('分配成功');
      setAssignModalVisible(false);
      setSelectedRowKeys([]);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.message || '分配失败');
    }
  };

  // 打开自动分配弹窗
  const handleOpenAutoAssignModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要分配的线索');
      return;
    }
    setAutoAssignModalVisible(true);
  };

  // 自动分配
  const handleAutoAssign = async () => {
    try {
      const values = await autoAssignForm.validateFields();
      await autoAssignLeads(selectedRowKeys as number[], values.campusId);
      message.success('自动分配成功');
      setAutoAssignModalVisible(false);
      setSelectedRowKeys([]);
      autoAssignForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.message || '自动分配失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<Lead> = [
    {
      title: '线索编号',
      dataIndex: 'leadNo',
      key: 'leadNo',
      width: 150,
      fixed: 'left',
      render: (text: string) => <span style={{ color: '#00d4ff' }}>{text}</span>,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      fixed: 'left',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 60,
      render: (gender: number) => (gender === 1 ? '男' : gender === 2 ? '女' : '未知'),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 60,
    },
    {
      title: '学校',
      dataIndex: 'school',
      key: 'school',
      width: 150,
      ellipsis: true,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => sourceMap[source] || source,
    },
    {
      title: '意向程度',
      dataIndex: 'intentLevel',
      key: 'intentLevel',
      width: 100,
      render: (level: string) => {
        const config = intentLevelMap[level];
        return config ? (
          <Tag color={config.color}>{config.text}</Tag>
        ) : (
          <span>{level}</span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusMap[status];
        return config ? (
          <Tag color={config.color}>{config.text}</Tag>
        ) : (
          <span>{status}</span>
        );
      },
    },
    {
      title: '跟进顾问',
      dataIndex: 'advisorName',
      key: 'advisorName',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '跟进次数',
      dataIndex: 'followCount',
      key: 'followCount',
      width: 100,
      align: 'center',
    },
    {
      title: '最后跟进时间',
      dataIndex: 'lastFollowTime',
      key: 'lastFollowTime',
      width: 180,
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Lead) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => navigate(`/marketing/lead/${record.id}`)}>
            详情
          </Button>
          <Popconfirm
            title="确定删除该线索吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>线索管理</div>
        <Space>
          <Button
            type="primary"
            icon={<ImportOutlined />}
            onClick={() => navigate('/marketing/lead/import')}
            style={styles.actionButton}
          >
            批量导入
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/marketing/lead/create')}
            style={styles.actionButton}
          >
            新增线索
          </Button>
        </Space>
      </div>

      {/* 搜索栏 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.searchBar}>
          <Form layout="inline" onFinish={handleSearch}>
            <Form.Item name="name">
              <Input placeholder="姓名" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="phone">
              <Input placeholder="手机号" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="status">
              <Select placeholder="状态" style={{ width: 120 }} allowClear>
                {Object.entries(statusMap).map(([key, value]) => (
                  <Select.Option key={key} value={key}>
                    {value.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="source">
              <Select placeholder="来源" style={{ width: 120 }} allowClear>
                {Object.entries(sourceMap).map(([key, value]) => (
                  <Select.Option key={key} value={key}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="intentLevel">
              <Select placeholder="意向程度" style={{ width: 120 }} allowClear>
                {Object.entries(intentLevelMap).map(([key, value]) => (
                  <Select.Option key={key} value={key}>
                    {value.text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        {/* 批量操作 */}
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                已选择 {selectedRowKeys.length} 项
              </span>
              <Button
                icon={<UserAddOutlined />}
                onClick={handleOpenAssignModal}
              >
                手动分配
              </Button>
              <Button
                icon={<TeamOutlined />}
                onClick={handleOpenAutoAssignModal}
              >
                自动分配
              </Button>
              <Button onClick={() => setSelectedRowKeys([])}>取消选择</Button>
            </Space>
          </div>
        )}

        {/* 表格 */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{ x: 1800 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, page, pageSize });
            },
          }}
        />
      </Card>

      {/* 手动分配弹窗 */}
      <Modal
        title="手动分配线索"
        open={assignModalVisible}
        onOk={handleAssign}
        onCancel={() => {
          setAssignModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="选择顾问"
            name="advisorId"
            rules={[{ required: true, message: '请选择顾问' }]}
          >
            <Select
              placeholder="请选择顾问"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children || '')?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {advisorList.map((advisor) => (
                <Select.Option key={advisor.id} value={advisor.id}>
                  {advisor.realName} ({advisor.campusName || '未分配校区'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
            将选中的 {selectedRowKeys.length} 条线索分配给指定顾问
          </div>
        </Form>
      </Modal>

      {/* 自动分配弹窗 */}
      <Modal
        title="自动分配线索"
        open={autoAssignModalVisible}
        onOk={handleAutoAssign}
        onCancel={() => {
          setAutoAssignModalVisible(false);
          autoAssignForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={autoAssignForm} layout="vertical">
          <Form.Item
            label="选择校区"
            name="campusId"
            rules={[{ required: true, message: '请选择校区' }]}
          >
            <Select placeholder="请选择校区">
              {/* 这里应该从校区列表中获取，暂时使用顾问的校区 */}
              {Array.from(new Set(advisorList.map((a) => a.campusId))).map((campusId) => {
                const advisor = advisorList.find((a) => a.campusId === campusId);
                return (
                  <Select.Option key={campusId} value={campusId}>
                    {advisor?.campusName || `校区 ${campusId}`}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
            系统将根据该校区顾问的当前线索数量，自动均衡分配选中的 {selectedRowKeys.length} 条线索
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Component;
