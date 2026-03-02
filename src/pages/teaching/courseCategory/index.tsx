import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Tree,
  message,
  Tooltip,
  Select,
  InputNumber,
  Popconfirm,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  BookOutlined,
  CodeOutlined,
  ExperimentOutlined,
  BulbOutlined,
  RocketOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import {
  getCourseCategoryTree,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  updateCourseCategoryStatus,
  type CourseCategory,
  type CourseCategoryFormData,
} from '@/api/courseCategory';

// 图标选项
const iconOptions = [
  { label: '文件夹', value: 'FolderOutlined', icon: <FolderOutlined /> },
  { label: '打开文件夹', value: 'FolderOpenOutlined', icon: <FolderOpenOutlined /> },
  { label: '书本', value: 'BookOutlined', icon: <BookOutlined /> },
  { label: '代码', value: 'CodeOutlined', icon: <CodeOutlined /> },
  { label: '实验', value: 'ExperimentOutlined', icon: <ExperimentOutlined /> },
  { label: '灯泡', value: 'BulbOutlined', icon: <BulbOutlined /> },
  { label: '火箭', value: 'RocketOutlined', icon: <RocketOutlined /> },
  { label: '皇冠', value: 'CrownOutlined', icon: <CrownOutlined /> },
  { label: '星星', value: 'StarOutlined', icon: <StarOutlined /> },
  { label: '火焰', value: 'FireOutlined', icon: <FireOutlined /> },
  { label: '闪电', value: 'ThunderboltOutlined', icon: <ThunderboltOutlined /> },
  { label: '心形', value: 'HeartOutlined', icon: <HeartOutlined /> },
];

// 根据图标名称获取图标组件
const getIconComponent = (iconName?: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    FolderOutlined: <FolderOutlined />,
    FolderOpenOutlined: <FolderOpenOutlined />,
    BookOutlined: <BookOutlined />,
    CodeOutlined: <CodeOutlined />,
    ExperimentOutlined: <ExperimentOutlined />,
    BulbOutlined: <BulbOutlined />,
    RocketOutlined: <RocketOutlined />,
    CrownOutlined: <CrownOutlined />,
    StarOutlined: <StarOutlined />,
    FireOutlined: <FireOutlined />,
    ThunderboltOutlined: <ThunderboltOutlined />,
    HeartOutlined: <HeartOutlined />,
  };
  return iconName ? iconMap[iconName] || <FolderOutlined /> : <FolderOutlined />;
};

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
  },
  filterBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
  },
  treeContainer: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    minHeight: 400,
  },
  treeNode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '4px 8px',
    borderRadius: 6,
  },
  nodeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nodeName: {
    color: '#fff',
    fontWeight: 500,
    fontSize: 14,
  },
  nodeActions: {
    display: 'flex',
    gap: 4,
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  iconSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 8,
  },
  iconOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  iconOptionSelected: {
    border: '1px solid #00d4ff',
    background: 'rgba(0, 212, 255, 0.1)',
  },
};

export default function CourseCategoryPage() {
  const [_loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CourseCategory[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  // 加载分类树
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await getCourseCategoryTree();
      setCategories(response || []);
      setFilteredCategories(response || []);
      // 默认展开所有节点
      const allKeys = getAllKeys(response || []);
      setExpandedKeys(allKeys);
    } catch (error: any) {
      message.error(error.message || '加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 获取所有节点的key
  const getAllKeys = (data: CourseCategory[]): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (nodes: CourseCategory[]) => {
      nodes.forEach((node) => {
        keys.push(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  // 搜索过滤
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filterTree = (nodes: CourseCategory[]): CourseCategory[] => {
      const filtered = nodes
        .map((node) => {
          const matchName = node.name.toLowerCase().includes(value.toLowerCase());
          const matchDesc = node.description?.toLowerCase().includes(value.toLowerCase());
          const children = node.children ? filterTree(node.children) : undefined;

          if (matchName || matchDesc || (children && children.length > 0)) {
            return { ...node, children };
          }
          return null;
        })
        .filter((node) => node !== null) as CourseCategory[];
      return filtered;
    };

    const filtered = filterTree(categories);
    setFilteredCategories(filtered);
    // 展开所有匹配的节点
    setExpandedKeys(getAllKeys(filtered));
  };

  // 转换为树形数据
  const convertToTreeData = (data: CourseCategory[]): DataNode[] => {
    return data.map((item) => ({
      key: item.id,
      title: renderTreeNode(item),
      children: item.children ? convertToTreeData(item.children) : undefined,
    }));
  };

  // 渲染树节点
  const renderTreeNode = (category: CourseCategory) => {
    return (
      <div
        style={styles.treeNode}
        className="tree-node-wrapper"
        onMouseEnter={(e) => {
          const actions = e.currentTarget.querySelector('.node-actions') as HTMLElement;
          if (actions) actions.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          const actions = e.currentTarget.querySelector('.node-actions') as HTMLElement;
          if (actions) actions.style.opacity = '0';
        }}
      >
        <div style={styles.nodeInfo}>
          <span style={{ color: '#00d4ff', fontSize: 16 }}>
            {getIconComponent(category.icon)}
          </span>
          <span style={styles.nodeName}>{category.name}</span>
          {category.description && (
            <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
              {category.description}
            </span>
          )}
          <Tag
            style={{
              background:
                category.status === 'active'
                  ? 'rgba(0, 255, 136, 0.1)'
                  : 'rgba(255, 77, 106, 0.1)',
              border: `1px solid ${
                category.status === 'active'
                  ? 'rgba(0, 255, 136, 0.3)'
                  : 'rgba(255, 77, 106, 0.3)'
              }`,
              color: category.status === 'active' ? '#00ff88' : '#ff4d6a',
            }}
          >
            {category.status === 'active' ? '启用' : '禁用'}
          </Tag>
        </div>
        <div className="node-actions" style={styles.nodeActions}>
          <Tooltip title="添加子分类">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              style={{ color: '#00ff88' }}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd(category);
              }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              style={{ color: '#00d4ff' }}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(category);
              }}
            />
          </Tooltip>
          <Tooltip title={category.status === 'active' ? '禁用' : '启用'}>
            <Switch
              size="small"
              checked={category.status === 'active'}
              onChange={(checked) => handleStatusChange(category.id, checked)}
              onClick={(_, e) => e.stopPropagation()}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="删除后将无法恢复，确认删除该分类吗？"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(category.id);
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              style={{ color: '#ff4d6a' }}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </div>
      </div>
    );
  };

  // 新增分类
  const handleAdd = (parent?: CourseCategory) => {
    setEditingCategory(null);
    setModalVisible(true);
    form.resetFields();
    if (parent) {
      form.setFieldsValue({ parentId: parent.id });
    }
  };

  // 编辑分类
  const handleEdit = (category: CourseCategory) => {
    setEditingCategory(category);
    setModalVisible(true);
    form.setFieldsValue({
      name: category.name,
      parentId: category.parentId,
      icon: category.icon || 'FolderOutlined',
      sort: category.sort,
      status: category.status,
      description: category.description,
    });
  };

  // 删除分类
  const handleDelete = async (id: number) => {
    try {
      await deleteCourseCategory(id);
      message.success('删除成功');
      loadCategories();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 状态切换
  const handleStatusChange = async (id: number, checked: boolean) => {
    try {
      await updateCourseCategoryStatus(id, checked ? 'active' : 'inactive');
      message.success('状态更新成功');
      loadCategories();
    } catch (error: any) {
      message.error(error.message || '状态更新失败');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: CourseCategoryFormData = {
        ...values,
        id: editingCategory?.id,
      };

      if (editingCategory) {
        await updateCourseCategory(formData);
        message.success('修改成功');
      } else {
        await createCourseCategory(formData);
        message.success('新增成功');
      }

      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error.message || '操作失败');
    }
  };

  // 获取父分类选项（排除自己和子孙节点）
  const getParentOptions = (
    data: CourseCategory[],
    excludeId?: number
  ): Array<{ label: string; value: number }> => {
    const options: Array<{ label: string; value: number }> = [];
    const traverse = (nodes: CourseCategory[], level = 0) => {
      nodes.forEach((node) => {
        if (node.id !== excludeId) {
          options.push({
            label: '　'.repeat(level) + node.name,
            value: node.id,
          });
          if (node.children && node.children.length > 0) {
            traverse(node.children, level + 1);
          }
        }
      });
    };
    traverse(data);
    return options;
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.pageHeader}>
        <div style={styles.pageTitle}>
          <AppstoreOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
          课程分类管理
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={styles.actionButton}
            onClick={() => handleAdd()}
          >
            新增分类
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadCategories}>
            刷新
          </Button>
        </Space>
      </div>

      <Card style={styles.card} bordered={false}>
        <div style={styles.filterBar}>
          <Input
            placeholder="搜索分类名称或描述"
            prefix={<SearchOutlined />}
            style={{ width: 320 }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>

        <div style={styles.treeContainer}>
          {filteredCategories.length > 0 ? (
            <Tree
              showLine
              defaultExpandAll
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              treeData={convertToTreeData(filteredCategories)}
              style={{
                background: 'transparent',
                color: '#fff',
              }}
            />
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: 60,
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              {searchText ? '未找到匹配的分类' : '暂无分类数据'}
            </div>
          )}
        </div>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="分类名称"
            name="name"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 50, message: '分类名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item label="父分类" name="parentId">
            <Select
              placeholder="请选择父分类（不选则为顶级分类）"
              allowClear
              options={[
                { label: '无（顶级分类）', value: null },
                ...getParentOptions(categories, editingCategory?.id),
              ]}
            />
          </Form.Item>

          <Form.Item
            label="分类图标"
            name="icon"
            initialValue="FolderOutlined"
          >
            <div style={styles.iconSelector}>
              {iconOptions.map((option) => (
                <div
                  key={option.value}
                  style={{
                    ...styles.iconOption,
                    ...(form.getFieldValue('icon') === option.value
                      ? styles.iconOptionSelected
                      : {}),
                  }}
                  onClick={() => form.setFieldsValue({ icon: option.value })}
                >
                  <span style={{ fontSize: 20, color: '#00d4ff' }}>
                    {option.icon}
                  </span>
                </div>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            label="排序"
            name="sort"
            initialValue={0}
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber
              min={0}
              max={9999}
              style={{ width: '100%' }}
              placeholder="数值越小越靠前"
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue="active"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea
              rows={3}
              placeholder="请输入分类描述"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
