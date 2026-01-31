# 排课管理前端实现文档

## 概述

本文档描述了教育机构学生管理系统中排课管理模块的前端实现，包含三个主要功能：
1. **批量排课** (任务 15.10)
2. **调课/代课/停课操作** (任务 15.11)
3. **课表多维度查看** (任务 15.12)

## 文件结构

```
src/
├── api/
│   └── schedule.ts                    # 排课相关 API 接口
├── types/
│   └── schedule.ts                    # 排课相关类型定义
└── pages/
    └── teaching/
        └── schedule/
            ├── index.tsx              # 排课管理主页面
            └── components/
                ├── BatchScheduleForm.tsx      # 批量排课表单
                ├── ScheduleOperations.tsx     # 调课/代课/停课操作
                └── ScheduleCalendar.tsx       # 课表日历视图
```

## 核心功能实现

### 1. 批量排课表单 (BatchScheduleForm.tsx)

#### 功能特性
- **基本信息选择**：班级、课程、教师、教室
- **时间设置**：
  - 开始日期和结束日期
  - 重复规则（不重复、每天、每周、每月）
  - 周几重复选择（每周模式）
  - 日期选择（每月模式）
  - 总课次设置
- **时间段管理**：
  - 支持添加多个时间段
  - 每个时间段独立设置开始和结束时间
  - 可删除时间段（至少保留一个）
- **其他选项**：
  - 跳过节假日开关
  - 跳过周末开关
  - 备注信息
- **排课预览**：
  - 生成预览按钮，显示所有将要创建的课程
  - 预览表格展示日期、星期、上课时间
  - 确认后提交批量排课

#### 技术实现
```typescript
// 时间段数据结构
interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

// 批量排课请求
interface BatchScheduleRequest {
  classId: number;
  courseId: number;
  teacherId: number;
  classroomId?: number;
  startDate: string;
  endDate?: string;
  totalSessions?: number;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  repeatValue?: number[];
  timeSlots: TimeSlot[];
  skipHolidays: boolean;
  skipWeekends: boolean;
  remark?: string;
}
```

#### 预览生成算法
1. 根据开始日期、结束日期和总课次确定排课范围
2. 按照重复规则（每天/每周/每月）遍历日期
3. 跳过周末（如果启用）
4. 跳过节假日（如果启用）
5. 为每个符合条件的日期生成所有时间段的课程
6. 显示预览列表供用户确认

### 2. 调课/代课/停课操作 (ScheduleOperations.tsx)

#### 功能特性
- **课表列表展示**：
  - 显示已排课的课程列表
  - 包含班级、课程、教师、教室、时间、状态等信息
  - 支持分页和筛选
- **调课功能**：
  - 修改上课时间（开始时间和结束时间）
  - 更换教师
  - 更换教室
  - 冲突检测功能
  - 必填原因说明
- **代课功能**：
  - 选择代课教师
  - 原教师信息保留
  - 必填原因说明
- **停课功能**：
  - 取消课程
  - 必填原因说明
- **冲突检测**：
  - 检测教师时间冲突
  - 检测教室时间冲突
  - 检测班级时间冲突
  - 显示冲突详情
  - 有冲突时禁止提交

#### 技术实现
```typescript
// 冲突检测请求
interface ConflictCheckRequest {
  teacherId?: number;
  classroomId?: number;
  classId?: number;
  startTime: string;
  endTime: string;
  excludeScheduleId?: number;
}

// 冲突信息
interface ConflictInfo {
  type: 'teacher' | 'classroom' | 'class';
  scheduleId: number;
  className: string;
  courseName: string;
  teacherName: string;
  classroomName?: string;
  startTime: string;
  endTime: string;
}
```

#### 操作流程
1. 用户选择要操作的课程
2. 打开对应的操作弹窗（调课/代课/停课）
3. 填写修改信息
4. 调课时可点击"检测冲突"按钮
5. 系统检测并显示冲突信息
6. 无冲突或解决冲突后提交
7. 刷新课表列表

### 3. 课表多维度查看 (ScheduleCalendar.tsx)

#### 功能特性
- **三种查看维度**：
  - 按班级查看：选择班级后显示该班级的所有课程
  - 按教师查看：选择教师后显示该教师的所有课程
  - 按教室查看：选择教室后显示该教室的所有课程
- **两种视图模式**：
  - 月视图：使用 Ant Design Calendar 组件
  - 周视图：自定义实现的周视图，按小时显示
- **日期导航**：
  - 上一月/周、下一月/周按钮
  - 今天按钮快速回到当前日期
  - 显示当前查看的日期范围
- **课程详情**：
  - 点击课程卡片查看详细信息
  - 显示班级、课程、教师、教室、时间、状态等
  - 显示代课教师（如有）
  - 显示取消原因（如有）

#### 技术实现

##### 月视图
使用 Ant Design 的 Calendar 组件，通过 `cellRender` 自定义日期单元格内容：

```typescript
const dateCellRender = (date: Dayjs) => {
  const dateSchedules = getDateSchedules(date);
  return (
    <div>
      {dateSchedules.map((schedule) => (
        <div key={schedule.id} onClick={() => handleScheduleClick(schedule)}>
          {/* 课程卡片 */}
        </div>
      ))}
    </div>
  );
};
```

##### 周视图
自定义实现，使用 CSS Grid 布局：

```typescript
// 生成一周的日期
const weekStart = selectedDate.startOf('week');
const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

// 生成时间段（8:00 - 21:00）
const timeSlots = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);

// 渲染网格
<div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)' }}>
  {/* 表头：时间 + 7天 */}
  {/* 表体：14个时间段 × 7天 */}
</div>
```

#### 样式设计
- **深色科技风格**：
  - 背景色：`#111827`
  - 主色调：青色渐变 `#00d4ff` → `#0099ff`
  - 辅助色：绿色 `#00ff88`、橙色 `#ffaa00`、红色 `#ff4d6a`
- **课程卡片**：
  - 按班级：青色边框和背景
  - 按教师：绿色边框和背景
  - 按教室：橙色边框和背景
- **交互效果**：
  - 悬停效果
  - 点击反馈
  - 平滑过渡动画

## API 接口

### 1. 批量排课
```typescript
POST /teaching/schedule/batch-enhanced
Request: BatchScheduleRequest
Response: { code: 200, msg: 'success' }
```

### 2. 冲突检测
```typescript
POST /teaching/schedule/check-conflict
Request: ConflictCheckRequest
Response: ConflictCheckResponse
```

### 3. 调课
```typescript
PUT /teaching/schedule/reschedule
Request: RescheduleRequest
Response: { code: 200, msg: 'success' }
```

### 4. 代课
```typescript
PUT /teaching/schedule/substitute
Request: SubstituteRequest
Response: { code: 200, msg: 'success' }
```

### 5. 停课
```typescript
PUT /teaching/schedule/cancel
Request: CancelScheduleRequest
Response: { code: 200, msg: 'success' }
```

### 6. 查询课表
```typescript
GET /teaching/schedule/list
Query: ScheduleQueryParams
Response: ScheduleListResponse
```

## 类型定义

完整的类型定义位于 `/src/types/schedule.ts`，包括：
- `Schedule`：课表实体
- `ScheduleStatus`：课表状态枚举
- `RepeatType`：重复规则类型
- `BatchScheduleRequest`：批量排课请求
- `ConflictCheckRequest`：冲突检测请求
- `ConflictCheckResponse`：冲突检测响应
- `RescheduleRequest`：调课请求
- `SubstituteRequest`：代课请求
- `CancelScheduleRequest`：停课请求
- 等等

## 使用说明

### 1. 批量排课流程
1. 进入"排课管理"页面
2. 切换到"批量排课"标签
3. 填写基本信息（班级、课程、教师、教室）
4. 设置时间（开始日期、结束日期、重复规则）
5. 添加上课时间段
6. 设置其他选项（跳过节假日、跳过周末）
7. 点击"生成预览"查看将要创建的课程
8. 确认无误后点击"确认排课"

### 2. 调课/代课/停课流程
1. 进入"排课管理"页面
2. 切换到"调课/代课/停课"标签
3. 在课表列表中找到要操作的课程
4. 点击对应的操作按钮（调课/代课/停课）
5. 在弹窗中填写修改信息
6. 调课时可点击"检测冲突"确保无冲突
7. 填写原因说明
8. 点击"确认"提交

### 3. 课表查看流程
1. 进入"排课管理"页面
2. 默认显示"课表查看"标签
3. 选择查看维度（按班级/按教师/按教室）
4. 选择具体的班级/教师/教室
5. 选择视图模式（月视图/周视图）
6. 使用导航按钮切换日期
7. 点击课程卡片查看详情

## 技术栈

- **React 18+**：UI 框架
- **TypeScript**：类型安全
- **Ant Design 5.x**：UI 组件库
- **dayjs**：日期处理库
- **Axios**：HTTP 客户端

## 注意事项

1. **dayjs 依赖**：项目需要安装 dayjs 包（Ant Design 5.x 已内置）
2. **模拟数据**：当前使用模拟数据，实际使用时需要取消注释 API 调用代码
3. **权限控制**：实际项目中需要根据用户权限控制操作按钮的显示
4. **错误处理**：已实现基本的错误处理，可根据需要增强
5. **性能优化**：大量课程数据时可考虑虚拟滚动等优化方案

## 扩展功能建议

1. **拖拽排课**：支持在日历视图中拖拽调整课程时间
2. **批量操作**：支持批量调课、批量停课
3. **课程模板**：保存常用的排课模板，快速创建课程
4. **导出功能**：导出课表为 Excel 或 PDF
5. **打印功能**：打印课表
6. **通知功能**：调课、停课时自动通知相关人员
7. **统计分析**：教师工作量统计、教室使用率分析等

## 维护说明

- 代码遵循 React Hooks 最佳实践
- 组件职责单一，易于维护和测试
- 类型定义完整，减少运行时错误
- 样式使用内联对象，便于主题定制
- 注释清晰，便于理解和修改
