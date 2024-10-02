import { AxiosInstance } from "../components/Axios"
import { SelectionButtonProps } from "../interfaces/button_types"
import { RFIProps, RFICreationProps } from "../interfaces/rfi_types"

export async function createRFI(rfi: RFIProps): Promise<Number> {
    const response = await AxiosInstance.post('api/rfi/create', rfi)
    return response.status
}

export async function getRFIs(): Promise<RFIProps[]> {
    const response = await AxiosInstance.get('api/rfi/get')
    return response.data
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

export async function updateRFI(rfi: RFIProps): Promise<Number> {
    const response = await AxiosInstance.put('api/rfi/update', rfi)
    return response.status
}

