// services/paymentService.js
import api from './api';

export const createOrder = async (courseId, token) => {
  try {
    console.log('Creating order via service for course:', courseId);
    const response = await api.post(`/payment/create-order/${courseId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Service response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Service error creating order:', error);
    throw error;
  }
};

export const verifyPayment = async (courseId, paymentData, token) => {
  return api.post(`/payment/verify/${courseId}`, paymentData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getPaymentHistory = (token) => {
  return api.get('/payment/history', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};