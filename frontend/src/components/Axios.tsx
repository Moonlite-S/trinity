import axios from "axios";

const isDevelopment = import.meta.env.MODE === 'development'
const baseUrl = isDevelopment ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_PROD

console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', baseUrl);

const AxiosInstance = axios.create({
    baseURL: "https://django-react-test-e9ghbqcrf2djcmfu.israelcentral-01.azurewebsites.net/",
    timeout: 5000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
})

export default AxiosInstance