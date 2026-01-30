import { createBrowserRouter, Navigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import Login from '@/pages/login';

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
        lazy: () => import('@/pages/dashboard'),
      },
      // 系统管理
      {
        path: 'system',
        children: [
          {
            path: 'user',
            lazy: () => import('@/pages/system/user'),
          },
          {
            path: 'role',
            lazy: () => import('@/pages/system/role'),
          },
          {
            path: 'menu',
            lazy: () => import('@/pages/system/menu'),
          },
          {
            path: 'campus',
            lazy: () => import('@/pages/system/campus'),
          },
          {
            path: 'dict',
            lazy: () => import('@/pages/system/dict'),
          },
        ],
      },
      // 学生管理
      {
        path: 'student',
        children: [
          {
            path: 'list',
            lazy: () => import('@/pages/student/list'),
          },
          {
            path: 'profile/:id',
            lazy: () => import('@/pages/student/profile'),
          },
        ],
      },
      // 教学管理
      {
        path: 'teaching',
        children: [
          {
            path: 'course',
            lazy: () => import('@/pages/teaching/course'),
          },
          {
            path: 'class',
            lazy: () => import('@/pages/teaching/class'),
          },
          {
            path: 'schedule',
            lazy: () => import('@/pages/teaching/schedule'),
          },
          {
            path: 'attendance',
            lazy: () => import('@/pages/teaching/attendance'),
          },
        ],
      },
      // 财务管理
      {
        path: 'finance',
        children: [
          {
            path: 'contract',
            lazy: () => import('@/pages/finance/contract'),
          },
          {
            path: 'payment',
            lazy: () => import('@/pages/finance/payment'),
          },
          {
            path: 'consumption',
            lazy: () => import('@/pages/finance/consumption'),
          },
        ],
      },
      // 招生管理
      {
        path: 'marketing',
        children: [
          {
            path: 'lead',
            lazy: () => import('@/pages/marketing/lead'),
          },
          {
            path: 'follow',
            lazy: () => import('@/pages/marketing/follow'),
          },
          {
            path: 'trial',
            lazy: () => import('@/pages/marketing/trial'),
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
