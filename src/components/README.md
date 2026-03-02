# 组件使用说明

本目录包含了教育管理系统的通用组件，所有组件都遵循深色科技风格（青色渐变主题）。

## 组件列表

### 1. CommonTable - 通用表格组件

功能特性：
- 内置分页功能
- 支持筛选和排序
- 支持数据导出
- 支持刷新功能
- 深色主题样式

使用示例：
```tsx
import { CommonTable } from '@/components';

<CommonTable
  columns={columns}
  dataSource={data}
  showExport={true}
  showRefresh={true}
  onExport={handleExport}
  onRefresh={handleRefresh}
  onChange={(pagination, filters, sorter) => {
    console.log('表格变化', pagination, filters, sorter);
  }}
/>
```

### 2. CommonForm - 通用表单组件

功能特性：
- 内置表单验证
- 统一的提交/取消按钮
- 支持自定义操作按钮
- 深色主题样式

使用示例：
```tsx
import { CommonForm } from '@/components';
import { Form, Input } from 'antd';

<CommonForm
  submitText="保存"
  cancelText="取消"
  showCancel={true}
  onSubmit={async (values) => {
    await saveData(values);
  }}
  onCancel={() => {
    navigate(-1);
  }}
>
  <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
  <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
    <Input />
  </Form.Item>
</CommonForm>
```

### 3. FileUpload - 文件上传组件

功能特性：
- 支持按钮上传和拖拽上传
- 文件大小和类型验证
- 上传进度显示
- 文件预览和删除
- 深色主题样式

使用示例：
```tsx
import { FileUpload } from '@/components';

// 按钮上传
<FileUpload
  type="button"
  maxCount={5}
  maxSize={10}
  accept=".jpg,.png,.pdf"
  onChange={(fileList) => {
    console.log('文件列表', fileList);
  }}
  hint="支持 JPG、PNG、PDF 格式，单个文件不超过 10MB"
/>

// 拖拽上传
<FileUpload
  type="drag"
  maxCount={1}
  maxSize={5}
  accept=".xlsx,.xls"
  customRequest={async (options) => {
    // 自定义上传逻辑
    const formData = new FormData();
    formData.append('file', options.file);
    await uploadFile(formData);
  }}
/>
```

### 4. CampusSwitch - 校区切换组件

功能特性：
- 校区选择和切换
- 支持显示地址信息
- 多种展示样式
- 深色主题样式

使用示例：
```tsx
import { CampusSwitch, SimpleCampusSwitch, CampusSwitchWithTag } from '@/components';

// 标准版本
<CampusSwitch
  value={currentCampusId}
  onChange={(campusId, campus) => {
    console.log('切换到', campus.name);
    setCurrentCampusId(campusId);
  }}
  showIcon={true}
  showAddress={true}
  width={250}
/>

// 简化版本
<SimpleCampusSwitch
  value={currentCampusId}
  onChange={(campusId, campus) => {
    setCurrentCampusId(campusId);
  }}
  width={150}
/>

// 带标签版本
<CampusSwitchWithTag
  value={currentCampusId}
  onChange={(campusId, campus) => {
    setCurrentCampusId(campusId);
  }}
/>
```

## 页面列表

### 1. 用户详情页面
路径：`src/pages/System/User/Detail.tsx`

功能特性：
- 用户基本信息展示
- 登录日志查看
- 操作日志查看
- 支持编辑和返回

### 2. 角色管理页面
路径：`src/pages/system/role/index.tsx`

功能特性：
- 角色列表展示
- 角色新增/编辑/删除
- 权限分配（树形选择）
- 权限树支持全选/半选

### 3. 教室管理页面
路径：`src/pages/System/Classroom/index.tsx`

功能特性：
- 教室列表展示
- 教室新增/编辑/删除
- 教室状态管理（空闲/使用中/维护中）
- 统计卡片展示
- 支持按校区、状态筛选

## 样式规范

所有组件和页面都遵循以下样式规范：

### 颜色主题
- 主色调：青色渐变 `#00d4ff` → `#0099ff`
- 成功色：`#00ff88`
- 警告色：`#ffaa00`
- 错误色：`#ff4d6a`
- 背景色：`#111827`
- 边框色：`rgba(0, 212, 255, 0.1)`

### 按钮样式
```tsx
// 主要按钮
style={{
  background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
  border: 'none',
  boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
}}

// 次要按钮
style={{
  background: 'rgba(0, 212, 255, 0.1)',
  border: '1px solid rgba(0, 212, 255, 0.3)',
  color: '#00d4ff',
}}
```

### 卡片样式
```tsx
style={{
  background: '#111827',
  border: '1px solid rgba(0, 212, 255, 0.1)',
  borderRadius: 12,
}}
```

### 标签样式
```tsx
// 青色标签
style={{
  background: 'rgba(0, 212, 255, 0.1)',
  border: '1px solid rgba(0, 212, 255, 0.3)',
  color: '#00d4ff',
}}

// 绿色标签（成功）
style={{
  background: 'rgba(0, 255, 136, 0.1)',
  border: '1px solid rgba(0, 255, 136, 0.3)',
  color: '#00ff88',
}}
```

## 注意事项

1. 所有组件都使用 TypeScript 编写，提供完整的类型定义
2. 组件支持 Ant Design 5.x 的所有原生属性
3. 遵循现有的深色科技风格设计
4. 所有异步操作都有 loading 状态
5. 所有操作都有成功/失败提示
6. 表单都有完整的验证规则
