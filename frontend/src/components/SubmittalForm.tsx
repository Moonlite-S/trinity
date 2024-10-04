import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDataForSubmittalCreation} from "../api/submittal"
import { SubmittalProps, SubmittalFormBaseProps } from "../interfaces/submittal_types"
import { SelectionComponent, BottomFormButton } from "./Buttons"
import { useSubmittalFormHandler } from "../hooks/submittalFormHandler"
import { useAuth } from "../App"
import { SelectionButtonProps } from "../interfaces/button_types"
import { GenericForm, GenericInput, GenericSelect } from "./GenericForm"
/**
 * The Form Component that creates a new submittal
 */
export function SubmittalFormCreation() {

    const { user } = useAuth()
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])

    const navigate = useNavigate()

    const [currentSubmittalData, setCurrentSubmittalData] = useState<SubmittalProps>({
        submittal_id: "",
        project: "",
        received_date: new Date().toLocaleDateString('en-CA'),
        project_name: "(Search Project)",
        type: "MECHANICAL",
        sub_description: "",
        assigned_to: user?.name ? user.name : "",
        status: "OPEN",
        notes: "",
    })

    const { onProjectChange, onAssignedToChange, onSubmit } = useSubmittalFormHandler(setCurrentSubmittalData, navigate, "POST")

    useEffect(() => {
        const get_submittals_data = async () => {
            const response = await getDataForSubmittalCreation()

            if (!response) {
                throw new Error("Error fetching submittal data")
            }

            const obj_projects = response.projects.map((value: string[]) => {
                return { value: value[0], label: value[1] }
            })
            setProjects(obj_projects)
            
            const obj_employees = response.users.map((value: string[]) => {
                return { value: value[0], label: value[1] }
            })
            setEmployees(obj_employees)

        }
        
        get_submittals_data()
    }, [])

    return (
        <SubmittalFormBase 
        submittal={currentSubmittalData}
        projects={projects} 
        employees={employees} 
        onSubmit={onSubmit} 
        onProjectChange={onProjectChange} 
        onAssignedToChange={onAssignedToChange}
        method="POST"/>
    )
}

/**
 * The Form Component that edits a submittal
 * 
 * I separated this into a different function because it was a headache to combine this with the creation form.
 * Maybe I'll find another way later.
 * 
 * @param submittal 
 * 
 */
export function SubmittalFormEdit({submittal}: {submittal: SubmittalProps}) {
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
    
    const [currentSubmittalData, setCurrentSubmittalData] = useState<SubmittalProps>(submittal)
    const navigate = useNavigate()

    const { onProjectChange, onAssignedToChange, onSubmit } = useSubmittalFormHandler(setCurrentSubmittalData, navigate, "PUT")

    useEffect(() => {
        const get_submittals_data = async () => {
            const response = await getDataForSubmittalCreation()

            if (!response) {
                throw new Error("Error fetching submittal data")
            }

            const obj_projects = response.projects.map((value: string[]) => {
                return { value: value[0], label: value[1] }
            })
            setProjects(obj_projects)
            
            const obj_employees = response.users.map((value: string[]) => {
                return { value: value[0], label: value[1] }
            })
            setEmployees(obj_employees)

            // const obj_clients = response.client_names.map((value: string) => {
            //     return { value: value, label: value }
            // })
            // setClients(obj_clients)
        }
        
        get_submittals_data()
    }, [])

    return (
        <SubmittalFormBase 
        submittal={currentSubmittalData} 
        projects={projects} 
        employees={employees} 
        onSubmit={onSubmit} 
        onProjectChange={onProjectChange} 
        onAssignedToChange={onAssignedToChange}
        method="PUT"/>
    )
}

function SubmittalFormBase({ submittal, onSubmit, projects, employees, onProjectChange, onAssignedToChange, method }: SubmittalFormBaseProps) {
    return (
        <GenericForm form_id="submittal_creation" onSubmit={onSubmit}>
            <SelectionComponent label="Project Name" Value={submittal.project_name} options={projects} onChange={onProjectChange} name="project"/>
            <GenericInput label="Received Date" value={submittal.received_date} type="date" name="received_date"/>
            <SelectionComponent label="Assigned To" Value={submittal.assigned_to} options={employees} onChange={onAssignedToChange} name="user"/>
            <GenericInput label="Submittal Type" value={submittal.type} type="text" name="type"/>
            <GenericInput label="Submittal Description" value={submittal.sub_description} type="text" name="sub_description"/>
            <GenericInput label="Notes" value={submittal.notes} type="text" name="notes"/>
            <GenericSelect label="Status" value={submittal.status} options={["OPEN", "CLOSED"]} name="status"/>

            <BottomFormButton button_text={method === "POST" ? "Create Submittal" : "Update Submittal"}/>
        </GenericForm>
    )
}