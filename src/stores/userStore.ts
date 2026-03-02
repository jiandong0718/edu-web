import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserInfo {
  id: number;
  username: string;
  realName: string;
  avatar?: string;
  phone?: string;
  email?: string;
  campusId?: number;
  campusName?: string;
  roles: string[];
  permissions: string[];
}

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  setToken: (token: string | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,

      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },

      setUserInfo: (userInfo) => set({ userInfo }),

      logout: () => {
        set({ token: null, userInfo: null });
        localStorage.removeItem('token');
      },

      hasPermission: (permission) => {
        const { userInfo } = get();
        if (!userInfo) return false;
        // 超级管理员拥有所有权限
        if (userInfo.roles.includes('super_admin')) return true;
        return userInfo.permissions.includes(permission);
      },

      hasRole: (role) => {
        const { userInfo } = get();
        if (!userInfo) return false;
        return userInfo.roles.includes(role);
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
