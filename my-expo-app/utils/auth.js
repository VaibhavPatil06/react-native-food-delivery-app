import { jwtDecode } from 'jwt-decode';
import { getData, storeData, removeData } from './asyncStorage';
import { refreshToken } from 'slices/authSlice';
import { store } from 'store';

export const isTokenExpired = (token) => {
  try {
    if (!token) return true;

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
};

export const getCurrentUser = async () => {
  try {
    const userToken = await getData('userToken');
    const userData = await getData('userData');

    if (!userToken || isTokenExpired(userToken)) {
      return null;
    }

    return userData || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const checkAuth = async () => {
  try {
    const userToken = await getData('userToken');
    const refreshToken = await getData('refreshToken');

    // No tokens available
    if (!userToken && !refreshToken) {
      return false;
    }

    // Access token is valid
    if (userToken && !isTokenExpired(userToken)) {
      return true;
    }

    // Try to refresh tokens if access token is expired but refresh token exists
    if (refreshToken && !isTokenExpired(refreshToken)) {
      const success = await refreshTokens();
      return success;
    }

    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

export const refreshTokens = async () => {
  try {
    const refreshTokenValue = await getData('refreshToken');

    if (!refreshTokenValue || isTokenExpired(refreshTokenValue)) {
      await clearAuthData();
      return false;
    }

    // Dispatch the refreshToken action from Redux
    const result = await store.dispatch(refreshToken());

    if (result.error) {
      await clearAuthData();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to refresh tokens:', error);
    await clearAuthData();
    return false;
  }
};

export const clearAuthData = async () => {
  try {
    await removeData('userToken');
    await removeData('refreshToken');
    await removeData('userData');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

export const getUserFromToken = (token) => {
  try {
    if (!token) return null;
    return jwtDecode(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const initializeAuth = async () => {
  try {
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
      await clearAuthData();
    }
  } catch (error) {
    console.error('Auth initialization failed:', error);
    await clearAuthData();
  }
};

export const getAuthHeader = async () => {
  try {
    const userToken = await getData('userToken');

    if (userToken && !isTokenExpired(userToken)) {
      return { Authorization: `Bearer ${userToken}` };
    }

    // Attempt to refresh token if expired
    const refreshed = await refreshTokens();
    if (refreshed) {
      const newToken = await getData('userToken');
      return { Authorization: `Bearer ${newToken}` };
    }

    return {};
  } catch (error) {
    console.error('Failed to get auth header:', error);
    return {};
  }
};
