import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Select,
  InputNumber,
  Input,
  Space,
  message,
  Spin,
  Radio,
  Divider,
  Card,
  Table,
  Tag,
} from 'antd';
import {
  PrinterOutlined,
  EyeOutlined,
  DownloadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  printContract,
  getPrintTemplates,
  previewPrint,
  getPrintRecords,
} from '@/api/contract';
import type {
  ContractPrintTemplate,
  ContractPrintData,
  ContractPrintRecord,
} from '@/types/contract';

interface ContractPrintModalProps {
  visible: boolean;
  contractId: number;
  contractNo: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ContractPrintModal: React.FC<ContractPrintModalProps> = ({
  visible,
  contractId,
  contractNo,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractPrintTemplate[]>([]);
  const [printRecords, setPrintRecords] = useState<ContractPrintRecord[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [printData, setPrintData] = useState<ContractPrintData>({
    contractId,
    printType: 'pdf',
    printCount: 1,
  });

  useEffect(() => {
    if (visible) {
      loadTemplates();
      loadPrintRecords();
    }
  }, [visible]);

  const loadTemplates = async () => {
    try {
      const data = await getPrintTemplates();
      setTemplates(data);
      // 设置默认模板
      const defaultTemplate = data.find((t) => t.isDefault);
      if (defaultTemplate) {
        setPrintData((prev) => ({ ...prev, templateId: defaultTemplate.id }));
      }
    } catch (error) {
      message.error('加载打印模板失败');
    }
  };

  const loadPrintRecords = async () => {
    try {
      const data = await getPrintRecords(contractId);
      setPrintRecords(data);
    } catch (error) {
      console.error('加载打印记录失败', error);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const html = await previewPrint(contractId, printData.templateId);
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      message.error('预览失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      await printContract(printData);
      message.success('打印成功');
      loadPrintRecords();
      onSuccess?.();
    } catch (error) {
      message.error('打印失败');
    } finally {
      setLoading(false);
    }
  };

  const printRecordColumns: ColumnsType<ContractPrintRecord> = [
    {
      title: '打印单号',
      dataIndex: 'printNo',
      key: 'printNo',
      width: 140,
    },
    {
      title: '打印类型',
      dataIndex: 'printType',
      key: 'printType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'pdf' ? 'blue' : 'green'}>
          {type === 'pdf' ? 'PDF打印' : '纸质打印'}
        </Tag>
      ),
    },
    {
      title: '模板',
      dataIndex: 'templateName',
      key: 'templateName',
      width: 120,
    },
    {
      title: '份数',
      dataIndex: 'printCount',
      key: 'printCount',
      width: 80,
    },
    {
      title: '打印人',
      dataIndex: 'printerName',
      key: 'printerName',
      width: 100,
    },
    {
      title: '打印时间',
      dataIndex: 'printTime',
      key: 'printTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.fileUrl && (
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.fileUrl, '_blank')}
            >
              下载
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#00d4ff' }} />
            <span>打印合同 - {contractNo}</span>
          </Space>
        }
        open={visible}
        onCancel={onClose}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setShowHistory(!showHistory)} icon={<HistoryOutlined />}>
              {showHistory ? '隐藏' : '查看'}打印记录
            </Button>
            <Button onClick={handlePreview} loading={previewLoading} icon={<EyeOutlined />}>
              预览
            </Button>
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              onClick={handlePrint}
              loading={loading}
              icon={<PrinterOutlined />}
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
                border: 'none',
              }}
            >
              确认打印
            </Button>
          </Space>
        }
      >
        <Card
          style={{
            background: '#111827',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            marginBottom: 16,
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
                打印模板
              </div>
              <Select
                style={{ width: '100%' }}
                value={printData.templateId}
                onChange={(value) =>
                  setPrintData((prev) => ({ ...prev, templateId: value }))
                }
                placeholder="请选择打印模板"
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

            <div>
              <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
                打印类型
              </div>
              <Radio.Group
                value={printData.printType}
                onChange={(e) =>
                  setPrintData((prev) => ({ ...prev, printType: e.target.value }))
                }
              >
                <Radio value="pdf">PDF打印</Radio>
                <Radio value="paper">纸质打印</Radio>
              </Radio.Group>
            </div>

            <div>
              <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
                打印份数
              </div>
              <InputNumber
                min={1}
                max={10}
                value={printData.printCount}
                onChange={(value) =>
                  setPrintData((prev) => ({ ...prev, printCount: value || 1 }))
                }
                style={{ width: 200 }}
              />
            </div>

            <div>
              <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>备注</div>
              <Input.TextArea
                rows={3}
                value={printData.remark}
                onChange={(e) =>
                  setPrintData((prev) => ({ ...prev, remark: e.target.value }))
                }
                placeholder="请输入备注信息（可选）"
              />
            </div>
          </Space>
        </Card>

        {showHistory && (
          <>
            <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.2)' }}>打印记录</Divider>
            <Table
              columns={printRecordColumns}
              dataSource={printRecords}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          </>
        )}
      </Modal>

      <Modal
        title="打印预览"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        width="90%"
        style={{ top: 20 }}
        footer={
          <Button onClick={() => setShowPreview(false)}>关闭</Button>
        }
      >
        <div
          style={{
            height: 'calc(100vh - 200px)',
            overflow: 'auto',
            background: '#fff',
            padding: 20,
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Modal>
    </>
  );
};

export default ContractPrintModal;
