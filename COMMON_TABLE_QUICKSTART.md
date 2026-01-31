# CommonTable 快速开始

## 5分钟上手指南

### 1. 安装依赖（可选）

如果需要使用导出功能：

```bash
npm install xlsx
```

### 2. 最简单的使用

```tsx
import { CommonTable } from '@/components/CommonTable';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
];

const data = [
  { id: 1, name: '项目A' },
  { id: 2, name: '项目B' },
];

function MyPage() {
  return (
    <CommonTable
      columns={columns}
      dataSource={data}
      rowKey="id"
    />
  );
}
```

### 3. 添加常用功能

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  searchable              // 添加搜索框
  exportable              // 添加导出按钮
  showRefresh             // 添加刷新按钮
  showColumnSetting       // 添加列设置按钮
/>
```

### 4. 使用后端分页

```tsx
const fetchData = async (params) => {
  const response = await fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
};

<CommonTable
  columns={columns}
  onFetch={fetchData}     // 使用后端分页
  rowKey="id"
  searchable
  exportable
/>
```

### 5. 添加行选择和批量操作

```tsx
function MyPage() {
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <CommonTable
      columns={columns}
      dataSource={data}
      rowKey="id"
      rowSelection                    // 启用行选择
      onSelectionChange={(keys, rows) => {
        setSelectedRows(rows);
      }}
      toolbarRender={() => (         // 自定义工具栏
        <Button
          danger
          disabled={selectedRows.length === 0}
          onClick={() => console.log('删除', selectedRows)}
        >
          批量删除
        </Button>
      )}
    />
  );
}
```

## 常用配置

### 分页配置

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  pagination={{
    pageSize: 20,           // 每页20条
    showSizeChanger: true,  // 显示每页条数切换器
    showQuickJumper: true,  // 显示快速跳转
  }}
/>
```

### 导出配置

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  exportable
  exportFileName="我的数据"
  exportConfig={{
    sheetName: '数据表',
    columns: ['id', 'name'],  // 只导出这些列
  }}
/>
```

### 搜索配置

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  searchable
  searchPlaceholder="搜索姓名、手机号"
  onSearch={(value) => {
    console.log('搜索:', value);
  }}
/>
```

## 完整示例

查看以下文件获取完整示例：

- `/src/pages/examples/TableExample.tsx` - 完整功能示例
- `/src/pages/examples/SimpleTableExample.tsx` - 简单示例

## 详细文档

- 完整使用指南：`/COMMON_TABLE_GUIDE.md`
- API 文档：查看使用指南中的 API 部分
- 迁移指南：`/COMMON_TABLE_MIGRATION.md`

## 常见问题

**Q: 如何实现后端分页？**
```tsx
const fetchData = async (params) => {
  // params 包含: current, pageSize, filters, sorter, search
  const response = await fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  // 返回格式: { data: [], total: 100 }
  return response.json();
};

<CommonTable onFetch={fetchData} />
```

**Q: 如何自定义列渲染？**
```tsx
const columns = [
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'active' ? 'success' : 'default'}>
        {status}
      </Tag>
    ),
  },
];
```

**Q: 如何添加操作列？**
```tsx
const columns = [
  // ... 其他列
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space>
        <Button type="link" onClick={() => handleEdit(record)}>
          编辑
        </Button>
        <Button type="link" danger onClick={() => handleDelete(record)}>
          删除
        </Button>
      </Space>
    ),
  },
];
```

## 获取帮助

- 查看完整文档：`/COMMON_TABLE_GUIDE.md`
- 查看示例代码：`/src/pages/examples/`
- 联系开发团队

## 下一步

1. 尝试运行示例页面
2. 在你的项目中使用组件
3. 根据需求调整配置
4. 查看完整文档了解更多功能

祝你使用愉快！
