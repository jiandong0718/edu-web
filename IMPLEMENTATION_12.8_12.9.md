# 招生漏斗图表和顾问业绩排行实现文档

## 概述

本次实现完成了任务 12.8 和 12.9，为教育机构学生管理系统的前端添加了两个重要的营销统计功能：
1. **招生漏斗图表** - 可视化展示线索转化全流程
2. **顾问业绩排行** - 展示顾问招生业绩和转化效果

## 实现的功能

### 1. 招生漏斗图表 (`/marketing/funnel`)

**功能特性：**
- 可视化漏斗图展示线索→试听→转化的完整流程
- 显示各阶段的数量和转化率
- 统计卡片展示关键指标（总线索数、总试听数、总转化数、整体转化率）
- 支持时间范围筛选（最近7天、30天、90天、本月、上月）
- 支持校区筛选
- 实时刷新功能

**技术实现：**
- 自定义漏斗图组件，使用渐变色和光泽效果
- 响应式布局，适配不同屏幕尺寸
- 深色科技风格 UI 设计
- 使用 Ant Design 组件库

**文件位置：**
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/pages/marketing/funnel/index.tsx`

### 2. 顾问业绩排行 (`/marketing/consultant-ranking`)

**功能特性：**
- 展示顾问排行榜（支持分页）
- 显示线索数、试听数、转化数、转化率、营收金额
- 支持多维度排序（按转化数、转化率、营收金额、线索数）
- 前三名特殊标识（金、银、铜牌）
- TOP 10 可视化图表展示（转化数排行、转化率排行）
- 支持时间范围筛选
- 支持校区筛选
- 详细表格展示所有顾问数据

**技术实现：**
- 自定义柱状图组件，带渐变色和动画效果
- 表格支持排序和分页
- 转化率使用彩色标签展示（高转化率绿色，低转化率红色）
- 响应式布局设计

**文件位置：**
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/pages/marketing/consultant-ranking/index.tsx`

## 新增文件清单

### 1. 类型定义
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/types/marketing.ts`
  - `FunnelData` - 漏斗数据类型
  - `FunnelStatsResponse` - 漏斗统计响应类型
  - `FunnelQueryParams` - 漏斗查询参数类型
  - `ConsultantPerformance` - 顾问业绩数据类型
  - `ConsultantRankingResponse` - 顾问排行响应类型
  - `ConsultantQueryParams` - 顾问查询参数类型

### 2. API 接口
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/api/marketing.ts`
  - `getFunnelStats()` - 获取招生漏斗统计数据
  - `getConsultantRanking()` - 获取顾问业绩排行

### 3. 页面组件
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/pages/marketing/funnel/index.tsx`
  - 招生漏斗图表页面
  - 包含自定义漏斗图组件

- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/pages/marketing/consultant-ranking/index.tsx`
  - 顾问业绩排行页面
  - 包含自定义柱状图组件

## 修改的文件

### 1. 路由配置
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/router/index.tsx`
  - 添加 `/marketing/funnel` 路由
  - 添加 `/marketing/consultant-ranking` 路由

### 2. 布局菜单
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/layouts/BasicLayout.tsx`
  - 在招生管理菜单下添加"招生漏斗"菜单项
  - 在招生管理菜单下添加"顾问业绩"菜单项

### 3. 依赖配置
- `/Users/liujiandong/Documents/work/package/edu/edu-web/package.json`
  - 添加 `dayjs` 依赖（用于日期处理）

## 技术栈

- **React 19.2.0** - UI 框架
- **TypeScript** - 类型安全
- **Ant Design 5.29.3** - UI 组件库
- **React Router 7.13.0** - 路由管理
- **Axios** - HTTP 请求
- **dayjs** - 日期处理
- **Zustand** - 状态管理

## UI 设计特点

### 深色科技风格
- 主色调：青色渐变 (#00d4ff → #0099ff)
- 背景色：深色系 (#0a0e17, #111827)
- 边框：半透明青色边框
- 阴影：多层次阴影效果
- 动画：平滑过渡和渐变动画

### 视觉效果
- 玻璃态效果（Glass Morphism）
- 渐变色背景
- 光泽效果
- 悬停动画
- 脉冲动画（前三名排行）

## API 接口说明

### 1. 获取招生漏斗统计数据

**接口：** `GET /marketing/stats/funnel`

**请求参数：**
```typescript
{
  startDate?: string;  // 开始日期 YYYY-MM-DD
  endDate?: string;    // 结束日期 YYYY-MM-DD
  campusId?: number;   // 校区ID
}
```

**响应数据：**
```typescript
{
  funnelData: [
    {
      stage: string;   // 阶段名称（如"新线索"、"已跟进"、"已试听"、"已转化"）
      count: number;   // 数量
      rate: number;    // 转化率（相对于上一阶段）
    }
  ],
  totalLeads: number;              // 总线索数
  totalTrials: number;             // 总试听数
  totalConversions: number;        // 总转化数
  overallConversionRate: number;   // 整体转化率
}
```

### 2. 获取顾问业绩排行

**接口：** `GET /marketing/stats/consultant-ranking`

**请求参数：**
```typescript
{
  startDate?: string;   // 开始日期 YYYY-MM-DD
  endDate?: string;     // 结束日期 YYYY-MM-DD
  campusId?: number;    // 校区ID
  sortBy?: string;      // 排序字段：conversionCount | conversionRate | revenue | leadCount
  sortOrder?: string;   // 排序方向：asc | desc
  page?: number;        // 页码
  pageSize?: number;    // 每页数量
}
```

**响应数据：**
```typescript
{
  rankings: [
    {
      advisorId: number;        // 顾问ID
      advisorName: string;      // 顾问姓名
      campusName: string;       // 校区名称
      leadCount: number;        // 线索数
      trialCount: number;       // 试听数
      conversionCount: number;  // 转化数
      conversionRate: number;   // 转化率
      revenue: number;          // 营收金额
    }
  ],
  total: number;  // 总记录数
}
```

## 安装和运行

### 1. 安装依赖
```bash
cd /Users/liujiandong/Documents/work/package/edu/edu-web
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问页面
- 招生漏斗：http://localhost:5173/marketing/funnel
- 顾问业绩：http://localhost:5173/marketing/consultant-ranking

## 后续工作

### 后端 API 实现
需要在后端实现以下接口：
1. `GET /marketing/stats/funnel` - 招生漏斗统计
2. `GET /marketing/stats/consultant-ranking` - 顾问业绩排行

### 数据来源
- 线索数据：`mkt_lead` 表
- 试听数据：`mkt_trial` 表
- 转化数据：`fin_contract` 表
- 顾问数据：`sys_user` 表（角色为顾问）

### 建议的数据库查询逻辑
1. **漏斗统计：**
   - 统计各阶段线索数量
   - 计算阶段间转化率
   - 支持时间范围和校区筛选

2. **顾问业绩：**
   - 按顾问分组统计线索、试听、转化数
   - 计算转化率 = 转化数 / 线索数
   - 关联合同表统计营收金额
   - 支持多维度排序

## 注意事项

1. **日期处理：** 使用 dayjs 库处理日期，确保格式统一为 YYYY-MM-DD
2. **权限控制：** 建议在后端实现数据权限控制，确保顾问只能查看自己的数据
3. **性能优化：** 对于大数据量，建议后端实现缓存机制
4. **数据准确性：** 确保统计数据的准确性，建议使用数据库事务
5. **响应式设计：** 页面已实现响应式布局，在移动端也能正常使用

## 总结

本次实现完成了招生漏斗图表和顾问业绩排行两个重要功能，为教育机构提供了直观的数据可视化工具，帮助管理者更好地了解招生转化情况和顾问业绩表现。所有代码遵循项目的深色科技风格设计规范，使用 TypeScript 确保类型安全，并提供了良好的用户体验。
