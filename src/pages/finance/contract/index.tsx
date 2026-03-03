import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  UserOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import ContractPrintModal from '@/components/ContractPrintModal';
import BatchPrintModal from '@/components/BatchPrintModal';
import {
  getContractList,
  exportContractList,
} from '@/api/contract';
import type { Contract, ContractQueryParams } from '@/types/contract';

interface ContractRow extends Contract {
  totalHours?: number;
  remainingHours?: number;
}

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
  statsBar: {
    display: 'flex',
    gap: 24,
    marginBottom: 20,
    padding: '16px 20px',
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(0, 212, 255, 0.1)',
    flexWrap: 'wrap' as const,
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

const statusConfig: Record<
  ContractRow['status'],
  { color: string; text: string; bg: string }
> = {
  draft: { color: '#8c8c8c', text: '草稿', bg: 'rgba(140, 140, 140, 0.1)' },
  active: { color: '#00ff88', text: '生效中', bg: 'rgba(0, 255, 136, 0.1)' },
  expired: { color: '#ffaa00', text: '已到期', bg: 'rgba(255, 170, 0, 0.1)' },
  terminated: { color: '#ff4d6a', text: '已终止', bg: 'rgba(255, 77, 106, 0.1)' },
  refunded: { color: '#9254de', text: '已退费', bg: 'rgba(146, 84, 222, 0.1)' },
};

const normalizeContractList = (response: unknown): { list: ContractRow[]; total: number } => {
  const raw = response as
    | { list?: ContractRow[]; total?: number; data?: { list?: ContractRow[]; total?: number } }
    | undefined;

  const payload = raw?.data && Array.isArray(raw.data.list) ? raw.data : raw;
  const list = Array.isArray(payload?.list) ? payload.list : [];
  const total = typeof payload?.total === 'number' ? payload.total : list.length;

  return { list, total };
};

const getKeywordQuery = (keyword: string): Pick<ContractQueryParams, 'contractNo' | 'studentName'> => {
  if (!keyword) {
    return {};
  }

  if (/^[A-Za-z0-9-]+$/.test(keyword)) {
    return { contractNo: keyword };
  }

  return { studentName: keyword };
};

function ContractList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [total, setTotal] = useState(0);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [batchPrintModalVisible, setBatchPrintModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<ContractRow[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const loadData = async () => {
    setLoading(true);
    try {
      const params: ContractQueryParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...getKeywordQuery(searchKeyword.trim()),
      };

      const response = await getContractList(params);
      const pageResult = normalizeContractList(response);
      setContracts(pageResult.list);
      setTotal(pageResult.total);
    } catch {
      message.error('加载合同列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [pagination.current, pagination.pageSize, searchKeyword]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSearchKeyword(searchInput);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchKeyword('');
    setPagination({ current: 1, pageSize: 10 });
  };

  const handleRefresh = () => {
    void loadData();
  };

  const handleExport = async () => {
    try {
      await exportContractList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...getKeywordQuery(searchKeyword.trim()),
      });
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  const handlePrint = (contract: ContractRow) => {
    setSelectedContract(contract);
    setPrintModalVisible(true);
  };

  const handleBatchPrint = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要打印的合同');
      return;
    }
    setBatchPrintModalVisible(true);
  };

  const handleTableChange = (pager: TablePaginationConfig) => {
    setPagination({
      current: pager.current || 1,
      pageSize: pager.pageSize || 10,
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[], selectedRecords: ContractRow[]) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedRows(selectedRecords);
    },
  };

  const stats = useMemo(() => {
    const activeCount = contracts.filter((item) => item.status === 'active').length;
    const totalAmount = contracts.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    return {
      count: total,
      activeCount,
      totalAmount,
    };
  }, [contracts, total]);

  const columns: ColumnsType<ContractRow> = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 160,
      render: (no: string) => (
        <span style={{ color: '#00d4ff', fontWeight: 500 }}>{no}</span>
      ),
    },
    {
      title: '学生信息',
      key: 'student',
      width: 220,
      render: (_, record) => (
        <Space>
          <Avatar
            size={36}
            icon={<UserOutlined />}
            src={record.studentAvatar}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 500 }}>{record.studentName}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
              {record.studentPhone || '-'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '合同金额',
      key: 'amount',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
            ¥{(record.totalAmount || 0).toLocaleString()}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            已付: ¥{(record.paidAmount || 0).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '课时情况',
      key: 'hours',
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            总课时: {record.totalHours ?? '-'}
          </div>
          <div
            style={{
              color:
                typeof record.remainingHours === 'number'
                  ? record.remainingHours > 10
                    ? '#00ff88'
                    : record.remainingHours > 0
                      ? '#ffaa00'
                      : '#ff4d6a'
                  : 'rgba(255, 255, 255, 0.5)',
              fontSize: 12,
            }}
          >
            剩余: {typeof record.remainingHours === 'number' ? `${record.remainingHours} 课时` : '-'}
          </div>
        </div>
      ),
    },
    {
      title: '有效期',
      key: 'date',
      width: 190,
      render: (_, record) => (
        <div>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12 }}>
            签约: {record.signDate}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            到期: {record.endDate}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: ContractRow['status']) => {
        const config = statusConfig[status] || statusConfig.draft;
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
              onClick={() => navigate(`/finance/contract/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#00ff88' }}
              onClick={() => navigate(`/finance/contract/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="打印">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              style={{ color: '#ffaa00' }}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <FileTextOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          合同管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={() => message.info('请先在后续版本接入新增合同表单')}
          >
            新增合同
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={handleBatchPrint}
            disabled={selectedRows.length === 0}
          >
            批量打印 {selectedRows.length > 0 && `(${selectedRows.length})`}
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.count}</div>
            <div style={styles.statLabel}>总合同数</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.activeCount}</div>
            <div style={styles.statLabel}>生效中</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>¥{stats.totalAmount.toLocaleString()}</div>
            <div style={styles.statLabel}>当前页合同总额</div>
          </div>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索合同编号、学生姓名"
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (value) => `共 ${value} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {selectedContract && (
        <ContractPrintModal
          visible={printModalVisible}
          contractId={selectedContract.id}
          contractNo={selectedContract.contractNo}
          onClose={() => {
            setPrintModalVisible(false);
            setSelectedContract(null);
          }}
          onSuccess={() => {
            message.success('打印成功');
          }}
        />
      )}

      <BatchPrintModal
        visible={batchPrintModalVisible}
        contracts={selectedRows.map((row) => ({
          id: row.id,
          contractNo: row.contractNo,
          studentName: row.studentName,
        }))}
        onClose={() => setBatchPrintModalVisible(false)}
        onSuccess={() => {
          setSelectedRowKeys([]);
          setSelectedRows([]);
        }}
      />
    </div>
  );
}

export default ContractList;
