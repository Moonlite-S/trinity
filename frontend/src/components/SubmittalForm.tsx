import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDataForSubmittalCreation} from "../api/submittal"
import { SubmittalProps, SubmittalFormBaseProps } from "../interfaces/submittal_types"
import { SelectionComponent, BottomFormButton } from "./Buttons"
import { useSubmittalFormHandler } from "../hooks/submittalFormHandler"
import { useAuth } from "../App"
import { SelectionButtonProps } from "../interfaces/button_types"
import { GenericForm, GenericInput, GenericSelect, GenericTextArea } from "./GenericForm"
import { Error_Component } from "./misc"

export function SubmittalForm({submittal, method}: {submittal?: SubmittalProps, method: "POST" | "PUT"}) {
    const { user } = useAuth()
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
    const [errorString, setErrorString] = useState<string>("")
    
    const [currentSubmittalData, setCurrentSubmittalData] = useState<SubmittalProps>(submittal ?? {
        submittal_id: "",
        project: "Select a project",
        received_date: new Date().toLocaleDateString('en-CA'),
        project_name: "(Search Project)",
        type: "MECHANICAL",
        sub_description: "",
        assigned_to: user?.name ? user.name : "",
        status: "OPEN",
        notes: "",
    })

    const navigate = useNavigate()
    const { onProjectChange, onAssignedToChange, onSubmit } = useSubmittalFormHandler(setCurrentSubmittalData, setErrorString, currentSubmittalData, navigate, method)

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
        <>
            {errorString && <Error_Component errorString={errorString}/>}
            <SubmittalFormBase 
                submittal={currentSubmittalData} 
                projects={projects} 
                employees={employees} 
                onSubmit={onSubmit} 
                onProjectChange={onProjectChange} 
                onAssignedToChange={onAssignedToChange}
                method={method}/>
        </>
    )
}

function SubmittalFormBase({ submittal, onSubmit, projects, employees, onProjectChange, onAssignedToChange, method }: SubmittalFormBaseProps) {
    const method_string = {
        POST: "Create Submittal",
        PUT: "Update Submittal",
    }

    return (
        <GenericForm form_id="submittal_creation" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <SelectionComponent label="Project Name" Value={submittal.project_name} options={projects} onChange={onProjectChange} name="project"/>
                <SelectionComponent label="Assigned To" Value={submittal.assigned_to} options={employees} onChange={onAssignedToChange} name="user"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <GenericInput label="Received Date" value={submittal.received_date} type="date" name="received_date"/>
                <GenericSelect label="Submittal Type" value={submittal.type} options={["MECHANICAL", "ELECTRICAL", "PLUMBING", "FIRE_PROTECTION", "OTHER"]} name="type"/>
            </div>
            
            <GenericTextArea label="Submittal Description" value={submittal.sub_description} name="sub_description"/>
            <GenericTextArea label="Notes" value={submittal.notes} name="notes"/>
            <GenericTextArea label="Sent Item" value={submittal.sent_item} name="sent_item"/>
            <GenericTextArea label="Send Email" value={submittal.send_email} name="send_email"/>
            <GenericSelect label="Status" value={submittal.status} options={["OPEN","CLOSING", "COMPLETED"]} name="status"/>
            
            {method === "PUT" && (
                <>
                    <GenericTextArea label="Closing Notes" value={submittal.closing_notes} name="closing_notes"/>
                </>
            )}
            <BottomFormButton button_text={method_string[method]}/>
        </GenericForm>
    )
}