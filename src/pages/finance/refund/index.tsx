import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Descriptions,
  Spin,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getRefundList,
  applyRefund,
  calculateRefundAmount,
  getRefundDetail,
} from '@/api/refund';
import { getContractList } from '@/api/contract';
import type {
  Refund,
  RefundQueryParams,
  RefundApplyFormData,
  RefundCalculation,
} from '@/types/refund';
import type { Contract } from '@/types/contract';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const statusConfig = {
  pending: { color: '#ffaa00', text: '待审批', icon: <ClockCircleOutlined /> },
  approved: { color: '#00ff88', text: '已通过', icon: <CheckCircleOutlined /> },
  rejected: { color: '#ff4d6a', text: '已拒绝', icon: <CloseCircleOutlined /> },
  refunded: { color: '#00d4ff', text: '已退款', icon: <CheckCircleOutlined /> },
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
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  statsBar: {
    marginBottom: 20,
    padding: '20px',
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(0, 212, 255, 0.1)',
  },
  calculationCard: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#00d4ff',
  },
};

function RefundList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Refund[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<RefundQueryParams>({
    pageNum: 1,
    pageSize: 10,
  });
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [calculation, setCalculation] = useState<RefundCalculation | null>(null);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [form] = Form.useForm();

  // 统计数据
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchRefundList();
  }, [queryParams]);

  useEffect(() => {
    if (applyModalVisible) {
      fetchContracts();
    }
  }, [applyModalVisible]);

  const fetchRefundList = async () => {
    setLoading(true);
    try {
      const response = await getRefundList(queryParams);
      setDataSource(response.records);
      setTotal(response.total);

      // 计算统计数据
      const totalCount = response.total;
      const pendingCount = response.records.filter((r) => r.status === 'pending').length;
      const approvedCount = response.records.filter((r) => r.status === 'approved').length;
      const totalAmount = response.records.reduce((sum, r) => sum + r.applyAmount, 0);

      setStats({
        totalCount,
        pendingCount,
        approvedCount,
        totalAmount,
      });
    } catch (error) {
      message.error('获取退费申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await getContractList({
        page: 1,
        pageSize: 100,
        status: 'active',
      });
      setContracts(response.list);
    } catch (error) {
      message.error('获取合同列表失败');
    }
  };

  const handleContractChange = async (contractId: number) => {
    setCalculationLoading(true);
    setCalculation(null);
    try {
      const result = await calculateRefundAmount(contractId);
      setCalculation(result);
    } catch (error) {
      message.error('计算退费金额失败');
    } finally {
      setCalculationLoading(false);
    }
  };

  const handleApply = () => {
    setApplyModalVisible(true);
    form.resetFields();
    setCalculation(null);
  };

  const handleApplySubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: RefundApplyFormData = {
        contractId: values.contractId,
        reason: values.reason,
        description: values.description,
      };

      await applyRefund(data);
      message.success('退费申请提交成功');
      setApplyModalVisible(false);
      fetchRefundList();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写完整的表单信息');
      } else {
        message.error('提交退费申请失败');
      }
    }
  };

  const handleViewDetail = async (record: Refund) => {
    try {
      const detail = await getRefundDetail(record.id);
      setSelectedRefund(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取退费详情失败');
    }
  };

  const handleSearch = (values: any) => {
    setQueryParams({
      ...queryParams,
      pageNum: 1,
      ...values,
    });
  };

  const handleRefresh = () => {
    fetchRefundList();
    message.success('数据已刷新');
  };

  const columns: ColumnsType<Refund> = [
    {
      title: '退费编号',
      dataIndex: 'refundNo',
      key: 'refundNo',
      width: 140,
      render: (no: string) => (
        <span style={{ color: '#00d4ff', fontWeight: 500 }}>{no}</span>
      ),
    },
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 140,
      render: (no: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{no}</span>
      ),
    },
    {
      title: '学生信息',
      key: 'student',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ color: '#fff', fontWeight: 500 }}>{record.studentName}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
            {record.campusName}
          </div>
        </div>
      ),
    },
    {
      title: '申请金额',
      dataIndex: 'applyAmount',
      key: 'applyAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '实退金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#00ff88', fontWeight: 600, fontSize: 16 }}>
          {amount ? `¥${amount.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: '违约金',
      dataIndex: 'penaltyAmount',
      key: 'penaltyAmount',
      width: 100,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#ff4d6a' }}>
          {amount ? `¥${amount.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 160,
      render: (time: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          {dayjs(time).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        return (
          <Tag
            icon={config.icon}
            style={{
              background: `${config.color}20`,
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
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={() => handleViewDetail(record)}
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
          <DollarOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          退费管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={handleApply}
          >
            申请退费
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.statsBar}>
          <Row gutter={24}>
            <Col span={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>总申请数</span>}
                value={stats.totalCount}
                valueStyle={{ color: '#00d4ff', fontWeight: 700 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>待审批</span>}
                value={stats.pendingCount}
                valueStyle={{ color: '#ffaa00', fontWeight: 700 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>已通过</span>}
                value={stats.approvedCount}
                valueStyle={{ color: '#00ff88', fontWeight: 700 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>申请总额</span>}
                value={stats.totalAmount}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#00d4ff', fontWeight: 700 }}
              />
            </Col>
          </Row>
        </div>

        <div style={styles.filterBar}>
          <Input
            placeholder="搜索退费编号、合同编号、学生姓名"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => handleSearch({ studentName: e.target.value })}
          />
          <Select
            placeholder="选择状态"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => handleSearch({ status: value })}
          >
            <Select.Option value="pending">待审批</Select.Option>
            <Select.Option value="approved">已通过</Select.Option>
            <Select.Option value="rejected">已拒绝</Select.Option>
            <Select.Option value="refunded">已退款</Select.Option>
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            onChange={(dates) => {
              if (dates) {
                handleSearch({
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD'),
                });
              } else {
                handleSearch({ startDate: undefined, endDate: undefined });
              }
            }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.pageNum,
            pageSize: queryParams.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, pageNum: page, pageSize });
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 申请退费弹窗 */}
      <Modal
        title={
          <span style={{ color: '#00d4ff', fontSize: 18, fontWeight: 600 }}>
            申请退费
          </span>
        }
        open={applyModalVisible}
        onOk={handleApplySubmit}
        onCancel={() => setApplyModalVisible(false)}
        width={700}
        okText="提交申请"
        cancelText="取消"
        okButtonProps={{
          style: styles.actionButton,
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="contractId"
            label="选择合同"
            rules={[{ required: true, message: '请选择合同' }]}
          >
            <Select
              placeholder="请选择合同"
              showSearch
              optionFilterProp="children"
              onChange={handleContractChange}
              loading={contracts.length === 0}
            >
              {contracts.map((contract) => (
                <Select.Option key={contract.id} value={contract.id}>
                  {contract.contractNo} - {contract.studentName} - ¥
                  {contract.totalAmount.toLocaleString()}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {calculationLoading && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin tip="正在计算退费金额..." />
            </div>
          )}

          {calculation && (
            <div style={styles.calculationCard}>
              <Descriptions
                title={
                  <span style={{ color: '#00d4ff', fontSize: 16 }}>
                    退费金额计算
                  </span>
                }
                column={2}
                size="small"
              >
                <Descriptions.Item label="合同总额">
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    ¥{calculation.contractAmount.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="已付金额">
                  <span style={{ color: '#00ff88', fontWeight: 600 }}>
                    ¥{calculation.paidAmount.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="总课时">
                  {calculation.totalHours} 课时
                </Descriptions.Item>
                <Descriptions.Item label="已用课时">
                  <span style={{ color: '#ffaa00' }}>
                    {calculation.usedHours} 课时
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="剩余课时">
                  <span style={{ color: '#00ff88' }}>
                    {calculation.remainingHours} 课时
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="课时单价">
                  ¥{calculation.pricePerHour.toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="已用金额">
                  <span style={{ color: '#ff4d6a' }}>
                    ¥{calculation.usedAmount.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="违约金">
                  <span style={{ color: '#ff4d6a' }}>
                    ¥{calculation.penaltyAmount.toLocaleString()} ({calculation.penaltyRate * 100}%)
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="可退金额" span={2}>
                  <div style={styles.amountText}>
                    ¥{calculation.refundableAmount.toLocaleString()}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="计算说明" span={2}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 12 }}>
                    {calculation.calculationNote}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Form.Item
            name="reason"
            label="退费原因"
            rules={[{ required: true, message: '请输入退费原因' }]}
          >
            <Select placeholder="请选择退费原因">
              <Select.Option value="学生转学">学生转学</Select.Option>
              <Select.Option value="学生搬家">学生搬家</Select.Option>
              <Select.Option value="课程不满意">课程不满意</Select.Option>
              <Select.Option value="教学质量问题">教学质量问题</Select.Option>
              <Select.Option value="家庭经济原因">家庭经济原因</Select.Option>
              <Select.Option value="其他原因">其他原因</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="详细说明">
            <TextArea
              rows={4}
              placeholder="请详细说明退费原因（选填）"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 退费详情弹窗 */}
      <Modal
        title={
          <span style={{ color: '#00d4ff', fontSize: 18, fontWeight: 600 }}>
            退费详情
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedRefund && (
          <Descriptions column={2} bordered size="small" style={{ marginTop: 24 }}>
            <Descriptions.Item label="退费编号" span={2}>
              <span style={{ color: '#00d4ff', fontWeight: 600 }}>
                {selectedRefund.refundNo}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="合同编号">
              {selectedRefund.contractNo}
            </Descriptions.Item>
            <Descriptions.Item label="学生姓名">
              {selectedRefund.studentName}
            </Descriptions.Item>
            <Descriptions.Item label="校区">
              {selectedRefund.campusName}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                icon={statusConfig[selectedRefund.status].icon}
                color={statusConfig[selectedRefund.status].color}
              >
                {statusConfig[selectedRefund.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请金额">
              <span style={{ color: '#ffaa00', fontWeight: 600, fontSize: 16 }}>
                ¥{selectedRefund.applyAmount.toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="实退金额">
              <span style={{ color: '#00ff88', fontWeight: 600, fontSize: 16 }}>
                {selectedRefund.actualAmount
                  ? `¥${selectedRefund.actualAmount.toLocaleString()}`
                  : '-'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="违约金">
              <span style={{ color: '#ff4d6a' }}>
                ¥{selectedRefund.penaltyAmount.toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="退费原因" span={2}>
              {selectedRefund.reason}
            </Descriptions.Item>
            {selectedRefund.description && (
              <Descriptions.Item label="详细说明" span={2}>
                {selectedRefund.description}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="申请时间">
              {dayjs(selectedRefund.applyTime).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="审批人">
              {selectedRefund.approverName || '-'}
            </Descriptions.Item>
            {selectedRefund.approveTime && (
              <Descriptions.Item label="审批时间">
                {dayjs(selectedRefund.approveTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedRefund.approveRemark && (
              <Descriptions.Item label="审批备注" span={2}>
                {selectedRefund.approveRemark}
              </Descriptions.Item>
            )}
            {selectedRefund.refundTime && (
              <Descriptions.Item label="退款时间">
                {dayjs(selectedRefund.refundTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedRefund.refundMethod && (
              <Descriptions.Item label="退款方式">
                {selectedRefund.refundMethod}
              </Descriptions.Item>
            )}
            {selectedRefund.refundTransactionNo && (
              <Descriptions.Item label="退款流水号" span={2}>
                {selectedRefund.refundTransactionNo}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default RefundList;
