import api from './api';

export const getWorkshops = () => api.get('/workshops');
export const getWorkshopById = (id) => api.get(`/workshops/${id}`);
export const enrollWorkshop = (id) => api.post(`/workshops/${id}/enroll`);