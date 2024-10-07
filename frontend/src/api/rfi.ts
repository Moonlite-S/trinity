import { AxiosError } from "axios"
import { AxiosInstance } from "../components/Axios"
import { SelectionButtonProps } from "../interfaces/button_types"
import { RFIProps, RFICreationProps } from "../interfaces/rfi_types"

export async function createRFI(rfi: RFIProps): Promise<Number> {
    try {
        console.log("Submitting RFI: ", rfi)
        const response = await AxiosInstance.post('api/rfi/', rfi)
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

export async function getRFIList(): Promise<RFIProps[]> {
    try {
        const response = await AxiosInstance.get('api/rfi/')
        console.log("Response: ", response.data)
        if (response.status !== 200) {
            throw new Error("Error fetching RFIs")
        }

        return response.data
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            if (error.response?.status === 400) {
                // 400 Bad Request
                throw new Error("Bad Request")
            } else if (error.response?.status === 403) {
                // 403 Forbidden
                throw new Error("Forbidden")
            }
        }
        console.error("Server Error: ", error)
        throw new Error("Server Error")
    }
}

export async function updateRFI(rfi: RFIProps): Promise<Number> {
    try {
        const response = await AxiosInstance.put('api/rfi/id/' + rfi.RFI_id, rfi)
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

export async function getDataForRFICreation(): Promise<RFICreationProps> {
    try {
        const response = await AxiosInstance.get('api/rfi/creation_data')

        if (!response.data) {
            throw new Error("No data returned from the server")
        }

        // So projects and employees are returned as a list of lists, where each sublist contains the id and name of the project/employee
        // Ex: Projects: [["ProjectID", "ProjectName"], ["ProjectID2", "ProjectName2"]]
        // Ex: Employees: [["EmployeeID", "EmployeeName"], ["EmployeeID2", "EmployeeName2"]]
        // The following code converts the list of lists into a list of objects that can be used in the SelectionComponent
        const projects = response.data.projects
        const project_options: SelectionButtonProps[] = projects.map((project: string[]) => {
            return {
                value: project[0],
                label: project[1]
            }
        })

        const employees = response.data.employees
        const employee_options: SelectionButtonProps[] = employees.map((employee: string[]) => {
            return {
                value: employee[0],
                label: employee[1]
            }
        })

        return {
            projects: project_options,
            employees: employee_options
        }
    } catch (error: unknown) {
        throw new Error("Error fetching data for RFI creation")
    }
}

export async function getRFI(id: string): Promise<RFIProps> {
    try {
        const response = await AxiosInstance.get('api/rfi/id/' + id)
        console.log("Response: ", response.data)

        if (response.data) {
            return response.data
        } else {
            throw new Error("Error fetching RFI")
        }
    } catch (error: unknown) {
        throw new Error("Error fetching RFI")
    }
}

export async function closeRFI(rfi: RFIProps): Promise<Number> {
    try {
        const response = await AxiosInstance.put('api/rfi/id/close/' + rfi.RFI_id, rfi) // Still needs to be tested
        return response.status 
    } catch (error: unknown) {
        throw new Error("Error closing RFI")
    }
}

