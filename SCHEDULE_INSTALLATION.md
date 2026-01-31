# 排课管理模块安装指南

## 安装依赖

排课管理模块需要 dayjs 库来处理日期和时间。请运行以下命令安装：

```bash
npm install dayjs
```

或使用 pnpm：

```bash
pnpm install dayjs
```

## 验证安装

安装完成后，可以通过以下命令验证：

```bash
npm list dayjs
```

## 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

## 注意事项

1. **Ant Design 5.x 内置 dayjs**：如果项目已经使用 Ant Design 5.x，dayjs 可能已经作为依赖安装。
2. **TypeScript 类型**：dayjs 自带 TypeScript 类型定义，无需额外安装 @types/dayjs。
3. **后端接口**：当前代码使用模拟数据，实际使用时需要：
   - 确保后端接口已实现
   - 取消 API 调用代码的注释
   - 注释或删除模拟数据代码

## 文件清单

已创建的文件：
- `/src/api/schedule.ts` - 排课 API 接口
- `/src/types/schedule.ts` - 排课类型定义
- `/src/pages/teaching/schedule/index.tsx` - 排课管理主页面
- `/src/pages/teaching/schedule/components/BatchScheduleForm.tsx` - 批量排课表单
- `/src/pages/teaching/schedule/components/ScheduleOperations.tsx` - 调课/代课/停课操作
- `/src/pages/teaching/schedule/components/ScheduleCalendar.tsx` - 课表日历视图

## 功能测试

### 1. 测试批量排课
1. 访问排课管理页面
2. 切换到"批量排课"标签
3. 填写表单并生成预览
4. 确认排课

### 2. 测试调课/代课/停课
1. 切换到"调课/代课/停课"标签
2. 查看课表列表
3. 点击操作按钮测试各项功能

### 3. 测试课表查看
1. 切换到"课表查看"标签
2. 选择不同的查看维度（班级/教师/教室）
3. 切换月视图和周视图
4. 点击课程查看详情

## 常见问题

### Q: 提示找不到 dayjs 模块
A: 运行 `npm install dayjs` 安装依赖

### Q: 日历显示异常
A: 检查 Ant Design 版本是否为 5.x 以上

### Q: API 调用失败
A: 检查后端服务是否启动，以及 API 地址配置是否正确

### Q: 类型错误
A: 确保 TypeScript 版本为 5.x 以上，运行 `npm run build` 检查类型错误

## 下一步

1. 安装 dayjs 依赖
2. 启动开发服务器测试功能
3. 连接后端 API
4. 根据实际需求调整样式和功能
