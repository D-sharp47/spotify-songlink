import { redirect } from 'react-router-dom';
import axios from 'axios';

export const setAuthToken = (token?: string | null, userId?: string | null) => {
  if (token) {
    localStorage.setItem("jwtToken", token);
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + 60 * 60 * 1000);
    localStorage.setItem("expiration", expiration.toISOString());
    axios.defaults.headers.common['Authorization'] = token;
    axios.defaults.headers.common['userId'] = userId;
  } else {
    // Delete headers
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['userId'];
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("expiration");
  }
};

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

export const getAuthToken = () => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    return null;
  }

  const tokenDuration = getTokenDuration();

  if (tokenDuration < 0) {
    return "EXPIRED";
  }

  return token;
}

export const tokenLoader = () => {
  return getAuthToken();
}


export const checkAuthLoader = () => {
  const token = getAuthToken();

  if (!token) {
    return redirect("/");
  }

  return token;
};