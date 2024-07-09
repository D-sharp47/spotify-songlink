import Axios, { AxiosRequestHeaders } from 'axios';
import { getAuthToken } from './auth';
const axios = Axios.create();

const accessToken = getAuthToken();

axios.interceptors.request.use(
  async (config) => {
    config.headers = {
      Authorization: `Bearer ${accessToken}`,
      userId: localStorage.getItem("userId"),
    } as unknown as AxiosRequestHeaders;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

export default axios;