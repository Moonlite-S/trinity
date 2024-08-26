import { UpdateProjectProps } from "../interfaces/project_types";
/**
 * Fetches a list of projects
 * 
 * @ param {string} the user's role so filter out projects they can't see (not yet implemented)
 * @ returns (supposed to be) a list of projects
 */
export async function getProjectList(): Promise<UpdateProjectProps[]> {
    try {
        const response = await fetch('http://localhost:8000/api/projects', {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        return data

    } catch (error) {
        console.error("Error: ",error)
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
        const response = await fetch('http://localhost:8000/api/projects/id/' + id, {
            method: 'GET',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json'
            },
        })

        if (!response.ok){  
            const text = response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`)
        }

        const data = await response.json()
        console.log("Got data", data)
        return data
    }
    catch (error) {
        console.error("Error getting project:", error)
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
 */
export async function createProject(project_data: { [key: string]: FormDataEntryValue }): Promise<UpdateProjectProps> {
    try {
        const response = await fetch('http://localhost:8000/api/projects/', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project_data)
        })

        if (!response.ok){  
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json()
        console.log("Got data", data)
        return data
    }
    catch (error) {
        console.error("Error creating project:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
    }
}

export async function updateProject(project_data: { [key: string]: FormDataEntryValue }, id: string | undefined): Promise<number> {
    try {
        const response = await fetch('http://localhost:8000/api/projects/id/' + id, {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project_data)
        })

        if (!response.ok) {  
            console.log("Error: ", response)
            return response.status
        }

        return response.status

    } catch (error) {
        console.error("Error updating project:", error);
        return 500
    }
}

export async function deleteProject(id: string | undefined): Promise<number> {
    try {
        const response = await fetch('http://localhost:8000/api/projects/id/' + id, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {  
            console.log("Error: ", response)
            return response.status
        }

        return response.status

    } catch (error) {
        console.error("Error deleting project:", error);
        return 500
    }
}