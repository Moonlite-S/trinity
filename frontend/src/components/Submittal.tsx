import { useEffect, useState } from "react";
import { getDataForSubmittalCreation } from "../api/submittal";
import { BottomFormButton, SelectionComponent } from "./Buttons";
import { Header } from "./misc";
import { ProjectSelectProps } from "../interfaces/project_types";
import DataTable, { Direction, TableColumn } from "react-data-table-component";
import { Submittal } from "../interfaces/submittal";

/**
 * ### Route for ('/submittals/create_submittal')   
 * 
 * Shows the form to create a new submittal
 * 
 */
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

/**
 * ### Route for ('/submittals')   
 * 
 * Shows the list of active submittals
 * 
 */
export function ViewSubmittals() {
    return (
        <>
            <Header />

            <div className="flex flex-col gap-5 p-5 ">
                <h1>Submittals</h1>
            </div>

            <SubmittalList />
        </>
    )
}

/**
 * The Table Component that lists the submittals
 */
function SubmittalList() {
    const columns: TableColumn<Submittal>[] = [
        { name: "Project ID", selector: row => row.project_id, sortable: true },
        { name: "Status", selector: row => row.submittal_status, sortable: true },
        { name: "Date Created", selector: row => row.submittal_date, sortable: true },
        { name: "Assigned To", selector: row => row.assigned_to, sortable: true },
        { name: "Description", selector: row => row.description, sortable: true },
        { name: "Notes", selector: row => row.notes, sortable: true },
    ]

    const data: Submittal[] = []

    return (
        <DataTable
            columns={columns}
            data={data}
            direction={Direction.AUTO}
            persistTableHead
            highlightOnHover
            expandableRows
            selectableRows
            pagination
            subHeader
        />
    )
}

/**
 * The Form Component that creates a new submittal
 */
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
        <form className="w-1/2 mx-auto">
            <div className="grid grid-cols-4 grid-flow-row gap-5 bg-slate-50 p-8 m-5 rounded-lg">
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
                    <input type="date" placeholder="Submittal Date" name="submittal_date" className="border border-black rounded-md p-1" defaultValue={new Date().toLocaleDateString("en-CA")}/>
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


