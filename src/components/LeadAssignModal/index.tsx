import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  message,
  Space,
  Radio,
  InputNumber,
  Alert,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { batchAssignLeads } from '@/api/lead';

interface LeadAssignModalProps {
  visible: boolean;
  leadIds: number[];
  onCancel: () => void;
  onSuccess: () => void;
}

// 分配模式
type AssignMode = 'manual' | 'auto';

export default function LeadAssignModal({
  visible,
  leadIds,
  onCancel,
  onSuccess,
}: LeadAssignModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [assignMode, setAssignMode] = useState<AssignMode>('manual');
  const [advisors, setAdvisors] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setAssignMode('manual');
      // TODO: 加载顾问列表
      loadAdvisors();
    }
  }, [visible, form]);

  // 加载顾问列表
  const loadAdvisors = async () => {
    try {
      // TODO: 调用API获取顾问列表
      // const result = await getAdvisorList();
      // setAdvisors(result);

      // 模拟数据
      setAdvisors([
        { id: 1, name: '张顾问', workload: 10 },
        { id: 2, name: '李顾问', workload: 8 },
        { id: 3, name: '王顾问', workload: 12 },
      ]);
    } catch (error) {
      message.error('加载顾问列表失败');
    }
  };

  // 提交分配
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (assignMode === 'manual') {
        // 手动分配
        await batchAssignLeads(leadIds, values.advisorId);
        message.success(`成功分配 ${leadIds.length} 条线索`);
      } else {
        // 自动分配
        // TODO: 调用自动分配API
        message.success(`成功自动分配 ${leadIds.length} 条线索`);
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error.message || '分配失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined style={{ color: '#00d4ff' }} />
          <span>批量分配线索</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      styles={{
        body: {
          padding: '24px',
        },
      }}
    >
      <Alert
        message={`已选择 ${leadIds.length} 条线索`}
        type="info"
        showIcon
        style={{
          marginBottom: 24,
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
        }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          assignMode: 'manual',
        }}
      >
        <Form.Item
          label="分配模式"
          name="assignMode"
        >
          <Radio.Group
            onChange={(e) => setAssignMode(e.target.value)}
            value={assignMode}
          >
            <Radio value="manual">手动分配</Radio>
            <Radio value="auto">自动分配</Radio>
          </Radio.Group>
        </Form.Item>

        {assignMode === 'manual' ? (
          <Form.Item
            label="选择顾问"
            name="advisorId"
            rules={[{ required: true, message: '请选择顾问' }]}
          >
            <Select
              placeholder="请选择顾问"
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
            >
              {advisors.map((advisor) => (
                <Select.Option key={advisor.id} value={advisor.id}>
                  {advisor.name} (当前负责: {advisor.workload} 条)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <>
            <Form.Item
              label="分配规则"
              name="assignRule"
              initialValue="balanced"
            >
              <Radio.Group>
                <Radio value="balanced">负载均衡</Radio>
                <Radio value="round_robin">轮询分配</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="每人最多分配"
              name="maxPerAdvisor"
              initialValue={10}
            >
              <InputNumber
                min={1}
                max={100}
                style={{ width: '100%' }}
                placeholder="每个顾问最多分配的线索数量"
              />
            </Form.Item>

            <Alert
              message="自动分配说明"
              description="系统将根据所选规则，自动将线索分配给当前负载较低的顾问"
              type="info"
              showIcon
              style={{
                background: 'rgba(0, 212, 255, 0.05)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}
            />
          </>
        )}
      </Form>
    </Modal>
  );
}
