import axios from 'axios';
import { getData, removeData } from '../utils/asyncStorage';
import { BACKEND_URL } from '@env';

const API = axios.create({
  baseURL: BACKEND_URL, // Fixed the URL (removed .com)
  headers: {
    'Content-Type': 'application/json',
  },
});
export const placeOrder = async (orderData, token) => {
  try {
    const response = await API.post(`/order/create-order`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};
export const getOrderById = async (orderId, token) => {
  try {


    const response = await API.get(`/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error.response?.data || error.message);
    throw error;
  }
};
export const getMyOrders = async (token) => {
  try {
    const response = await API.get(`/order/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error.response?.data || error.message);
    throw error;
  }
};
// Move these outside to prevent circular imports
export const fetchCategories = async () => {
  try {
    const response = await API.get('/categories');
    return response.data;
  } catch (error) {
      console.log(error)
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchFeatured = async () => {
  try {
    const response = await API.get('/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured:', error);
    throw error;
  }
};

// Create a separate function for token refresh handling
export const handleTokenRefresh = async () => {
  try {
    const refreshTokenValue = await getData('refreshToken');
    const response = await API.post('/auth/refresh', { refreshToken: refreshTokenValue });
    await storeData('userToken', response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    await removeData('userToken');
    await removeData('refreshToken');
    throw error;
  }
};

// Request interceptor
API.interceptors.request.use(
  async (config) => {
    const token = await getData('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (modified to not depend on Redux)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await handleTokenRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
