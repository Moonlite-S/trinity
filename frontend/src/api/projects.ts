/**
 * Fetches a list of projects
 * 
 * @ param {string} the user's role so filter out projects they can't see (not yet implemented)
 * @returns (supposed to be) a list of projects
 */
export function get_project_list(): Promise<any> {
    // This has to be changed everytime the user switches projects
    // Remember to convert this to an async function
    return fetch('http://localhost:8000/api/projects', {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(
        // This is where the raw response from the backend is returned
        (response: Response) => {
            if (response.ok) {
                console.log("Success")
                return response.json() // This goes to the next 'then'
            }
            else {
                console.log("Was not ok")
                throw new Error("Network not ok")
            }
        }
    ).then(
        // The 'data' is the parsed JSON response
        (data) => {
            const sent_project = data
            console.log("Sent from backend: %O", sent_project)
            return sent_project // This is what actually gets returned
        }
    ).catch(
        (error: Error) => {
            console.error("Error: ",error, error.name)
            throw error
        }
    )
}

/**
 * Fetches a single project based on id
 * 
 * @param id the project id of the project
 * @returns Code 200 if successful and error if not
 */
export async function get_project(id: string): Promise<any> {
    try {
        const response = await fetch('http://localhost:8000/api/projects/' + id, {
            method: 'GET',
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
export async function create_project(project_data: any): Promise<any> {
    try {
        const response = await fetch('http://localhost:8000/api/projects/', {
            method: 'POST',
            mode: 'cors',
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