import api from './api';

export const getInstructors = () => api.get('/instructors');
export const getInstructorById = (id) => api.get(`/instructors/${id}`);