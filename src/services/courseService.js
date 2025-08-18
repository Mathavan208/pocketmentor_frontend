import api from './api';

export const getCourses = () => api.get('/courses');
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const enrollCourse = (id) => api.post(`/courses/${id}/enroll`);