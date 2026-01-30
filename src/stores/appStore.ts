import { create } from 'zustand';

export interface MenuItem {
  id: number;
  parentId: number;
  name: string;
  path: string;
  component?: string;
  permission?: string;
  icon?: string;
  type: number;
  visible: boolean;
  children?: MenuItem[];
}

interface AppState {
  collapsed: boolean;
  menus: MenuItem[];
  currentCampusId: number | null;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMenus: (menus: MenuItem[]) => void;
  setCurrentCampusId: (campusId: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  collapsed: false,
  menus: [],
  currentCampusId: null,

  setCollapsed: (collapsed) => set({ collapsed }),

  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),

  setMenus: (menus) => set({ menus }),

  setCurrentCampusId: (campusId) => set({ currentCampusId: campusId }),
}));
