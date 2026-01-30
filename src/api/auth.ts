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
}

export interface CaptchaResult {
  captchaKey: string;
  captchaImage: string;
}

// 登录
export const login = (params: LoginParams) => {
  return http.post<LoginResult>('/auth/login', params);
};

// 登出
export const logout = () => {
  return http.post('/auth/logout');
};

// 获取当前用户信息
export const getUserInfo = () => {
  return http.get<UserInfo>('/auth/info');
};

// 获取验证码
export const getCaptcha = () => {
  return http.get<CaptchaResult>('/auth/captcha');
};

// 修改密码
export const changePassword = (oldPassword: string, newPassword: string) => {
  return http.post('/auth/password', { oldPassword, newPassword });
};

// 获取用户菜单
export const getUserMenus = () => {
  return http.get('/auth/menus');
};
