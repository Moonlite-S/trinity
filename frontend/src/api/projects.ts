import { ProjectCreationProps, ProjectProps } from "../interfaces/project_types";
import AxiosInstance from "../components/Axios";
import { AxiosError } from "axios";

/**
 * Fetches a list of projects
 * 
 * @ filter optional: filters the list of projects based on field
 * @ returns (supposed to be) a list of ProjectProps
 */
export async function getProjectList(filter?: string): Promise<ProjectProps[]> {
    try {
        const response = await AxiosInstance.get('api/projects' + (filter ? '/' + filter : ''))

        console.log(response)

        if (response.status === 200) {
            return response.data
        } else {
            throw new Error('Error fetching projects')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}

/**
 * Fetches a single project based on id
 * 
 * @param id the project id of the project
 * @returns An object of type UpdateProjectProps
 */
export async function getProject(id: string): Promise<ProjectProps> {
    try {
        const response = await AxiosInstance.get('api/projects/id/' + id)

        if (response.data) {
            console.log(response)
            return response.data
        } else {
            throw new Error('Error fetching project')
        }

    } catch (error) {
        console.error("Error: ",error)
        throw error
    }
}

/**
 * Creates a Trinity Project
 * 
 * @param project_data the project data to send make sure it's in the correct format
 * 
 * { project_id: number, project_name: string, project_description: string, current_manager: string, customer_name: string, city: string, start_date: string, end_date: string }
 * @returns Code 200 if successful and error if not
 * 
 * TODO: 
 * - Backend needs to perform a check to make sure the project doesn't already exist
 * - Currently can't catch the error if project_id already exists
 */
export async function createProject(project_data: ProjectProps): Promise<Number> {
    try {
        const response = await AxiosInstance.post('api/projects/', project_data)
        console.log(project_data)
        return response.status
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
                // 400 Bad Request
                return 400
            } else if (error.response?.status === 403) {
                // 403 Forbidden
                return 403
            }
        } 

        console.error("Server Error: ", error)
        return 500
    }
}

export async function updateProject(project_data: ProjectProps): Promise<Number> {
    console.log(project_data)
    try {
        const response = await AxiosInstance.put('api/projects/id/' + project_data.project_id, project_data)

        console.log(response)

        return 200

    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
                // 400 Bad Request
                return 400
            } else if (error.response?.status === 403) {
                // 403 Forbidden
                return 403
            }
        }
        console.error("Server Error: ", error)
        return 500
    }
}

export async function deleteProject(id: string): Promise<number> {
    try {
        const response = await AxiosInstance.delete('api/projects/id/' + id)

        console.log(response)

        return 204
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
                // 400 Bad Request
                return 400
            } else if (error.response?.status === 403) {
                // 403 Forbidden
                return 403
            }
        }
        console.error("Server Error: ", error)
        return 500
    }
}

export async function getDataForProjectCreation(date: string): Promise<ProjectCreationProps> {
    try {
        const response = await AxiosInstance.get('api/projects/project_creation', { params: { date: date } })

        if (response.status === 200) {
            return response.data
        } else {
            throw new Error('Error fetching project creation data')
        }
    } catch (error) {
        console.error("Server Error: ", error)
        throw error
    }
}

export async function getProjectByDate(year: string, month: string): Promise<ProjectProps[]> {
    try {
        const response = await AxiosInstance.get('api/projects/by_date', { params: { year: year, month: month} })

        if (!response) {
            throw new Error("Error fetching project list")
        }

        return response.data

    } catch (error) {  
        console.error("Server Error: ",error)
        throw error
    }
}