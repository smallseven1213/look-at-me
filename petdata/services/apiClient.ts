// src/services/apiClient.ts
import axios from 'axios';
import { useUserStore } from '../hooks/useUserStore';
import { sendLog } from './logService';

// 創建一個 Axios 實例
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：只處理基本配置
apiClient.interceptors.request.use(
  (config) => {
    // 檢查是否需要跳過 token
    if (config.headers?.['Skip-Auth']) {
      delete config.headers['Skip-Auth'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 響應攔截器：處理全局錯誤，例如 401 未授權
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 不要對 log API 的錯誤再次進行記錄
    const isLogEndpoint = error.config?.url === 'https://line-bot.petdata.ai/log';
    
    if (!isLogEndpoint) {
      // 記錄錯誤
      const errorMessage = JSON.stringify({
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
        data: error.response?.data
      });
      
      sendLog('api client catch error', errorMessage);
    }

    if (error.response?.status === 401) {
      // 清除用戶狀態並重定向到登入頁面
      useUserStore.getState().clearUser();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
