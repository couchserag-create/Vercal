import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let csrfTokenCache: string | null = null;

// Helper to fetch CSRF token from server
export async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) return csrfTokenCache;
  try {
    const response = await axios.get('/api/auth/csrf-token');
    if (response.data && response.data.csrfToken) {
      csrfTokenCache = response.data.csrfToken;
      return csrfTokenCache!;
    }
  } catch (err) {
    console.warn('CSRF token fetch warning:', err);
  }
  return '';
}

// Request Interceptor: Attach JWT Bearer Token and CSRF Token
axiosClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('fitbrilliance_jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      const csrf = await getCsrfToken();
      if (csrf) {
        config.headers['X-CSRF-Token'] = csrf;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Session Expiration
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.response.data && error.response.data.message?.includes('جلسة الدخول منتهية')) {
        localStorage.removeItem('fitbrilliance_jwt_token');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
