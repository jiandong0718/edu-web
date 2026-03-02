/**
 * CampusSwitch 组件使用示例
 *
 * 展示三种不同样式的校区切换组件及其使用场景
 */

import { useState } from 'react';
import { Space, Card, Typography, Divider, Row, Col, message } from 'antd';
import {
  CampusSwitch,
  SimpleCampusSwitch,
  CampusSwitchWithTag,
  type Campus
} from './index';

const { Title, Text, Paragraph } = Typography;

// 示例：自定义校区列表
const customCampusList: Campus[] = [
  {
    id: 1,
    name: '总部校区',
    code: 'HQ',
    address: '深圳市南山区科技园南区深南大道9988号',
    status: 'active',
  },
  {
    id: 2,
    name: '福田分校',
    code: 'FT',
    address: '深圳市福田区中心区福华三路138号',
    status: 'active',
  },
  {
    id: 3,
    name: '龙岗分校',
    code: 'LG',
    address: '深圳市龙岗区龙城广场地铁站A出口',
    status: 'active',
  },
  {
    id: 4,
    name: '宝安分校',
    code: 'BA',
    address: '深圳市宝安区新安街道宝安大道',
    status: 'active',
  },
  {
    id: 5,
    name: '罗湖分校',
    code: 'LH',
    address: '深圳市罗湖区东门步行街',
    status: 'inactive', // 此校区不会显示在列表中
  },
];

export function CampusSwitchDemo() {
  const [campusId, setCampusId] = useState<number>(1);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  // 处理校区切换
  const handleCampusChange = (id: number, campus: Campus) => {
    setCampusId(id);
    setSelectedCampus(campus);
    message.success(`已切换到 ${campus.name}`);
    console.log('切换校区:', { id, campus });
  };

  return (
    <div style={{ padding: 24, background: '#0a0e1a', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 标题 */}
        <div>
          <Title level={2} style={{ color: '#00d4ff', marginBottom: 8 }}>
            校区切换组件示例
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            展示三种不同样式的校区切换组件及其使用场景
          </Paragraph>
        </div>

        <Divider style={{ borderColor: 'rgba(0, 212, 255, 0.2)' }} />

        {/* 示例 1: 标准版 */}
        <Card
          title="标准版 - 显示图标和地址"
          style={{
            background: '#111827',
            border: '1px solid rgba(0, 212, 255, 0.1)',
          }}
          headStyle={{
            color: '#00d4ff',
            borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              适用场景：表单选择、详细信息展示
            </Text>
            <CampusSwitch
              campusList={customCampusList}
              value={campusId}
              onChange={handleCampusChange}
              showIcon={true}
              showAddress={true}
              width={300}
            />
          </Space>
        </Card>

        {/* 示例 2: 简化版 */}
        <Card
          title="简化版 - 仅显示名称"
          style={{
            background: '#111827',
            border: '1px solid rgba(0, 212, 255, 0.1)',
          }}
          headStyle={{
            color: '#00d4ff',
            borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              适用场景：空间受限的界面、快速选择
            </Text>
            <SimpleCampusSwitch
              campusList={customCampusList}
              value={campusId}
              onChange={handleCampusChange}
              width={180}
            />
          </Space>
        </Card>

        {/* 示例 3: 带标签版 */}
        <Card
          title="带标签版 - 显示当前校区标签"
          style={{
            background: '#111827',
            border: '1px solid rgba(0, 212, 255, 0.1)',
          }}
          headStyle={{
            color: '#00d4ff',
            borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              适用场景：顶部导航栏、需要突出显示当前校区
            </Text>
            <CampusSwitchWithTag
              campusList={customCampusList}
              value={campusId}
              onChange={handleCampusChange}
              width={250}
            />
          </Space>
        </Card>

        {/* 示例 4: 禁用状态 */}
        <Card
          title="禁用状态"
          style={{
            background: '#111827',
            border: '1px solid rgba(0, 212, 255, 0.1)',
          }}
          headStyle={{
            color: '#00d4ff',
            borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              适用场景：权限限制、不可编辑状态
            </Text>
            <CampusSwitch
              campusList={customCampusList}
              value={campusId}
              onChange={handleCampusChange}
              disabled={true}
              width={250}
            />
          </Space>
        </Card>

        {/* 当前选中信息 */}
        {selectedCampus && (
          <Card
            title="当前选中的校区信息"
            style={{
              background: '#111827',
              border: '1px solid rgba(0, 255, 136, 0.2)',
            }}
            headStyle={{
              color: '#00ff88',
              borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                    校区ID
                  </Text>
                  <Text strong style={{ color: '#00d4ff', fontSize: 16 }}>
                    {selectedCampus.id}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                    校区名称
                  </Text>
                  <Text strong style={{ color: '#00d4ff', fontSize: 16 }}>
                    {selectedCampus.name}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                    校区编码
                  </Text>
                  <Text strong style={{ color: '#00d4ff', fontSize: 16 }}>
                    {selectedCampus.code}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                    状态
                  </Text>
                  <Text strong style={{ color: '#00ff88', fontSize: 16 }}>
                    {selectedCampus.status === 'active' ? '激活' : '未激活'}
                  </Text>
                </Space>
              </Col>
              <Col span={24}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                    校区地址
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    {selectedCampus.address}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* 使用提示 */}
        <Card
          title="使用提示"
          style={{
            background: '#111827',
            border: '1px solid rgba(0, 212, 255, 0.1)',
          }}
          headStyle={{
            color: '#00d4ff',
            borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
          }}
        >
          <Space direction="vertical" size="small">
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              • 组件会自动过滤 status 为 'inactive' 的校区
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              • 支持受控和非受控两种模式
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              • 可以通过 width 属性自定义选择器宽度
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              • onChange 回调会返回校区ID和完整的校区对象
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              • 建议与 Zustand Store 集成，实现全局校区状态管理
            </Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
}

export default CampusSwitchDemo;
