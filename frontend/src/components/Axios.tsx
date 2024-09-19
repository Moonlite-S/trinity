import axios from "axios";
import config from "../config";

const isDevelopment = import.meta.env.MODE === 'development'
const baseUrl = isDevelopment ? config.development.apiBaseUrl : config.production.apiBaseUrl

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
})

export default AxiosInstance