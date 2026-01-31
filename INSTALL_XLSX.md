# CommonTable 组件安装说明

## 安装 xlsx 依赖

CommonTable 组件的导出功能依赖 xlsx 库，请运行以下命令安装：

```bash
npm install xlsx
```

或使用 pnpm:

```bash
pnpm install xlsx
```

## 类型定义

如果使用 TypeScript，xlsx 库已包含类型定义，无需额外安装 @types/xlsx。

## 验证安装

安装完成后，可以在项目中导入测试：

```typescript
import * as XLSX from 'xlsx';
console.log('xlsx version:', XLSX.version);
```

## 可选依赖

如果不需要导出功能，可以不安装 xlsx 库。组件会在尝试导出时提示安装。
