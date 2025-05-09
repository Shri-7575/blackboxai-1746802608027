import axios from 'axios';
import toast from 'react-hot-toast';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
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

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await instance.post('/api/auth/refresh-token');
        const { token } = response.data;

        localStorage.setItem('token', token);
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return instance(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);

    return Promise.reject(error);
  }
);

export default instance;
