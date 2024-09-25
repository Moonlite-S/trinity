import { useEffect, useState } from "react";
import { getDataForSubmittalCreation } from "../api/submittal";
import { BottomFormButton, SelectionComponent } from "./Buttons";
import { Header } from "./misc";
import { ProjectSelectProps } from "../interfaces/project_types";

export default function CreateSubmittal() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Create Submittal</h1>
            </div>

            <SubmittalFormCreation />
        </>
    )
}

export function ViewSubmittals() {
    return (
        <>
            <Header />

            <div className="flex flex-col gap-5 bg-slate-50">
                <h1>Submittals</h1>
            </div>
        </>
    )
}

function SubmittalFormCreation() {
    const [projects, setProjects] = useState<ProjectSelectProps[]>([])
    const [clients, setClients] = useState<ProjectSelectProps[]>([])

    const [employees, setEmployees] = useState<ProjectSelectProps[]>([])
    useEffect(() => {
        const get_submittals_data = async () => {
            const response = await getDataForSubmittalCreation()

            if (!response) {
                throw new Error("Error fetching submittal data")
            }

            console.log(response.projects)

            const obj_projects = response.projects.map((value: string) => {
                return { value: value[0], label: value[1] }
            })

            setProjects(obj_projects)
            
            const obj_employees = response.users.map((value: string) => {
                return { value: value[0], label: value[1] }
            })
            setEmployees(obj_employees)

            const obj_clients = response.client_names.map((value: string) => {
                return { value: value, label: value }
            })
            setClients(obj_clients)
        }
        
        get_submittals_data()
    }, [])
    return (
        <form>
            <div className="grid grid-cols-4 grid-flow-row gap-5 bg-slate-50 p-5 m-5 rounded-lg">
                <div className="flex flex-col gap-2 col-span-2">
                    <label>Project Name</label>
                    <SelectionComponent defaultValue={""} options={projects} name="project_name" />
                </div>

                <div className="flex flex-col gap-2 col-span-2">
                    <label>Client Name</label>
                    <SelectionComponent defaultValue={""} options={clients} name="client_name" />
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Submittal Name</label>
                    <input type="text" placeholder="Submittal Name" name="submittal_name" className="border border-black rounded-md p-1"/>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Recieved Date</label>
                    <input type="date" placeholder="Submittal Date" name="submittal_date" className="border border-black rounded-md p-1"/>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Submittal Type</label>
                    <select name="submittal_type" className="border border-black rounded-md p-1">
                        <option value="mechanical">MECHANICAL</option>
                        <option value="electrical">ELECTRICAL</option>
                        <option value="plumbing">PLUMBING</option>
                        <option value="fire_protection">FIRE PROTECTION</option>
                        <option value="other">OTHER</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Submittal Status</label>
                    <select name="submittal_status" className="border border-black rounded-md p-1">
                        <option value="open">OPEN</option>
                        <option value="closed">CLOSED</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Assigned To</label>
                    <SelectionComponent defaultValue={""} options={employees} name="assigned_to" />
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Description</label>
                    <textarea placeholder="Description" name="description" className="border border-black rounded-md p-1"/>
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Notes</label>
                    <textarea placeholder="Notes" name="notes" className="border border-black rounded-md p-1"/>
                </div>
            </div>

            <div className="mx-auto text-center justify-center pt-5 ">   
                <BottomFormButton button_text="Create" />
            </div>
        </form>
    )
}


