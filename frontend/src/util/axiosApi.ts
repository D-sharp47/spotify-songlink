import Axios, { AxiosRequestHeaders } from 'axios';
import { getAuthToken } from './auth';

const axios = Axios.create();

axios.interceptors.request.use(
  async (config) => {
    const accessToken = await getAuthToken(); 
    config.headers = {
      Authorization: `Bearer ${accessToken}`,
      userId: localStorage.getItem("userId"),
    } as unknown as AxiosRequestHeaders;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;