# 考勤管理前端实现文档

## 概述

本文档描述了教育机构学生管理系统的考勤管理模块前端实现，包含三个主要功能页面：

1. **课堂签到页面** (任务 16.10)
2. **请假管理页面** (任务 16.11)
3. **考勤统计报表** (任务 16.12)

## 文件结构

```
src/
├── api/
│   └── attendance.ts                    # 考勤相关 API 接口
├── types/
│   └── attendance.ts                    # 考勤类型定义
└── pages/
    └── teaching/
        └── attendance/
            ├── index.tsx                # 主入口页面（Tab 导航）
            ├── CheckIn.tsx              # 课堂签到页面
            ├── LeaveManagement.tsx      # 请假管理页面
            └── Statistics.tsx           # 考勤统计页面
```

## 功能详细说明

### 1. 课堂签到页面 (CheckIn.tsx)

#### 功能特性
- ✅ 选择班级和课程（排课）
- ✅ 显示该课程的学员列表
- ✅ 支持单个学员签到
- ✅ 支持批量签到（多选）
- ✅ 标记考勤状态：出勤、缺勤、迟到、请假
- ✅ 填写备注信息
- ✅ 实时显示课程信息和签到统计

#### 技术实现
- 使用 `Select` 组件选择班级和课程
- 使用 `Table` 组件展示学员列表，支持行选择
- 使用 `Modal` + `Form` 实现签到弹窗
- 使用 `Radio.Group` 选择考勤状态
- 调用 API：`checkIn`（单个签到）、`batchCheckIn`（批量签到）

#### 界面元素
- 班级选择下拉框
- 课程选择下拉框
- 课程信息展示区（班级、课程、时间、人数、已签到数）
- 学员列表表格（支持多选）
- 批量签到按钮
- 单个签到按钮
- 签到弹窗（状态选择、备注输入）

#### 状态配置
```typescript
const statusConfig = {
  present: { color: '#00ff88', text: '出勤', icon: CheckCircleOutlined },
  absent: { color: '#ff4d6a', text: '缺勤', icon: CloseCircleOutlined },
  late: { color: '#ffaa00', text: '迟到', icon: ClockCircleOutlined },
  leave: { color: '#00d4ff', text: '请假', icon: FileTextOutlined },
};
```

### 2. 请假管理页面 (LeaveManagement.tsx)

#### 功能特性
- ✅ 请假申请列表展示
- ✅ 按状态分类（全部、待审批、已通过、已拒绝）
- ✅ 搜索和筛选（学员姓名、班级、日期范围）
- ✅ 查看请假详情
- ✅ 请假审批操作（通过/拒绝）
- ✅ 安排补课功能
- ✅ 统计数据展示

#### 技术实现
- 使用 `Tabs` 组件实现状态分类
- 使用 `Table` 组件展示请假列表
- 使用 `RangePicker` 实现日期范围筛选
- 使用 `Modal` + `Descriptions` 展示详情
- 使用 `Modal` + `Form` 实现补课安排
- 调用 API：`getLeaveList`、`approveLeave`、`arrangeMakeup`

#### 界面元素
- 统计数据栏（总申请数、待审批、已通过、已拒绝）
- 搜索筛选栏（学员姓名、班级、日期范围）
- 状态 Tab 切换
- 请假列表表格
- 操作按钮（详情、通过、拒绝、安排补课）
- 详情弹窗
- 补课安排弹窗

#### 审批流程
1. 查看请假详情
2. 点击"通过"或"拒绝"按钮
3. 确认操作
4. 如果通过，可以安排补课

### 3. 考勤统计报表 (Statistics.tsx)

#### 功能特性
- ✅ 按时间段统计（日期范围选择）
- ✅ 按班级筛选
- ✅ 总体统计数据展示
- ✅ 柱状图展示考勤状态分布
- ✅ 饼图展示考勤状态占比
- ✅ 按班级统计表格
- ✅ 按学员统计表格
- ✅ 导出功能

#### 技术实现
- 使用 `RangePicker` 选择统计时间范围
- 使用 `Statistic` 组件展示总体数据
- 使用 CSS 实现自定义柱状图（渐变色、阴影效果）
- 使用 CSS `conic-gradient` 实现饼图
- 使用 `Progress` 组件展示出勤率
- 使用 `Tabs` 切换班级统计和学员统计
- 调用 API：`getAttendanceStats`、`exportAttendanceStats`

#### 界面元素
- 日期范围选择器
- 班级筛选下拉框
- 导出报表按钮
- 总体统计卡片（4个）
  - 总课次
  - 出勤数
  - 缺勤数
  - 出勤率
- 柱状图（考勤状态分布）
- 饼图（考勤状态占比）
- 统计表格（按班级/按学员）

#### 图表实现

**柱状图**：
- 使用 CSS 渐变色实现柱子
- 动态计算柱子高度（基于数据占比）
- 显示数值标签
- 不同状态使用不同颜色

**饼图**：
- 使用 CSS `conic-gradient` 实现
- 动态计算各部分角度
- 中心显示出勤率
- 配有图例说明

## API 接口

### 类型定义 (types/attendance.ts)

```typescript
// 考勤状态
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

// 请假状态
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

// 主要接口类型
- AttendanceRecord: 考勤记录
- CheckInParams: 签到参数
- BatchCheckInParams: 批量签到参数
- LeaveApplication: 请假申请
- LeaveQueryParams: 请假查询参数
- LeaveApproveParams: 请假审批参数
- MakeupParams: 补课安排参数
- ClassAttendanceStats: 班级考勤统计
- StudentAttendanceStats: 学员考勤统计
- AttendanceStatsParams: 统计查询参数
- AttendanceStatsResponse: 统计响应
```

### API 方法 (api/attendance.ts)

```typescript
// 获取班级课程信息
getClassCourseInfo(classId: number, scheduleId: number)

// 签到
checkIn(data: CheckInParams)

// 批量签到
batchCheckIn(data: BatchCheckInParams)

// 获取请假列表
getLeaveList(params: LeaveQueryParams)

// 审批请假
approveLeave(data: LeaveApproveParams)

// 安排补课
arrangeMakeup(data: MakeupParams)

// 获取考勤统计
getAttendanceStats(params: AttendanceStatsParams)

// 导出考勤统计
exportAttendanceStats(params: AttendanceStatsParams)
```

## 设计风格

### 深色科技风格
- 背景色：`#111827`
- 主色调：青色渐变 `#00d4ff → #0099ff`
- 边框：半透明青色 `rgba(0, 212, 255, 0.1)`
- 阴影：青色光晕效果

### 状态颜色
- 出勤/通过：`#00ff88` (绿色)
- 缺勤/拒绝：`#ff4d6a` (红色)
- 迟到/待审批：`#ffaa00` (橙色)
- 请假：`#00d4ff` (青色)

### 组件样式
- 卡片：深色背景 + 青色边框 + 圆角
- 按钮：渐变色 + 阴影效果
- 表格：深色主题 + 高亮行
- 标签：半透明背景 + 彩色边框

## 使用说明

### 1. 课堂签到流程
1. 选择班级
2. 选择课程（排课）
3. 查看学员列表
4. 单个签到：点击学员行的"签到"按钮
5. 批量签到：勾选多个学员，点击"批量签到"按钮
6. 在弹窗中选择考勤状态（出勤/缺勤/迟到/请假）
7. 可选填写备注
8. 确认提交

### 2. 请假管理流程
1. 查看请假申请列表
2. 使用搜索和筛选功能定位申请
3. 点击"详情"查看完整信息
4. 对于待审批的申请：
   - 点击"通过"批准请假
   - 点击"拒绝"驳回请假
5. 对于已通过的申请：
   - 点击"安排补课"选择补课时间

### 3. 考勤统计查看
1. 选择统计时间范围
2. 可选择特定班级
3. 查看总体统计数据
4. 查看图表（柱状图、饼图）
5. 切换查看班级统计或学员统计
6. 点击"导出报表"下载 Excel 文件

## 技术栈

- **React 18+**: 前端框架
- **TypeScript**: 类型安全
- **Ant Design 5.x**: UI 组件库
- **dayjs**: 日期处理
- **Axios**: HTTP 请求

## 响应式设计

- 使用 Ant Design 的 Grid 系统（Row/Col）
- 表格支持横向滚动
- 筛选栏支持自动换行
- 适配不同屏幕尺寸

## 性能优化

- 使用 `useState` 管理本地状态
- 使用 `useEffect` 处理副作用
- 表格分页加载
- 防抖搜索（可扩展）
- 懒加载路由（已在 router 中配置）

## 扩展建议

1. **实时更新**：使用 WebSocket 实现签到状态实时同步
2. **扫码签到**：集成二维码扫描功能
3. **人脸识别**：集成人脸识别签到
4. **消息通知**：请假审批结果推送通知
5. **数据导出**：支持更多格式（PDF、CSV）
6. **高级图表**：集成 ECharts 或 Recharts 实现更丰富的图表
7. **移动端适配**：优化移动端体验
8. **离线支持**：支持离线签到，后续同步

## 注意事项

1. 所有 API 调用都需要后端接口支持
2. 当前使用模拟数据，实际使用时需要连接真实 API
3. 文件导出功能依赖后端返回 Blob 数据
4. 日期格式统一使用 `YYYY-MM-DD`
5. 时间格式统一使用 `HH:mm`
6. 所有表单都有基本的验证规则

## 后端接口要求

### 签到接口
- `POST /teaching/attendance/check-in`
- `POST /teaching/attendance/batch-check-in`
- `GET /teaching/attendance/class-info`

### 请假接口
- `GET /teaching/leave/page`
- `PUT /teaching/leave/{id}/approve`
- `PUT /teaching/leave/{id}/makeup`

### 统计接口
- `GET /teaching/attendance/statistics`
- `GET /teaching/attendance/statistics/export`

## 测试建议

1. **单元测试**：测试组件渲染和交互
2. **集成测试**：测试 API 调用和数据流
3. **E2E 测试**：测试完整业务流程
4. **性能测试**：测试大数据量下的表现
5. **兼容性测试**：测试不同浏览器

## 维护说明

- 代码遵循 ESLint 规范
- 使用 TypeScript 确保类型安全
- 组件拆分合理，易于维护
- 样式使用内联对象，便于主题切换
- 注释清晰，便于理解

---

**实现日期**: 2024-01-31
**版本**: 1.0.0
**作者**: Claude Code Agent
