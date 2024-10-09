import { BottomFormButton, SelectionComponent } from "./Buttons";
import { SelectionButtonProps } from "../interfaces/button_types";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDataForRFICreation } from "../api/rfi";
import { RFIFormBaseProps, RFIProps } from "../interfaces/rfi_types";
import { useRFIFormHandler } from "../hooks/rfiFormHandler";
import { Error_Component } from "./misc";
import { GenericForm, GenericInput, GenericSelect, GenericTextArea } from "./GenericForm";
import { useAuth } from "../App";

export default function RFIFormCreation() {
    const { user } = useAuth()
    if (!user) return <div>Loading...</div>

    const navigate = useNavigate()

    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
    const [errorString, setErrorString] = useState<string>()

    const [currentRFIData, setCurrentRFIData] = useState<RFIProps>({
        RFI_id: "",
        notes: "",
        notes_closed: "",
        sent_out_date: new Date().toLocaleDateString('en-CA'),
        date_received: new Date().toLocaleDateString('en-CA'),
        type: "MECHANICAL",
        project: "",
        created_by_pk: user?.id as string,
        assigned_to_pk: "",
        description: "",
        status: "ACTIVE"
    })

    useEffect(() => {
        const fetchProjects = async () => {
            const response = await getDataForRFICreation()
            console.log(response)
            
            setProjects(response.projects)
            setEmployees(response.employees)

            setCurrentRFIData(prev => ({...prev, project: response.projects[0].label}))
            setCurrentRFIData(prev => ({...prev, created_by: 
                {
                    name:response.employees[0].label, 
                    email: response.employees[0].value, 
                    username: "", 
                    password: "", 
                    role: "Team Member"
                }
            }))
        }

        fetchProjects()
    }, [])

    const { handleSubmit, handleProjectChange, handleCreatedByEmployeeChange, handleSentByEmployeeChange } = useRFIFormHandler({setCurrentRFIData, currentRFIData, navigate, setErrorString, method: "POST"})

    return (
        <RFIFormBase 
        user={user}
        errorString={errorString} 
        currentRFIData={currentRFIData} 
        handleSubmit={handleSubmit} 
        handleProjectChange={handleProjectChange} 
        handleCreatedByEmployeeChange={handleCreatedByEmployeeChange}
        handleSentByEmployeeChange={handleSentByEmployeeChange}
        projects={projects} 
        employees={employees}
        method="POST"/>
    )
}

export function RFIFormUpdate({RFIProps}: {RFIProps: RFIProps}) {
    const { user } = useAuth()
    if (!user) return <div>Loading...</div>

    const { id } = useParams<string>()
    if (!id) return <div>Loading...</div>

    const [currentRFIData, setCurrentRFIData] = useState<RFIProps>({
        ...RFIProps,
        created_by_pk: RFIProps.created_by?.id as string,
        assigned_to_pk: RFIProps.assigned_to?.id as string,
        project: RFIProps.project_id as string
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [errorString, setErrorString] = useState<string>()
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
    const navigate = useNavigate()

    const { handleSubmit, handleProjectChange, handleCreatedByEmployeeChange, handleSentByEmployeeChange } = useRFIFormHandler({setCurrentRFIData, currentRFIData, navigate, setErrorString, method: "PUT"})

    useEffect(() => {
        const getRFIData = async () => {
            const data = await getDataForRFICreation()
            setProjects(data.projects)
            setEmployees(data.employees)
            setLoading(false)
        }

        getRFIData()
    }, [id, navigate])

    if (loading) return <div>Loading...</div>

    return (
        <RFIFormBase
        user={user}
        errorString={errorString} 
        currentRFIData={currentRFIData} 
        handleSubmit={handleSubmit} 
        handleProjectChange={handleProjectChange} 
        handleCreatedByEmployeeChange={handleCreatedByEmployeeChange}
        handleSentByEmployeeChange={handleSentByEmployeeChange}
        projects={projects} 
        employees={employees}
        method="PUT"/>
    )
}

function RFIFormBase({user, errorString, currentRFIData, handleSubmit, handleProjectChange, handleCreatedByEmployeeChange, handleSentByEmployeeChange, projects, employees, method }: RFIFormBaseProps){
    const method_string = {
        POST: "Create RFI",
        PUT: "Update RFI",
        CLOSE: "Close RFI"
    }

    const status_options = user.role === "Team Member" ? ["ACTIVE", "CLOSING"] : ["ACTIVE", "CLOSING", "COMPLETED"]
    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}
    <GenericForm form_id="rfi_form" onSubmit={handleSubmit}>
        <SelectionComponent label="Project" name="project" Value={currentRFIData.project} options={projects} onChange={handleProjectChange}/>
        
        <div className="grid grid-cols-2 gap-4">
            <GenericInput label="Sent Out Date" name="sent_out_date" type="date" value={currentRFIData.sent_out_date} />
            <GenericInput label="Date Received" name="date_received" type="date" value={currentRFIData.date_received} />
        </div>

        <GenericSelect label="Type" name="type" options={["MECHANICAL", "ELECTRICAL", "PLUMBING", "OTHER"]} value={currentRFIData.type} />
        
        <div className="grid grid-cols-2 gap-4">
            <SelectionComponent label="Assigned To" name="assigned_to_pk" Value={currentRFIData.assigned_to_pk} options={employees} onChange={handleSentByEmployeeChange}/>
            <SelectionComponent label="Created By" name="created_by_pk" Value={currentRFIData.created_by_pk} options={employees} onChange={handleCreatedByEmployeeChange}/>
        </div>

        <GenericTextArea label="Description" name="description" value={currentRFIData.description} />
        <GenericTextArea label="Notes" name="notes" value={currentRFIData.notes} />
        <GenericSelect label="Status" name="status" options={status_options} value={currentRFIData.status} />
        {method === "CLOSE" && <GenericTextArea label="Closing Notes" name="notes_closed" value={currentRFIData.notes_closed} />}
        
        <BottomFormButton button_text={method_string[method]}/>
    </GenericForm>
    </>
    )
}