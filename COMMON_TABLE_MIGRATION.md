# CommonTable 组件升级指南

## 概述

本文档帮助你从旧版 CommonTable 组件迁移到新版本。

## 主要变化

### 新增功能

1. **搜索功能**: 新增 `searchable` 和 `searchPlaceholder` 属性
2. **列配置**: 新增 `showColumnSetting` 属性，支持显示/隐藏列
3. **行选择**: 新增 `rowSelection` 和 `onSelectionChange` 属性
4. **自定义工具栏**: 新增 `toolbarRender` 属性
5. **数据获取**: 新增 `onFetch` 属性，支持后端分页
6. **导出配置**: 新增 `exportConfig` 属性，支持更灵活的导出配置
7. **自动加载**: 新增 `autoLoad` 属性，控制是否自动加载数据

### API 变化

#### 保持兼容的属性

以下属性保持向后兼容，无需修改：

- `columns`
- `dataSource`
- `loading`
- `pagination`
- `rowKey`
- `exportable` (原 `showExport`)
- `exportFileName`
- `showRefresh`
- `onRefresh`
- `onChange`

#### 重命名的属性

| 旧属性名 | 新属性名 | 说明 |
|---------|---------|------|
| `showExport` | `exportable` | 更语义化的命名 |

#### 新增的属性

| 属性名 | 类型 | 说明 |
|-------|------|------|
| `onFetch` | `(params: FetchParams) => Promise<PageResult<T>>` | 数据获取函数 |
| `searchable` | `boolean` | 是否显示搜索框 |
| `searchPlaceholder` | `string` | 搜索框占位符 |
| `onSearch` | `(value: string) => void` | 搜索回调 |
| `rowSelection` | `boolean` | 是否支持行选择 |
| `onSelectionChange` | `(keys, rows) => void` | 选择变化回调 |
| `toolbarRender` | `() => React.ReactNode` | 自定义工具栏 |
| `showColumnSetting` | `boolean` | 是否显示列设置 |
| `exportConfig` | `ExportConfig` | 导出配置 |
| `autoLoad` | `boolean` | 是否自动加载数据 |

## 迁移步骤

### 1. 基础迁移（无需修改）

如果你只使用了基础功能，代码无需修改：

```tsx
// 旧版本 - 仍然可以正常工作
<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  showExport
  exportFileName="export"
  showRefresh
  onRefresh={handleRefresh}
/>
```

### 2. 使用新功能

#### 添加搜索功能

```tsx
// 新版本
<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  searchable  // 新增
  searchPlaceholder="搜索关键词"  // 新增
  onSearch={(value) => console.log(value)}  // 新增
/>
```

#### 添加行选择功能

```tsx
// 新版本
<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  rowSelection  // 新增
  onSelectionChange={(keys, rows) => {  // 新增
    console.log('选中:', keys, rows);
  }}
/>
```

#### 使用后端分页

```tsx
// 旧版本 - 前端分页
<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
/>

// 新版本 - 后端分页
<CommonTable
  columns={columns}
  onFetch={async (params) => {  // 新增
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.json();
  }}
  rowKey="id"
/>
```

#### 添加自定义工具栏

```tsx
// 新版本
<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  toolbarRender={() => (  // 新增
    <Space>
      <Button type="primary">新增</Button>
      <Button>导入</Button>
    </Space>
  )}
/>
```

### 3. 导出功能升级

```tsx
// 旧版本
<CommonTable
  columns={columns}
  dataSource={data}
  showExport
  exportFileName="export"
  onExport={handleExport}
/>

// 新版本 - 使用新的 exportConfig
<CommonTable
  columns={columns}
  dataSource={data}
  exportable  // 推荐使用新名称
  exportFileName="export"
  exportConfig={{  // 新增
    sheetName: '数据表',
    columns: ['id', 'name', 'age'],  // 指定导出列
  }}
  onExport={handleExport}
/>
```

## 类型定义变化

### 新增类型

```typescript
// FetchParams - 数据获取参数
interface FetchParams {
  current: number;
  pageSize: number;
  filters?: Record<string, FilterValue | null>;
  sorter?: SorterResult<any> | SorterResult<any>[];
  search?: string;
}

// PageResult - 分页结果
interface PageResult<T> {
  data: T[];
  total: number;
  current?: number;
  pageSize?: number;
}

// ExportConfig - 导出配置
interface ExportConfig {
  fileName?: string;
  sheetName?: string;
  columns?: string[];
}
```

### 导入类型

```typescript
// 旧版本
import type { CommonTableProps } from '@/components/CommonTable';

// 新版本 - 可以导入更多类型
import type {
  CommonTableProps,
  FetchParams,
  PageResult,
  ExportConfig,
} from '@/components/CommonTable';
```

## 样式变化

新版本的样式更加统一和美观，但保持了相同的深色科技风格。如果你有自定义样式，可能需要微调。

## 性能优化

新版本包含以下性能优化：

1. **搜索防抖**: 搜索输入自动防抖（500ms）
2. **useMemo**: 使用 useMemo 优化列过滤
3. **useCallback**: 使用 useCallback 优化回调函数

## 常见问题

### Q: 旧代码是否需要立即升级？
A: 不需要。旧代码可以继续正常工作，新功能是可选的。

### Q: 如何判断是否需要使用 onFetch？
A: 如果数据量大（>1000条）或需要服务端筛选/排序，建议使用 onFetch。

### Q: 导出功能需要额外安装依赖吗？
A: 是的，需要安装 xlsx 库: `npm install xlsx`

### Q: 如何保持旧的 showExport 属性？
A: showExport 仍然可以使用，但推荐使用新的 exportable 属性。

## 完整示例对比

### 旧版本

```tsx
<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  showExport
  exportFileName="export"
  showRefresh
  onRefresh={handleRefresh}
  onChange={handleChange}
/>
```

### 新版本（使用所有新功能）

```tsx
<CommonTable
  columns={columns}
  onFetch={fetchData}
  rowKey="id"
  searchable
  searchPlaceholder="搜索关键词"
  exportable
  exportFileName="export"
  exportConfig={{
    sheetName: '数据表',
    columns: ['id', 'name', 'age'],
  }}
  showRefresh
  showColumnSetting
  rowSelection
  onSelectionChange={handleSelectionChange}
  toolbarRender={() => (
    <Button type="primary">新增</Button>
  )}
  onChange={handleChange}
/>
```

## 获取帮助

- 查看完整文档: `COMMON_TABLE_GUIDE.md`
- 查看示例代码: `src/pages/examples/TableExample.tsx`
- 查看测试清单: `COMMON_TABLE_TEST_CHECKLIST.md`

## 反馈

如有问题或建议，请联系开发团队。
