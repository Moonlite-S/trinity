import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDataForSubmittalCreation} from "../api/submittal"
import { SubmittalProps, SubmittalFormBaseProps } from "../interfaces/submittal_types"
import { SelectionComponent, BottomFormButton } from "./Buttons"
import { useSubmittalFormHandler } from "../hooks/submittalFormHandler"
import { useAuth } from "../App"
import { SelectionButtonProps } from "../interfaces/button_types"
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
        onAssignedToChange={onAssignedToChange}/>
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
        onAssignedToChange={onAssignedToChange}/>
    )
}

function SubmittalFormBase({ submittal, onSubmit, projects, employees, onProjectChange, onAssignedToChange }: SubmittalFormBaseProps) {

    const isUpdate: boolean = submittal?.submittal_id !== ""
    return (
        <form className="w-3/4 mx-auto" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 grid-flow-row gap-5 bg-slate-50 p-8 m-5 rounded-lg">
                <div className="flex flex-col gap-2 col-span-3">
                    <label>Project Name</label>
                    <SelectionComponent Value={submittal.project_name} options={projects} name="project" onChange={onProjectChange}/>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Submittal ID</label>
                    <input type="text" value={submittal?.submittal_id} placeholder="Submittal ID" name="submittal_id" className="border border-black rounded-md p-1" readOnly/>
                </div>

                <div className="flex flex-col gap-2 ">
                    <label>Recieved Date</label>
                    <input type="date" placeholder="Submittal Date" name="received_date" className="border border-black rounded-md p-1" defaultValue={submittal?.received_date} required/>
                </div>


                <div className="flex flex-col gap-2">
                    <label>Submittal Type</label>
                    <select name="type" className="border border-black rounded-md p-1" defaultValue={submittal?.type} required>
                        <option value="mechanical">MECHANICAL</option>
                        <option value="electrical">ELECTRICAL</option>
                        <option value="plumbing">PLUMBING</option>
                        <option value="fire_protection">FIRE PROTECTION</option>
                        <option value="other">OTHER</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Submittal Status</label>
                    <select name="status" className="border border-black rounded-md p-1" defaultValue={submittal?.status} required>
                        <option value="open">OPEN</option>
                        <option value="closed">CLOSED</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label>Assigned To</label>
                    <SelectionComponent Value={submittal.assigned_to} options={employees} name="user" onChange={onAssignedToChange} />
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Description</label>
                    <textarea placeholder="Description" name="sub_description" className="border border-black rounded-md p-1" defaultValue={submittal?.sub_description} required/>
                </div>

                <div className="flex flex-col gap-2 col-span-4">
                    <label>Notes</label>
                    <textarea placeholder="Notes" name="notes" className="border border-black rounded-md p-1" defaultValue={submittal?.notes} required/>
                </div>
            </div>

            <div className="mx-auto text-center justify-center pt-5 ">   
                <BottomFormButton button_text={isUpdate ? "Update" : "Create"} />
            </div>
        </form>
    )
}