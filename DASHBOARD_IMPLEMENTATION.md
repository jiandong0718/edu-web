# 数据看板前端实现文档

## 概述

本文档描述了教育机构学生管理系统的数据看板前端实现，包含招生数据、营收数据和教学数据三个看板页面。

## 实现的功能

### 1. 招生数据看板（任务 24.7）

#### 统计卡片
- **线索统计卡片**
  - 线索总数（带图标）
  - 待跟进数量
  - 已转化数量

- **试听统计卡片**
  - 试听总数
  - 已完成进度条
  - 已转化进度条

- **转化率卡片**
  - 整体转化率百分比
  - 试听转化率

#### 图表
- **转化率趋势图**（折线图）
  - 显示最近7天的转化率变化
  - 渐变色填充区域
  - 响应式设计

- **线索来源分布**（饼图）
  - 多种来源的占比展示
  - 彩色图例
  - 数值标注

### 2. 营收数据看板（任务 24.8）

#### 统计卡片
- **收入统计卡片**（4个）
  - 今日收入
  - 本周收入
  - 本月收入
  - 本年收入

- **欠费统计卡片**
  - 欠费总额（红色警示）
  - 欠费学员数量

#### 图表
- **收入趋势图**（折线图）
  - 显示最近30天的收入变化
  - 渐变色线条和填充

- **收款方式分布**
  - 多种支付方式的金额统计
  - 占比百分比显示
  - 响应式网格布局

### 3. 教学数据看板（任务 24.9）

#### 统计卡片
- **学员统计卡片**
  - 在读学员数量
  - 试听学员数量
  - 潜在学员数量

- **班级统计卡片**
  - 班级总数
  - 活跃班级数量
  - 满员班级数量

- **教师统计卡片**
  - 教师总数
  - 全职教师数量
  - 兼职教师数量

#### 图表
- **考勤率图表**（柱状图）
  - 显示最近7天的考勤率
  - 渐变色柱状条
  - 百分比标注

## 技术实现

### 文件结构

```
edu-web/
├── src/
│   ├── api/
│   │   └── dashboard.ts          # 看板API接口
│   ├── types/
│   │   └── dashboard.ts          # 看板数据类型定义
│   └── pages/
│       └── dashboard/
│           └── index.tsx         # 看板主页面
```

### 核心技术栈

- **React 18+**: 使用函数组件和Hooks
- **TypeScript**: 完整的类型定义
- **Ant Design 5.x**: UI组件库
  - Card: 卡片容器
  - Statistic: 统计数值展示
  - Tabs: 标签页切换
  - Progress: 进度条
  - Row/Col: 响应式布局
- **自定义图表组件**: 使用SVG实现轻量级图表
  - LineChart: 折线图
  - PieChart: 饼图
  - BarChart: 柱状图

### API接口

#### 1. 招生数据接口
```typescript
GET /dashboard/enrollment

Response: {
  leadStats: {
    total: number;
    pending: number;
    converted: number;
  };
  trialStats: {
    total: number;
    scheduled: number;
    completed: number;
    converted: number;
  };
  conversionTrend: Array<{
    date: string;
    rate: number;
  }>;
  leadSourceDistribution: Array<{
    source: string;
    count: number;
  }>;
}
```

#### 2. 营收数据接口
```typescript
GET /dashboard/revenue

Response: {
  revenueStats: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  paymentMethodDistribution: Array<{
    method: string;
    amount: number;
  }>;
  revenueTrend: Array<{
    date: string;
    amount: number;
  }>;
  arrearsStats: {
    totalArrears: number;
    studentCount: number;
  };
}
```

#### 3. 教学数据接口
```typescript
GET /dashboard/teaching

Response: {
  studentStats: {
    active: number;
    trial: number;
    potential: number;
  };
  classStats: {
    total: number;
    active: number;
    full: number;
  };
  teacherStats: {
    total: number;
    fullTime: number;
    partTime: number;
  };
  attendanceRate: Array<{
    date: string;
    rate: number;
  }>;
}
```

### 设计风格

#### 深色科技风格
- **背景色**: `#0a0e17` (深色背景)
- **卡片背景**: 渐变色 + 毛玻璃效果
  ```css
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)
  backdropFilter: blur(10px)
  ```
- **边框**: 青色半透明边框 `rgba(0, 212, 255, 0.2)`
- **阴影**: 深色阴影增强层次感

#### 颜色方案
- **主色调**: 青色渐变 `#00d4ff → #0099ff`
- **成功色**: 青绿色 `#00ffaa`
- **警告色**: 金色 `#ffd700`
- **危险色**: 粉红色 `#ff6b9d`
- **文字色**: 白色及半透明白色

#### 图表样式
- **折线图**: 渐变色线条 + 半透明填充区域
- **饼图**: 多彩扇形 + 中心镂空设计
- **柱状图**: 渐变色柱状条 + 圆角顶部

### 响应式设计

使用Ant Design的栅格系统实现响应式布局：

```typescript
<Col xs={24} sm={12} lg={8}>  // 移动端全宽，平板半宽，桌面1/3宽
<Col xs={24} lg={16}>          // 移动端全宽，桌面2/3宽
```

### 组件架构

#### 主组件结构
```
Dashboard (主容器)
├── Tabs (标签页切换)
│   ├── EnrollmentDashboard (招生数据)
│   │   ├── 统计卡片组
│   │   ├── LineChart (转化率趋势)
│   │   └── PieChart (线索来源)
│   ├── RevenueDashboard (营收数据)
│   │   ├── 统计卡片组
│   │   ├── LineChart (收入趋势)
│   │   └── 收款方式分布
│   └── TeachingDashboard (教学数据)
│       ├── 统计卡片组
│       └── BarChart (考勤率)
```

#### 自定义图表组件

**LineChart (折线图)**
- 使用SVG polyline绘制
- 支持渐变色填充
- 自动计算坐标点
- 响应式缩放

**PieChart (饼图)**
- 使用SVG path绘制扇形
- 支持多种颜色
- 带图例和数值标注
- 中心镂空设计

**BarChart (柱状图)**
- 使用div + CSS实现
- 渐变色填充
- 百分比标注
- 平滑过渡动画

### 数据加载

每个子看板独立加载数据：

```typescript
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await getEnrollmentDashboard();
    setData(result.data);
  } catch (error) {
    message.error('获取数据失败');
  } finally {
    setLoading(false);
  }
};
```

### 错误处理

- 网络请求失败显示错误提示
- 数据为空时不渲染图表
- 加载状态显示Spin组件

## 使用方法

### 1. 安装依赖

项目已包含所需依赖，无需额外安装。

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问页面

访问 `http://localhost:5173/dashboard` 查看数据看板。

### 4. 切换看板

点击顶部标签页切换不同的数据看板：
- 招生数据
- 营收数据
- 教学数据

## 扩展建议

### 1. 添加图表库（可选）

如需更复杂的图表功能，可以安装专业图表库：

```bash
# 安装 ECharts
npm install echarts echarts-for-react

# 或安装 Ant Design Charts
npm install @ant-design/charts
```

### 2. 添加数据刷新

可以添加自动刷新功能：

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    fetchData();
  }, 60000); // 每分钟刷新一次

  return () => clearInterval(timer);
}, []);
```

### 3. 添加日期筛选

可以添加日期范围选择器：

```typescript
<DatePicker.RangePicker
  onChange={(dates) => {
    // 根据日期范围重新获取数据
  }}
/>
```

### 4. 添加数据导出

可以添加导出功能：

```typescript
const exportData = () => {
  // 导出为Excel或PDF
};
```

## 注意事项

1. **后端接口**: 确保后端接口已实现并返回正确的数据格式
2. **权限控制**: 根据用户角色控制数据访问权限
3. **性能优化**: 大数据量时考虑分页或虚拟滚动
4. **浏览器兼容**: 测试不同浏览器的兼容性
5. **移动端适配**: 确保在移动设备上正常显示

## 文件清单

### 新增文件
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/api/dashboard.ts`
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/types/dashboard.ts`

### 修改文件
- `/Users/liujiandong/Documents/work/package/edu/edu-web/src/pages/dashboard/index.tsx`

## 总结

本实现完成了三个数据看板的前端页面，包括：
- 招生数据看板（线索统计、试听统计、转化率趋势、线索来源分布）
- 营收数据看板（收入统计、收款方式分布、收入趋势、欠费统计）
- 教学数据看板（学员统计、班级统计、教师统计、考勤率图表）

采用深色科技风格设计，使用Ant Design组件和自定义SVG图表，实现了响应式布局和良好的用户体验。
