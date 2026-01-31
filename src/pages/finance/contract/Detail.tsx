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
  Timeline,
  Statistic,
  Row,
  Col,
  Progress,
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getContractDetail,
  getContractItems,
  getPaymentRecords,
  getHourAccounts,
  getRefundApplications,
  downloadContract,
  deleteContract,
} from '@/api/contract';
import type {
  Contract,
  ContractItem,
  PaymentRecord,
  HourAccount,
  RefundApplication,
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
  const [refunds, setRefunds] = useState<RefundApplication[]>([]);
  const [printModalVisible, setPrintModalVisible] = useState(false);

  // 加载合同详情
  const loadContractDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [contractRes, itemsRes, paymentsRes, accountsRes, refundsRes] = await Promise.all([
        getContractDetail(Number(id)),
        getContractItems(Number(id)),
        getPaymentRecords(Number(id)),
        getHourAccounts(Number(id)),
        getRefundApplications(Number(id)),
      ]);
      setContract(contractRes);
      setItems(itemsRes);
      setPayments(paymentsRes);
      setHourAccounts(accountsRes);
      setRefunds(refundsRes);
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
      draft: { color: 'default', text: '草稿' },
      active: { color: 'success', text: '生效中' },
      expired: { color: 'warning', text: '已过期' },
      terminated: { color: 'error', text: '已终止' },
      refunded: { color: 'purple', text: '已退费' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 类型标签
  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      regular: { color: 'blue', text: '常规合同' },
      trial: { color: 'cyan', text: '试听合同' },
      package: { color: 'purple', text: '课程包' },
    };
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
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

  // 下载合同
  const handleDownload = async () => {
    try {
      await downloadContract(Number(id));
      message.success('合同下载成功');
    } catch (error) {
      message.error('合同下载失败');
    }
  };

  // 编辑合同
  const handleEdit = () => {
    navigate(`/finance/contract/edit/${id}`);
  };

  // 删除合同
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个合同吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteContract(Number(id));
          message.success('删除成功');
          navigate('/finance/contract');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 打印合同
  const handlePrint = () => {
    setPrintModalVisible(true);
  };

  // 合同明细列
  const itemColumns: ColumnsType<ContractItem> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '课程包',
      dataIndex: 'coursePackageName',
      key: 'coursePackageName',
      render: (text) => text || '-',
    },
    {
      title: '数量（课时）',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      title: '优惠金额',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      align: 'right',
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      title: '实付金额',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      align: 'right',
      render: (value) => <span style={{ color: '#00ff88', fontWeight: 'bold' }}>¥{value.toFixed(2)}</span>,
    },
    {
      title: '已用课时',
      dataIndex: 'usedQuantity',
      key: 'usedQuantity',
      align: 'right',
    },
    {
      title: '剩余课时',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      align: 'right',
      render: (value) => <span style={{ color: '#00d4ff' }}>{value}</span>,
    },
  ];

  // 收款记录列
  const paymentColumns: ColumnsType<PaymentRecord> = [
    {
      title: '收款单号',
      dataIndex: 'paymentNo',
      key: 'paymentNo',
    },
    {
      title: '收款金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (value) => <span style={{ color: '#00ff88', fontWeight: 'bold' }}>¥{value.toFixed(2)}</span>,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (value) => getPaymentMethodTag(value),
    },
    {
      title: '收款日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
    },
    {
      title: '收款人',
      dataIndex: 'receiverName',
      key: 'receiverName',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text) => text || '-',
    },
  ];

  // 课时账户列
  const accountColumns: ColumnsType<HourAccount> = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '总课时',
      dataIndex: 'totalHours',
      key: 'totalHours',
      align: 'right',
    },
    {
      title: '已用课时',
      dataIndex: 'usedHours',
      key: 'usedHours',
      align: 'right',
    },
    {
      title: '剩余课时',
      dataIndex: 'remainingHours',
      key: 'remainingHours',
      align: 'right',
      render: (value) => <span style={{ color: '#00d4ff' }}>{value}</span>,
    },
    {
      title: '冻结课时',
      dataIndex: 'frozenHours',
      key: 'frozenHours',
      align: 'right',
    },
    {
      title: '使用进度',
      key: 'progress',
      render: (_, record) => {
        const percent = (record.usedHours / record.totalHours) * 100;
        return <Progress percent={Number(percent.toFixed(1))} size="small" />;
      },
    },
    {
      title: '到期日期',
      dataIndex: 'expireDate',
      key: 'expireDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          active: { color: 'success', text: '正常' },
          expired: { color: 'error', text: '已过期' },
          frozen: { color: 'warning', text: '已冻结' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
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

  return (
    <div className="contract-detail">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="合同总额"
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
              title="已收金额"
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
              title="优惠金额"
              value={contract.discountAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ffaa00' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="退费金额"
              value={contract.refundAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d6a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 基本信息 */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>合同基本信息</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              下载
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              编辑
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
          </Space>
        }
        className="info-card"
        style={{ marginBottom: 24 }}
      >
        <Descriptions column={3} bordered>
          <Descriptions.Item label="合同编号">{contract.contractNo}</Descriptions.Item>
          <Descriptions.Item label="合同状态">{getStatusTag(contract.status)}</Descriptions.Item>
          <Descriptions.Item label="合同类型">{getTypeTag(contract.type)}</Descriptions.Item>
          <Descriptions.Item label="学员姓名">{contract.studentName}</Descriptions.Item>
          <Descriptions.Item label="学员电话">{contract.studentPhone}</Descriptions.Item>
          <Descriptions.Item label="家长姓名">{contract.parentName}</Descriptions.Item>
          <Descriptions.Item label="家长电话">{contract.parentPhone}</Descriptions.Item>
          <Descriptions.Item label="所属校区">{contract.campusName}</Descriptions.Item>
          <Descriptions.Item label="销售人员">{contract.salesPersonName}</Descriptions.Item>
          <Descriptions.Item label="签订日期">{contract.signDate}</Descriptions.Item>
          <Descriptions.Item label="开始日期">{contract.startDate}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{contract.endDate}</Descriptions.Item>
          <Descriptions.Item label="备注" span={3}>
            {contract.remark || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 合同明细 */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>合同明细</span>
          </Space>
        }
        className="detail-card"
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 收款记录 */}
      <Card
        title={
          <Space>
            <DollarOutlined />
            <span>收款记录</span>
          </Space>
        }
        className="payment-card"
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={paymentColumns}
          dataSource={payments}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* 课时账户 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>课时账户</span>
          </Space>
        }
        className="account-card"
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={accountColumns}
          dataSource={hourAccounts}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 退费记录 */}
      {refunds.length > 0 && (
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined />
              <span>退费记录</span>
            </Space>
          }
          className="refund-card"
        >
          <Timeline>
            {refunds.map((refund) => (
              <Timeline.Item key={refund.id} color={refund.status === 'completed' ? 'green' : 'blue'}>
                <p>
                  <strong>退费金额：</strong>
                  <span style={{ color: '#ff4d6a', fontWeight: 'bold' }}>¥{refund.refundAmount.toFixed(2)}</span>
                </p>
                <p>
                  <strong>退费原因：</strong>
                  {refund.refundReason}
                </p>
                <p>
                  <strong>申请人：</strong>
                  {refund.applicantName}
                </p>
                <p>
                  <strong>申请时间：</strong>
                  {refund.createTime}
                </p>
                {refund.approverName && (
                  <>
                    <p>
                      <strong>审批人：</strong>
                      {refund.approverName}
                    </p>
                    <p>
                      <strong>审批时间：</strong>
                      {refund.approveDate}
                    </p>
                    <p>
                      <strong>审批备注：</strong>
                      {refund.approveRemark || '-'}
                    </p>
                  </>
                )}
                <p>
                  <strong>状态：</strong>
                  <Tag
                    color={
                      refund.status === 'completed'
                        ? 'success'
                        : refund.status === 'approved'
                        ? 'processing'
                        : refund.status === 'rejected'
                        ? 'error'
                        : 'default'
                    }
                  >
                    {refund.status === 'pending'
                      ? '待审批'
                      : refund.status === 'approved'
                      ? '已批准'
                      : refund.status === 'rejected'
                      ? '已拒绝'
                      : '已完成'}
                  </Tag>
                </p>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

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
