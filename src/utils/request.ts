import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;

    // 如果是文件下载，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }

    // 业务状态码判断
    if (data.code === 200) {
      return data;
    }

    // 业务错误
    message.error(data.msg || '请求失败');
    return Promise.reject(new Error(data.msg || '请求失败'));
  },
  (error) => {
    // HTTP 错误处理
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error(data?.msg || '服务器错误');
          break;
        default:
          message.error(data?.msg || '网络错误');
      }
    } else if (error.message.includes('timeout')) {
      message.error('请求超时');
    } else {
      message.error('网络错误');
    }
    return Promise.reject(error);
  }
);

// 封装请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config);
  },

  // 文件上传
  upload<T = any>(url: string, file: File, onProgress?: (percent: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    return request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  // 文件下载
  download(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    return request.get(url, { ...config, responseType: 'blob' }).then((response: any) => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    });
  },
};

export default request;
