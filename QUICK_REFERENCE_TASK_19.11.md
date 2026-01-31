# 课时调整管理页面 - 快速参考

## 访问路径
- **URL**: `/finance/class-hour/adjust`
- **菜单位置**: 财务管理 → 课时调整

## 文件结构
```
edu-web/
├── src/
│   ├── types/
│   │   └── classHour.ts                    # 类型定义 (107行)
│   ├── api/
│   │   └── classHour.ts                    # API接口 (51行)
│   ├── pages/
│   │   └── finance/
│   │       └── class-hour/
│   │           └── adjust/
│   │               └── index.tsx           # 主页面 (844行)
│   ├── router/
│   │   └── index.tsx                       # 路由配置 (已更新)
│   └── layouts/
│       └── BasicLayout.tsx                 # 菜单配置 (已更新)
└── IMPLEMENTATION_SUMMARY_TASK_19.11.md    # 实现总结文档
```

## 核心功能

### 1. 课时账户列表
- 展示学员课时账户信息
- 支持按学员、课程、校区、状态筛选
- 显示总课时、已用课时、剩余课时
- 智能预警（课时不足、即将到期）

### 2. 课时调整操作
- **赠送课时**: 为学员增加课时
- **扣减课时**: 减少学员课时
- **撤销调整**: 撤销之前的调整
- 必填调整原因和课时数

### 3. 调整历史记录
- 时间线展示所有调整记录
- 显示调整类型、课时变化、原因
- 记录操作人和操作时间

### 4. 统计信息
- 总账户数
- 正常账户数
- 预警账户数
- 剩余总课时

## 状态说明

### 账户状态
- **正常** (active): 绿色，课时充足
- **预警** (warning): 橙色，课时不足10
- **已过期** (expired): 灰色，已超过有效期
- **已冻结** (frozen): 红色，账户被冻结

### 调整类型
- **赠送** (gift): 绿色，增加课时
- **扣减** (deduct): 红色，减少课时
- **撤销** (revoke): 橙色，撤销调整

## API接口

### 课时账户
- `GET /finance/class-hour/account/list` - 获取账户列表
- `GET /finance/class-hour/account/:id` - 获取账户详情

### 课时调整
- `POST /finance/class-hour/adjust` - 提交课时调整
- `GET /finance/class-hour/adjust/records` - 获取调整记录
- `GET /finance/class-hour/account/:id/adjust-records` - 获取指定账户记录

### 统计与导出
- `GET /finance/class-hour/statistics` - 获取统计信息
- `GET /finance/class-hour/account/export` - 导出账户列表
- `GET /finance/class-hour/adjust/export` - 导出调整记录

## 使用示例

### 导入类型
```typescript
import type {
  ClassHourAccount,
  ClassHourAdjustType,
  ClassHourAdjustFormData,
} from '@/types/classHour';
```

### 调用API
```typescript
import {
  getClassHourAccountList,
  adjustClassHour,
  getAccountAdjustRecords,
} from '@/api/classHour';

// 获取账户列表
const response = await getClassHourAccountList({
  page: 1,
  pageSize: 10,
  status: 'active',
});

// 调整课时
await adjustClassHour({
  accountId: 1,
  adjustType: 'gift',
  adjustHours: 8,
  reason: '学员表现优秀',
});

// 获取调整记录
const records = await getAccountAdjustRecords(1);
```

## 颜色规范

### 主题色
- 主题蓝: `#00d4ff`
- 成功绿: `#00ff88`
- 警告橙: `#ffaa00`
- 危险红: `#ff4d6a`
- 中性灰: `#999`

### 背景色
- 页面背景: `#0a0e17`
- 卡片背景: `#111827`
- 边框颜色: `rgba(0, 212, 255, 0.1)`

## 开发注意事项

1. **Mock数据**: 当前使用Mock数据，需替换为真实API
2. **表单验证**: 已实现基础验证，可根据需求扩展
3. **权限控制**: 已过期账户禁用调整操作
4. **错误处理**: 需添加完整的错误处理逻辑
5. **性能优化**: 大数据量时考虑虚拟滚动

## 测试清单

- [ ] 页面正常加载
- [ ] 账户列表展示
- [ ] 筛选功能正常
- [ ] 调整弹窗打开/关闭
- [ ] 表单验证生效
- [ ] 调整操作成功
- [ ] 记录弹窗展示
- [ ] 预警提示显示
- [ ] 响应式布局正常
- [ ] 深色主题样式正确

## 后续优化

1. 集成真实API接口
2. 添加批量操作功能
3. 实现数据导出功能
4. 添加审批流程
5. 优化移动端体验
6. 添加数据分析图表
7. 实现自动预警通知

## 技术支持

- React 18+ 文档: https://react.dev
- Ant Design 5.x 文档: https://ant.design
- TypeScript 文档: https://www.typescriptlang.org

---

**创建时间**: 2026-01-31
**任务编号**: 19.11
**状态**: ✅ 已完成
