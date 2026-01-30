# edu-admin-web

教育机构学生管理系统 - 前端管理后台

## 技术栈

- React 18+
- TypeScript
- Vite
- Ant Design 5.x
- Ant Design Pro Components
- Zustand (状态管理)
- Axios (HTTP 请求)
- React Router 6

## 项目结构

```
edu-admin-web/
├── src/
│   ├── api/           # API 接口定义
│   ├── components/    # 公共组件
│   ├── hooks/         # 自定义 Hooks
│   ├── layouts/       # 布局组件
│   ├── pages/         # 页面组件
│   ├── stores/        # Zustand 状态管理
│   ├── utils/         # 工具函数
│   ├── App.tsx        # 应用入口
│   └── main.tsx       # 主入口
├── public/            # 静态资源
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 环境要求

- Node.js 18+
- npm 9+ 或 pnpm 8+

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 开发规范

### 目录命名

- 组件目录使用 PascalCase：`UserList/`
- 工具函数使用 camelCase：`formatDate.ts`
- 常量文件使用 UPPER_CASE：`API_URLS.ts`

### 组件规范

- 使用函数组件 + Hooks
- Props 使用 TypeScript 接口定义
- 复杂组件拆分为子组件

### 状态管理

- 全局状态使用 Zustand
- 组件内状态使用 useState/useReducer
- 服务端状态考虑使用 React Query（可选）

### API 调用

- 统一使用 `src/api/` 下的接口
- 使用 Axios 实例，统一处理错误和 Token

## 环境变量

创建 `.env.local` 文件：

```
VITE_API_BASE_URL=http://localhost:8080
```

## License

MIT License
