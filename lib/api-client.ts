import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';


export interface BackendResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';


const ROLE_KEY = 'phishguard_user_role';

const getTokenKey = (type: 'access' | 'refresh') => {
  const role = typeof window !== 'undefined' 
    ? localStorage.getItem(ROLE_KEY) || 'user' 
    : 'user';
  return `phishguard_${role}_${type}_token`;
};


export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(getTokenKey('access'));
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(getTokenKey('refresh'));
  },

  setTokens(accessToken: string, refreshToken: string, role?: string): void {
    if (typeof window === 'undefined') return;
    if (role) localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(getTokenKey('access'), accessToken);
    localStorage.setItem(getTokenKey('refresh'), refreshToken);
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getTokenKey('access'));
    localStorage.removeItem(getTokenKey('refresh'));
    localStorage.removeItem(ROLE_KEY);
  },
};



let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}


const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<BackendResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    
    const url = originalRequest.url || '';
    if (url.includes('/auth/')) {
      return Promise.reject(error);
    }

    
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(apiClient(originalRequest));
        });
      });
    }

    
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<BackendResponse<{ accessToken: string; refreshToken: string }>>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data!;
      tokenStorage.setTokens(newAccessToken, newRefreshToken);

      
      onTokenRefreshed(newAccessToken);

      
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      
      tokenStorage.clearTokens();
      refreshSubscribers = [];
      if (typeof window !== 'undefined') {
        // Don't redirect to login from public pages like /training/*
        const isPublicRoute = window.location.pathname.startsWith('/training');
        if (!isPublicRoute) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
