import axios from "axios";

const isDevelopement = import.meta.env.MODE === 'development'
const baseUrl = isDevelopement ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_PROD

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