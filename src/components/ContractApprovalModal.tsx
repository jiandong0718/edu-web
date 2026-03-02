import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Select,
  Input,
  Space,
  message,
  Timeline,
  Card,
  Tag,
  Descriptions,
  Empty,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  submitApproval,
  processApproval,
  cancelApproval,
  getApprovalHistory,
  getApprovalFlow,
} from '@/api/contract';
import type {
  ContractApproval,
  ContractApprovalFlow,
  ContractApprovalSubmitData,
  ContractApprovalProcessData,
} from '@/types/contract';

interface ContractApprovalModalProps {
  visible: boolean;
  contractId: number;
  contractNo: string;
  mode: 'submit' | 'process' | 'history';
  approvalId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const ContractApprovalModal: React.FC<ContractApprovalModalProps> = ({
  visible,
  contractId,
  contractNo,
  mode,
  approvalId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState<ContractApproval[]>([]);
  const [approvalFlow, setApprovalFlow] = useState<ContractApprovalFlow[]>([]);

  const [submitData, setSubmitData] = useState<ContractApprovalSubmitData>({
    contractId,
    approvalType: 'contract',
  });

  const [processData, setProcessData] = useState<ContractApprovalProcessData>({
    approvalId: approvalId || 0,
    result: 'approved',
  });

  useEffect(() => {
    if (visible) {
      if (mode === 'history') {
        loadApprovalHistory();
      } else if (mode === 'process' && approvalId) {
        loadApprovalFlow(approvalId);
      }
    }
  }, [visible, mode, approvalId]);

  const loadApprovalHistory = async () => {
    try {
      const data = await getApprovalHistory(contractId);
      setApprovalHistory(data);
    } catch (error) {
      message.error('加载审批历史失败');
    }
  };

  const loadApprovalFlow = async (id: number) => {
    try {
      const data = await getApprovalFlow(id);
      setApprovalFlow(data);
    } catch (error) {
      message.error('加载审批流程失败');
    }
  };

  const handleSubmit = async () => {
    if (!submitData.approvalType) {
      message.warning('请选择审批类型');
      return;
    }

    setLoading(true);
    try {
      await submitApproval(submitData);
      message.success('提交审批成功');
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error('提交审批失败');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      await processApproval(processData);
      message.success('审批处理成功');
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error('审批处理失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { color: 'orange', text: '待审批', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', text: '已通过', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: '已拒绝', icon: <CloseCircleOutlined /> },
      cancelled: { color: 'default', text: '已撤销', icon: <CloseCircleOutlined /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getApprovalTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      contract: '合同审批',
      change: '变更审批',
      cancel: '作废审批',
    };
    return typeMap[type] || type;
  };

  const renderSubmitForm = () => (
    <Card
      style={{
        background: '#111827',
        border: '1px solid rgba(0, 212, 255, 0.1)',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
            合同编号
          </div>
          <Input value={contractNo} disabled />
        </div>

        <div>
          <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
            审批类型 <span style={{ color: '#ff4d4f' }}>*</span>
          </div>
          <Select
            style={{ width: '100%' }}
            value={submitData.approvalType}
            onChange={(value) =>
              setSubmitData((prev) => ({ ...prev, approvalType: value }))
            }
          >
            <Select.Option value="contract">合同审批</Select.Option>
            <Select.Option value="change">变更审批</Select.Option>
            <Select.Option value="cancel">作废审批</Select.Option>
          </Select>
        </div>

        <div>
          <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
            提交原因
          </div>
          <Input.TextArea
            rows={4}
            value={submitData.submitReason}
            onChange={(e) =>
              setSubmitData((prev) => ({ ...prev, submitReason: e.target.value }))
            }
            placeholder="请输入提交审批的原因（可选）"
          />
        </div>
      </Space>
    </Card>
  );

  const renderProcessForm = () => (
    <Card
      style={{
        background: '#111827',
        border: '1px solid rgba(0, 212, 255, 0.1)',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
            审批结果 <span style={{ color: '#ff4d4f' }}>*</span>
          </div>
          <Select
            style={{ width: '100%' }}
            value={processData.result}
            onChange={(value) =>
              setProcessData((prev) => ({ ...prev, result: value }))
            }
          >
            <Select.Option value="approved">
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> 通过
            </Select.Option>
            <Select.Option value="rejected">
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 拒绝
            </Select.Option>
          </Select>
        </div>

        <div>
          <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
            审批意见
          </div>
          <Input.TextArea
            rows={4}
            value={processData.approveRemark}
            onChange={(e) =>
              setProcessData((prev) => ({ ...prev, approveRemark: e.target.value }))
            }
            placeholder="请输入审批意见（可选）"
          />
        </div>

        {approvalFlow.length > 0 && (
          <div>
            <div style={{ marginBottom: 8, color: 'rgba(255, 255, 255, 0.85)' }}>
              审批流程
            </div>
            <Timeline>
              {approvalFlow.map((flow) => (
                <Timeline.Item
                  key={flow.id}
                  color={
                    flow.status === 'approved'
                      ? 'green'
                      : flow.status === 'rejected'
                      ? 'red'
                      : flow.status === 'pending'
                      ? 'blue'
                      : 'gray'
                  }
                >
                  <div>
                    <Space>
                      <span style={{ fontWeight: 500 }}>步骤 {flow.stepNo}</span>
                      {getStatusTag(flow.status)}
                    </Space>
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginTop: 4 }}>
                    审批人: {flow.approverName}
                  </div>
                  {flow.approveTime && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
                      {flow.approveTime}
                    </div>
                  )}
                  {flow.approveRemark && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginTop: 4 }}>
                      意见: {flow.approveRemark}
                    </div>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Space>
    </Card>
  );

  const renderHistory = () => (
    <div>
      {approvalHistory.length === 0 ? (
        <Empty description="暂无审批记录" />
      ) : (
        <Timeline>
          {approvalHistory.map((approval) => (
            <Timeline.Item
              key={approval.id}
              color={
                approval.status === 'approved'
                  ? 'green'
                  : approval.status === 'rejected'
                  ? 'red'
                  : approval.status === 'pending'
                  ? 'blue'
                  : 'gray'
              }
            >
              <Card
                size="small"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <span style={{ fontWeight: 500 }}>{approval.approvalNo}</span>
                      {getStatusTag(approval.status)}
                      <Tag color="blue">{getApprovalTypeText(approval.approvalType)}</Tag>
                    </Space>
                  </div>

                  <Descriptions size="small" column={2}>
                    <Descriptions.Item label="提交人">
                      {approval.submitterName}
                    </Descriptions.Item>
                    <Descriptions.Item label="提交时间">
                      {approval.submitTime}
                    </Descriptions.Item>
                    {approval.submitReason && (
                      <Descriptions.Item label="提交原因" span={2}>
                        {approval.submitReason}
                      </Descriptions.Item>
                    )}
                    {approval.approverName && (
                      <>
                        <Descriptions.Item label="审批人">
                          {approval.approverName}
                        </Descriptions.Item>
                        <Descriptions.Item label="审批时间">
                          {approval.approveTime}
                        </Descriptions.Item>
                      </>
                    )}
                    {approval.approveRemark && (
                      <Descriptions.Item label="审批意见" span={2}>
                        {approval.approveRemark}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Space>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </div>
  );

  const getTitle = () => {
    const titles = {
      submit: '提交审批',
      process: '处理审批',
      history: '审批历史',
    };
    return (
      <Space>
        {mode === 'submit' ? (
          <SendOutlined style={{ color: '#00d4ff' }} />
        ) : mode === 'process' ? (
          <CheckCircleOutlined style={{ color: '#00d4ff' }} />
        ) : (
          <HistoryOutlined style={{ color: '#00d4ff' }} />
        )}
        <span>{titles[mode]} - {contractNo}</span>
      </Space>
    );
  };

  const getFooter = () => {
    if (mode === 'history') {
      return <Button onClick={onClose}>关闭</Button>;
    }

    return (
      <Space>
        <Button onClick={onClose}>取消</Button>
        <Button
          type="primary"
          onClick={mode === 'submit' ? handleSubmit : handleProcess}
          loading={loading}
          icon={mode === 'submit' ? <SendOutlined /> : <CheckCircleOutlined />}
          style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
            border: 'none',
          }}
        >
          {mode === 'submit' ? '提交审批' : '确认审批'}
        </Button>
      </Space>
    );
  };

  return (
    <Modal
      title={getTitle()}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={getFooter()}
    >
      {mode === 'submit' && renderSubmitForm()}
      {mode === 'process' && renderProcessForm()}
      {mode === 'history' && renderHistory()}
    </Modal>
  );
};

export default ContractApprovalModal;
