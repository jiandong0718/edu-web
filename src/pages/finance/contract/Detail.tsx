import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Modal,
  Tabs,
  Breadcrumb,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  StopOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  EyeOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getContractDetail,
  getContractItems,
  getPaymentRecords,
  getHourAccounts,
  cancelContract,
} from '@/api/contract';
import type {
  Contract,
  ContractItem,
  PaymentRecord,
  HourAccount,
} from '@/types/contract';
import ContractPrintModal from '@/components/ContractPrintModal';
import './Detail.less';

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [items, setItems] = useState<ContractItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [hourAccounts, setHourAccounts] = useState<HourAccount[]>([]);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // 加载合同详情
  const loadContractDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [contractRes, itemsRes, paymentsRes, accountsRes] = await Promise.all([
        getContractDetail(Number(id)),
        getContractItems(Number(id)),
        getPaymentRecords(Number(id)),
        getHourAccounts(Number(id)),
      ]);
      setContract(contractRes);
      setItems(itemsRes);
      setPayments(paymentsRes);
      setHourAccounts(accountsRes);
    } catch (error) {
      message.error('加载合同详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractDetail();
  }, [id]);

  // 状态标签
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: '#999', text: '草稿' },
      active: { color: '#00ff88', text: '已签署' },
      expired: { color: '#ffaa00', text: '已到期' },
      terminated: { color: '#ff4d6a', text: '已作废' },
    };
    const config = statusMap[status] || { color: '#999', text: status };
    return (
      <Tag
        style={{
          background: `${config.color}20`,
          border: `1px solid ${config.color}`,
          color: config.color,
        }}
      >
        {config.text}
      </Tag>
    );
  };

  // 支付方式标签
  const getPaymentMethodTag = (method: string) => {
    const methodMap: Record<string, string> = {
      cash: '现金',
      wechat: '微信',
      alipay: '支付宝',
      bank_transfer: '银行转账',
      pos: 'POS机',
    };
    return methodMap[method] || method;
  };

  // 打印合同
  const handlePrint = () => {
    setPrintModalVisible(true);
  };

  // 作废合同
  const handleCancel = () => {
    Modal.confirm({
      title: '确认作废合同',
      content: '作废后合同将无法恢复，确定要作废这个合同吗？',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        try {
          await cancelContract(Number(id));
          message.success('合同已作废');
          loadContractDetail();
        } catch (error) {
          message.error('作废失败');
        }
      },
    });
  };

  // 返回列表
  const handleBack = () => {
    navigate('/finance/contract');
  };

  // 查看收据
  const handleViewReceipt = (paymentId: number) => {
    message.info(`查看收据: ${paymentId}`);
    // TODO: 实现查看收据功能
  };

  // 打印收据
  const handlePrintReceipt = (paymentId: number) => {
    message.info(`打印收据: ${paymentId}`);
    // TODO: 实现打印收据功能
  };

  // 查看消课记录
  const handleViewConsumption = (accountId: number) => {
    message.info(`查看消课记录: ${accountId}`);
    // TODO: 实现查看消课记录功能
  };

  // 合同明细列
  const itemColumns: ColumnsType<ContractItem> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 200,
    },
    {
      title: '课时数',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      width: 100,
      render: (value) => <span style={{ color: '#00d4ff' }}>{value}</span>,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 120,
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      title: '小计',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      width: 120,
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      title: '折扣',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      align: 'right',
      width: 120,
      render: (value) => (
        <span style={{ color: '#ffaa00' }}>-¥{value.toFixed(2)}</span>
      ),
    },
    {
      title: '实付金额',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      align: 'right',
      width: 140,
      render: (value) => (
        <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: 16 }}>
          ¥{value.toFixed(2)}
        </span>
      ),
    },
  ];

  // 支付记录列
  const paymentColumns: ColumnsType<PaymentRecord> = [
    {
      title: '支付时间',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 180,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (value) => (
        <Tag color="blue">{getPaymentMethodTag(value)}</Tag>
      ),
    },
    {
      title: '支付金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 140,
      render: (value) => (
        <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: 16 }}>
          ¥{value.toFixed(2)}
        </span>
      ),
    },
    {
      title: '收据编号',
      dataIndex: 'paymentNo',
      key: 'paymentNo',
      width: 160,
      render: (no) => (
        <span style={{ color: '#00d4ff' }}>{no}</span>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'receiverName',
      key: 'receiverName',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewReceipt(record.id)}
          >
            查看收据
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(record.id)}
          >
            打印
          </Button>
        </Space>
      ),
    },
  ];

  // 课时账户列
  const accountColumns: ColumnsType<HourAccount> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 200,
    },
    {
      title: '总课时',
      dataIndex: 'totalHours',
      key: 'totalHours',
      align: 'right',
      width: 100,
    },
    {
      title: '已用课时',
      dataIndex: 'usedHours',
      key: 'usedHours',
      align: 'right',
      width: 100,
      render: (value) => (
        <span style={{ color: '#ffaa00' }}>{value}</span>
      ),
    },
    {
      title: '剩余课时',
      dataIndex: 'remainingHours',
      key: 'remainingHours',
      align: 'right',
      width: 100,
      render: (value) => (
        <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: 16 }}>
          {value}
        </span>
      ),
    },
    {
      title: '赠送课时',
      dataIndex: 'frozenHours',
      key: 'frozenHours',
      align: 'right',
      width: 100,
      render: (value) => (
        <span style={{ color: '#00d4ff' }}>{value || 0}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: '#00ff88', text: '正常' },
          expired: { color: '#ff4d6a', text: '已过期' },
          frozen: { color: '#ffaa00', text: '已冻结' },
        };
        const config = statusMap[status] || { color: '#999', text: status };
        return (
          <Tag
            style={{
              background: `${config.color}20`,
              border: `1px solid ${config.color}`,
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
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<FileSearchOutlined />}
          onClick={() => handleViewConsumption(record.id)}
        >
          消课记录
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!contract) {
    return <div>合同不存在</div>;
  }

  // 计算汇总数据
  const totalHours = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.finalPrice, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalRemainingHours = hourAccounts.reduce((sum, account) => sum + account.remainingHours, 0);
  const unpaidAmount = contract.totalAmount - contract.paidAmount;

  return (
    <div className="contract-detail">
      {/* 面包屑导航 */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: (
                <span>
                  <HomeOutlined style={{ marginRight: 4 }} />
                  首页
                </span>
              ),
            },
            {
              title: '财务管理',
            },
            {
              title: (
                <a onClick={handleBack} style={{ color: '#00d4ff' }}>
                  合同管理
                </a>
              ),
            },
            {
              title: '合同详情',
            },
          ]}
        />
      </div>

      {/* 页面标题和操作按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
          <FileTextOutlined style={{ marginRight: 12, color: '#00d4ff' }} />
          合同详情 - {contract.contractNo}
        </div>
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: 'none',
              color: '#fff',
            }}
          >
            打印
          </Button>
          {contract.status === 'active' && (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleCancel}
            >
              作废
            </Button>
          )}
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回
          </Button>
        </Space>
      </div>

      {/* Tab页签 */}
      <Card
        style={{
          background: '#111827',
          border: '1px solid rgba(0, 212, 255, 0.1)',
          borderRadius: 12,
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: (
                <span>
                  <FileTextOutlined />
                  合同基本信息
                </span>
              ),
              children: (
                <div>
                  {/* 金额统计卡片 */}
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="合同金额"
                          value={contract.totalAmount}
                          precision={2}
                          prefix="¥"
                          valueStyle={{ color: '#00d4ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="已付金额"
                          value={contract.paidAmount}
                          precision={2}
                          prefix="¥"
                          valueStyle={{ color: '#00ff88' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="欠费金额"
                          value={unpaidAmount}
                          precision={2}
                          prefix="¥"
                          valueStyle={{ color: unpaidAmount > 0 ? '#ff4d6a' : '#00ff88' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="优惠金额"
                          value={contract.discountAmount || 0}
                          precision={2}
                          prefix="¥"
                          valueStyle={{ color: '#ffaa00' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* 基本信息 */}
                  <Descriptions
                    column={2}
                    bordered
                    labelStyle={{
                      background: 'rgba(0, 212, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.65)',
                      fontWeight: 500,
                    }}
                    contentStyle={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      color: 'rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    <Descriptions.Item label="合同编号">
                      <span style={{ color: '#00d4ff', fontWeight: 600 }}>
                        {contract.contractNo}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="合同状态">
                      {getStatusTag(contract.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="签署日期">
                      {contract.signDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="有效期">
                      {contract.startDate} 至 {contract.endDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="学员姓名">
                      {contract.studentName}
                    </Descriptions.Item>
                    <Descriptions.Item label="学员手机">
                      {contract.studentPhone}
                    </Descriptions.Item>
                    <Descriptions.Item label="所属校区">
                      {contract.campusName}
                    </Descriptions.Item>
                    <Descriptions.Item label="销售人员">
                      {contract.salesPersonName}
                    </Descriptions.Item>
                    <Descriptions.Item label="备注" span={2}>
                      {contract.remark || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <FileTextOutlined />
                  合同明细
                </span>
              ),
              children: (
                <div>
                  <Table
                    columns={itemColumns}
                    dataSource={items}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 900 }}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row
                          style={{
                            background: 'rgba(0, 212, 255, 0.05)',
                            fontWeight: 600,
                          }}
                        >
                          <Table.Summary.Cell index={0}>
                            <span style={{ color: '#fff' }}>合计</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span style={{ color: '#00d4ff', fontSize: 16 }}>
                              {totalHours}
                            </span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} />
                          <Table.Summary.Cell index={3} />
                          <Table.Summary.Cell index={4} />
                          <Table.Summary.Cell index={5} align="right">
                            <span style={{ color: '#00ff88', fontSize: 18, fontWeight: 'bold' }}>
                              ¥{totalAmount.toFixed(2)}
                            </span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </div>
              ),
            },
            {
              key: '3',
              label: (
                <span>
                  <DollarOutlined />
                  支付记录
                </span>
              ),
              children: (
                <div>
                  <Table
                    columns={paymentColumns}
                    dataSource={payments}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row
                          style={{
                            background: 'rgba(0, 212, 255, 0.05)',
                            fontWeight: 600,
                          }}
                        >
                          <Table.Summary.Cell index={0}>
                            <span style={{ color: '#fff' }}>已付总额</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} />
                          <Table.Summary.Cell index={2} align="right">
                            <span style={{ color: '#00ff88', fontSize: 18, fontWeight: 'bold' }}>
                              ¥{totalPaid.toFixed(2)}
                            </span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} />
                          <Table.Summary.Cell index={4} />
                          <Table.Summary.Cell index={5} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </div>
              ),
            },
            {
              key: '4',
              label: (
                <span>
                  <ClockCircleOutlined />
                  课时账户
                </span>
              ),
              children: (
                <div>
                  <Table
                    columns={accountColumns}
                    dataSource={hourAccounts}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 900 }}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row
                          style={{
                            background: 'rgba(0, 212, 255, 0.05)',
                            fontWeight: 600,
                          }}
                        >
                          <Table.Summary.Cell index={0}>
                            <span style={{ color: '#fff' }}>合计</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} />
                          <Table.Summary.Cell index={2} />
                          <Table.Summary.Cell index={3} align="right">
                            <span style={{ color: '#00ff88', fontSize: 18, fontWeight: 'bold' }}>
                              {totalRemainingHours}
                            </span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} />
                          <Table.Summary.Cell index={5} />
                          <Table.Summary.Cell index={6} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 打印合同弹窗 */}
      {contract && (
        <ContractPrintModal
          visible={printModalVisible}
          contractId={contract.id}
          contractNo={contract.contractNo}
          onClose={() => setPrintModalVisible(false)}
          onSuccess={() => {
            message.success('打印成功');
          }}
        />
      )}
    </div>
  );
};

export default ContractDetail;
