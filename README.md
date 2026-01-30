# edu-admin-web

教育机构学生管理系统 - 前端管理后台

## 项目进度

| 页面 | 状态 | 说明 |
|------|------|------|
| 登录页 | ✅ 完成 | 粒子动画背景、玻璃态卡片 |
| Dashboard | ✅ 完成 | 统计卡片、Canvas图表、环形进度图 |
| 学生管理 | ✅ 完成 | 列表CRUD、批量操作、筛选 |
| 用户管理 | ✅ 完成 | 用户列表、角色分配 |
| 合同管理 | ✅ 完成 | 合同列表、状态管理 |
| 课程管理 | ✅ 完成 | 课程列表、分类管理 |
| 布局组件 | ✅ 完成 | 深色侧边栏、玻璃态Header |

## 设计风格

- **主题**: 深色科技风格
- **主色调**: 青色渐变 (#00d4ff → #0099ff)
- **背景色**: 深色系 (#0a0e17, #111827, #1a2332)
- **特效**: 粒子动画、发光边框、玻璃态毛玻璃效果

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
