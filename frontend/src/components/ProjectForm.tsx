import { useState } from "react"
import { ProjectFormProps } from "../interfaces/project_types"
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

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
    {button_text, projectManagerList, onSubmit, formProps}: ProjectFormProps
) { 
    const {
        project_id = '',
        project_name = '',
        manager = '',
        city = '',
        quarter = 'Q1',
        status = 'ACTIVE',
        client_name = '',
        start_date = new Date().toLocaleDateString("en-CA"),
        end_date = '',
        notes = '',
        folder_location = '',
        project_template = '',
    } = formProps ?? {}

    const cityOptions = [
        { value: 'San Diego', label: 'San Diego' },
        { value: 'Los Angeles', label: 'Los Angeles' },
        { value: 'San Francisco', label: 'San Francisco' },
        { value: 'Oakland', label: 'Oakland' },
    ]

    const [ProjectID, setProjectID] = useState(project_id)

    const projectManagerListOptions = projectManagerList?.map((value: string) => {
        return { value: value, label: value }
    })

    const customerNameOptions = [
        { value: 'Client 1', label: 'Client 1' },
        { value: 'Client 2', label: 'Client 2' },
    ]

    const templates = [
        { value: 'default', label: 'default' },
    ]

    const onProjectIDChange = (event: any) => {
        setProjectID(event.target.value)
    }

    // Change the project ID to the first two letters of the project name
    const onProjectNameChange = (event: any) => {
        let project_name_local: string = event.target.value.toUpperCase()
        let project_name_split = project_name_local.split(" ")
        let project_name_final = (project_name_split ? project_name_split[0].charAt(0) : "") + (project_name_split.length > 1 ? project_name_split[1].charAt(0) : "")
        setProjectID(project_name_final)
    }

    const onQuarterChange = (event: any) => {
        setProjectID(event.target.value)
    }

    return (
    <>
    <form id="project_creation" onSubmit={onSubmit}  method="post">
        <div className="flex flex-col gap-10 p-24 mx-auto max-w-screen-lg bg-zinc-50" >
            <div className="flex flex-row justify-center gap-5">
                <label className="py-2">Project ID:</label>
                <input onChange={onProjectIDChange} value={ProjectID} className="bg-slate-200 rounded-md border-zinc-500 border" type="text" name="project_id" />
                
                <label htmlFor="project_name" className="py-2" >Project Name:</label>
                <input defaultValue={project_name} onChange={onProjectNameChange} className="bg-white border border-zinc-500 rounded-md focus:outline-none focus:ring focus:ring-orange-400" type="text" name="project_name" autoFocus required/>

                <label className="py-2">Quarter:</label>
                <select onChange={onQuarterChange} defaultValue={quarter} name="quarter" className="bg-white p-2 rounded-md border border-zinc-500">
                    <option value={'Q1'}>Q1</option>
                    <option value={'Q2'}>Q2</option>
                    <option value={'Q3'}>Q3</option>
                    <option value={'Q4'}>Q4</option>
                </select>


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
                        <CreateableSelectionComponent defaultValue={manager} options={projectManagerListOptions} name="manager"/>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label >Client Name</label>
                        <CreateableSelectionComponent defaultValue={client_name} options={customerNameOptions} name="client_name"/>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-5">
                        <label >City</label>
                        <CreateableSelectionComponent defaultValue={city} options={cityOptions} name="city"/>
                    </div>
                </div>
            </div> 
            
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-row ">
                    <label htmlFor="folder_location" className="py-2">Folder Name:</label>
                    <input defaultValue={folder_location} className="mx-2 p-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="text" name="folder_location" />
                </div>


                <div className="flex flex-row justify-between gap-5">
                    <label htmlFor="template" className="py-2">Template:</label>
                    <SelectionComponent defaultValue={project_template} options={templates} name="template"/>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <label  htmlFor="notes">Project Notes:</label>
                <textarea defaultValue={notes} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" placeholder="Enter notes or other details" name="description"/>
            </div>

            <div title="This will send an email to any project manager(s) assigned to the project. If the user is one of the project managers, they will not receive an email.">
                <label htmlFor="notify_manager" className="py-2" >Notify Manager(s):</label>
                <input type="checkbox" name="notify_manager" className="mx-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" />
            </div>
        </div>

        {button_text === "Create Project" ? 
        <BottomFormButton button_text={button_text} route_back="/main_menu"/>
        :
        <BottomFormButton button_text={button_text} route_back="/projects/"/>}

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
function BottomFormButton({ button_text, route_back }: { button_text: string, route_back: string }) {
    const navigate = useNavigate();
    return (
    <div className="mx-auto text-center justify-center pt-5">

        <button className='bg-orange-300 rounded p-4' onClick={() =>navigate(route_back)}>Back</button>
        
        <button type="submit" className="bg-orange-300 rounded p-4 ml-5">
            {button_text}
        </button>

    </div>
    );
}

type SelectionComponentProps = {
    defaultValue: string,
    multiple?: boolean,
    options: { value: string, label: string }[] | undefined,
    name: string    
}

function CreateableSelectionComponent({defaultValue = '', multiple, options, name}: SelectionComponentProps){
    if (!options) {
        options = [{value: '', label: ''}];
    }

    return (
        <CreatableSelect defaultInputValue={defaultValue} options={options} name={name} placeholder="Search" isMulti={multiple} isClearable 
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

    return (
        <Select defaultInputValue={defaultValue} options={options} name={name} placeholder="Search" isMulti={multiple} isClearable 
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