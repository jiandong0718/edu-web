import { createBrowserRouter, Navigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import Login from '@/pages/login/index';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        lazy: async () => ({
          Component: (await import('@/pages/dashboard')).default
        }),
      },
      // 系统管理
      {
        path: 'system',
        children: [
          {
            path: 'user',
            lazy: async () => ({
              Component: (await import('@/pages/system/user')).default
            }),
          },
          {
            path: 'role',
            lazy: async () => ({
              Component: (await import('@/pages/system/role')).default
            }),
          },
          {
            path: 'menu',
            lazy: async () => ({
              Component: (await import('@/pages/system/menu')).default
            }),
          },
          {
            path: 'campus',
            lazy: async () => ({
              Component: (await import('@/pages/system/campus')).default
            }),
          },
          {
            path: 'dict',
            lazy: async () => ({
              Component: (await import('@/pages/system/dict')).default
            }),
          },
        ],
      },
      // 学生管理
      {
        path: 'student',
        children: [
          {
            path: 'list',
            lazy: async () => ({
              Component: (await import('@/pages/student/list')).default
            }),
          },
          {
            path: 'profile/:id',
            lazy: async () => ({
              Component: (await import('@/pages/student/profile')).default
            }),
          },
          {
            path: 'tag',
            lazy: async () => ({
              Component: (await import('@/pages/student/tag')).default
            }),
          },
          {
            path: 'import',
            lazy: async () => ({
              Component: (await import('@/pages/student/import')).default
            }),
          },
        ],
      },
      // 教学管理
      {
        path: 'teaching',
        children: [
          {
            path: 'teacher',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/teacher')).default
            }),
          },
          {
            path: 'teacher/:id',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/teacher/Detail')).default
            }),
          },
          {
            path: 'course',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/course')).default
            }),
          },
          {
            path: 'course-category',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/courseCategory')).default
            }),
          },
          {
            path: 'class',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/class')).default
            }),
          },
          {
            path: 'class/:id',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/class/Detail')).default
            }),
          },
          {
            path: 'schedule',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/schedule')).default
            }),
          },
          {
            path: 'attendance',
            lazy: async () => ({
              Component: (await import('@/pages/teaching/attendance')).default
            }),
          },
        ],
      },
      // 财务管理
      {
        path: 'finance',
        children: [
          {
            path: 'contract',
            lazy: async () => ({
              Component: (await import('@/pages/finance/contract')).default
            }),
          },
          {
            path: 'contract/:id',
            lazy: async () => ({
              Component: (await import('@/pages/finance/contract/Detail')).default
            }),
          },
          {
            path: 'payment',
            lazy: async () => ({
              Component: (await import('@/pages/finance/payment')).default
            }),
          },
          {
            path: 'consumption',
            lazy: async () => ({
              Component: (await import('@/pages/finance/consumption')).default
            }),
          },
          {
            path: 'refund',
            lazy: async () => ({
              Component: (await import('@/pages/finance/refund')).default
            }),
          },
          {
            path: 'class-hour/adjust',
            lazy: async () => ({
              Component: (await import('@/pages/finance/class-hour/adjust')).default
            }),
          },
        ],
      },
      // 招生管理
      {
        path: 'marketing',
        children: [
          {
            path: 'lead',
            lazy: async () => ({
              Component: (await import('@/pages/marketing/lead')).default
            }),
          },
          {
            path: 'lead-import',
            lazy: async () => ({
              Component: (await import('@/pages/marketing/lead-import')).default
            }),
          },
          {
            path: 'lead-assign',
            lazy: async () => ({
              Component: (await import('@/pages/marketing/lead-assign')).default
            }),
          },
          {
            path: 'follow',
            lazy: async () => ({
              Component: (await import('@/pages/marketing/follow')).default
            }),
          },
          {
            path: 'trial',
            lazy: async () => ({
              Component: (await import('@/pages/marketing/trial')).default
            }),
          },
          {
            path: 'funnel',
            lazy: async () => ({
              Component: (await import('@/pages/marketing/funnel')).default
            }),
          },
          {
            path: 'consultant-ranking',
            lazy: async () => ({
              Component: (await import('@/pages/marketing/consultant-ranking')).default
            }),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
