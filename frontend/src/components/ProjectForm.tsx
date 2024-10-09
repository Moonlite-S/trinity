import { useEffect, useState } from "react"
import { ProjectFormBaseProps, ProjectProps } from "../interfaces/project_types"
import { getDataForProjectCreation } from "../api/projects";
import { CreateableSelectionComponent, SelectionComponent, BottomFormButton } from "./Buttons";
import { Error_Component } from "./misc";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { useProjectFormHandler } from "../hooks/projectFormHandler";
import { GenericForm, GenericInput, GenericSelect, GenericTextArea } from "./GenericForm";

const templates = [
    'default'
]

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
        template: "",
        folder_location: "",
    })

    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [errorString, setErrorString] = useState<string>()

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

    const { onSubmit, onManagerChange, onClientChange, onCityChange } = useProjectFormHandler(setCurrentProjectData, currentProjectData, navigate, setErrorString, "POST")

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

    const { onSubmit, onManagerChange, onClientChange, onCityChange } = useProjectFormHandler(setCurrentProjectData, currentProjectData, navigate, setErrorString, "PUT")

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value[1], label: value[0] }
    })

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
        onManagerChange={onManagerChange} 
        onClientChange={onClientChange} 
        onCityChange={onCityChange} 
        method="PUT"
    />
    </>
    )
}

function ProjectFormBase({ currentProjectData, projectManagerListOptions, Clients, Cities, templates, onSubmit, onManagerChange, onClientChange, onCityChange, method }: ProjectFormBaseProps) {
    return (
        <GenericForm form_id="project_creation" onSubmit={onSubmit}>
            <GenericInput label="Project Name" value={currentProjectData.project_name} type="text" name="project_name"/>
            <div className="grid grid-cols-2 gap-4">
                <GenericInput label="Date Created" value={currentProjectData.start_date} type="date" name="start_date"/>
                <GenericInput label="Date Due" value={currentProjectData.end_date} type="date" name="end_date"/>
            </div> 
            <div className="grid grid-cols-3 gap-4">
                <SelectionComponent label="Project Manager" Value={currentProjectData.manager.name} options={projectManagerListOptions} onChange={onManagerChange} name="manager"/>
                <CreateableSelectionComponent label="Client Name" options={Clients} name="client_name" Value={currentProjectData.client_name} onChange={onClientChange}/>
                <CreateableSelectionComponent label="City" Value={currentProjectData.city} options={Cities} name="city" onChange={onCityChange}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <GenericSelect label="Project Status" value={currentProjectData.status} options={["ACTIVE", "COMPLETED", "CANCELLED", "NOT STARTED"]} name="status" />
                <GenericSelect label="Template" value={currentProjectData.template} options={templates} name="template" />
            </div>
            <GenericTextArea label="Project Description" value={currentProjectData.description} name="description" />
            <BottomFormButton button_text={method === "POST" ? "Create Project" : "Update Project"}/>
        </GenericForm>
    )
}
