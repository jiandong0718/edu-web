import { Form, Button, Space, message } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { FormProps, FormInstance } from 'antd/es/form';
import type { ReactNode } from 'react';
import { useState } from 'react';

export interface CommonFormProps extends FormProps {
  // 表单实例
  form?: FormInstance;
  // 提交按钮文本
  submitText?: string;
  // 取消按钮文本
  cancelText?: string;
  // 是否显示取消按钮
  showCancel?: boolean;
  // 提交处理函数
  onSubmit?: (values: any) => Promise<void> | void;
  // 取消处理函数
  onCancel?: () => void;
  // 是否显示操作按钮
  showActions?: boolean;
  // 自定义操作按钮
  actions?: ReactNode;
  // 子元素
  children?: ReactNode;
}

const styles = {
  container: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
    minWidth: 100,
  },
  cancelButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.65)',
    minWidth: 100,
  },
};

export function CommonForm({
  form: externalForm,
  submitText = '提交',
  cancelText = '取消',
  showCancel = true,
  onSubmit,
  onCancel,
  showActions = true,
  actions,
  children,
  ...restProps
}: CommonFormProps) {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const [loading, setLoading] = useState(false);

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (onSubmit) {
        setLoading(true);
        try {
          await onSubmit(values);
          message.success('提交成功');
        } catch (error: any) {
          message.error(error.message || '提交失败');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div style={styles.container}>
      <Form
        form={form}
        layout="vertical"
        {...restProps}
      >
        {children}

        {/* 操作按钮 */}
        {showActions && (
          <div style={styles.actions}>
            {actions || (
              <Space size="middle">
                {showCancel && (
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    style={styles.cancelButton}
                    disabled={loading}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  style={styles.submitButton}
                >
                  {submitText}
                </Button>
              </Space>
            )}
          </div>
        )}
      </Form>
    </div>
  );
}

export default CommonForm;
