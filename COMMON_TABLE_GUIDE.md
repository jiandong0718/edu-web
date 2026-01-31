# CommonTable 通用表格组件使用指南

## 概述

CommonTable 是一个基于 Ant Design Table 封装的通用表格组件，提供了丰富的功能和深色科技风格的UI设计。

## 核心特性

- **分页支持**: 支持前端分页和后端分页
- **数据筛选**: 支持列筛选、搜索框
- **排序功能**: 支持多列排序
- **数据导出**: 支持导出Excel（基于xlsx库）
- **列配置**: 支持显示/隐藏列
- **行选择**: 支持单选、多选、批量操作
- **自动刷新**: 支持手动刷新数据
- **自定义工具栏**: 支持自定义操作按钮
- **响应式设计**: 适配不同屏幕尺寸
- **深色主题**: 科技感十足的青色渐变主题

## 安装依赖

使用导出功能需要安装 xlsx 库:

```bash
npm install xlsx
# 或
pnpm install xlsx
```

## 基础用法

### 1. 静态数据表格（前端分页）

```tsx
import { CommonTable } from '@/components/CommonTable';
import type { ColumnType } from 'antd/es/table';

interface DataType {
  id: number;
  name: string;
  age: number;
}

const columns: ColumnType<DataType>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
];

const data: DataType[] = [
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
];

function MyTable() {
  return (
    <CommonTable
      columns={columns}
      dataSource={data}
      rowKey="id"
    />
  );
}
```

### 2. 动态数据表格（后端分页）

```tsx
import { CommonTable } from '@/components/CommonTable';
import type { FetchParams, PageResult } from '@/components/CommonTable';

function MyTable() {
  const fetchData = async (params: FetchParams): Promise<PageResult<DataType>> => {
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.json();
  };

  return (
    <CommonTable
      columns={columns}
      onFetch={fetchData}
      rowKey="id"
    />
  );
}
```

## API 文档

### CommonTableProps

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| columns | 表格列配置 | `ColumnType<T>[]` | 必填 |
| dataSource | 静态数据源 | `T[]` | - |
| loading | 加载状态 | `boolean` | `false` |
| pagination | 分页配置 | `PaginationConfig \| false` | `{}` |
| onFetch | 数据获取函数（动态数据） | `(params: FetchParams) => Promise<PageResult<T>>` | - |
| rowKey | 行唯一标识 | `string \| ((record: T) => string)` | `'id'` |
| exportable | 是否可导出 | `boolean` | `false` |
| exportFileName | 导出文件名 | `string` | `'export'` |
| exportConfig | 导出配置 | `ExportConfig` | - |
| onExport | 自定义导出函数 | `(data: T[], config?: ExportConfig) => Promise<void> \| void` | - |
| searchable | 是否显示搜索框 | `boolean` | `false` |
| searchPlaceholder | 搜索框占位符 | `string` | `'请输入搜索关键词'` |
| onSearch | 搜索回调 | `(value: string) => void` | - |
| rowSelection | 是否支持行选择 | `boolean` | `false` |
| onSelectionChange | 选择变化回调 | `(selectedRowKeys: React.Key[], selectedRows: T[]) => void` | - |
| toolbarRender | 自定义工具栏 | `() => React.ReactNode` | - |
| showRefresh | 是否显示刷新按钮 | `boolean` | `true` |
| onRefresh | 刷新回调 | `() => Promise<void> \| void` | - |
| showColumnSetting | 是否显示列设置 | `boolean` | `false` |
| onChange | 表格变化回调 | `(pagination, filters, sorter) => void` | - |
| autoLoad | 是否自动加载数据 | `boolean` | `true` |

### FetchParams

```typescript
interface FetchParams {
  current: number;        // 当前页码
  pageSize: number;       // 每页条数
  filters?: Record<string, FilterValue | null>;  // 筛选条件
  sorter?: SorterResult<any> | SorterResult<any>[];  // 排序条件
  search?: string;        // 搜索关键词
}
```

### PageResult

```typescript
interface PageResult<T> {
  data: T[];              // 数据列表
  total: number;          // 总条数
  current?: number;       // 当前页码
  pageSize?: number;      // 每页条数
}
```

### ExportConfig

```typescript
interface ExportConfig {
  fileName?: string;      // 文件名
  sheetName?: string;     // 工作表名称
  columns?: string[];     // 要导出的列key
}
```

## 高级用法

### 1. 搜索功能

```tsx
<CommonTable
  columns={columns}
  onFetch={fetchData}
  searchable
  searchPlaceholder="搜索姓名、手机号"
  onSearch={(value) => {
    console.log('搜索:', value);
  }}
/>
```

### 2. 导出功能

```tsx
// 使用默认导出
<CommonTable
  columns={columns}
  dataSource={data}
  exportable
  exportFileName="学生列表"
  exportConfig={{
    sheetName: '学生数据',
    columns: ['id', 'name', 'age'], // 只导出指定列
  }}
/>

// 使用自定义导出
<CommonTable
  columns={columns}
  dataSource={data}
  exportable
  onExport={async (data, config) => {
    // 调用后端API导出
    await fetch('/api/export', {
      method: 'POST',
      body: JSON.stringify({ data, config }),
    });
  }}
/>
```

### 3. 行选择和批量操作

```tsx
function MyTable() {
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <CommonTable
      columns={columns}
      dataSource={data}
      rowSelection
      onSelectionChange={(keys, rows) => {
        setSelectedRows(rows);
      }}
      toolbarRender={() => (
        <Space>
          <Button
            danger
            disabled={selectedRows.length === 0}
            onClick={() => {
              console.log('批量删除:', selectedRows);
            }}
          >
            批量删除
          </Button>
        </Space>
      )}
    />
  );
}
```

### 4. 列配置

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  showColumnSetting  // 显示列设置按钮
/>
```

### 5. 自定义工具栏

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  toolbarRender={() => (
    <Space>
      <Button type="primary" icon={<PlusOutlined />}>
        新增
      </Button>
      <Button icon={<UploadOutlined />}>
        导入
      </Button>
    </Space>
  )}
/>
```

### 6. 筛选和排序

```tsx
const columns: ColumnType<DataType>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    sorter: true,  // 启用排序
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    filters: [  // 启用筛选
      { text: '在读', value: 'active' },
      { text: '休学', value: 'inactive' },
    ],
  },
];

<CommonTable
  columns={columns}
  onFetch={fetchData}
  onChange={(pagination, filters, sorter) => {
    console.log('表格变化:', { pagination, filters, sorter });
  }}
/>
```

### 7. 刷新功能

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  showRefresh
  onRefresh={async () => {
    // 自定义刷新逻辑
    await refetchData();
  }}
/>
```

## 样式定制

组件使用深色科技风格，主要颜色变量：

```css
--primary-color: #00d4ff;
--primary-gradient: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
--bg-card: #111827;
--border-color: rgba(0, 212, 255, 0.1);
```

可以通过修改 `src/components/CommonTable/styles.ts` 来自定义样式。

## 完整示例

查看 `/src/pages/examples/TableExample.tsx` 获取完整的使用示例。

## 注意事项

1. **导出功能**: 需要安装 `xlsx` 库才能使用导出功能
2. **rowKey**: 必须确保每行数据有唯一的key，默认使用 `id` 字段
3. **onFetch vs dataSource**:
   - 使用 `onFetch` 实现后端分页（推荐用于大数据量）
   - 使用 `dataSource` 实现前端分页（适合小数据量）
4. **搜索防抖**: 搜索功能内置了500ms的防抖，避免频繁请求
5. **列配置**: 列的 `key` 或 `dataIndex` 必须唯一，用于列配置功能

## 性能优化建议

1. 对于大数据量，使用后端分页（`onFetch`）
2. 合理设置 `pageSize`，避免单页数据过多
3. 使用 `scroll` 属性固定表头和列
4. 避免在 `render` 函数中进行复杂计算

## 常见问题

### Q: 导出功能报错？
A: 请确保已安装 `xlsx` 库: `npm install xlsx`

### Q: 如何实现服务端排序和筛选？
A: 在 `onFetch` 函数中处理 `params.sorter` 和 `params.filters`，将参数传递给后端API

### Q: 如何自定义空状态？
A: 可以通过 Ant Design Table 的 `locale` 属性自定义，或修改组件源码

### Q: 如何禁用某些行的选择？
A: 使用 Ant Design Table 的 `rowSelection.getCheckboxProps` 属性

## 更新日志

### v1.0.0 (2026-01-31)
- 初始版本发布
- 支持分页、筛选、排序、导出、搜索等核心功能
- 深色科技风格UI设计
- 完整的TypeScript类型支持

## 技术支持

如有问题或建议，请联系开发团队。
