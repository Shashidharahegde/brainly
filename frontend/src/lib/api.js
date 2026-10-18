
import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND}/api`,
});

api.interceptors.request.use((config) => {
    let token = localStorage.getItem('token');
    try {
        token = JSON.parse(localStorage.getItem('user-info') || 'null')?.token || token;
    } catch {
        localStorage.removeItem('user-info');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
