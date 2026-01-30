# CampusSwitch 校区切换组件

校区切换组件，支持多种展示样式和完整的交互功能。

## 功能特性

- 支持校区选择和切换
- 显示校区地址信息
- 当前选中状态标识
- 三种展示样式：标准版、简化版、带标签版
- 深色科技风格主题
- 完整的 TypeScript 类型支持

## 组件变体

### 1. CampusSwitch (标准版)

显示图标和地址的完整版本。

```tsx
import { CampusSwitch } from '@/components';

function Example() {
  const [campusId, setCampusId] = useState<number>(1);

  const handleChange = (id: number, campus: Campus) => {
    console.log('切换到校区:', campus.name);
    setCampusId(id);
  };

  return (
    <CampusSwitch
      value={campusId}
      onChange={handleChange}
      showIcon={true}
      showAddress={true}
      width={250}
    />
  );
}
```

### 2. SimpleCampusSwitch (简化版)

仅显示校区名称，不显示图标和地址。

```tsx
import { SimpleCampusSwitch } from '@/components';

function Example() {
  const [campusId, setCampusId] = useState<number>(1);

  return (
    <SimpleCampusSwitch
      value={campusId}
      onChange={(id, campus) => setCampusId(id)}
      width={150}
    />
  );
}
```

### 3. CampusSwitchWithTag (带标签版)

显示"当前校区"标签，适合在顶部导航栏使用。

```tsx
import { CampusSwitchWithTag } from '@/components';

function Example() {
  const [campusId, setCampusId] = useState<number>(1);

  return (
    <CampusSwitchWithTag
      value={campusId}
      onChange={(id, campus) => setCampusId(id)}
      width={250}
    />
  );
}
```

## API

### CampusSwitchProps

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| campusList | 校区列表 | `Campus[]` | 默认校区列表 |
| value | 当前选中的校区ID | `number` | - |
| onChange | 切换回调函数 | `(campusId: number, campus: Campus) => void` | - |
| showIcon | 是否显示图标 | `boolean` | `true` |
| showAddress | 是否显示地址 | `boolean` | `true` |
| width | 选择器宽度 | `number \| string` | `250` |
| disabled | 是否禁用 | `boolean` | `false` |
| placeholder | 占位符文本 | `string` | `'请选择校区'` |

### Campus 类型

```typescript
interface Campus {
  id: number;           // 校区ID
  name: string;         // 校区名称
  code: string;         // 校区编码
  address?: string;     // 校区地址
  status: 'active' | 'inactive';  // 状态
}
```

## 使用场景

### 1. 在顶部导航栏中使用

```tsx
import { CampusSwitchWithTag } from '@/components';
import { useAppStore } from '@/stores';

function Header() {
  const { currentCampusId, setCurrentCampusId } = useAppStore();

  return (
    <div className="header">
      <CampusSwitchWithTag
        value={currentCampusId}
        onChange={(id) => setCurrentCampusId(id)}
      />
    </div>
  );
}
```

### 2. 在表单中使用

```tsx
import { Form } from 'antd';
import { CampusSwitch } from '@/components';

function StudentForm() {
  return (
    <Form>
      <Form.Item label="所属校区" name="campusId">
        <CampusSwitch placeholder="请选择学生所属校区" />
      </Form.Item>
    </Form>
  );
}
```

### 3. 与 Zustand Store 集成

```tsx
import { CampusSwitch } from '@/components';
import { useAppStore } from '@/stores';
import { useEffect } from 'react';

function CampusSelector() {
  const { currentCampusId, setCurrentCampusId } = useAppStore();

  const handleCampusChange = (id: number, campus: Campus) => {
    setCurrentCampusId(id);
    // 可以在这里触发数据刷新
    console.log('当前校区已切换:', campus.name);
  };

  return (
    <CampusSwitch
      value={currentCampusId}
      onChange={handleCampusChange}
    />
  );
}
```

### 4. 自定义校区列表

```tsx
import { CampusSwitch, Campus } from '@/components';
import { useState, useEffect } from 'react';
import { getCampusList } from '@/api/campus';

function CustomCampusSwitch() {
  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 API 获取校区列表
    getCampusList().then(data => {
      setCampusList(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>加载中...</div>;

  return (
    <CampusSwitch
      campusList={campusList}
      onChange={(id, campus) => {
        console.log('选择了校区:', campus);
      }}
    />
  );
}
```

## 样式定制

组件使用内联样式，遵循项目的深色科技风格主题：

- 主色调：青色渐变 (#00d4ff → #0099ff)
- 背景：深色 (#111827)
- 边框：半透明青色
- 图标：青色高亮
- 选中状态：绿色标识 (#00ff88)

如需自定义样式，可以通过 CSS 覆盖：

```css
.custom-campus-switch .ant-select {
  /* 自定义样式 */
}
```

## 注意事项

1. 组件会自动过滤 `status` 为 `'inactive'` 的校区
2. 如果未提供 `campusList`，将使用默认的示例数据
3. 组件支持受控和非受控两种模式
4. 建议在应用初始化时从后端 API 获取真实的校区列表

## 完整示例

```tsx
import { useState } from 'react';
import { Space, Card, Typography } from 'antd';
import {
  CampusSwitch,
  SimpleCampusSwitch,
  CampusSwitchWithTag,
  Campus
} from '@/components';

const { Title, Text } = Typography;

function CampusSwitchDemo() {
  const [campusId, setCampusId] = useState<number>(1);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  const handleChange = (id: number, campus: Campus) => {
    setCampusId(id);
    setSelectedCampus(campus);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="标准版 - 显示图标和地址">
          <CampusSwitch
            value={campusId}
            onChange={handleChange}
          />
        </Card>

        <Card title="简化版 - 仅显示名称">
          <SimpleCampusSwitch
            value={campusId}
            onChange={handleChange}
          />
        </Card>

        <Card title="带标签版 - 显示当前校区标签">
          <CampusSwitchWithTag
            value={campusId}
            onChange={handleChange}
          />
        </Card>

        {selectedCampus && (
          <Card title="当前选中的校区信息">
            <Space direction="vertical">
              <Text>ID: {selectedCampus.id}</Text>
              <Text>名称: {selectedCampus.name}</Text>
              <Text>编码: {selectedCampus.code}</Text>
              <Text>地址: {selectedCampus.address}</Text>
              <Text>状态: {selectedCampus.status}</Text>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
}

export default CampusSwitchDemo;
```

## 技术实现

- 基于 Ant Design 5.x Select 组件
- 使用 React Hooks (useState)
- 完整的 TypeScript 类型定义
- 支持受控组件模式
- 自动过滤非激活状态的校区
- 响应式设计，支持自定义宽度
