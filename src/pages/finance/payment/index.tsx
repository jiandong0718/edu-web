import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, message, Modal } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPaymentPage, downloadBatchReceiptPdf, type Payment } from '@/api/payment';
import ReceiptPrint from '@/components/ReceiptPrint';

const PaymentPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getPaymentPage({
        pageNum,
        pageSize,
      });
      setDataSource(response.data.records);
      setTotal(response.data.total);
    } catch (error) {
      message.error('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [pageNum, pageSize]);

  // 打印收据
  const handlePrintReceipt = (record: Payment) => {
    setCurrentPaymentId(record.id);
    setReceiptVisible(true);
  };

  // 批量打印
  const handleBatchPrint = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要打印的收款记录');
      return;
    }

    Modal.confirm({
      title: '批量打印收据',
      content: `确定要打印选中的 ${selectedRowKeys.length} 条收款记录的收据吗？`,
      onOk: async () => {
        try {
          const response = await downloadBatchReceiptPdf(selectedRowKeys as number[]);

          // 创建下载链接
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `receipts_batch_${Date.now()}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          message.success('批量下载成功');
        } catch (error) {
          message.error('批量下载失败');
          console.error(error);
        }
      },
    });
  };

  // 获取支付状态标签
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'warning', text: '待支付' },
      paid: { color: 'success', text: '已支付' },
      failed: { color: 'error', text: '支付失败' },
      refunded: { color: 'default', text: '已退款' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取支付方式名称
  const getPaymentMethodName = (method: string) => {
    const methodMap: Record<string, string> = {
      wechat: '微信支付',
      alipay: '支付宝',
      unionpay: '银联支付',
      cash: '现金',
      pos: 'POS机',
      bank_transfer: '银行转账',
    };
    return methodMap[method] || method;
  };

  const columns: ColumnsType<Payment> = [
    {
      title: '收款单号',
      dataIndex: 'paymentNo',
      key: 'paymentNo',
      width: 180,
    },
    {
      title: '收款金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method: string) => getPaymentMethodName(method),
    },
    {
      title: '支付状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '支付时间',
      dataIndex: 'payTime',
      key: 'payTime',
      width: 180,
    },
    {
      title: '交易号',
      dataIndex: 'transactionNo',
      key: 'transactionNo',
      width: 200,
      ellipsis: true,
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
      render: (_: any, record: Payment) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(record)}
            disabled={record.status !== 'paid'}
          >
            打印收据
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="收款流水查询"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleBatchPrint}
            disabled={selectedRowKeys.length === 0}
          >
            批量打印 ({selectedRowKeys.length})
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (record: Payment) => ({
            disabled: record.status !== 'paid',
          }),
        }}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => {
            setPageNum(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 1400 }}
      />

      <ReceiptPrint
        visible={receiptVisible}
        paymentId={currentPaymentId}
        onClose={() => {
          setReceiptVisible(false);
          setCurrentPaymentId(null);
        }}
      />
    </Card>
  );
};

export default PaymentPage;
