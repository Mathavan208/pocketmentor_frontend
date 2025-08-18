import api from './api';

export const getProfile = () => api.get('/users/profile');
export const login = (email, password) => api.post('/users/login', { email, password });
export const register = (name, email, password) => api.post('/users/register', { name, email, password });