# CommonTable 组件

通用表格组件，基于 Ant Design Table 封装，提供丰富的功能和深色科技风格的UI。

## 文件结构

```
CommonTable/
├── index.tsx          # 主组件文件
├── types.ts           # TypeScript 类型定义
├── styles.ts          # 样式配置
├── utils.ts           # 工具函数（导出、防抖等）
└── README.md          # 本文件
```

## 核心功能

- ✅ 分页（前端/后端）
- ✅ 筛选
- ✅ 排序
- ✅ 搜索
- ✅ 导出Excel
- ✅ 列配置
- ✅ 行选择
- ✅ 批量操作
- ✅ 自定义工具栏
- ✅ 自动刷新

## 快速开始

```tsx
import { CommonTable } from '@/components/CommonTable';

<CommonTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  searchable
  exportable
/>
```

## 详细文档

查看项目根目录的 `COMMON_TABLE_GUIDE.md` 获取完整使用文档。

## 示例

查看 `/src/pages/examples/TableExample.tsx` 获取完整示例代码。

## 依赖

- antd: ^5.29.3
- xlsx: 需要手动安装（用于导出功能）

## 技术栈

- React 19+
- TypeScript
- Ant Design 5.x
- xlsx（可选，用于导出）
