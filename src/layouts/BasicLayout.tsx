import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  ReadOutlined,
  DollarOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useUserStore, useAppStore } from '@/stores';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '工作台',
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/user', label: '用户管理' },
      { key: '/system/role', label: '角色管理' },
      { key: '/system/menu', label: '菜单管理' },
      { key: '/system/campus', label: '校区管理' },
      { key: '/system/dict', label: '字典管理' },
    ],
  },
  {
    key: '/student',
    icon: <TeamOutlined />,
    label: '学生管理',
    children: [
      { key: '/student/list', label: '学生列表' },
    ],
  },
  {
    key: '/teaching',
    icon: <ReadOutlined />,
    label: '教学管理',
    children: [
      { key: '/teaching/course', label: '课程管理' },
      { key: '/teaching/class', label: '班级管理' },
      { key: '/teaching/schedule', label: '排课管理' },
      { key: '/teaching/attendance', label: '考勤管理' },
    ],
  },
  {
    key: '/finance',
    icon: <DollarOutlined />,
    label: '财务管理',
    children: [
      { key: '/finance/contract', label: '合同管理' },
      { key: '/finance/payment', label: '收费管理' },
      { key: '/finance/consumption', label: '课时消耗' },
    ],
  },
  {
    key: '/marketing',
    icon: <PhoneOutlined />,
    label: '招生管理',
    children: [
      { key: '/marketing/lead', label: '线索管理' },
      { key: '/marketing/follow', label: '跟进记录' },
      { key: '/marketing/trial', label: '试听管理' },
    ],
  },
];

const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useUserStore();
  const { collapsed, toggleCollapsed } = useAppStore();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 获取当前选中的菜单项
  const selectedKeys = [location.pathname];
  const openKeys = ['/' + location.pathname.split('/')[1]];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: collapsed ? 16 : 18,
            fontWeight: 600,
            color: '#1890ff'
          }}>
            {collapsed ? 'EDU' : '教育管理系统'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ cursor: 'pointer' }} onClick={toggleCollapsed}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={userInfo?.avatar} />
              <span>{userInfo?.realName || userInfo?.username || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{
          margin: 24,
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
