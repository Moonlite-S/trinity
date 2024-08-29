import axios from "axios";
import config from "../config";

const isDevelopment = import.meta.env.MODE === 'development'
const baseUrl = isDevelopment ? config.development.apiBaseUrl : config.production.apiBaseUrl

console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', baseUrl);

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
})

export default AxiosInstance