import { useState } from 'react';
import { Select, Space, Tag } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';

export interface Campus {
  id: number;
  name: string;
  code: string;
  address?: string;
  status: 'active' | 'inactive';
}

export interface CampusSwitchProps {
  // 校区列表
  campusList?: Campus[];
  // 当前选中的校区ID
  value?: number;
  // 切换回调
  onChange?: (campusId: number, campus: Campus) => void;
  // 是否显示图标
  showIcon?: boolean;
  // 是否显示地址
  showAddress?: boolean;
  // 选择器宽度
  width?: number | string;
  // 是否禁用
  disabled?: boolean;
  // 占位符
  placeholder?: string;
}

const styles = {
  container: {
    display: 'inline-block',
  },
  select: {
    minWidth: 200,
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionName: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 500,
  },
  optionAddress: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    marginTop: 2,
  },
  activeTag: {
    background: 'rgba(0, 255, 136, 0.1)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    color: '#00ff88',
    fontSize: 11,
    padding: '0 6px',
  },
  icon: {
    color: '#00d4ff',
    fontSize: 16,
  },
};

// 默认校区数据
const defaultCampusList: Campus[] = [
  {
    id: 1,
    name: '总部校区',
    code: 'HQ',
    address: '深圳市南山区科技园',
    status: 'active',
  },
  {
    id: 2,
    name: '分部校区',
    code: 'BRANCH',
    address: '深圳市福田区中心区',
    status: 'active',
  },
  {
    id: 3,
    name: '东部校区',
    code: 'EAST',
    address: '深圳市龙岗区龙城广场',
    status: 'active',
  },
  {
    id: 4,
    name: '西部校区',
    code: 'WEST',
    address: '深圳市宝安区新安街道',
    status: 'active',
  },
];

export function CampusSwitch({
  campusList = defaultCampusList,
  value,
  onChange,
  showIcon = true,
  showAddress = true,
  width = 250,
  disabled = false,
  placeholder = '请选择校区',
}: CampusSwitchProps) {
  const [selectedCampusId, setSelectedCampusId] = useState<number | undefined>(value);

  // 处理切换
  const handleChange = (campusId: number) => {
    setSelectedCampusId(campusId);
    const campus = campusList.find((c) => c.id === campusId);
    if (campus && onChange) {
      onChange(campusId, campus);
    }
  };

  // 获取当前选中的校区
  // const selectedCampus = campusList.find((c) => c.id === (value ?? selectedCampusId));

  // 过滤激活的校区
  const activeCampusList = campusList.filter((c) => c.status === 'active');

  return (
    <div style={styles.container}>
      <Select
        value={value ?? selectedCampusId}
        onChange={handleChange}
        style={{ ...styles.select, width }}
        disabled={disabled}
        placeholder={placeholder}
        suffixIcon={showIcon ? <EnvironmentOutlined style={styles.icon} /> : undefined}
        optionLabelProp="label"
      >
        {activeCampusList.map((campus) => (
          <Select.Option
            key={campus.id}
            value={campus.id}
            label={
              <Space>
                {showIcon && <EnvironmentOutlined style={styles.icon} />}
                <span>{campus.name}</span>
              </Space>
            }
          >
            <div style={styles.optionLabel}>
              <div style={styles.optionContent}>
                {showIcon && <EnvironmentOutlined style={styles.icon} />}
                <div style={{ flex: 1 }}>
                  <div style={styles.optionName}>{campus.name}</div>
                  {showAddress && campus.address && (
                    <div style={styles.optionAddress}>{campus.address}</div>
                  )}
                </div>
              </div>
              {campus.id === (value ?? selectedCampusId) && (
                <CheckCircleOutlined style={{ color: '#00ff88', fontSize: 16 }} />
              )}
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}

// 简化版本 - 仅显示名称
export function SimpleCampusSwitch({
  campusList = defaultCampusList,
  value,
  onChange,
  width = 150,
  disabled = false,
}: Omit<CampusSwitchProps, 'showIcon' | 'showAddress'>) {
  return (
    <CampusSwitch
      campusList={campusList}
      value={value}
      onChange={onChange}
      width={width}
      disabled={disabled}
      showIcon={false}
      showAddress={false}
    />
  );
}

// 带标签版本 - 显示当前校区标签
export function CampusSwitchWithTag({
  campusList = defaultCampusList,
  value,
  onChange,
  width = 250,
  disabled = false,
}: Omit<CampusSwitchProps, 'showIcon' | 'showAddress'>) {
  const selectedCampus = campusList.find((c) => c.id === value);

  return (
    <Space>
      <CampusSwitch
        campusList={campusList}
        value={value}
        onChange={onChange}
        width={width}
        disabled={disabled}
      />
      {selectedCampus && (
        <Tag style={styles.activeTag}>
          <CheckCircleOutlined style={{ marginRight: 4 }} />
          当前校区
        </Tag>
      )}
    </Space>
  );
}

export default CampusSwitch;
