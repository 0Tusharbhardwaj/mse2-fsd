import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mse2-fsd-wi22.onrender.com/', // Backend base URL
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
