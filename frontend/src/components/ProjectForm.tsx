import { useEffect, useState } from "react"
import { ProjectProps } from "../interfaces/project_types"
import { getDataForProjectCreation } from "../api/projects";
import { CreateableSelectionComponent, SelectionComponent, BottomFormButton } from "./Buttons";
import { Error_Component } from "./misc";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { useProjectFormHandler } from "../hooks/projectFormHandler";

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
export function ProjectFormCreation() { 
    const { user } = useAuth()
    const navigate = useNavigate()

    if (!user) {
        return <Error_Component errorString="User not found" />
    }
    
    const [currentProjectData, setCurrentProjectData] = useState<ProjectProps>({
        project_id: "",
        project_name: "",
        status: "ACTIVE",
        start_date: new Date().toLocaleDateString("en-CA"),
        end_date: "",
        manager: user,
        city: "",
        description: "",
        client_name: "",
        folder_location: "",
        project_template: "",
    })

    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()

    const [errorString, setErrorString] = useState<string>()

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

    const templates = [
        { value: 'default', label: 'default' },
    ]

    const { onSubmit, onDateStartChange, onManagerChange, onClientChange, onCityChange } = useProjectFormHandler(setCurrentProjectData, navigate, setErrorString, "POST", user)

    useEffect(() => {
        const get_project_data = async () => {
            try {
                const DateStart = currentProjectData.start_date

                const response = await getDataForProjectCreation(DateStart)

                if (!response) {
                    throw new Error("Error fetching project list")
                }

                const project_count = String(response.project_count + 1).padStart(3, "0") 

                const date_start = DateStart.split('-')[0] + '-' + DateStart.split('-')[1]
                setCurrentProjectData(prev => ({...prev, project_id: date_start + "-" + project_count}))
                
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

    return (
    <>
    {errorString && <Error_Component errorString={errorString} />}

    <ProjectFormBase 
        currentProjectData={currentProjectData} 
        projectManagerListOptions={projectManagerListOptions} 
        Clients={Clients ?? []} 
        Cities={Cities ?? []} 
        templates={templates} 
        onSubmit={onSubmit} 
        onDateStartChange={onDateStartChange} 
        onManagerChange={onManagerChange} 
        onClientChange={onClientChange} 
        onCityChange={onCityChange} 
    />
    </>
    )
}

export function ProjectFormUpdate(
    {formProps}: {formProps?: ProjectProps}
) { 
    const { user } = useAuth()

    if (!user) {
        return <Error_Component errorString="User not found" />
    }

    if (!formProps) {
        return <Error_Component errorString="Project not found" />
    }

    const navigate = useNavigate()

    const [currentProjectData, setCurrentProjectData] = useState<ProjectProps>(formProps)

    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()
    const [errorString, setErrorString] = useState<string>()

    const { onSubmit, onDateStartChange, onManagerChange, onClientChange, onCityChange } = useProjectFormHandler(setCurrentProjectData, navigate, setErrorString, "PUT", user)

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

    const templates = [
        { value: 'default', label: 'default' },
    ]

    useEffect(() => {
        const get_project_data = async () => {
            try {
                const response = await getDataForProjectCreation(currentProjectData.start_date)

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

    <ProjectFormBase
        currentProjectData={currentProjectData} 
        projectManagerListOptions={projectManagerListOptions} 
        Clients={Clients ?? []} 
        Cities={Cities ?? []} 
        templates={templates} 
        onSubmit={onSubmit} 
        onDateStartChange={onDateStartChange} 
        onManagerChange={onManagerChange} 
        onClientChange={onClientChange} 
        onCityChange={onCityChange} 
    />
    </>
    )
}

type ProjectFormBaseProps = {
    currentProjectData: ProjectProps
    projectManagerListOptions: { value: string, label: string }[]
    Clients: { value: string, label: string }[]
    Cities: { value: string, label: string }[]
    templates: { value: string, label: string }[]
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    onDateStartChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onManagerChange: (e: unknown) => void
    onClientChange: (e: unknown) => void
    onCityChange: (e: unknown) => void
}

function ProjectFormBase({ currentProjectData, projectManagerListOptions, Clients, Cities, templates, onSubmit, onDateStartChange, onManagerChange, onClientChange, onCityChange }: ProjectFormBaseProps) {
    return (
        <form id="project_creation" onSubmit={onSubmit}  method="post">
        <div className="flex flex-col gap-10 p-24 mx-auto max-w-screen-lg bg-zinc-50" >
            <div className="flex flex-row justify-center gap-5">
                <label htmlFor="project_id" className="py-2">Project ID:</label>
                <input defaultValue={currentProjectData.project_id} className="bg-slate-200 rounded-md border-zinc-500 border" type="text" name="project_id"/>
                
                <label htmlFor="project_name" className="py-2" >Project Name:</label>
                <input className="bg-white border border-zinc-500 rounded-md focus:outline-none focus:ring focus:ring-orange-400" type="text" defaultValue={currentProjectData.project_name} name="project_name" autoFocus required/>
            </div>
        
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="status" className="py-2">Project Status:</label>
                        <select name="status" className="bg-white rounded-md p-2 border border-zinc-500">
                            <option value={'ACTIVE'}>Active</option>
                            <option value={'COMPLETED'}>Completed</option>
                            <option value={'CANCELLED'}>Cancelled</option>
                            <option value={'NOT STARTED'}>Not Started</option>
                        </select>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="start_date" className="py-2">Date Created:</label>
                        <input value={currentProjectData.start_date} onChange={onDateStartChange} className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="start_date" required/>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="end_date" className="py-2">Due Date:</label>
                        <input className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="end_date" required/>
                    </div>
                </div>

                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="manager" >Project Manager:</label>
                        {currentProjectData.manager.name && <SelectionComponent defaultValue={currentProjectData.manager.name} options={projectManagerListOptions} onChange={onManagerChange} name="manager"/>}
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label >Client Name</label>
                        <CreateableSelectionComponent options={Clients} name="client_name" defaultValue={currentProjectData.client_name} onChange={onClientChange}/>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-5">
                        <label >City</label>
                        <CreateableSelectionComponent defaultValue={currentProjectData.city} options={Cities} name="city" onChange={onCityChange}/>
                    </div>
                </div>
            </div> 
            
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-row ">
                    <label htmlFor="folder_location" className="py-2">Folder Name:</label>
                    <input defaultValue={currentProjectData.project_id} className="mx-2 p-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="text" name="folder_location" />
                </div>

                <div className="flex flex-row justify-between gap-5">
                    <label htmlFor="template" className="py-2">Template:</label>
                    <SelectionComponent options={templates} name="template"/>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <label  htmlFor="description">Project description:</label>
                <textarea defaultValue={""} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" placeholder="Enter description or other details" name="description"/>
            </div>

            <div title="If you are the project managers assigned to this project, you will not receive an email.">
                <label htmlFor="notify_manager" className="py-2" >Notify Manager:</label>
                <input type="checkbox" name="notify_manager" className="mx-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" defaultChecked />
            </div>
        </div>

        <BottomFormButton button_text="Create Project"/>

    </form>
    )
}
