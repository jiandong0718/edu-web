import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import router from './router'
import './index.css'

// 深色科技风格主题配置
const darkTechTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // 主色调 - 青色
    colorPrimary: '#00d4ff',
    colorInfo: '#00d4ff',
    colorSuccess: '#00ff88',
    colorWarning: '#ffaa00',
    colorError: '#ff4d6a',

    // 背景色
    colorBgBase: '#0a0e17',
    colorBgContainer: '#111827',
    colorBgElevated: '#1a2332',
    colorBgLayout: '#0a0e17',
    colorBgSpotlight: '#1f2937',

    // 边框
    colorBorder: 'rgba(0, 212, 255, 0.15)',
    colorBorderSecondary: 'rgba(0, 212, 255, 0.08)',

    // 文字
    colorText: 'rgba(255, 255, 255, 0.95)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.25)',

    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

    // 阴影
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 212, 255, 0.05)',
    boxShadowSecondary: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },
  components: {
    Layout: {
      headerBg: 'rgba(17, 24, 39, 0.95)',
      siderBg: '#0f1419',
      bodyBg: '#0a0e17',
      triggerBg: '#1a2332',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'rgba(0, 212, 255, 0.03)',
      darkItemSelectedBg: 'rgba(0, 212, 255, 0.15)',
      darkItemHoverBg: 'rgba(0, 212, 255, 0.08)',
      darkItemColor: 'rgba(255, 255, 255, 0.65)',
      darkItemSelectedColor: '#00d4ff',
      itemHeight: 48,
      iconSize: 18,
    },
    Card: {
      colorBgContainer: '#111827',
      colorBorderSecondary: 'rgba(0, 212, 255, 0.1)',
    },
    Table: {
      colorBgContainer: '#111827',
      headerBg: '#1a2332',
      headerColor: 'rgba(255, 255, 255, 0.85)',
      rowHoverBg: 'rgba(0, 212, 255, 0.05)',
      borderColor: 'rgba(0, 212, 255, 0.08)',
    },
    Button: {
      primaryShadow: '0 2px 10px rgba(0, 212, 255, 0.3)',
      defaultBorderColor: 'rgba(0, 212, 255, 0.3)',
      defaultColor: 'rgba(255, 255, 255, 0.85)',
    },
    Input: {
      colorBgContainer: '#1a2332',
      colorBorder: 'rgba(0, 212, 255, 0.2)',
      hoverBorderColor: '#00d4ff',
      activeBorderColor: '#00d4ff',
    },
    Select: {
      colorBgContainer: '#1a2332',
      colorBgElevated: '#1a2332',
      optionSelectedBg: 'rgba(0, 212, 255, 0.15)',
    },
    Modal: {
      contentBg: '#111827',
      headerBg: '#111827',
    },
    Dropdown: {
      colorBgElevated: '#1a2332',
    },
    Statistic: {
      titleColor: 'rgba(255, 255, 255, 0.65)',
      contentColor: '#ffffff',
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN} theme={darkTechTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>,
)
