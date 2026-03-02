# 消息中心功能使用指南

## 快速开始

### 1. 启动开发服务器

```bash
cd /Users/liujiandong/Documents/work/package/edu/edu-web
npm run dev
```

访问：http://localhost:5173

### 2. 访问消息中心

有两种方式访问消息中心：

**方式一：通过菜单**
1. 登录系统
2. 点击左侧菜单"系统管理"
3. 点击"消息中心"

**方式二：通过头部铃铛**
1. 点击顶部导航栏的铃铛图标
2. 查看未读消息预览
3. 点击"查看全部消息"

直接访问：http://localhost:5173/notification/message

## 功能演示

### 消息列表

1. **查看消息**
   - 左侧选择分类（全部、未读、已读、系统通知、业务通知、审批通知）
   - 右侧显示对应的消息列表
   - 未读消息有青色边框高亮

2. **搜索消息**
   - 在搜索框输入关键词
   - 按回车或失去焦点触发搜索
   - 支持搜索标题和内容

3. **查看详情**
   - 点击消息列表项
   - 右侧弹出详情抽屉
   - 自动标记为已读

4. **标记已读**
   - 点击"全部标记已读"按钮
   - 所有未读消息变为已读状态

5. **删除消息**
   - 单条删除：点击消息右侧的"删除"按钮
   - 批量删除：点击"删除已读消息"按钮

### 未读提醒

1. **查看未读数量**
   - 头部铃铛图标显示未读数量徽章
   - 数量超过99显示"99+"

2. **预览未读消息**
   - 点击铃铛图标
   - 弹出最近5条未读消息
   - 点击消息跳转到消息中心

3. **实时更新**
   - 每30秒自动更新未读数量
   - 无需手动刷新

## 模拟数据测试

由于后端接口尚未实现，可以使用以下方式进行前端测试：

### 方式一：Mock数据

在 `src/api/notification.ts` 中临时添加Mock数据：

```typescript
// 临时Mock数据（测试用）
const mockMessages: Message[] = [
  {
    id: 1,
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护升级，期间可能无法访问，请提前做好准备。',
    type: 'system',
    status: 'unread',
    senderName: '系统管理员',
    receiverId: 1,
    sendTime: '2026-01-31 10:00:00',
    createTime: '2026-01-31 10:00:00',
  },
  {
    id: 2,
    title: '课时预警提醒',
    content: '学生张三的课时余额不足10课时，请及时提醒家长续费。',
    type: 'business',
    status: 'unread',
    senderName: '教务系统',
    receiverId: 1,
    sendTime: '2026-01-31 09:30:00',
    createTime: '2026-01-31 09:30:00',
  },
  {
    id: 3,
    title: '退费审批通过',
    content: '学生李四的退费申请已审批通过，退费金额1000元，请及时处理。',
    type: 'approval',
    status: 'read',
    senderName: '财务主管',
    receiverId: 1,
    sendTime: '2026-01-30 16:00:00',
    readTime: '2026-01-30 17:00:00',
    createTime: '2026-01-30 16:00:00',
  },
];

// 修改getMessagePage函数
export const getMessagePage = async (params: MessageQueryParams) => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 模拟筛选
  let filtered = mockMessages;
  if (params.status) {
    filtered = filtered.filter(m => m.status === params.status);
  }
  if (params.type) {
    filtered = filtered.filter(m => m.type === params.type);
  }
  if (params.keyword) {
    filtered = filtered.filter(m =>
      m.title.includes(params.keyword!) ||
      m.content.includes(params.keyword!)
    );
  }

  return {
    list: filtered,
    total: filtered.length,
    page: params.page,
    pageSize: params.pageSize,
  };
};

// 修改getUnreadCount函数
export const getUnreadCount = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const unreadMessages = mockMessages.filter(m => m.status === 'unread');
  return {
    total: unreadMessages.length,
    system: unreadMessages.filter(m => m.type === 'system').length,
    business: unreadMessages.filter(m => m.type === 'business').length,
    approval: unreadMessages.filter(m => m.type === 'approval').length,
  };
};
```

### 方式二：使用Mock Service Worker (MSW)

1. 安装MSW：
```bash
npm install -D msw
```

2. 创建Mock handlers（详见MSW文档）

### 方式三：使用JSON Server

1. 安装JSON Server：
```bash
npm install -g json-server
```

2. 创建 `db.json` 文件

3. 启动Mock服务器：
```bash
json-server --watch db.json --port 8080
```

## 样式预览

### 主题色
- 主色调：青色渐变 (#00d4ff → #0099ff)
- 系统通知：#00d4ff
- 业务通知：#0099ff
- 审批通知：#00ff88

### 视觉效果
- 深色背景
- 玻璃态效果
- 发光边框
- 脉冲动画
- 悬停效果

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 常见问题

### Q: 消息列表为空？
A: 检查后端API是否正常返回数据，或使用Mock数据测试。

### Q: 未读数量不更新？
A: 检查轮询是否正常工作，查看浏览器控制台是否有错误。

### Q: 样式显示异常？
A: 确保CSS文件正确导入，检查浏览器是否支持CSS特性。

### Q: 点击消息无反应？
A: 检查路由配置是否正确，查看浏览器控制台错误信息。

## 开发调试

### 查看网络请求
打开浏览器开发者工具 > Network标签，查看API请求和响应。

### 查看控制台日志
打开浏览器开发者工具 > Console标签，查看错误和警告信息。

### React DevTools
安装React DevTools扩展，查看组件状态和Props。

## 相关文档

- [实现总结文档](./TASK_21.10_IMPLEMENTATION_SUMMARY.md)
- [快速参考文档](./MESSAGE_CENTER_QUICK_REFERENCE.md)
- [验证清单](./TASK_21.10_CHECKLIST.md)
- [项目文档](./CLAUDE.md)

## 技术支持

如遇到问题，请：
1. 查看相关文档
2. 检查浏览器控制台错误
3. 查看网络请求状态
4. 确认后端API是否正常

---

**版本：** 1.0.0
**更新时间：** 2026-01-31
**作者：** Claude Code Agent
