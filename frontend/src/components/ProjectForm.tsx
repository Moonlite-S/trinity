import { useEffect, useState } from "react"
import { ProjectFormBaseProps, ProjectProps } from "../interfaces/project_types"
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
        template: "",
    })

    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [errorString, setErrorString] = useState<string>()

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

    const templates = [
        { value: 'default', label: 'default' },
    ]

    const { onSubmit, onDateStartChange, onManagerChange, onClientChange, onCityChange } = useProjectFormHandler(setCurrentProjectData, navigate, setErrorString, "POST")

    useEffect(() => {
        const get_project_data = async () => {
            try {
                setIsLoading(true)

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
        setIsLoading(false)
    },[])

    if (isLoading){
        return <h1>Loading...</h1>
    }

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
        method="POST"
    />
    </>
    )
}

export function ProjectFormUpdate(
    {formProps}: {formProps: ProjectProps}
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

    const { onSubmit, onDateStartChange, onManagerChange, onClientChange, onCityChange } = useProjectFormHandler(setCurrentProjectData, navigate, setErrorString, "PUT")

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
        method="PUT"
    />
    </>
    )
}

function ProjectFormBase({ currentProjectData, projectManagerListOptions, Clients, Cities, templates, onSubmit, onDateStartChange, onManagerChange, onClientChange, onCityChange, method }: ProjectFormBaseProps) {
    return (
        <form data-testid="project_creation" id="project_creation" onSubmit={onSubmit}  method="post">
        <div className="flex flex-col gap-10 p-24 mx-auto max-w-screen-lg bg-zinc-50" >
            <div className="flex flex-row justify-center gap-5">
                <label htmlFor="project_id" className="py-2">Project ID:</label>
                <input id="project_id" defaultValue={currentProjectData.project_id} className="bg-slate-200 rounded-md border-zinc-500 border" type="text" name="project_id"/>
                
                <label htmlFor="project_name" className="py-2" >Project Name:</label>
                <input id="project_name" className="bg-white border border-zinc-500 rounded-md focus:outline-none focus:ring focus:ring-orange-400" type="text" defaultValue={currentProjectData.project_name} name="project_name" autoFocus required/>
            </div>
        
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="status" className="py-2">Project Status:</label>
                        <select id="status" defaultValue={currentProjectData.status} name="status" className="bg-white rounded-md p-2 border border-zinc-500">
                            <option value={'ACTIVE'}>Active</option>
                            <option value={'COMPLETED'}>Completed</option>
                            <option value={'CANCELLED'}>Cancelled</option>
                            <option value={'NOT STARTED'}>Not Started</option>
                        </select>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="start_date" className="py-2">Date Created:</label>
                        <input id="start_date" value={currentProjectData.start_date} onChange={onDateStartChange} className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="start_date" required/>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="end_date" className="py-2">Due Date:</label>
                        <input id="end_date" className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="end_date" defaultValue={currentProjectData.end_date} required/>
                    </div>
                </div>

                <div className="flex flex-col gap-5 justify-between">
                    <SelectionComponent label="Project Manager" Value={currentProjectData.manager.name} options={projectManagerListOptions} onChange={onManagerChange} name="manager"/>
                    <CreateableSelectionComponent label="Client Name" options={Clients} name="client_name" Value={currentProjectData.client_name} onChange={onClientChange}/>
                    <CreateableSelectionComponent label="City" Value={currentProjectData.city} options={Cities} name="city" onChange={onCityChange}/>
                </div>
            </div> 
            
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-row ">
                    <label htmlFor="folder_location" className="py-2">Folder Name:</label>
                    <input id="folder_location" defaultValue={currentProjectData.project_id} className="mx-2 p-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="text" name="folder_location" />
                </div>

                <SelectionComponent label="Template" options={templates} name="template"/>
            </div>

            <div className="flex flex-col gap-5">
                <label htmlFor="description">Project description:</label>
                <textarea id="description" className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" placeholder="Enter description or other details" defaultValue={currentProjectData.description} name="description"/>
            </div>
        </div>

        <BottomFormButton button_text={method === "POST" ? "Create Project" : "Update Project"}/>

    </form>
    )
}
