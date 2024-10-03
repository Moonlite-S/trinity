import { NavigateFunction } from "react-router-dom"
import { ProjectFormProps, ProjectProps } from "../interfaces/project_types"
import { createProject, getDataForProjectCreation, updateProject } from "../api/projects"
import { FormEvent } from "react"
import { EmployeeProps } from "../interfaces/employee_type"
import { MethodHandler } from "../components/misc"

export const useProjectFormHandler = (
    setCurrentProjectData: React.Dispatch<React.SetStateAction<ProjectProps>>,
    navigate: NavigateFunction,
    setErrorString: React.Dispatch<React.SetStateAction<string | undefined>>,
    method: "POST" | "PUT",
) => {

    const onDateStartChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
        const date = event.target.value
        const value = event.target.value.split('-')[0] + '-' + event.target.value.split('-')[1]
        setCurrentProjectData(prev => ({...prev, start_date: date}))

        try {
            const response = await getDataForProjectCreation(date)

            if (!response) {
                throw new Error("Error fetching project list")
            }

            const project_count = String(response.project_count + 1).padStart(3, "0")

            setCurrentProjectData(prev => ({...prev, project_id: value + "-" + project_count}))
        } catch (error) {
            console.error("Error fetching project list:", error)
            setErrorString("Error fetching project list: " + error)
        }
    }

    const onManagerChange = async (e: unknown) => {
        if (e && typeof e === 'object' && 'value' in e && 'label' in e) {
            setCurrentProjectData(prev => ({...prev, manager: {name: e.label, email: e.value} as EmployeeProps}))
        }
    }

    const onClientChange = async (e: unknown) => {
        if (e && typeof e === 'object' && 'value' in e && 'label' in e) {
            setCurrentProjectData(prev => ({...prev, client_name: e.label as string}))
            console.log("Client Name: ", e.label as string)
        }
    }

    const onCityChange = async (e: unknown) => {
        if (e && typeof e === 'object' && 'value' in e && 'label' in e) {
            setCurrentProjectData(prev => ({...prev, city: e.label as string}))
            console.log("City: ", e.label as string)
        }
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        
        const formData = new FormData(event.target as HTMLFormElement)
        const formDataObj = Object.fromEntries(formData.entries())

        try {
            const method_handler = MethodHandler(method, createProject, updateProject)

            if (method_handler) {
                setErrorString(undefined)
                const result_code = await method_handler(formDataObj as ProjectFormProps)

                // Error handling
                switch (result_code) {
                    case 200:
                        alert("Project updated successfully!")
                        navigate("/projects")
                        break
                    case 201:
                        alert("Project created successfully!")
                        navigate("/projects")
                        break
                    case 400:
                        setErrorString("Bad Request: Invalid data. Please make sure all fields are filled out. Error: " + result_code)
                        break
                    case 403:
                        setErrorString("Forbidden: You are not authorized to create projects. Error: " + result_code)
                        break
                    default:
                        throw new Error("Error creating project: " + result_code)
                }
            }

        } catch (error: unknown) {
            console.error("Something went wrong: ", error)
            setErrorString("Error 500")
        }
    }

    return {onDateStartChange, onManagerChange, onClientChange, onCityChange, onSubmit}
}