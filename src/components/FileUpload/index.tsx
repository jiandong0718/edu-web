import { useState } from 'react';
import { Upload, Button, message, Progress } from 'antd';
import { UploadOutlined, InboxOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload';
import type { RcFile } from 'antd/es/upload/interface';

export interface FileUploadProps {
  // 上传类型：button | drag
  type?: 'button' | 'drag';
  // 最大文件数量
  maxCount?: number;
  // 最大文件大小（MB）
  maxSize?: number;
  // 允许的文件类型
  accept?: string;
  // 文件列表
  fileList?: UploadFile[];
  // 文件列表变化回调
  onChange?: (fileList: UploadFile[]) => void;
  // 上传前校验
  beforeUpload?: (file: RcFile) => boolean | Promise<boolean>;
  // 自定义上传
  customRequest?: UploadProps['customRequest'];
  // 是否显示上传列表
  showUploadList?: boolean;
  // 是否禁用
  disabled?: boolean;
  // 提示文本
  hint?: string;
}

const styles = {
  container: {
    width: '100%',
  },
  dragArea: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '2px dashed rgba(0, 212, 255, 0.3)',
    borderRadius: 12,
    padding: '40px 20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  dragAreaHover: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '2px dashed rgba(0, 212, 255, 0.5)',
  },
  dragIcon: {
    fontSize: 48,
    color: '#00d4ff',
    marginBottom: 16,
  },
  dragText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  dragHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderRadius: 8,
    marginTop: 12,
  },
  fileName: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  fileActions: {
    display: 'flex',
    gap: 8,
  },
  actionButton: {
    color: '#00d4ff',
    cursor: 'pointer',
    fontSize: 16,
  },
  deleteButton: {
    color: '#ff4d6a',
    cursor: 'pointer',
    fontSize: 16,
  },
};

export function FileUpload({
  type = 'button',
  maxCount = 1,
  maxSize = 10,
  accept,
  fileList = [],
  onChange,
  beforeUpload,
  customRequest,
  showUploadList = true,
  disabled = false,
  hint,
}: FileUploadProps) {
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>(fileList);

  // 默认上传前校验
  const defaultBeforeUpload = (file: RcFile) => {
    // 检查文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    // 检查文件类型
    if (accept) {
      const acceptTypes = accept.split(',').map((t) => t.trim());
      const fileType = file.type;
      const fileName = file.name;
      const fileExt = fileName.substring(fileName.lastIndexOf('.'));

      const isAccepted = acceptTypes.some(
        (type) => fileType.includes(type.replace('*', '')) || fileExt === type
      );

      if (!isAccepted) {
        message.error(`只支持上传 ${accept} 格式的文件`);
        return false;
      }
    }

    return true;
  };

  // 处理文件变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setUploadFileList(newFileList);
    if (onChange) {
      onChange(newFileList);
    }
  };

  // 处理文件预览
  const handlePreview = (file: UploadFile) => {
    if (file.url || file.preview) {
      window.open(file.url || file.preview, '_blank');
    }
  };

  // 处理文件删除
  const handleRemove = (file: UploadFile) => {
    const newFileList = uploadFileList.filter((item) => item.uid !== file.uid);
    setUploadFileList(newFileList);
    if (onChange) {
      onChange(newFileList);
    }
  };

  const uploadProps: UploadProps = {
    fileList: uploadFileList,
    onChange: handleChange,
    beforeUpload: beforeUpload || defaultBeforeUpload,
    customRequest,
    maxCount,
    accept,
    disabled,
    showUploadList: false,
  };

  return (
    <div style={styles.container}>
      {type === 'drag' ? (
        <Upload.Dragger {...uploadProps}>
          <div>
            <p>
              <InboxOutlined style={styles.dragIcon} />
            </p>
            <p style={styles.dragText}>点击或拖拽文件到此区域上传</p>
            <p style={styles.dragHint}>
              {hint || `支持单个或批量上传，单个文件不超过 ${maxSize}MB`}
            </p>
          </div>
        </Upload.Dragger>
      ) : (
        <Upload {...uploadProps}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            disabled={disabled || (maxCount > 0 && uploadFileList.length >= maxCount)}
            style={styles.uploadButton}
          >
            选择文件
          </Button>
          {hint && (
            <div style={{ ...styles.dragHint, marginTop: 8, textAlign: 'left' }}>{hint}</div>
          )}
        </Upload>
      )}

      {/* 自定义文件列表 */}
      {showUploadList && uploadFileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {uploadFileList.map((file) => (
            <div key={file.uid} style={styles.fileItem}>
              <div style={styles.fileName}>{file.name}</div>
              {file.status === 'uploading' && (
                <Progress
                  percent={file.percent}
                  size="small"
                  strokeColor={{
                    '0%': '#00d4ff',
                    '100%': '#0099ff',
                  }}
                  style={{ width: 100, marginLeft: 12 }}
                />
              )}
              {file.status === 'done' && (
                <div style={styles.fileActions}>
                  <EyeOutlined
                    style={styles.actionButton}
                    onClick={() => handlePreview(file)}
                  />
                  <DeleteOutlined
                    style={styles.deleteButton}
                    onClick={() => handleRemove(file)}
                  />
                </div>
              )}
              {file.status === 'error' && (
                <div style={{ color: '#ff4d6a', fontSize: 12 }}>上传失败</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
