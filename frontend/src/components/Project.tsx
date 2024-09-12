import { useEffect, useMemo, useState } from "react";
import { Error_Component, Header } from "./misc";
import { createProject, getProjectList, getProject, updateProject, deleteProject } from "../api/projects";
import { useNavigate, useParams } from "react-router-dom";
import DataTable, { Direction, TableColumn } from "react-data-table-component";
import { FilterProps, UpdateProjectProps } from "../interfaces/project_types";
import { getEmployeeNameList } from "../api/employee";
import { ProjectForm } from "./ProjectForm";
import { Route_Button } from "./Buttons";

/**
 * ### [Route for ('/create_project')]
 * 
 * This component shows a ProjectForm component to create a new project.
 */
export function CreateProject() {
    const [errorString, setErrorString] = useState<string>()
    const navigate = useNavigate()

    const onSubmit = async (event: any) => {
        event.preventDefault()

        const formData = new FormData(event.target)
        const data = Object.fromEntries(formData)

        if (data.notify_manager === "on") {
            const to = data.manager // Change this so that it's the user's email
            const subject = "New Project (" + data.project_name + ") Assigned to you"
            const body = "You have been assigned a new project, " + data.project_name + ". Please check it out."

            const mail_url = `mailto:${encodeURIComponent(String(to))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

            window.location.href = mail_url
        }

        try {
            setErrorString(undefined)
            const result_code = await createProject(data)
            
            console.log(data)
            console.log(result_code)

            // Error handling
            switch (result_code) {
                case 201:
                    alert("Project created successfully!")
                    navigate("/projects")
                    break
                case 400:
                    setErrorString("Bad Request: Invalid data. Please make sure all fields are filled out. Error: " + result_code)
                    break
                case 403:
                    setErrorString("Forbidden: You are not authorized to create projects. Error: " + result_code)
                    break
                default:
                    throw new Error("Error creating project: " + result_code)
            }

        } catch (error: unknown) {
            console.error("Something went wrong: ", error)
            setErrorString("Error 500")
        }
    }

    return (
        <>
            <Header />

            {errorString && <Error_Component errorString={errorString} />}

            <div className="justify-center mx-auto p-5">

                <h2>Create Project:</h2>

            </div>

            <ProjectForm button_text="Create Project" onSubmit={onSubmit} />

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
    /**
     * TODO:
     * - Make the page printable
     */
    const [project, setProject] = useState<UpdateProjectProps[]>()
    const [manager, setManagers] = useState<string[]>([])

    useEffect(() => {
        const get_data = async () => {
            const response = await getProjectList()

            if (!response) {
                throw new Error("Error fetching project list")
            }

            const unique_managers = [...new Set(response.map(project => project.manager))]

            setManagers(unique_managers)
            
            setProject(response)
        }


        get_data()
    }, [])

    return(
        <>
            <Header />

            <h1 className="mb-5 px-2">Project Status Report</h1>

            {project && project.length === 0 && <h1 className="flex justify-center py-2">No projects found</h1>}

            {manager && manager.map(manager => 
            <div key={manager} className="my-5">
                <h4 className="px-2">Total Projects: {project && project.filter(project => project.manager === manager).length}</h4>
                <div className="grid grid-cols-5 p-4 border-b-2 bg-slate-50">
                    <h3>{manager}</h3>
                    <h3>Project ID</h3>
                    <h3>Project Name</h3>
                    <h3>Client Name</h3>
                    <h3>On-Going Status</h3>
                </div>

                <div>
                    {project && project.filter(project => project.manager === manager).map(project => 
                    <div key={project.project_id} className="grid grid-cols-5 px-2 py-4 hover:bg-slate-100 transition border-b">
                        <div>
                            
                        </div>
                        <div>
                            {project && project.project_id}
                        </div>
                        <div>
                            {project && project.project_name}
                        </div>
                        <div>
                            {project && project.client_name}
                        </div>
                        <div>
                            {project && project.notes}
                        </div>
                    </div>
                    )}
                </div>
            </div>
            )}

            <div className="flex justify-center">
                <Route_Button route="/main_menu" text="Back to Projects" />
            </div>
        </>
    )
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
