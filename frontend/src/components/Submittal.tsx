import { useEffect, useState } from "react";
import { createSubmittal, getDataForSubmittalCreation, getSubmittals, getSubmittalsByProjectId } from "../api/submittal";
import { BottomFormButton, SelectionComponent } from "./Buttons";
import { Header } from "./misc";
import { ProjectSelectProps } from "../interfaces/project_types";
import DataTable, { Direction, TableColumn } from "react-data-table-component";
import { Submittal, SubmittalCreation } from "../interfaces/submittal_types";

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
    const [submittals, setSubmittals] = useState<Submittal[]>([])

    useEffect(() => {
        const get_submittals = async () => {
            const response = await getSubmittals()
            setSubmittals(response)
            console.log("Submittals: ", response)
        }

        get_submittals()
    }, [])

    const columns: TableColumn<Submittal>[] = [
        { name: "Submittal ID", selector: row => row.submittal_id, sortable: true },
        { name: "Project", selector: row => row.project_name, sortable: true },
        { name: "Client", selector: row => row.client_name, sortable: true },
        { name: "Status", selector: row => row.status, sortable: true },
        { name: "Type", selector: row => row.type, sortable: true },
        { name: "Date Received", selector: row => row.received_date, sortable: true },
        { name: "Assigned To", selector: row => row.assigned_to, sortable: true },
        { name: "Description", selector: row => row.sub_description, sortable: true },
        { name: "Notes", selector: row => row.notes, sortable: true },
    ]

    return (
        <DataTable
            columns={columns}
            data={submittals}
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
    //const [clients, setClients] = useState<ProjectSelectProps[]>([])
    const [submittal_id, setSubmittalId] = useState<string>("")
    const [employees, setEmployees] = useState<ProjectSelectProps[]>([])
    useEffect(() => {
        const get_submittals_data = async () => {
            const response = await getDataForSubmittalCreation()

            if (!response) {
                throw new Error("Error fetching submittal data")
            }

            const obj_projects = response.projects.map((value: string) => {
                return { value: value[0], label: value[1] }
            })
            setProjects(obj_projects)
            
            const obj_employees = response.users.map((value: string) => {
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

    const onProjectChange = async (e: unknown) => {
        // This is to ensure that the value is of the correct type (ProjectSelectProps)
        if (e && typeof e === 'object' && 'value' in e && 'label' in e) {
            try {
                const response = await getSubmittalsByProjectId(e.value as string)
                console.log("Response: ", response)
                const submittal_count = response.length + 1
                console.log("Submittal Count: ", submittal_count)
                const project_id = e.value
                setSubmittalId('S-' + project_id + '-' + submittal_count.toString().padStart(3, '0'))
            }
            catch (error) {
                console.log(error)
            }
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("Form Submitted", e.target)

        const formData = new FormData(e.target as HTMLFormElement)
        const formDataObj = Object.fromEntries(formData.entries())
        console.log("Form Data Object: ", formDataObj)

        try {
            const response = await createSubmittal(formDataObj as SubmittalCreation)
            console.log("Response: ", response)
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <form className="w-2/3 mx-auto" onSubmit={onSubmit}>
            <div className="grid grid-cols-4 grid-flow-row gap-5 bg-slate-50 p-8 m-5 rounded-lg">

                <div className="flex flex-col gap-2 col-span-2">
                    <label>Submittal ID</label>
                    <input type="text" value={submittal_id} placeholder="Submittal ID" name="submittal_id" className="border border-black rounded-md p-1" readOnly/>
                </div>

                <div className="flex flex-col gap-2 col-span-2">
                    <label>Project Name</label>
                    <SelectionComponent defaultValue={""} options={projects} name="project" onChange={onProjectChange}/>
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Submittal Name</label>
                    <input type="text" placeholder="Submittal Name" name="submittal_name" className="border border-black rounded-md p-1" required/>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Recieved Date</label>
                    <input type="date" placeholder="Submittal Date" name="received_date" className="border border-black rounded-md p-1" defaultValue={new Date().toLocaleDateString("en-CA")} required/>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Submittal Type</label>
                    <select name="type" className="border border-black rounded-md p-1" required>
                        <option value="mechanical">MECHANICAL</option>
                        <option value="electrical">ELECTRICAL</option>
                        <option value="plumbing">PLUMBING</option>
                        <option value="fire_protection">FIRE PROTECTION</option>
                        <option value="other">OTHER</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Submittal Status</label>
                    <select name="status" className="border border-black rounded-md p-1" required>
                        <option value="open">OPEN</option>
                        <option value="closed">CLOSED</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Assigned To</label>
                    <SelectionComponent defaultValue={""} options={employees} name="user" />
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Description</label>
                    <textarea placeholder="Description" name="sub_description" className="border border-black rounded-md p-1" required/>
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Notes</label>
                    <textarea placeholder="Notes" name="notes" className="border border-black rounded-md p-1" required/>
                </div>
            </div>

            <div className="mx-auto text-center justify-center pt-5 ">   
                <BottomFormButton button_text="Create" />
            </div>
        </form>
    )
}


