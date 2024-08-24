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

/**
 * @returns a list of ONLY employee names
 */
export async function getEmployeeNameList(): Promise<string[]> {
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
            const error = {
                status: response.status
            }

            return JSON.parse(JSON.stringify(error))
        }

        const data = await response.json();

        const to_string:string[] = data.map((obj: { name: string }) => obj.name); // Gotta convert it to a string array

        return to_string
    } catch (e) {
        console.error("Error getting employee list:", e);
        const error = {
            status: 500
        }
        return JSON.parse(JSON.stringify(error))
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

export async function getAllEmployeeData(): Promise<EmployeeProps[]>  {
    try {
        const response = await fetch('http://localhost:8000/api/user/all_users', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            console.log("Error: " + response.status)
            const error = {
                status: response.status
            }

            return JSON.parse(JSON.stringify(error))
        }

        const data = await response.json();
        console.log("Got data", data);
        return data;
    } catch (e) {
        console.error("Error getting employee list:", e);
        const error = {
            status: 500
        }
        return JSON.parse(JSON.stringify(error))
    }
        
}