import { UpdateProjectProps } from "../interfaces/project_types";
import AxiosInstance from "../components/Axios";

/**
 * Fetches a list of projects
 * 
 * @ param {string} the user's role so filter out projects they can't see (not yet implemented)
 * @ returns (supposed to be) a list of projects
 */
export async function getProjectList(): Promise<UpdateProjectProps[]> {
    try {
        const response = await AxiosInstance.get('api/projects')

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
export async function getProject(id: string): Promise<UpdateProjectProps> {
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
 */
export async function createProject(project_data: { [key: string]: FormDataEntryValue }): Promise<UpdateProjectProps> {
    try {
        const response = await AxiosInstance.post('api/projects/', project_data)

        console.log(response)

        if (response.status === 201) {
            return response.data
        } else {
            throw new Error('Error creating project')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}

export async function updateProject(project_data: { [key: string]: FormDataEntryValue }, id: string | undefined): Promise<number> {
    try {
        const response = await AxiosInstance.put('api/projects/id/' + id, project_data)

        console.log(response)

        if (response.status === 200) {
            return response.status
        } else if (response.status === 403) {
            // You have no permissions
            console.error("Forbidden. Error", response.status)
            return response.status
        } else {
            throw new Error('Error updating project')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}

export async function deleteProject(id: string | undefined): Promise<number> {
    try {
        const response = await AxiosInstance.delete('api/projects/id/' + id)

        console.log(response)

        if (response.status === 204) {
            return response.status
        } else if (response.status === 403) {
            // You have no permissions
            console.error("Forbidden. Error", response.status)
            return response.status
        } else {
            throw new Error('Error deleting project')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}