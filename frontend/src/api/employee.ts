type EmployeeProps = {
    name: string;
    email: string;
    password: string;
}

/**
 * Employee Creation API
 * 
 * Sends a POST request to the backend and creates an employee
 * 
 * @returns Code 200 if successful and error if not
 * 
 */
export async function createEmployee({name, email, password} : EmployeeProps): Promise<number> {
    try {
        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            }),
        });

        if (!response.ok) {
            console.log("Error: " + response.status)
            return response.status
        }

        const data = await response.json();
        console.log("Got data", data);
        return response.status;
    } catch (error) {
        console.error("Error creating employee:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
    }
}

export async function getEmployeeList(): Promise<any> {
    try {
        const response = await fetch('http://localhost:8000/api/user/all_users_names', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            console.log("Error: " + response.status)
            return response.status
        }

        const data = await response.json();
        console.log("Got data", data);
        return data;
    } catch (error) {
        console.error("Error getting employee list:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
    }
}

/** Have this serach for one employee by email or id
 * 
 * - Backend still needs to implement this
 */
export async function getOneEmployee(email: string): Promise<any> {
    try {
        const response = await fetch('http://localhost:8000/api/user/:id' + email, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            console.log("Error: " + response.status)
            return response.status
        }

        const data = await response.json();
        console.log("Got data", data);
        return data;
    } catch (error) {
        console.error("Error getting employee list:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
    }
}
