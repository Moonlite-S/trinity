import { useEffect, useState } from "react"
import { ProjectFormProps } from "../interfaces/project_types"
import { getDataForProjectCreation } from "../api/projects";
import { CreateableSelectionComponent, SelectionComponent, BottomFormButton, SelectionComponentValue } from "./Buttons";
import { Error_Component } from "./misc";
import { EmployeeProps } from "../interfaces/employee_type";

/**
 * This component shows the user the form to create a new project.
 * 
 * @param FormProps : ( see type FormProps )  
 * 
 * TODO:
 *  - REFACTOR THIS IN AN EASIER WAY (NO PROP DRILLING)
 *  - DefaultManager sends only the name, not the email
 *  - I think the best way to decouple this is to just have two ProjectForm components. One for creating and one for updating. 
 */
export function ProjectFormCreation(
    {onSubmit}: ProjectFormProps
) { 
    const [ProjectID, setProjectID] = useState('')
    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()
    const [DateStart, setDateStart] = useState(new Date().toLocaleDateString("en-CA"))
    const [defaultManager, setDefaultManager] = useState<string>("")
    const [errorString, setErrorString] = useState<string>()

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

    const templates = [
        { value: 'default', label: 'default' },
    ]

    useEffect(() => {
        const get_project_data = async () => {
            try {
                const response = await getDataForProjectCreation(DateStart)

                if (!response) {
                    throw new Error("Error fetching project list")
                }

                const project_count = String(response.project_count + 1).padStart(3, "0") 

                setProjectID(DateStart + "-" + project_count)
                setDefaultManager(response.current_user[0])
                
                setProjectManagers(response.users)
                const obj_client_names = response.client_names.map((value: string) => {
                    return { value: value, label: value }
                })
                const obj_cities = response.cities.map((value: string) => {
                    return { value: value, label: value }
                })
                setClients(obj_client_names)
                setCities(obj_cities)
            } catch (error) {
                console.error("Error fetching project list:", error)
                setErrorString("Error fetching project list: " + error)
            }
        }
        
        get_project_data()
    },[])
    
    const onDateStartChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setDateStart(value)

        try {
            const response = await getDataForProjectCreation(value)

            if (!response) {
                throw new Error("Error fetching project list")
            }
            const project_count = String(response.project_count + 1).padStart(3, "0")

            setProjectID(value + "-" + project_count)
        } catch (error) {
            console.error("Error fetching project list:", error)
            setErrorString("Error fetching project list: " + error)
        }
    }

    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}

    <form id="project_creation" onSubmit={onSubmit}  method="post">
        <div className="flex flex-col gap-10 p-24 mx-auto max-w-screen-lg bg-zinc-50" >
            <div className="flex flex-row justify-center gap-5">
                <label htmlFor="project_id" className="py-2">Project ID:</label>
                <input defaultValue={ProjectID} className="bg-slate-200 rounded-md border-zinc-500 border" type="text" name="project_id"/>
                
                <label htmlFor="project_name" className="py-2" >Project Name:</label>
                <input className="bg-white border border-zinc-500 rounded-md focus:outline-none focus:ring focus:ring-orange-400" type="text" name="project_name" autoFocus required/>
            </div>
        
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="status" className="py-2">Project Status:</label>
                        <select defaultValue={status} name="status" className="bg-white rounded-md p-2 border border-zinc-500">
                            <option value={'ACTIVE'}>Active</option>
                            <option value={'COMPLETED'}>Completed</option>
                            <option value={'CANCELLED'}>Cancelled</option>
                            <option value={'NOT STARTED'}>Not Started</option>
                        </select>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="start_date" className="py-2">Date Created:</label>
                        <input value={DateStart} onChange={onDateStartChange} className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="start_date" required/>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="end_date" className="py-2">Due Date:</label>
                        <input className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="end_date" required/>
                    </div>
                </div>

                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="manager" >Project Manager:</label>
                        {defaultManager && <SelectionComponent defaultValue={defaultManager} options={projectManagerListOptions} name="manager"/>}
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label >Client Name</label>
                        <CreateableSelectionComponent options={Clients} name="client_name" defaultValue={""}/>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-5">
                        <label >City</label>
                        <CreateableSelectionComponent defaultValue={""} options={Cities} name="city"/>
                    </div>
                </div>
            </div> 
            
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-row ">
                    <label htmlFor="folder_location" className="py-2">Folder Name:</label>
                    <input defaultValue={ProjectID} className="mx-2 p-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="text" name="folder_location" />
                </div>

                <div className="flex flex-row justify-between gap-5">
                    <label htmlFor="template" className="py-2">Template:</label>
                    <SelectionComponent options={templates} name="template"/>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <label  htmlFor="notes">Project Notes:</label>
                <textarea defaultValue={""} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" placeholder="Enter notes or other details" name="notes"/>
            </div>

            <div title="If you are the project managers assigned to this project, you will not receive an email.">
                <label htmlFor="notify_manager" className="py-2" >Notify Manager:</label>
                <input type="checkbox" name="notify_manager" className="mx-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" defaultChecked />
            </div>
        </div>

        <BottomFormButton button_text="Create Project"/>

    </form>
    </>
    )
}

export function ProjectFormUpdate(
    {onSubmit, formProps}: ProjectFormProps
) { 
    const {
        project_id = '',
        project_name = '',
        manager = {} as EmployeeProps,
        city = '',
        status = 'ACTIVE',
        client_name = '',
        start_date = new Date().toLocaleDateString("en-CA"),
        end_date = '',
        notes = '',
        project_template = '',
    } = formProps ?? {}

    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()
    const [errorString, setErrorString] = useState<string>()
    const defaultManager = manager?.name ?? ""

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

    const templates = [
        { value: 'default', label: 'default' },
    ]

    useEffect(() => {
        const get_project_data = async () => {
            try {
                const response = await getDataForProjectCreation(start_date)

                console.log(response)
                if (!response) {
                    throw new Error("Error fetching project list")
                }

                setProjectManagers(response.users)

                const obj_client_names = response.client_names.map((value: string) => {
                    return { value: value, label: value }
                })
                const obj_cities = response.cities.map((value: string) => {
                    return { value: value, label: value }
                })
                setClients(obj_client_names)
                setCities(obj_cities)
            } catch (error) {
                console.error("Error fetching project list:", error)
                setErrorString("Error fetching project list: " + error)
            }
        }

        get_project_data()
    },[])

    // Disabled as long as we decide that we don't want to allow changing the start date
    // TODO: Remove this comment if we decide to allow changing the start date
    // const onDateStartChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = event.target.value
    //     setDateStart(value)

    //     try {
    //         const response = await getDataForProjectCreation(value)

    //         if (!response) {
    //             throw new Error("Error fetching project list")
    //         }
    //         const project_count = String(response.project_count + 1).padStart(3, "0")

    //         if (button_text != "Update Project") {
    //             setProjectID(value + "-" + project_count)
    //         }
    //     } catch (error) {
    //         console.error("Error fetching project list:", error)
    //         setErrorString("Error fetching project list: " + error)
    //     }
    // }

    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}

    <form id="project_creation" onSubmit={onSubmit}  method="post">
        <div className="flex flex-col gap-10 p-24 mx-auto max-w-screen-lg bg-zinc-50" >
            <div className="flex flex-row justify-center gap-5">
                <label htmlFor="project_id" className="py-2">Project ID:</label>
                <input defaultValue={project_id} className="bg-slate-200 rounded-md border-zinc-500 border" type="text" name="project_id"/>
                
                <label htmlFor="project_name" className="py-2" >Project Name:</label>
                <input defaultValue={project_name} className="bg-white border border-zinc-500 rounded-md focus:outline-none focus:ring focus:ring-orange-400" type="text" name="project_name" autoFocus required/>
            </div>
        
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="status" className="py-2">Project Status:</label>
                        <select defaultValue={status} name="status" className="bg-white rounded-md p-2 border border-zinc-500">
                            <option value={'ACTIVE'}>Active</option>
                            <option value={'COMPLETED'}>Completed</option>
                            <option value={'CANCELLED'}>Cancelled</option>
                            <option value={'NOT STARTED'}>Not Started</option>
                        </select>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="start_date" className="py-2">Date Created:</label>
                        <input defaultValue={start_date} className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="start_date" required/>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="end_date" className="py-2">Due Date:</label>
                        <input defaultValue={end_date} className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="end_date" required/>
                    </div>
                </div>

                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="manager" >Project Manager:</label>
                        {defaultManager && <SelectionComponentValue defaultValue={defaultManager} options={projectManagerListOptions} name="manager"/>}
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label >Client Name</label>
                        <CreateableSelectionComponent defaultValue={client_name} options={Clients} name="client_name"/>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-5">
                        <label >City</label>
                        <CreateableSelectionComponent defaultValue={city} options={Cities} name="city"/>
                    </div>
                </div>
            </div> 
            
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-row ">
                    <label htmlFor="folder_location" className="py-2">Folder Name:</label>
                    <input defaultValue={project_id} className="mx-2 p-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="text" name="folder_location" />
                </div>

                <div className="flex flex-row justify-between gap-5">
                    <label htmlFor="template" className="py-2">Template:</label>
                    <SelectionComponent defaultValue={project_template} options={templates} name="template"/>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <label  htmlFor="notes">Project Notes:</label>
                <textarea defaultValue={notes} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" placeholder="Enter notes or other details" name="notes"/>
            </div>

        </div>

        <BottomFormButton button_text="Update Project"/>

    </form>
    </>
    )
}

