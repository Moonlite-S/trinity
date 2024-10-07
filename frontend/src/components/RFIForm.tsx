import { BottomFormButton, SelectionComponent } from "./Buttons";
import { SelectionButtonProps } from "../interfaces/button_types";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDataForRFICreation } from "../api/rfi";
import { RFIFormBaseProps, RFIProps } from "../interfaces/rfi_types";
import { useRFIFormHandler } from "../hooks/rfiFormHandler";
import { Error_Component } from "./misc";
import { GenericForm, GenericInput, GenericSelect } from "./GenericForm";
import { useAuth } from "../App";

export default function RFIFormCreation() {
    const { user } = useAuth()
    const navigate = useNavigate()
    
    if (!user) {
        navigate("/login")
    }

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

export function RFIFormUpdate({RFIProps, method}: {RFIProps: RFIProps, method: "PUT" | "CLOSE"}) {
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
        errorString={errorString} 
        currentRFIData={currentRFIData} 
        handleSubmit={handleSubmit} 
        handleProjectChange={handleProjectChange} 
        handleCreatedByEmployeeChange={handleCreatedByEmployeeChange}
        handleSentByEmployeeChange={handleSentByEmployeeChange}
        projects={projects} 
        employees={employees}
        method={method}/>
    )
}

function RFIFormBase({errorString, currentRFIData, handleSubmit, handleProjectChange, handleCreatedByEmployeeChange, handleSentByEmployeeChange, projects, employees, method }: RFIFormBaseProps){
    const method_string = {
        POST: "Create RFI",
        PUT: "Update RFI",
        CLOSE: "Close RFI"
    }
    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}
    <GenericForm form_id="rfi_form" onSubmit={handleSubmit}>
        <GenericInput label="Sent Out Date" name="sent_out_date" type="date" value={currentRFIData.sent_out_date} />
        <GenericInput label="Date Received" name="date_received" type="date" value={currentRFIData.date_received} />
        <GenericSelect label="Type" name="type" options={["MECHANICAL", "ELECTRICAL", "PLUMBING", "OTHER"]} value={currentRFIData.type} />
        <SelectionComponent label="Project" name="project" Value={currentRFIData.project} options={projects} onChange={handleProjectChange}/>
        <SelectionComponent label="Assigned To" name="assigned_to_pk" Value={currentRFIData.assigned_to_pk} options={employees} onChange={handleSentByEmployeeChange}/>
        <SelectionComponent label="Created By" name="created_by_pk" Value={currentRFIData.created_by_pk} options={employees} onChange={handleCreatedByEmployeeChange}/>
        <GenericInput label="Description" name="description" type="text" value={currentRFIData.description} />
        <GenericInput label="Notes" name="notes" type="text" value={currentRFIData.notes} />
        {method === "CLOSE" && <GenericInput label="Closing Notes" name="notes_closed" type="text" value={currentRFIData.notes_closed} />}
        
        <BottomFormButton button_text={method_string[method]}/>
    </GenericForm>
    </>
    )
}