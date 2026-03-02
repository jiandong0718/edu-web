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
  Modal,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ImportOutlined,
  UserAddOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { getLeadList, deleteLead, exportLeadList } from '@/api/lead';
import type { Lead, LeadQueryParams } from '@/types/lead';
import LeadAssignModal from '@/components/LeadAssignModal';

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

// 状态映射
const statusMap: Record<string, { text: string; color: string }> = {
  new: { text: '新线索', color: '#00d4ff' },
  following: { text: '跟进中', color: '#0099ff' },
  appointed: { text: '已预约', color: '#00ff88' },
  trialed: { text: '已试听', color: '#ffa940' },
  converted: { text: '已成交', color: '#52c41a' },
  lost: { text: '已流失', color: '#ff4d6a' },
};

// 来源映射
const sourceMap: Record<string, string> = {
  offline: '地推',
  referral: '转介绍',
  online_ad: '线上广告',
  walk_in: '自然到访',
  phone: '电话咨询',
};

export function Component() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [queryParams, setQueryParams] = useState<LeadQueryParams>({
    page: 1,
    pageSize: 10,
  });

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getLeadList(queryParams);
      setDataSource(result.list);
      setTotal(result.total);
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
  const handleSearch = (values: any) => {
    setQueryParams({
      ...queryParams,
      ...values,
      page: 1,
    });
  };

  // 重置搜索
  const handleReset = () => {
    setQueryParams({
      page: 1,
      pageSize: 10,
    });
  };

  // 删除
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条线索吗？',
      onOk: async () => {
        try {
          await deleteLead(id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 导出
  const handleExport = async () => {
    try {
      await exportLeadList(queryParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 批量分配
  const handleBatchAssign = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要分配的线索');
      return;
    }
    setAssignModalVisible(true);
  };

  // 分配成功
  const handleAssignSuccess = () => {
    setAssignModalVisible(false);
    setSelectedRowKeys([]);
    loadData();
  };

  // 表格列定义
  const columns: ColumnsType<Lead> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: string) => (gender === 'male' ? '男' : '女'),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: string) => sourceMap[source] || source,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status];
        return (
          <Tag color={statusInfo?.color || 'default'}>
            {statusInfo?.text || status}
          </Tag>
        );
      },
    },
    {
      title: '跟进顾问',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      width: 120,
      render: (name: string) => name || '-',
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
      render: (time: string) => time || '-',
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
      width: 180,
      fixed: 'right',
      render: (_: any, record: Lead) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/lead/detail/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/lead/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
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
            icon={<ImportOutlined />}
            onClick={() => navigate('/lead/import')}
          >
            批量导入
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/lead/create')}
            style={styles.actionButton}
          >
            新增线索
          </Button>
        </Space>
      </div>

      {/* 搜索栏 */}
      <Card style={styles.card} bordered={false}>
        <div style={styles.searchBar}>
          <Space size="middle" wrap>
            <Input
              placeholder="搜索姓名"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => handleSearch({ name: e.target.value })}
            />
            <Input
              placeholder="搜索手机号"
              style={{ width: 200 }}
              onChange={(e) => handleSearch({ phone: e.target.value })}
            />
            <Select
              placeholder="选择状态"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleSearch({ status: value })}
            >
              {Object.entries(statusMap).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value.text}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="选择来源"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleSearch({ source: value })}
            >
              {Object.entries(sourceMap).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
            <Button onClick={handleReset}>重置</Button>
          </Space>
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
                onClick={handleBatchAssign}
              >
                批量分配
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
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
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
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* 分配弹窗 */}
      <LeadAssignModal
        visible={assignModalVisible}
        leadIds={selectedRowKeys}
        onCancel={() => setAssignModalVisible(false)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}

export default Component;
