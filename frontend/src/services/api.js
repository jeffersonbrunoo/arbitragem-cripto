import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('Erro da API:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
