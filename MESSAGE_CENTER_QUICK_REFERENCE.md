# 消息中心功能 - 快速参考

## 文件结构

```
edu-web/
├── src/
│   ├── types/
│   │   └── notification.ts              # 消息类型定义
│   ├── api/
│   │   └── notification.ts              # 消息API接口
│   ├── components/
│   │   └── NotificationBell/            # 头部通知铃铛组件
│   │       ├── index.tsx
│   │       └── index.css
│   ├── pages/
│   │   └── notification/
│   │       └── message/                 # 消息中心页面
│   │           ├── index.tsx
│   │           ├── index.css
│   │           └── components/
│   │               ├── MessageDetail.tsx
│   │               └── MessageDetail.css
│   ├── layouts/
│   │   └── BasicLayout.tsx              # 已更新：集成通知铃铛
│   └── router/
│       └── index.tsx                    # 已更新：添加消息路由
└── TASK_21.10_IMPLEMENTATION_SUMMARY.md # 实现总结文档
```

## 核心类型定义

```typescript
// 消息类型
export type MessageType = 'system' | 'business' | 'approval';

// 消息状态
export type MessageStatus = 'unread' | 'read';

// 消息详情
export interface Message {
  id: number;
  title: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  senderId?: number;
  senderName?: string;
  receiverId: number;
  receiverName?: string;
  relatedId?: number;
  relatedType?: string;
  sendTime: string;
  readTime?: string;
  createTime: string;
  updateTime?: string;
}
```

## API接口列表

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| getMessagePage | GET | /notification/message/page | 分页查询消息 |
| getMessageDetail | GET | /notification/message/{id} | 查询消息详情 |
| markMessageRead | PUT | /notification/message/{id}/read | 标记已读 |
| markAllRead | PUT | /notification/message/read-all | 全部标记已读 |
| deleteMessage | DELETE | /notification/message/{id} | 删除消息 |
| batchDeleteMessage | DELETE | /notification/message/batch | 批量删除 |
| getUnreadCount | GET | /notification/message/unread-count | 获取未读数量 |
| deleteAllRead | DELETE | /notification/message/read-all | 删除所有已读 |

## 组件使用示例

### 1. 在Layout中使用NotificationBell

```tsx
import NotificationBell from '@/components/NotificationBell';

// 在Header中使用
<NotificationBell className="header-icon" style={styles.iconButton} />
```

### 2. 路由配置

```tsx
{
  path: 'notification',
  children: [
    {
      path: 'message',
      lazy: async () => ({
        Component: (await import('@/pages/notification/message')).default
      }),
    },
  ],
}
```

### 3. 菜单配置

```tsx
{
  key: '/system',
  icon: <SettingOutlined />,
  label: '系统管理',
  children: [
    // ... 其他菜单项
    { key: '/notification/message', label: '消息中心' },
  ],
}
```

## 样式主题

### 颜色配置

```css
/* 主题色 */
--primary-color: #00d4ff;
--primary-gradient: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);

/* 消息类型颜色 */
--system-color: #00d4ff;
--business-color: #0099ff;
--approval-color: #00ff88;

/* 背景色 */
--bg-dark: #0a0e17;
--bg-card: #111827;
--bg-hover: rgba(0, 212, 255, 0.08);

/* 边框色 */
--border-color: rgba(0, 212, 255, 0.1);
--border-active: rgba(0, 212, 255, 0.4);
```

### 关键样式类

```css
/* 未读消息高亮 */
.message-item.unread {
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
}

/* 分类激活状态 */
.category-item.active {
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
}

/* Badge动画 */
.notification-badge .ant-badge-count {
  animation: pulse 2s ease-in-out infinite;
}
```

## 功能特性清单

### 消息中心页面

- [x] 左侧分类导航（6种分类）
- [x] 消息列表展示（标题、摘要、时间、类型）
- [x] 未读消息高亮显示
- [x] 搜索功能（标题、内容）
- [x] 分页支持
- [x] 全部标记已读
- [x] 删除已读消息
- [x] 刷新功能
- [x] 点击查看详情
- [x] 自动标记已读

### 消息详情抽屉

- [x] 右侧抽屉展示
- [x] 消息完整信息
- [x] 发送人和时间
- [x] 阅读状态
- [x] 关联业务信息
- [x] 删除操作

### 头部通知铃铛

- [x] 未读数量徽章
- [x] 弹窗预览（最近5条）
- [x] 实时更新（30秒轮询）
- [x] 点击跳转消息中心
- [x] 脉冲动画效果

## 常见问题

### Q1: 如何修改轮询间隔？

在 `NotificationBell/index.tsx` 中修改：

```tsx
// 轮询更新未读数量（每30秒）
useEffect(() => {
  const timer = setInterval(() => {
    loadUnreadCount();
  }, 30000); // 修改这里的数值（毫秒）

  return () => clearInterval(timer);
}, []);
```

### Q2: 如何自定义消息类型？

1. 在 `types/notification.ts` 中添加新类型：
```tsx
export type MessageType = 'system' | 'business' | 'approval' | 'custom';
```

2. 在 `MESSAGE_TYPE_CONFIG` 中添加配置：
```tsx
export const MESSAGE_TYPE_CONFIG = {
  // ... 现有配置
  custom: {
    label: '自定义通知',
    color: '#ff6b6b',
    icon: 'CustomIcon',
  },
};
```

### Q3: 如何集成WebSocket实时推送？

替换轮询机制，在 `NotificationBell/index.tsx` 中：

```tsx
useEffect(() => {
  // 建立WebSocket连接
  const ws = new WebSocket('ws://your-server/notifications');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'unread_count') {
      setUnreadCount(data.count);
    }
  };

  return () => ws.close();
}, []);
```

### Q4: 如何添加消息提示音？

在 `NotificationBell/index.tsx` 中：

```tsx
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
};

// 在未读数量变化时播放
useEffect(() => {
  if (unreadCount > prevUnreadCount) {
    playNotificationSound();
  }
}, [unreadCount]);
```

## 性能优化建议

1. **虚拟滚动**：使用 `react-window` 或 `react-virtualized` 处理长列表
2. **防抖搜索**：使用 `lodash.debounce` 优化搜索输入
3. **缓存策略**：使用 `React Query` 或 `SWR` 管理数据缓存
4. **懒加载图片**：使用 `react-lazy-load-image-component`
5. **代码分割**：确保路由懒加载正常工作

## 测试要点

### 功能测试

```bash
# 1. 消息列表加载
- 访问 /notification/message
- 验证消息列表正常显示
- 验证分页功能

# 2. 消息分类
- 点击左侧各个分类
- 验证筛选结果正确

# 3. 搜索功能
- 输入关键词搜索
- 验证搜索结果

# 4. 标记已读
- 点击消息查看详情
- 验证自动标记已读
- 点击"全部标记已读"

# 5. 删除消息
- 删除单条消息
- 删除所有已读消息

# 6. 未读提醒
- 验证铃铛显示未读数量
- 点击铃铛查看预览
- 验证轮询更新
```

### 兼容性测试

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- 移动端浏览器

## 部署注意事项

1. **环境变量**：确保 `VITE_API_BASE_URL` 配置正确
2. **API接口**：确保后端接口已实现并可访问
3. **路由配置**：确保服务器支持前端路由（SPA模式）
4. **静态资源**：确保CSS和图片资源正确加载
5. **CORS配置**：确保跨域请求配置正确

## 联系方式

如有问题，请查看：
- 实现总结文档：`TASK_21.10_IMPLEMENTATION_SUMMARY.md`
- 项目文档：`CLAUDE.md`
