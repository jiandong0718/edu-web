import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Space,
  Tag,
  message,
  Modal,
  Form,
  Popconfirm,
  ColorPicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { CommonTable } from '@/components/CommonTable';
import type { ColumnsType } from 'antd/es/table';
import type { StudentTag, StudentTagQueryParams, StudentTagFormData } from '@/types/student';
import {
  getStudentTagList,
  createStudentTag,
  updateStudentTag,
  deleteStudentTag,
} from '@/api/student';
import type { Color } from 'antd/es/color-picker';

const { Search } = Input;
const { TextArea } = Input;

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
};

export function Component() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<StudentTag[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<StudentTagQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<number>();
  const [form] = Form.useForm();
  const [tagColor, setTagColor] = useState<string>('#00d4ff');

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStudentTagList(queryParams);
      setDataSource(res.list);
      setTotal(res.total);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 搜索
  const handleSearch = (value: string) => {
    setQueryParams({ ...queryParams, name: value, page: 1 });
  };

  // 重置
  const handleReset = () => {
    setQueryParams({ page: 1, pageSize: 10 });
  };

  // 新增
  const handleAdd = () => {
    setEditingId(undefined);
    setTagColor('#00d4ff');
    form.resetFields();
    setFormVisible(true);
  };

  // 编辑
  const handleEdit = (record: StudentTag) => {
    setEditingId(record.id);
    setTagColor(record.color);
    form.setFieldsValue(record);
    setFormVisible(true);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteStudentTag(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: StudentTagFormData = {
        ...values,
        color: tagColor,
      };

      if (editingId) {
        await updateStudentTag(editingId, formData);
        message.success('更新成功');
      } else {
        await createStudentTag(formData);
        message.success('创建成功');
      }
      setFormVisible(false);
      loadData();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error.message || '操作失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<StudentTag> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Tag
          style={{
            background: `${record.color}20`,
            border: `1px solid ${record.color}`,
            color: record.color,
            fontSize: 14,
            padding: '4px 12px',
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              background: color,
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{color}</span>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text || '-'}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (text: string) => <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{text}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#00d4ff' }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除这个标签吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d6a' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <TagsOutlined />
          学员标签管理
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={styles.actionButton}
        >
          新增标签
        </Button>
      </div>

      {/* 筛选栏 */}
      <div style={styles.filterBar}>
        <Search
          placeholder="搜索标签名称"
          allowClear
          style={{ width: 240 }}
          onSearch={handleSearch}
        />
        <Button onClick={handleReset}>重置</Button>
      </div>

      {/* 表格 */}
      <CommonTable<StudentTag>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total,
          onChange: (page, pageSize) => {
            setQueryParams({ ...queryParams, page, pageSize });
          },
        }}
        showRefresh
        onRefresh={loadData}
      />

      {/* 新增/编辑表单 */}
      <Modal
        title={editingId ? '编辑标签' : '新增标签'}
        open={formVisible}
        onOk={handleSubmit}
        onCancel={() => setFormVisible(false)}
        width={500}
        okText="提交"
        cancelText="取消"
        styles={{
          body: { background: '#111827' },
          header: { background: '#111827', borderBottom: '1px solid rgba(0, 212, 255, 0.1)' },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标签名称"
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item label="标签颜色" required>
            <ColorPicker
              value={tagColor}
              onChange={(color: Color) => setTagColor(color.toHexString())}
              showText
              presets={[
                {
                  label: '推荐颜色',
                  colors: [
                    '#00d4ff',
                    '#0099ff',
                    '#00ff88',
                    '#ffaa00',
                    '#ff4d6a',
                    '#9d4edd',
                    '#06ffa5',
                    '#ff006e',
                  ],
                },
              ]}
            />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea rows={3} placeholder="请输入标签描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Component;
