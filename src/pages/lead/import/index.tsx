import { useState } from 'react';
import {
  Card,
  Button,
  Upload,
  Space,
  message,
  Table,
  Alert,
  Steps,
  Result,
  Progress,
} from 'antd';
import {
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ImportOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import type { ColumnsType } from 'antd/es/table';
import { downloadLeadTemplate, importLeads } from '@/api/lead';
import type { LeadImportResult } from '@/types/lead';

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
    marginBottom: 24,
  },
  stepCard: {
    background: '#111827',
    border: '1px solid rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  uploadArea: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '2px dashed rgba(0, 212, 255, 0.3)',
    borderRadius: 12,
    padding: 60,
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  uploadIcon: {
    fontSize: 64,
    color: '#00d4ff',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  downloadButton: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    color: '#00d4ff',
  },
};

export function Component() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<LeadImportResult>();
  const [downloading, setDownloading] = useState(false);

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      await downloadLeadTemplate();
      message.success('模板下载成功');
    } catch (error) {
      message.error('模板下载失败');
    } finally {
      setDownloading(false);
    }
  };

  // 上传配置
  const uploadProps: UploadProps = {
    accept: '.xlsx,.xls',
    maxCount: 1,
    fileList,
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error('只能上传 Excel 文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB！');
        return false;
      }
      setFileList([file]);
      setCurrentStep(1);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setCurrentStep(0);
      setImportResult(undefined);
    },
  };

  // 开始导入
  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error('请先上传文件');
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0] as any;
      const result = await importLeads(file);
      setImportResult(result);
      setCurrentStep(2);
      if (result.failed === 0) {
        message.success(`导入成功！共导入 ${result.success} 条数据`);
      } else {
        message.warning(
          `导入完成！成功 ${result.success} 条，失败 ${result.failed} 条`
        );
      }
    } catch (error: any) {
      message.error(error.message || '导入失败');
    } finally {
      setUploading(false);
    }
  };

  // 重新导入
  const handleReset = () => {
    setFileList([]);
    setCurrentStep(0);
    setImportResult(undefined);
  };

  // 错误列表列定义
  const errorColumns: ColumnsType<{ row: number; message: string }> = [
    {
      title: '行号',
      dataIndex: 'row',
      key: 'row',
      width: 100,
      align: 'center',
      render: (text: number) => (
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>第 {text} 行</span>
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => <span style={{ color: '#ff4d6a' }}>{text}</span>,
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <ImportOutlined />
          线索批量导入
        </div>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          loading={downloading}
          style={styles.downloadButton}
        >
          下载导入模板
        </Button>
      </div>

      {/* 步骤条 */}
      <div style={styles.stepCard}>
        <Steps current={currentStep}>
          <Steps.Step title="上传文件" description="选择要导入的 Excel 文件" />
          <Steps.Step title="确认导入" description="检查文件并开始导入" />
          <Steps.Step title="导入完成" description="查看导入结果" />
        </Steps>
      </div>

      {/* 导入说明 */}
      <Card style={styles.card} bordered={false}>
        <Alert
          message="导入说明"
          description={
            <div>
              <p>1. 请先下载导入模板，按照模板格式填写线索信息</p>
              <p>2. 必填字段：姓名、手机号</p>
              <p>3. 性别填写：男 或 女</p>
              <p>4. 来源填写：offline（地推）、referral（转介绍）、online_ad（线上广告）、walk_in（自然到访）、phone（电话咨询）</p>
              <p>5. 意向程度填写：high（高）、medium（中）、low（低）</p>
              <p>6. 单次最多导入 1000 条数据</p>
            </div>
          }
          type="info"
          showIcon
          style={{
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
          }}
        />
      </Card>

      {/* 步骤1: 上传文件 */}
      {currentStep === 0 && (
        <Card style={styles.card} bordered={false}>
          <Upload.Dragger {...uploadProps}>
            <div>
              <InboxOutlined style={styles.uploadIcon} />
              <div style={styles.uploadText}>点击或拖拽文件到此区域上传</div>
              <div style={styles.uploadHint}>
                支持 .xlsx 和 .xls 格式，文件大小不超过 10MB
              </div>
            </div>
          </Upload.Dragger>
        </Card>
      )}

      {/* 步骤2: 确认导入 */}
      {currentStep === 1 && (
        <Card style={styles.card} bordered={false}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#00ff88', marginBottom: 24 }} />
            <div style={{ fontSize: 18, color: '#fff', marginBottom: 16 }}>
              文件上传成功，准备导入
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.65)', marginBottom: 32 }}>
              文件名：{fileList[0]?.name}
            </div>
            <Space size="large">
              <Button onClick={handleReset}>重新选择</Button>
              <Button
                type="primary"
                icon={<ImportOutlined />}
                onClick={handleImport}
                loading={uploading}
                style={styles.actionButton}
              >
                开始导入
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* 步骤3: 导入完成 */}
      {currentStep === 2 && importResult && (
        <>
          <Card style={styles.card} bordered={false}>
            <Result
              status={importResult.failed === 0 ? 'success' : 'warning'}
              title={
                importResult.failed === 0
                  ? '导入成功！'
                  : '导入完成，部分数据导入失败'
              }
              subTitle={
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <Progress
                      percent={Math.round(
                        (importResult.success / (importResult.success + importResult.failed)) * 100
                      )}
                      strokeColor={{
                        '0%': '#00d4ff',
                        '100%': '#0099ff',
                      }}
                      format={(percent) => `${percent}%`}
                    />
                  </div>
                  <Space size="large">
                    <div>
                      <CheckCircleOutlined style={{ color: '#00ff88', marginRight: 8 }} />
                      成功：{importResult.success} 条
                    </div>
                    <div>
                      <CloseCircleOutlined style={{ color: '#ff4d6a', marginRight: 8 }} />
                      失败：{importResult.failed} 条
                    </div>
                  </Space>
                </div>
              }
              extra={[
                <Button key="reset" onClick={handleReset}>
                  继续导入
                </Button>,
                <Button
                  key="back"
                  type="primary"
                  onClick={() => window.history.back()}
                  style={styles.actionButton}
                >
                  返回线索列表
                </Button>,
              ]}
            />
          </Card>

          {/* 错误列表 */}
          {importResult.errors && importResult.errors.length > 0 && (
            <Card
              title={
                <span style={{ color: '#fff' }}>
                  <CloseCircleOutlined style={{ color: '#ff4d6a', marginRight: 8 }} />
                  错误详情
                </span>
              }
              style={styles.card}
              bordered={false}
            >
              <Table
                columns={errorColumns}
                dataSource={importResult.errors}
                rowKey="row"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `共 ${total} 条错误`,
                }}
                style={{
                  background: '#111827',
                }}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default Component;
