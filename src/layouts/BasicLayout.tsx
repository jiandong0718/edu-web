import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Tooltip } from 'antd';
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
  BellOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useUserStore, useAppStore } from '@/stores';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '数据看板',
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
      { key: '/finance/refund', label: '退费管理' },
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
      { key: '/marketing/funnel', label: '招生漏斗' },
      { key: '/marketing/consultant-ranking', label: '顾问业绩' },
    ],
  },
];

// 科技风格样式
const styles = {
  layout: {
    minHeight: '100vh',
    background: '#0a0e17',
  },
  sider: {
    background: 'linear-gradient(180deg, #0f1419 0%, #0a0e17 100%)',
    borderRight: '1px solid rgba(0, 212, 255, 0.1)',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  logo: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
    background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  logoText: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #00d4ff 100%)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '2px',
    animation: 'gradientShift 3s ease infinite',
  },
  header: {
    padding: '0 24px',
    background: 'rgba(17, 24, 39, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.65)',
    transition: 'all 0.3s ease',
    fontSize: 18,
  },
  content: {
    margin: 24,
    padding: 24,
    background: '#111827',
    borderRadius: 12,
    border: '1px solid rgba(0, 212, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
    minHeight: 280,
    animation: 'fadeIn 0.3s ease',
  },
  userAvatar: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    border: '2px solid rgba(0, 212, 255, 0.3)',
    boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
  },
  menuContainer: {
    height: 'calc(100vh - 64px)',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
  },
};

// 添加全局样式
const globalStyles = `
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(0, 212, 255, 0); }
  }

  .tech-menu .ant-menu-item-selected {
    position: relative;
  }

  .tech-menu .ant-menu-item-selected::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: linear-gradient(180deg, #00d4ff 0%, #0099ff 100%);
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  }

  .tech-menu .ant-menu-item:hover,
  .tech-menu .ant-menu-submenu-title:hover {
    background: rgba(0, 212, 255, 0.08) !important;
  }

  .header-icon:hover {
    background: rgba(0, 212, 255, 0.1) !important;
    color: #00d4ff !important;
  }

  .notification-badge .ant-badge-dot {
    background: #00ff88;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }
`;

const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useUserStore();
  const { collapsed, toggleCollapsed } = useAppStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 注入全局样式
    const styleEl = document.createElement('style');
    styleEl.textContent = globalStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
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
      danger: true,
    },
  ];

  // 获取当前选中的菜单项
  const selectedKeys = [location.pathname];
  const openKeys = ['/' + location.pathname.split('/')[1]];

  return (
    <Layout style={styles.layout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={80}
        style={styles.sider}
      >
        <div style={styles.logo}>
          <h1 style={{
            ...styles.logoText,
            fontSize: collapsed ? 16 : 20,
          }}>
            {collapsed ? 'EDU' : 'EDU ADMIN'}
          </h1>
          {/* 装饰性光效 */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: collapsed ? 40 : 120,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={styles.menuContainer} className="tech-menu">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={selectedKeys}
            defaultOpenKeys={collapsed ? [] : openKeys}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              border: 'none',
            }}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={styles.header}>
          <div style={styles.headerLeft}>
            <div
              className="header-icon"
              style={styles.iconButton}
              onClick={toggleCollapsed}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Tooltip title="搜索">
              <div className="header-icon" style={styles.iconButton}>
                <SearchOutlined />
              </div>
            </Tooltip>
          </div>
          <div style={styles.headerRight}>
            <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
              <div
                className="header-icon"
                style={styles.iconButton}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </div>
            </Tooltip>
            <Tooltip title="通知">
              <Badge dot className="notification-badge">
                <div className="header-icon" style={styles.iconButton}>
                  <BellOutlined />
                </div>
              </Badge>
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', marginLeft: 8 }}>
                <Avatar
                  icon={<UserOutlined />}
                  src={userInfo?.avatar}
                  style={styles.userAvatar}
                />
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  {userInfo?.realName || userInfo?.username || '用户'}
                </span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
