import { redirect } from 'react-router-dom';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "https://songlink.co";

export const setToken = (tokens?: {accessToken: string, refreshToken: string, expires_in: number} | null, userId?: string | null) => {
  if (tokens && userId) {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("userId", userId);
    setTokenExpiration(tokens.expires_in);

    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
    axios.defaults.headers.common['userId'] = userId;
  } else {
    // Delete headers
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['userId'];
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");}
};

const setTokenExpiration = (expires_in: number) => {
  const now = new Date();
  const expirationDate = new Date(now.getTime() + expires_in * 1000);
  localStorage.setItem("expiration", expirationDate.toISOString());
}

export const getTokenDuration = () => {
  const storedExpirationDate = localStorage.getItem("expiration");
  if (!storedExpirationDate) {
    return 0;
  }
  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  const duration = expirationDate.getTime() - now.getTime();
  return duration;
}

export const getAuthToken = async () => {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  const tokenDuration = getTokenDuration();

  if (tokenDuration < 0) {
    token = await refreshToken();
  }

  return token;
}

export const tokenLoader = async () => {
  return await getAuthToken();
}

const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    // Handle case where refreshToken is not available
    console.error('Refresh token not found.');
    return null;
  }

  try {
    const response = await axios.post(`${backendUrl}/api/auth/refresh`, {
      refreshToken: refreshToken,
    });

    const { accessToken, expires_in } = response.data;

    localStorage.setItem('accessToken', accessToken);
    setTokenExpiration(expires_in);

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

export const checkAuthLoader = async () => {
  const token = await getAuthToken();

  if (!token) {
    return redirect("/");
  }

  return true;
};