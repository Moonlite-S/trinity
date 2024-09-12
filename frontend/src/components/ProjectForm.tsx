import { useEffect, useState } from "react"
import { ProjectFormProps, SelectionComponentProps } from "../interfaces/project_types"
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { getDataForProjectCreation } from "../api/projects";
import { Back_Button, Error_Component } from "./misc";

/**
 * This component shows the user the form to create a new project.
 * 
 * @param FormProps : ( see type FormProps )  
 * 
 * TODO:
 *  - Project Managers can now have more than one manager [FIX THIS IN THE BACKEND]
 *  - Folder Name might just be the same for Project ID
 *  - REFACTOR THIS IN AN EASIER WAY (NO PROP DRILLING)
 *  - Email the Project Manager(s) when a new project is created
 * 
 */
export function ProjectForm(
    {button_text, onSubmit, formProps}: ProjectFormProps
) { 
    const {
        project_id = '',
        project_name = '',
        manager = '',
        city = '',
        status = 'ACTIVE',
        client_name = '',
        start_date = new Date().toLocaleDateString("en-CA"),
        end_date = '',
        notes = '',
        project_template = '',
    } = formProps ?? {}

    const [ProjectID, setProjectID] = useState(project_id)
    const [ProjectManagers, setProjectManagers] = useState<string[]>([])
    const [Clients, setClients] = useState<{ value: string, label: string }[] | undefined>()
    const [Cities, setCities] = useState<{ value: string, label: string }[] | undefined>()
    const [DateStart, setDateStart] = useState(start_date)
    const [defaultManager, setDefaultManager] = useState<string>(manager)
    const [errorString, setErrorString] = useState<string>()

    const projectManagerListOptions = ProjectManagers?.map((value: string) => {
        return { value: value, label: value }
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

                if (button_text === "Create Project") {
                    setProjectID(start_date + "-" + project_count)
                    setDefaultManager(response.current_user)
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

    const onDateStartChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setDateStart(value)

        try {
            const response = await getDataForProjectCreation(value)

            if (!response) {
                throw new Error("Error fetching project list")
            }
            const project_count = String(response.project_count + 1).padStart(3, "0")

            if (button_text != "Update Project") {
                setProjectID(value + "-" + project_count)
            }
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
                        <input value={DateStart} onChange={onDateStartChange} className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="start_date" required/>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="end_date" className="py-2">Due Date:</label>
                        <input defaultValue={end_date} className="bg-white border rounded-md p-2 border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="date" name="end_date" required/>
                    </div>
                </div>

                <div className="flex flex-col gap-5 justify-between">
                    <div className="flex flex-row justify-between gap-5">
                        <label htmlFor="manager" >Project Manager:</label>
                        {defaultManager && <CreateableSelectionComponent defaultValue={defaultManager} options={projectManagerListOptions} name="manager"/>}
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
                    <input defaultValue={ProjectID} className="mx-2 p-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="text" name="folder_location" />
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

            {button_text === "Create Project" && 
            <div title="If you are the project managers assigned to this project, you will not receive an email.">
                <label htmlFor="notify_manager" className="py-2" >Notify Manager(s):</label>
                <input type="checkbox" name="notify_manager" className="mx-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" defaultChecked />
            </div>}
        </div>

        <BottomFormButton button_text={button_text}/>

    </form>
    </>
    )
}

/**
 * For use in both the CreateProjectForm and UpdateProjectForm components
 *  
 * There are two buttons: One that goes back to the main menu and one that creates or updates a project
 * 
 * @params button_text The text of the second button (Either "Create Project" or "Update Project")
 * @params route The route of the back button (Either "/main_menu" or "/update_project")
 * This is usually either "Create Project" or "Update Project"
 */
export function BottomFormButton({ button_text }: { button_text: string}) {
    return (
    <div className="mx-auto text-center justify-center pt-5">

        <Back_Button/>
        
        <button type="submit" className="bg-orange-300 rounded p-4 ml-5">
            {button_text}
        </button>

    </div>
    );
}

function CreateableSelectionComponent({defaultValue = '', multiple, options, name}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
    }
        
    const defaultOption = options.find((option) => option.value === defaultValue)
    // Sets default to the defaultOption if it exists
    // if not, uses DefaultValue
    const selectDefaultValue = defaultOption
        ? defaultOption
        : {value: defaultValue, label: defaultValue}

    return (
        <CreatableSelect defaultValue={selectDefaultValue} options={options} name={name} placeholder="Search" isMulti={multiple} isClearable 
        styles = {{
            control: (baseStyles: any, state: any) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'orange' : 'gray',
                boxShadow: state.isFocused ? '0 0 0 2px orange' : 'none',
                '&:hover': {
                    borderColor: state.isFocused ? 'orange' : 'gray',
                },
            }),
            option: () => ({
                padding: '5px 10px',
                rounded: '5px',
                '&:hover': {
                    backgroundColor: '#cacacc',
                },
            })
        }}/>
    )
}

function SelectionComponent({defaultValue = '', multiple, options, name}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
    }

    const defaultOption = options.find((option) => option.value === defaultValue)

    // Sets default to the defaultOption if it exists
    // if not, uses DefaultValue
    const selectDefaultValue = defaultOption
        ? defaultOption
        : {value: defaultValue, label: defaultValue}
    return (
        <Select defaultValue={selectDefaultValue} options={options} name={name} placeholder="Search" isMulti={multiple} isClearable 
        styles = {{
            control: (baseStyles: any, state: any) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'orange' : 'gray',
                boxShadow: state.isFocused ? '0 0 0 2px orange' : 'none',
                '&:hover': {
                    borderColor: state.isFocused ? 'orange' : 'gray',
                },
            }),
            option: () => ({
                padding: '5px 10px',
                rounded: '5px',
                '&:hover': {
                    backgroundColor: '#cacacc',
                },
                
            })

        }}/>
    )
}