import axios from 'axios';
import useAuthStore from '../store/store';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const storeToken = useAuthStore.getState().token;
  const localToken = localStorage.getItem('token');
  const token = storeToken || localToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default API;