import { AxiosError } from "axios"
import AxiosInstance from "../components/Axios"
import { SubmittalCreationProps, SubmittalProps } from "../interfaces/submittal_types"

/**
 * @returns a list of projects and users for the submittal creation page
 * So the frontend can populate the dropdown menus
 * 
 * @returns 403 if the user is not authorized to access the data
 */
export async function getDataForSubmittalCreation(): Promise<SubmittalCreationProps> {
    try {  
        const response = await AxiosInstance.get('api/submittal/creation_data')
        return response.data
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 403) {
                throw new Error("403 Access Denied")    
            }
            throw new Error("500 Internal Server Error")
        } else if (error instanceof Error) {
            throw new Error("500 Internal Server Error")
        }
        throw new Error("500 Internal Server Error")
    }
}

//**Argument must be a Submittal object
//**Returns the status code of the response
export async function createSubmittal(submittalData: SubmittalProps): Promise<Number> {
    try {
        const response = await AxiosInstance.post('api/submittal/', submittalData)
        return response.status
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 403) {
                console.log("403 Access Denied")
                return 403
            } else if (error.response?.status === 400) {
                console.log("400 Bad Request")
                return 400
            }
            return 500
        } else if (error instanceof Error) {
            return 500
        }
        return 500
    }
}

export async function updateSubmittal(submittalData: SubmittalProps): Promise<Number> {
    try {
        const response = await AxiosInstance.put('api/submittal/id/' + submittalData.submittal_id, submittalData)
        return response.status

    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            return error.response?.status ?? 500
        } else if (error instanceof Error) {
            return 500
        }
        return 500
    }
}   

export async function closeSubmittal(submittalId: string): Promise<Number> {
    try {
        const response = await AxiosInstance.put('api/submittal/id/' + submittalId, {
            is_active: false
        })
        return response.status
    } catch (error: unknown) {
        return 500
    }
}

export async function getSubmittalById(submittalId: string): Promise<SubmittalProps> {
    try {
        const response = await AxiosInstance.get(`api/submittal/id/${submittalId}`)
        return response.data as SubmittalProps
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw error.response?.data
        } else if (error instanceof Error) {
            throw error.message
        }
        throw new Error("Unknown error")
    }
}

export async function getSubmittalsByProjectId(projectId: string): Promise<SubmittalProps[]> {
    try {
        const response = await AxiosInstance.get(`api/submittal/project_id/${projectId}`)
        return response.data as SubmittalProps[]
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw error.response?.data
        } else if (error instanceof Error) {
            throw error.message
        }
        throw new Error("Unknown error")
    }
}

export async function getSubmittals(): Promise<SubmittalProps[]> {
    try {
        const response = await AxiosInstance.get('api/submittal/')
        return response.data as SubmittalProps[]
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw error.response?.data
        } else if (error instanceof Error) {
            throw error.message
        }
        throw new Error("Unknown error")
    }
}

export async function getSubmittalByUser(email: string): Promise<SubmittalProps[]> {
    try {
        const response = await AxiosInstance.get(`api/submittal/name/${email}`)
        return response.data as SubmittalProps[]
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw error.response?.data
        } else if (error instanceof Error) {
            throw error.message
        }
        throw new Error("Unknown error")
    }
}

export async function deleteSubmittal(submittalId: string): Promise<Number> {
    try {
        const response = await AxiosInstance.delete(`api/submittal/id/${submittalId}`)
        return response.status
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw error.response?.data
        } else if (error instanceof Error) {
            throw error.message
        }
        throw new Error("Unknown error")
    }
}

