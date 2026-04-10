import { http } from '@/utils/request';
import type { UserInfo } from '@/stores';

export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
  captchaKey?: string;
}

export interface LoginResult {
  token: string;
  userInfo: UserInfo;
  isFirstLogin?: boolean;
  message?: string;
}

export interface CaptchaResult {
  captchaKey: string;
  captchaImage: string;
}

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string;
  firstLogin?: boolean;
}

type ApiEnvelope<T> = {
  code?: number;
  msg?: string;
  data?: T;
};

type BackendLoginUser = {
  id?: number | string;
  userId?: number | string;
  username?: string;
  realName?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  campusId?: number | string;
  campusName?: string;
  roles?: unknown[];
  permissions?: unknown[];
};

const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const normalizeUserInfo = (raw: unknown): UserInfo => {
  const item = (raw ?? {}) as BackendLoginUser;
  return {
    id: toNumber(item.id ?? item.userId),
    username: String(item.username ?? ''),
    realName: String(item.realName ?? item.username ?? ''),
    avatar: item.avatar ? String(item.avatar) : undefined,
    phone: item.phone ? String(item.phone) : undefined,
    email: item.email ? String(item.email) : undefined,
    campusId: item.campusId != null ? toNumber(item.campusId) : undefined,
    campusName: item.campusName ? String(item.campusName) : undefined,
    roles: Array.isArray(item.roles) ? item.roles.map((role) => String(role)) : [],
    permissions: Array.isArray(item.permissions)
      ? item.permissions.map((permission) => String(permission))
      : [],
  };
};

const normalizeLoginResult = (raw: unknown): LoginResult => {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    token: String(item.token ?? ''),
    userInfo: normalizeUserInfo(item.userInfo),
    isFirstLogin: typeof item.isFirstLogin === 'boolean' ? item.isFirstLogin : undefined,
    message: item.message ? String(item.message) : undefined,
  };
};

// 登录
export const login = async (params: LoginParams) => {
  const response = await http.post<unknown>('/auth/login', params);
  return normalizeLoginResult(unwrapData<unknown>(response));
};

// 登出
export const logout = () => {
  return http.post('/auth/logout');
};

// 获取当前用户信息
export const getUserInfo = async () => {
  const response = await http.get<unknown>('/auth/info');
  return normalizeUserInfo(unwrapData<unknown>(response));
};

// 获取验证码
export const getCaptcha = () => {
  return Promise.reject(new Error('当前后端未启用验证码接口')) as Promise<CaptchaResult>;
};

// 修改密码
export const changePassword = (
  oldPassword: string,
  newPassword: string,
  options?: Pick<ChangePasswordPayload, 'confirmPassword' | 'firstLogin'>
) => {
  return http.post('/auth/password', {
    oldPassword,
    newPassword,
    confirmPassword: options?.confirmPassword ?? newPassword,
    firstLogin: options?.firstLogin ?? false,
  });
};

// 获取用户菜单
export const getUserMenus = async () => {
  const response = await http.get<unknown>('/auth/menus');
  const payload = unwrapData<unknown>(response);
  return Array.isArray(payload) ? payload : [];
};
