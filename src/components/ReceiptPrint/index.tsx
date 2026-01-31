import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, message, Radio, InputNumber, Space } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { getReceiptDetail, downloadReceiptPdf, type ReceiptDetail } from '@/api/payment';
import './index.less';

interface ReceiptPrintProps {
  visible: boolean;
  paymentId: number | null;
  onClose: () => void;
}

const ReceiptPrint: React.FC<ReceiptPrintProps> = ({ visible, paymentId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptDetail | null>(null);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    if (visible && paymentId) {
      loadReceiptData();
    }
  }, [visible, paymentId]);

  const loadReceiptData = async () => {
    if (!paymentId) return;

    setLoading(true);
    try {
      const response = await getReceiptDetail(paymentId);
      setReceiptData(response.data);
    } catch (error) {
      message.error('加载收据数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!paymentId) return;

    setLoading(true);
    try {
      const response = await downloadReceiptPdf(paymentId);

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${receiptData?.receiptNo || paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('下载成功');
    } catch (error) {
      message.error('下载失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="打印收据"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={loading}
        >
          下载PDF
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          loading={loading}
        >
          打印
        </Button>,
      ]}
      className="receipt-print-modal"
    >
      <Spin spinning={loading}>
        {/* 打印设置 */}
        <div className="print-settings">
          <Space size="large">
            <div>
              <span style={{ marginRight: 8 }}>纸张大小：</span>
              <Radio.Group value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                <Radio.Button value="A4">A4</Radio.Button>
                <Radio.Button value="A5">A5</Radio.Button>
              </Radio.Group>
            </div>
            <div>
              <span style={{ marginRight: 8 }}>打印方向：</span>
              <Radio.Group value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                <Radio.Button value="portrait">纵向</Radio.Button>
                <Radio.Button value="landscape">横向</Radio.Button>
              </Radio.Group>
            </div>
            <div>
              <span style={{ marginRight: 8 }}>打印份数：</span>
              <InputNumber
                min={1}
                max={10}
                value={copies}
                onChange={(value) => setCopies(value || 1)}
                style={{ width: 80 }}
              />
            </div>
          </Space>
        </div>

        {/* 收据预览 */}
        {receiptData && (
          <div className={`receipt-preview ${paperSize} ${orientation}`}>
            <div className="receipt-container">
              <div className="receipt-header">
                <h1 className="receipt-title">收据</h1>
                <div className="receipt-no">收据编号：{receiptData.receiptNo}</div>
              </div>

              <div className="receipt-section">
                <div className="receipt-row">
                  <span className="label">收款日期：</span>
                  <span className="value">{receiptData.paymentDate}</span>
                </div>
              </div>

              <div className="receipt-section">
                <div className="receipt-row">
                  <span className="label">学员姓名：</span>
                  <span className="value">{receiptData.studentInfo.name}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">学员编号：</span>
                  <span className="value">{receiptData.studentInfo.studentNo}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">联系电话：</span>
                  <span className="value">{receiptData.studentInfo.phone}</span>
                </div>
              </div>

              <div className="receipt-section">
                <table className="receipt-table">
                  <thead>
                    <tr>
                      <th>收款项目</th>
                      <th>数量</th>
                      <th>单价（元）</th>
                      <th>金额（元）</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{receiptData.paymentItem.name}</td>
                      <td>{receiptData.paymentItem.quantity}</td>
                      <td>{receiptData.paymentItem.unitPrice}</td>
                      <td>{receiptData.amount}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="receipt-row">
                  <span className="label">合同编号：</span>
                  <span className="value">{receiptData.paymentItem.contractNo}</span>
                </div>
              </div>

              <div className="amount-section">
                <div className="receipt-row">
                  <span className="label">收款金额：</span>
                  <span className="value">{receiptData.amount} 元</span>
                </div>
                <div className="amount-large">
                  人民币（大写）：{receiptData.amountInWords}
                </div>
              </div>

              <div className="receipt-section">
                <div className="receipt-row">
                  <span className="label">收款方式：</span>
                  <span className="value">{receiptData.paymentMethod}</span>
                </div>
                <div className="receipt-row">
                  <span className="label">收款人：</span>
                  <span className="value">{receiptData.receiver}</span>
                </div>
              </div>

              {receiptData.remark && (
                <div className="receipt-section">
                  <div className="receipt-row">
                    <span className="label">备注：</span>
                    <span className="value">{receiptData.remark}</span>
                  </div>
                </div>
              )}

              <div className="receipt-footer">
                <div className="signature-section">
                  <div className="signature-item">
                    <div>收款单位（盖章）</div>
                    <div className="signature-line"></div>
                  </div>
                  <div className="signature-item">
                    <div>经办人（签字）</div>
                    <div className="signature-line"></div>
                  </div>
                </div>
              </div>

              <div className="institution-info">
                <div>{receiptData.institutionInfo.name}</div>
                {receiptData.institutionInfo.campusName && (
                  <div>校区：{receiptData.institutionInfo.campusName}</div>
                )}
                <div>地址：{receiptData.institutionInfo.address}</div>
                <div>电话：{receiptData.institutionInfo.phone}</div>
              </div>
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ReceiptPrint;
