import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Select,
  Space,
  message,
  Table,
  Tag,
  Progress,
  Alert,
} from 'antd';
import { PrinterOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { batchPrintContracts, getPrintTemplates } from '@/api/contract';
import type { ContractPrintTemplate } from '@/types/contract';

interface BatchPrintModalProps {
  visible: boolean;
  contracts: Array<{ id: number; contractNo: string; studentName: string }>;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PrintResult {
  contractId: number;
  contractNo: string;
  status: 'pending' | 'success' | 'failed';
  printId?: number;
  error?: string;
}

const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  visible,
  contracts,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractPrintTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [printResults, setPrintResults] = useState<PrintResult[]>([]);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadTemplates();
      initPrintResults();
    }
  }, [visible, contracts]);

  const loadTemplates = async () => {
    try {
      const data = await getPrintTemplates();
      setTemplates(data);
      const defaultTemplate = data.find((t) => t.isDefault);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      }
    } catch (error) {
      message.error('加载打印模板失败');
    }
  };

  const initPrintResults = () => {
    const results: PrintResult[] = contracts.map((contract) => ({
      contractId: contract.id,
      contractNo: contract.contractNo,
      status: 'pending',
    }));
    setPrintResults(results);
  };

  const handleBatchPrint = async () => {
    if (!selectedTemplateId) {
      message.warning('请选择打印模板');
      return;
    }

    setPrinting(true);
    setLoading(true);

    try {
      const contractIds = contracts.map((c) => c.id);
      const printIds = await batchPrintContracts(contractIds, selectedTemplateId);

      // 更新打印结果
      const updatedResults = printResults.map((result, index) => ({
        ...result,
        status: printIds[index] ? 'success' : 'failed',
        printId: printIds[index],
        error: printIds[index] ? undefined : '打印失败',
      })) as PrintResult[];

      setPrintResults(updatedResults);

      const successCount = printIds.filter((id) => id).length;
      message.success(`批量打印完成，成功 ${successCount}/${contracts.length} 个合同`);

      onSuccess?.();
    } catch (error) {
      message.error('批量打印失败');
      // 标记所有为失败
      const failedResults = printResults.map((result) => ({
        ...result,
        status: 'failed' as const,
        error: '打印失败',
      }));
      setPrintResults(failedResults);
    } finally {
      setLoading(false);
      setPrinting(false);
    }
  };

  const columns: ColumnsType<PrintResult> = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'default', text: '待打印', icon: null },
          success: { color: 'success', text: '成功', icon: <CheckCircleOutlined /> },
          failed: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '打印ID',
      dataIndex: 'printId',
      key: 'printId',
      width: 100,
      render: (printId?: number) => printId || '-',
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      render: (error?: string) => (
        <span style={{ color: '#ff4d4f' }}>{error || '-'}</span>
      ),
    },
  ];

  const successCount = printResults.filter((r) => r.status === 'success').length;
  const failedCount = printResults.filter((r) => r.status === 'failed').length;
  const progress = printing
    ? ((successCount + failedCount) / contracts.length) * 100
    : 0;

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined style={{ color: '#00d4ff' }} />
          <span>批量打印合同</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        <Space>
          <Button onClick={onClose} disabled={loading}>
            {printing ? '关闭' : '取消'}
          </Button>
          <Button
            type="primary"
            onClick={handleBatchPrint}
            loading={loading}
            disabled={printing}
            icon={<PrinterOutlined />}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: 'none',
            }}
          >
            开始打印
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message={`已选择 ${contracts.length} 个合同进行批量打印`}
          type="info"
          showIcon
        />

        <div>
          <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
            打印模板
          </div>
          <Select
            style={{ width: '100%' }}
            value={selectedTemplateId}
            onChange={setSelectedTemplateId}
            placeholder="请选择打印模板"
            disabled={printing}
          >
            {templates.map((template) => (
              <Select.Option key={template.id} value={template.id}>
                {template.templateName}
                {template.isDefault && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    默认
                  </Tag>
                )}
              </Select.Option>
            ))}
          </Select>
        </div>

        {printing && (
          <div>
            <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
              打印进度
            </div>
            <Progress
              percent={Math.round(progress)}
              status={failedCount > 0 ? 'exception' : 'active'}
              format={() => `${successCount + failedCount}/${contracts.length}`}
            />
          </div>
        )}

        <div>
          <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
            打印列表
          </div>
          <Table
            columns={columns}
            dataSource={printResults}
            rowKey="contractId"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
        </div>

        {(successCount > 0 || failedCount > 0) && (
          <Alert
            message={
              <Space>
                <span>打印完成:</span>
                <Tag color="success">成功 {successCount}</Tag>
                {failedCount > 0 && <Tag color="error">失败 {failedCount}</Tag>}
              </Space>
            }
            type={failedCount > 0 ? 'warning' : 'success'}
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};

export default BatchPrintModal;
