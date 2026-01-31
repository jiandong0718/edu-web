# 数据看板测试指南

## 快速开始

### 1. 启动开发服务器

```bash
cd /Users/liujiandong/Documents/work/package/edu/edu-web
npm run dev
```

服务器将在 `http://localhost:3000` 启动（根据vite.config.ts配置）

### 2. 访问数据看板

在浏览器中访问: `http://localhost:3000/dashboard`

## 测试清单

### 功能测试

#### 招生数据看板
- [ ] 页面加载时显示加载动画
- [ ] 线索统计卡片正确显示总数、待跟进、已转化
- [ ] 试听统计卡片显示总数和进度条
- [ ] 转化率卡片显示百分比
- [ ] 转化率趋势折线图正确渲染
- [ ] 线索来源分布饼图正确渲染
- [ ] 数据加载失败时显示错误提示

#### 营收数据看板
- [ ] 四个收入统计卡片（今日、本周、本月、本年）正确显示
- [ ] 欠费统计卡片显示总额和学员数
- [ ] 收入趋势折线图正确渲染（30天数据）
- [ ] 收款方式分布正确显示各支付方式金额和占比
- [ ] 货币格式化正确（¥符号和千分位）

#### 教学数据看板
- [ ] 学员统计卡片显示在读、试听、潜在学员数
- [ ] 班级统计卡片显示总数、活跃、满员班级数
- [ ] 教师统计卡片显示总数、全职、兼职教师数
- [ ] 考勤率柱状图正确渲染（7天数据）
- [ ] 百分比标注正确显示

### UI/UX测试

#### 样式检查
- [ ] 深色科技风格主题正确应用
- [ ] 卡片背景渐变和毛玻璃效果正常
- [ ] 青色边框和阴影效果正常
- [ ] 文字颜色和对比度合适
- [ ] 图标正确显示

#### 响应式测试
- [ ] 桌面端（>1200px）: 卡片3列布局
- [ ] 平板端（768-1200px）: 卡片2列布局
- [ ] 移动端（<768px）: 卡片单列布局
- [ ] 图表在不同屏幕尺寸下正常显示

#### 交互测试
- [ ] 标签页切换流畅
- [ ] 鼠标悬停效果正常
- [ ] 加载状态正确显示
- [ ] 错误提示正确显示

### 性能测试
- [ ] 页面首次加载时间 < 2秒
- [ ] 标签页切换响应时间 < 500ms
- [ ] 图表渲染流畅无卡顿
- [ ] 内存占用合理

## 模拟数据测试

如果后端接口尚未完成，可以使用以下模拟数据进行测试：

### 方法1: 修改API文件添加模拟数据

编辑 `/Users/liujiandong/Documents/work/package/edu/edu-web/src/api/dashboard.ts`:

```typescript
// 临时模拟数据
export const getEnrollmentDashboard = () => {
  return Promise.resolve({
    data: {
      leadStats: {
        total: 156,
        pending: 45,
        converted: 78,
      },
      trialStats: {
        total: 89,
        scheduled: 23,
        completed: 56,
        converted: 34,
      },
      conversionTrend: [
        { date: '2024-01-25', rate: 45.2 },
        { date: '2024-01-26', rate: 48.5 },
        { date: '2024-01-27', rate: 52.1 },
        { date: '2024-01-28', rate: 49.8 },
        { date: '2024-01-29', rate: 55.3 },
        { date: '2024-01-30', rate: 58.7 },
        { date: '2024-01-31', rate: 61.2 },
      ],
      leadSourceDistribution: [
        { source: '线上推广', count: 45 },
        { source: '朋友推荐', count: 38 },
        { source: '地推活动', count: 32 },
        { source: '老学员介绍', count: 25 },
        { source: '其他', count: 16 },
      ],
    },
  });
};

export const getRevenueDashboard = () => {
  return Promise.resolve({
    data: {
      revenueStats: {
        today: 12580.50,
        week: 89650.00,
        month: 356780.00,
        year: 2456890.00,
      },
      paymentMethodDistribution: [
        { method: '微信支付', amount: 156780.00 },
        { method: '支付宝', amount: 98650.00 },
        { method: '银行转账', amount: 67890.00 },
        { method: '现金', amount: 33460.00 },
      ],
      revenueTrend: Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: Math.floor(Math.random() * 20000) + 10000,
      })),
      arrearsStats: {
        totalArrears: 45680.00,
        studentCount: 23,
      },
    },
  });
};

export const getTeachingDashboard = () => {
  return Promise.resolve({
    data: {
      studentStats: {
        active: 234,
        trial: 45,
        potential: 67,
      },
      classStats: {
        total: 28,
        active: 24,
        full: 8,
      },
      teacherStats: {
        total: 18,
        fullTime: 12,
        partTime: 6,
      },
      attendanceRate: [
        { date: '2024-01-25', rate: 92.5 },
        { date: '2024-01-26', rate: 94.2 },
        { date: '2024-01-27', rate: 88.7 },
        { date: '2024-01-28', rate: 91.3 },
        { date: '2024-01-29', rate: 95.8 },
        { date: '2024-01-30', rate: 93.6 },
        { date: '2024-01-31', rate: 96.2 },
      ],
    },
  });
};
```

### 方法2: 使用Mock Service Worker (MSW)

安装MSW:
```bash
npm install msw --save-dev
```

创建mock handlers并在开发环境中启用。

## 常见问题

### 1. 页面显示空白
- 检查浏览器控制台是否有错误
- 确认后端API是否正常运行
- 检查网络请求是否成功

### 2. 图表不显示
- 检查数据格式是否正确
- 确认数据不为空
- 查看浏览器控制台是否有SVG相关错误

### 3. 样式不正确
- 清除浏览器缓存
- 检查CSS是否正确加载
- 确认Ant Design主题配置

### 4. API请求失败
- 检查后端服务是否启动
- 确认API端点是否正确
- 查看网络代理配置（vite.config.ts）

## 浏览器兼容性

推荐使用以下浏览器测试：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 下一步

完成测试后，可以考虑：
1. 添加数据刷新功能
2. 添加日期范围筛选
3. 添加数据导出功能
4. 优化图表交互体验
5. 添加更多数据维度

## 反馈

如有问题或建议，请记录以下信息：
- 浏览器版本
- 错误截图
- 控制台错误信息
- 复现步骤
