import api from './api';

export const getDashboardStats = () => api.get('/admin/dashboard');
export const getUsers = () => api.get('/admin/users');
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const getPayments = () => api.get('/admin/payments');
export const getEnrollments = () => api.get('/admin/enrollments');
export const createAdmin = (email, password) => api.post('/admin/create-admin', { email, password });