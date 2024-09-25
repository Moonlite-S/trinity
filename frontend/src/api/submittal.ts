import { AxiosError } from "axios";
import AxiosInstance from "../components/Axios";

export async function getDataForSubmittalCreation() {
    try {  
        const response = await AxiosInstance.get('api/submittal/creation_data')
        console.log("Yo", response.data)
        return response.data
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            return error.response?.data
        } else if (error instanceof Error) {
            return error.message
        }
        return null
    }
}