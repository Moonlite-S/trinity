import axios from "axios";
import config from "../config";

const isDevelopment = import.meta.env.MODE === 'development'
const baseUrl = isDevelopment ? config.development.apiBaseUrl : config.production.apiBaseUrl

export const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    withXSRFToken: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
})

export default AxiosInstance