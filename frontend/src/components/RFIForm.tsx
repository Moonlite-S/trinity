import { BottomFormButton, SelectionComponent } from "./Buttons";
import { SelectionButtonProps } from "../interfaces/button_types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDataForRFICreation } from "../api/rfi";
import { RFIFormBaseProps, RFIProps } from "../interfaces/rfi_types";
import { useRFIFormHandler } from "../hooks/rfiFormHandler";
import { Error_Component } from "./misc";

export default function RFIFormCreation() {
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
    const [errorString, setErrorString] = useState<string>()
    const navigate = useNavigate()

    const [currentRFIData, setCurrentRFIData] = useState<RFIProps>({
        RFI_id: "",
        notes: "",
        notes_closed: "",
        sent_out_date: new Date().toLocaleDateString('en-CA'),
        date_received: new Date().toLocaleDateString('en-CA'),
        type: "MECHANICAL",
        project: "",
        user: {
            name: "",
            email: "",
            username: "",
            password: "",
            role: ""
        },
        description: ""
    })

    useEffect(() => {
        const fetchProjects = async () => {
            const response = await getDataForRFICreation()
            console.log(response)
            
            setProjects(response.projects)
            setEmployees(response.employees)

            setCurrentRFIData(prev => ({...prev, project: response.projects[0].label}))
            setCurrentRFIData(prev => ({...prev, user: 
                {
                    name:response.employees[0].label, 
                    email: response.employees[0].value, 
                    username: "", 
                    password: "", 
                    role: ""
                }
            }))
        }

        fetchProjects()
    }, [])

    const { handleSubmit, handleProjectChange, handleEmployeeChange } = useRFIFormHandler({setCurrentRFIData, navigate, setErrorString, method: "POST"})

    return (
        <RFIFormBase 
        errorString={errorString} 
        currentRFIData={currentRFIData} 
        handleSubmit={handleSubmit} 
        handleProjectChange={handleProjectChange} handleEmployeeChange={handleEmployeeChange} 
        projects={projects} 
        employees={employees}/>
    )
}

function RFIFormBase({errorString, currentRFIData, handleSubmit, handleProjectChange, handleEmployeeChange, projects, employees}: RFIFormBaseProps){
    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}
    <div className="bg-slate-200 p-5 rounded-md border border-zinc-500 m-5 w-3/4 mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mx-auto">
            <div className="flex flex-col gap-2">
                <label htmlFor="RFI_id">RFI ID:</label>
                <input type="text" id="RFI_id" name="RFI_id" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required/>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="sent_out_date">Sent Out Date</label>
                <input type="date" id="sent_out_date" name="sent_out_date" defaultValue={new Date().toLocaleDateString('en-CA')} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required/>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="date_received">Date Received</label>
                <input type="date" id="date_received" name="date_received" defaultValue={new Date().toLocaleDateString('en-CA')} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required/>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="type">Type</label>
                <select id="type" name="type" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required>
                    <option value="MECHANICAL">MECHANICAL</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="PLUMBING">PLUMBING</option>
                    <option value="OTHER">OTHER</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="project">Project</label>
                <SelectionComponent Value={currentRFIData.project} options={projects} name="project" onChange={handleProjectChange} />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="user">Created By</label>
                    <SelectionComponent Value={currentRFIData.user.name} options={employees} name="user" onChange={handleEmployeeChange}/>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="notes">Notes:</label>
                <textarea id="notes" name="notes" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required/>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="notes_closed">Notes Closed:</label>
                <textarea id="notes_closed" name="notes_closed" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required/>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="description">Description:</label>
                <textarea id="description" name="description" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" required/>
            </div>

            <BottomFormButton button_text="Create RFI"/>
        </form>
    </div>
    </>
    )
}