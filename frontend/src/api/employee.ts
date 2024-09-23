import { AxiosError } from "axios";
import AxiosInstance from "../components/Axios";
import { EmployeeNameEmail, EmployeeProps } from "../interfaces/employee_type";

/**
 * Employee Creation API
 * 
 * Sends a POST request to the backend and creates an employee
 * 
 * @returns Code 200 if successful and error if not
 * 
 */
export async function createEmployee({name, email, password, role} : EmployeeProps): Promise<number> {
    try {
        const response = await AxiosInstance.post('api/register', {
            name: name,
            email: email,
            password: password,
            username: name,
            role: role
        });
        
        console.log(response)

        if (response.status === 200) {
            return response.status
        } else {
            throw new Error('Error creating employee')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}

/**
 * @returns a list of ONLY employee names
 */
export async function getEmployeeNameList(): Promise<string[]> {
    try {
        const response = await AxiosInstance.get('api/user/all_users_names')


        if (response.status === 200) {
            const names: string[] = response.data.map((employee: { name: string }) => employee.name)

            return names
        } else {
            throw new Error('Error getting employee list')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}

/** Have this serach for one employee by email or id
 * 
 * - Backend still needs to implement this
 */
export async function getOneEmployee(email: string): Promise<EmployeeProps
> {
    try {
        const response = await AxiosInstance.get('api/user/:id' + email)

        console.log(response)

        if (response.status === 200) {
            return response.data
        } else {
            throw new Error('Error getting employee')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}

/**
 * Send a GET request to the backend and get all employees
 * 
 */
export async function getAllEmployeeData(): Promise<EmployeeProps[]>  {
    try {
        const response = await AxiosInstance.get('api/user/all_users')

        console.log(response)

        if (response.status === 200) {
            return response.data
        } else {
            throw new Error('Error getting employee list')
        }

    } catch (error) {
        console.error("Server Error: ",error)
        throw error
    }
}

export async function getAllEmployeeNameAndEmail(): Promise<EmployeeNameEmail[]> {
    try {
        const response = await AxiosInstance.get(
          "api/user/all_users_name_and_email"
        );

        console.log("Axios Response", response)

        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
                // 400 Bad Request
                throw new Error('Error getting employee list')
            } else if (error.response?.status === 403) {
                // 403 Forbidden
                throw new Error('Error getting employee list')
            }
        } else if (error instanceof Error) {
            console.error("Server Error: ", error)
            throw error
        }

        throw new Error('Error getting employee list')
    }
}