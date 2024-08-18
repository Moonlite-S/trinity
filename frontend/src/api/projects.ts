export function test_project_list(): Promise<any> {
    // This has to be changed everytime the user switches projects
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
            const sent_project = data['0']
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
            const text = response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
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