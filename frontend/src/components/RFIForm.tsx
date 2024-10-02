import { BottomFormButton, SelectionComponent } from "./Buttons";
import { SelectionButtonProps } from "../interfaces/button_types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDataForRFICreation } from "../api/rfi";
import { RFIProps } from "../interfaces/rfi_types";
import { useRFIFormHandler } from "../hooks/rfiFormHandler";
import { Error_Component } from "./misc";

export default function RFIForm() {
    const [projects, setProjects] = useState<SelectionButtonProps[]>([])
    const [employees, setEmployees] = useState<SelectionButtonProps[]>([])
    const [errorString, setErrorString] = useState<string>()
    const navigate = useNavigate()

    const [currentRFIData, setCurrentRFIData] = useState<RFIProps>({
        title: "",
        description: "",
        sent_out_date: new Date().toLocaleDateString("en-CA"),
        date_received: new Date().toLocaleDateString("en-CA"),
        type: "MECHANICAL",
        project_id: "",
        status: "ACTIVE",
        created_by: {
            name: "",
            email: "",
            username: "",
            password: "",
            role: ""
        }
    })

    useEffect(() => {
        const fetchProjects = async () => {
            const response = await getDataForRFICreation()
            console.log(response)
            
            setProjects(response.projects)
            setEmployees(response.employees)

            setCurrentRFIData(prev => ({...prev, project_id: response.projects[0].label}))
            setCurrentRFIData(prev => ({...prev, created_by: 
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
        <div className="bg-slate-200 p-5 rounded-md border border-zinc-500 m-5 w-3/4 mx-auto">
            {errorString && <Error_Component errorString={errorString} />}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mx-auto">
                <div className="flex flex-col gap-2">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" />
                </div>



                <div className="flex flex-col gap-2">
                    <label htmlFor="sent_out_date">Sent Out Date</label>
                    <input type="date" id="sent_out_date" name="sent_out_date" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="date_received">Date Received</label>
                    <input type="date" id="date_received" name="date_received" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="type">Type</label>
                    <select id="type" name="type" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2">
                        <option value="MECHANICAL">MECHANICAL</option>
                        <option value="ELECTRICAL">ELECTRICAL</option>
                        <option value="PLUMBING">PLUMBING</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="project_id">Project</label>
                    <SelectionComponent Value={currentRFIData.project_id} options={projects} name="project_id" onChange={handleProjectChange}/>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="created_by">Created By</label>
                    <SelectionComponent Value={currentRFIData.created_by.name} options={employees} name="created_by" onChange={handleEmployeeChange}/>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400 p-2" />
                </div>

                <BottomFormButton button_text="Create RFI"/>
            </form>
        </div>
    )
}

