import { useEffect, useMemo, useState } from "react";
import { Error_Component, Header, Route_Button } from "./misc";
import { createProject, getProjectList, getProject, updateProject, deleteProject } from "../api/projects";
import { useNavigate, useParams } from "react-router-dom";
import DataTable, { Direction, TableColumn } from "react-data-table-component";
import { FilterProps, ProjectFormProps, UpdateProjectProps } from "../interfaces/project_types";
import { getEmployeeNameList } from "../api/employee";
import CreatableSelect from "react-select/creatable";

/**
 * ### [Route for ('/create_project')]
 * 
 * This component shows a ProjectForm component to create a new project.
 */
export function CreateProject() {
    const [projectManagers, setProjectManagers] = useState<string[]>([])
    const [errorString, setErrorString] = useState<string>()
    const navigate = useNavigate()

    const onSubmit = async (event: any) => {
        event.preventDefault()

        const formData = new FormData(event.target)
        const data = Object.fromEntries(formData)

        console.log(data)

        try {
            await createProject(data)
            // Component that signals that a project has been created
            alert("Project created successfully!")
            navigate("/projects")
        } catch (error) {
            console.error("Error creating project:", error);
            setErrorString("Error creating project: " + error)
        }
    }

    useEffect(() => {
        const get_managers = async () => {
            try {
                const managers = await getEmployeeNameList()
                setProjectManagers(managers)
            } catch (error) {
                console.error("Error fetching managers:", error);
                setErrorString("Error fetching managers: " + error)
            }
        }

        get_managers()
    }, [])
    return (
        <>
            <Header />

            {errorString && <Error_Component errorString={errorString} />}

            <div className="justify-center mx-auto p-5">

                <h2>Create Project:</h2>

            </div>

            <ProjectForm button_text="Create Project" projectManagerList={projectManagers} onSubmit={onSubmit} />

        </>
    )
}

/**
 * ### [Route for ('/create_init')]
 * 
 * Asks the user is they want to use a temlate before designing their project.
 * 
 */
export function CreateProjectTemplateAsk( ){
    return (
    <>
        <Header />

        <h1 className="text-center">Start from a Template Project?</h1>

        <div className="flex flex-row justify-center m-5 gap-5">
            <Route_Button route="/projects/create_init" text="Start from Template" />
            <Route_Button route="/projects/create_project" text="Start from Scratch" />
        </div>

        <div className="flex flex-row justify-center m-5 gap-5">
            <Route_Button route="/main_menu" text="Main Menu" />
        </div>
    </>
    )
}

/**
 * ### [Route for ('/update_project')]
 * 
 * This component fetches a list of projects and shows them in a table.
 * 
 * TODO: 
 *  - Add a button to create a new project (so we can have one button in the Main Menu)
 *  - Add a search bar
 *  - Look for a custom component for the table that has search, sort, and pagination
 */
export function UpdateProjectList() {
    const [projectList, setProjectList] = useState<UpdateProjectProps[]>([])
    const [projectLoaded, setProjectLoaded] = useState<boolean>(false)

    useEffect(() => {
        // This is where the list of projects will be fetched
        const fetchProjects = async () => {
            try {
                const data: Array<UpdateProjectProps> = await getProjectList()
                
                setProjectList(data)
                setProjectLoaded(true)
            }
           catch (error) {
               console.error("Error fetching projects:", error);
               throw error; // Re-throw the error so the caller can handle it if needed
            }
        }

        fetchProjects()
    }, [])

    return(
        <>
            <Header />

            <ProjectUpdateTable projectList={projectList} projectLoaded={projectLoaded} />

            <div className="flex flex-row justify-center gap-3 m-2">
                <Route_Button route={"/main_menu"} text="Back"/>
            </div>
        </>
    )
}

/**
 * ### [Route for ('/update_project/id/:id')]
 * 
 *  This component shows a Form component to update an existing project.
 */
export function UpdateProject() {
    const { id } = useParams<string>()
    const [projectManager, setProjectManagers] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState<UpdateProjectProps>()
    const [errorString, setErrorString] = useState<string>()
    const [loading, setLoading] = useState<boolean>(true)
    const navigate = useNavigate()

    useEffect(() => {
        // We need to fetch a list of projects
        const project = async () => {
            if (!id) return

            try {
                const data = await getProject(id)
                const managers = await getEmployeeNameList()

                if (data.manager && !managers.includes(data.manager)) {
                    console.error("There's no mangaer with that name: ", data.manager)
                    console.error("We will automatically include it, but please create the employee before creating a project")

                    setErrorString("There is no manager in the database with that name. \n We will automatically include it, but please create the employee before creating a project.")
                    managers.push(data.manager)
                }

                setCurrentProject(data)
                setProjectManagers(managers)
                setLoading(false)
            } catch (error) {
                console.error("Error fetching project:", error);
                navigate("/*")
            }
        }

        project()
    }, [])

    const onSubmit = async(event: any) => {
        event.preventDefault()
        
        try {
            const form_data = new FormData(event.target)
            const data = Object.fromEntries(form_data)
            const response = await updateProject(data, id)

            switch (response) {
                case 200:
                    alert("Project updated successfully!")
                    navigate("/projects")
                    break;
                case 403:
                    setErrorString("Failed to update project. Error code: " + response + " Forbidden. Only the current project manager can update the project.")
                    break;
                case 404:
                    setErrorString("Failed to update project. Error code: " + response + " Not Found")
                    break;
                default:    
                    setErrorString("Failed to update project. Error code: " + response)
            }

        } catch (error) {
            console.error("Error updating project:", error);
            throw error; // Re-throw the error so the caller can handle it if needed
        }
    }

    return (
        <>
            <Header />

            {errorString && <Error_Component errorString={errorString} />}

            {loading ? <div>Loading...</div> 
            : 
            <ProjectForm button_text="Update Project" projectManagerList={projectManager} onSubmit={onSubmit} formProps={currentProject} />}
        </>
    )
}

/**
 *  ### [Route for ('/project_status_report/:id')]
 * 
 * This component shows the status of a project based on the project id.
 */
export function ProjectStatusReport() {
    // Maybe this is about showing the status of the project
    const { id } = useParams<string>()
    const [project, setProject] = useState<UpdateProjectProps>()

    useEffect(() => {
        const reponse = async () => {
            if (!id) return

            const data = await getProject(id)
            console.log(data)
            setProject(data)
        }

        reponse()
    }, [])

    return(
        <>
            <Header />

            <h1 className="mb-5">Project Status Report</h1>
            {project?.project_name}
        </>
    )
}

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
function ProjectForm(
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
                        <SelectionComponent defaultValue={manager} options={projectManagerListOptions} name="manager"/>
                    </div>

                    <div className="flex flex-row justify-between gap-5">
                        <label >Client Name</label>
                        <SelectionComponent defaultValue={client_name} options={customerNameOptions} name="client_name"/>
                    </div>
                    
                    <div className="flex flex-row justify-between gap-5">
                        <label >City</label>
                        <SelectionComponent defaultValue={city} options={cityOptions} name="city"/>
                    </div>
                </div>
            </div> 
            
            <div className="flex flex-row gap-5 justify-between">
                <div className="flex flex-row ">
                    <label htmlFor="folder_location" className="py-2">Folder Name:</label>
                    <input defaultValue={folder_location} className="mx-2 p-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" type="text" name="folder_location" />
                </div>

                <div title="This will send an email to any project manager(s) assigned to the project. If the user is one of the project managers, they will not receive an email.">
                    <label htmlFor="notify_manager" className="py-2" >Notify Manager(s):</label>
                    <input type="checkbox" name="notify_manager" className="mx-2 bg-slate-200 border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" />
                </div>
            </div>

            <div className="flex flex-col ">
                <label htmlFor="project_files">(Optional): Upload Project Files</label>
                <input type="file" id="project_files" name="project_files"/>
            </div>

            <div className="flex flex-col gap-5">
                <label  htmlFor="notes">Project Notes:</label>
                <textarea defaultValue={notes} className="bg-white border rounded-md border-zinc-500 focus:outline-none focus:ring focus:ring-orange-400" placeholder="Enter notes or other details" name="description"/>
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

type SelectionComponentProps = {
    defaultValue: string,
    multiple?: boolean,
    options: { value: string, label: string }[] | undefined,
    name: string    
}
function SelectionComponent({defaultValue = '', multiple, options, name}: SelectionComponentProps){
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


/**
 * Helper Component for ProjectUpdateTable
 * 
 * This is the filter bar at the top of the table
 * 
 * At some point, we'll implement the vector search here maybe
 */
const FilterComponent = ({ filterText, onFilter, onClear }: FilterProps) => (
    <>
        <input
         id="search"
         type="text"
         placeholder="Filter..."
         aria-label="Search input"
         value={filterText}
         onChange={onFilter}
         className="bg-slate-100 px-4 py-2"
         />

        <button className="bg-orange-200 rounded px-4 py-2 ml-5 transition hover:bg-orange-300" type="button" onClick={onClear}>
            X
        </button>
    </>
)

/**
 * A Component that shows when the user clicks on a row on the table.
 * 
 * This is where the description of the project will be stored
 * 
 * But also I want buttons to see a report or edit the project
 * 
 * @param param0 data The props of a give row
 * 
 */
const ExpandableRowComponent = ({ data }: { data: UpdateProjectProps }) => (
    <div className="flex flex-col gap-5 bg-slate-50">
        
        <div className="p-5 flex flex-row gap-5">

            <div>
                <h3>Description:</h3>
                {data.notes && <p>{data.notes}</p>}
            </div>

            <div>
                <h3>Tasks:</h3>
                <p>(This is where ongoing tasks come in)</p>
            </div>

        </div>

        <div className="flex flex-row gap-5 m-5">
            <Route_Button route={"/projects/update_project/" + data.project_id} text="Edit"/>
            <Route_Button route={"/projects/project_status_report/" + data.project_id} text="Report"/>
            <Route_Button route="/main_menu" text="Open Folder"/>
            <Route_Button route={"/create_template"} text="Create Template"/>
            <Route_Button route={"/projects/delete/" + data.project_id} text="Delete" isDelete/>
        </div>

    </div>
)

/**
 * The Table Component that lists the projects
 * 
 * Features sorting by any field, and filtering by Project Name currently.
 * 
 * @param param0 projectList - List of projects 
 * @param param1 projectLoaded - Boolean to check if projects have been loaded
 */
function ProjectUpdateTable({ projectList, projectLoaded }: { projectList: UpdateProjectProps[], projectLoaded: boolean }) {
    const [filterText, setFilterText] = useState<string>('')
    const [resetPaginationToggle, setResetPaginationToggle] = useState<boolean>(false)

    const filteredProjects: UpdateProjectProps[] = projectList.filter(item => item.project_name.toLowerCase().includes(filterText.toLowerCase()))

    // Column Names
    const columns: TableColumn<UpdateProjectProps>[] = [
        { name: "Project ID", selector: row => row.project_id, sortable: true },
        { name: "Project Name", selector: row => row.project_name, sortable: true },
        { name: "Project Manager", selector: row => row.manager, sortable: true },
        { name: "Status", selector: row => row.status, sortable: true },
        { name: "Customer", selector: row => row.client_name, sortable: true },
        { name: "City", selector: row => row.city, sortable: true },
        { name: "Date Created", selector: row => row.start_date, sortable: true },
        { name: "Date Ended", selector: row => row.end_date, sortable: true },
        { name: "Folder Location", selector: row => row.folder_location, sortable: true },
    ]

    // For the filter function
    const filterSearchBox = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('')
            }
        }

        return (
            <FilterComponent onFilter={(e: any) => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />

        )
    }, [filterText, resetPaginationToggle])

    return(
        <DataTable
        title="Project List"
        columns={columns}
        data={filteredProjects}
        direction={Direction.AUTO}
        progressPending={!projectLoaded}
        subHeaderComponent={filterSearchBox}
        expandableRowsComponent={ExpandableRowComponent}
        paginationResetDefaultPage={resetPaginationToggle}
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
 * Delete Confirmation Page for Projects
 * 
 * Need to make have a sort of backup before deleting the project
 * or have multiple confirmation pages
 * 
 */
export function ProjectDeleteConfimation() {
    const { id } = useParams<string>();
    const navigate = useNavigate();

    const handleClick = async() => {
        await deleteProject(id);
        navigate("/projects");
    }
    return (
        <>
        <Header />

        <div className="p-20 text-center">
            <p>Are you sure you want to delete this project?</p>

            <div className="flex flex-row justify-center gap-5">
                <Route_Button route="/projects/" text="Back" />
                <button className="bg-red-300 rounded p-4 my-2 hover:bg-red-400 transition" onClick={handleClick}>Yes</button>
            </div>
        </div>
        </>

    )
}
