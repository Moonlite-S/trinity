import axios from "axios";
import config from "../config";
import { getCookie } from "typescript-cookie";

const isDevelopment = import.meta.env.MODE === 'development'
const baseUrl = isDevelopment ? config.development.apiBaseUrl : config.production.apiBaseUrl

const csrfToken = getCookie('csrftoken')

export const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    withCredentials: true,
    xsrfCookieName: csrfToken,
    xsrfHeaderName: 'X-CSRFToken',
    withXSRFToken: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
})

AxiosInstance.interceptors.request.use((config) => {
    const token = getCookie('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  });
  

export default AxiosInstance