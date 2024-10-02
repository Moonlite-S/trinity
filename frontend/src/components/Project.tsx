/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Header } from "./misc";
import { getProjectList, getProject, deleteProject } from "../api/projects";
import { useNavigate, useParams } from "react-router-dom";
import DataTable, { Direction, TableColumn } from "react-data-table-component";
import { ProjectFilterProps, ProjectProps } from "../interfaces/project_types";
import { ProjectFormCreation, ProjectFormUpdate } from "./ProjectForm";
import { Route_Button } from "./Buttons";
import { filterTasksByProject } from "../api/tasks";
import { SubmittalProps } from "../interfaces/submittal_types";

/**
 * ### [Route for ('/create_project')]
 * 
 * This component shows a ProjectForm component to create a new project.
 * 
 */
export function CreateProject() {
    //const [errorString, setErrorString] = useState<string>()

    return (
        <>
            <Header />

            {/* {errorString && <Error_Component errorString={errorString} />} */}

            <div className="justify-center mx-auto p-5">

                <h2>Create Project:</h2>

            </div>

            <ProjectFormCreation/>

        </>
    )
}

/**
 * ### [Route for ('/update_project')]
 * 
 * This component fetches a list of projects and shows them in a table.
 * 
 */
export function UpdateProjectList() {
    const [projectList, setProjectList] = useState<ProjectProps[]>([])
    const [projectLoaded, setProjectLoaded] = useState<boolean>(false)

    useEffect(() => {
        // This is where the list of projects will be fetched
        const fetchProjects = async () => {
            try {
                const data: Array<ProjectProps> = await getProjectList()
                
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
    if (!id) return <div>Loading...</div>

    const [currentProject, setCurrentProject] = useState<ProjectProps>()
    const [loading, setLoading] = useState<boolean>(true)
    const navigate = useNavigate()

    useEffect(() => {
        // We need to fetch a list of projects
        const project = async () => {

            try {
                const data = await getProject(id)

                setCurrentProject(data)

                setLoading(false)
            } catch (error) {
                console.error("Error fetching project:", error);
                navigate("/*")
            }
        }

        project()
    }, [id, navigate])

    return (
        <>
            <Header />

            {loading ? <div>Loading...</div> 
            : 
            currentProject && <ProjectFormUpdate formProps={currentProject} />}
            
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
    const [project, setProject] = useState<ProjectProps[]>()
    const [managers, setManagers] = useState<string[]>([])

    useEffect(() => {
        const get_data = async () => {
            const response = await getProjectList()

            if (!response) {
                throw new Error("Error fetching project list")
            }

            const unique_managers = [...new Set(response.map(project => project.manager.name))];

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

            {managers && managers.map((manager, index) => 
            <div key={index} className="my-5">
                <h4 className="px-2">Total Projects: {project && project.filter(project => project.manager.name === manager).length}</h4>
                <div className="grid grid-cols-5 p-4 border-b-2 bg-slate-50">
                    <h3>{manager}</h3>
                    <h3>Project ID</h3>
                    <h3>Project Name</h3>
                    <h3>Client Name</h3>
                    <h3>On-Going Status</h3>
                </div>

                <div>
                    {project && project.filter(project => project.manager.name === manager).map((project, index) => 
                    <div key={index} className="grid grid-cols-5 px-2 py-4 hover:bg-slate-100 transition border-b">
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
                            {project && project.description}
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
const FilterComponent = ({ filterText, onFilter, onClear }: ProjectFilterProps) => (
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
 * This is where the description of the project will be stored
 * 
 * @param data The props of a give row
 * 
 */
const ExpandableRowComponent = ({ data }: { data: ProjectProps }) => {
    const [submittals, setSubmittals] = useState<SubmittalProps[]>([])

    const [taskCounts, setTaskCounts] = useState<{
        total: number,
        completed: number
    }>({
        total: 0,
        completed: 0
    })

    // Keeps track of the submittal counts and their status all in one object
    const [submittalCounts, setSubmittalCounts] = useState<{
        mechanical: { total: number, completed: number },
        electrical: { total: number, completed: number },
        plumbing: { total: number, completed: number },
        fire_protection: { total: number, completed: number },
        other: { total: number, completed: number }
    }>({
        mechanical: { total: 0, completed: 0 },
        electrical: { total: 0, completed: 0 },
        plumbing: { total: 0, completed: 0 },
        fire_protection: { total: 0, completed: 0 },
        other: { total: 0, completed: 0 }
    })

    useEffect(() => {
        //console.log("Data: ", data)
        const get_tasks = async () => {
            const response = await filterTasksByProject(data.project_id)

            const calculateTaskCounts = () => {
                const counts = {
                    total: 0,
                    completed: 0
                };
                
                response.forEach(task => {
                    counts.total++;
                    if (task.status === "completed") {
                        counts.completed++;
                    }
                });
                
                setTaskCounts(counts);
            };
            
            calculateTaskCounts();
        }
        
        if (data.submittals) {
            setSubmittals(data.submittals)
            
            const calculateSubmittalCounts = () => {
                const counts = {
                    mechanical: { total: 0, completed: 0 },
                    electrical: { total: 0, completed: 0 },
                plumbing: { total: 0, completed: 0 },
                fire_protection: { total: 0, completed: 0 },
                other: { total: 0, completed: 0 },
            };
            
            submittals.forEach(submittal => {
                counts[submittal.type].total++;
                if (submittal.status === "closed") {
                    counts[submittal.type].completed++;
                }
            });
            
            setSubmittalCounts(counts);
        };

        calculateSubmittalCounts();
        }
        
        get_tasks()
    }, [data, submittals])

    const totalSubmittals = Object.values(submittalCounts).reduce((sum, { total }) => sum + total, 0);
    const totalCompletedSubmittals = Object.values(submittalCounts).reduce((sum, { completed }) => sum + completed, 0);
    const totalProgress = totalSubmittals > 0 ? (totalCompletedSubmittals / totalSubmittals) * 100 : 0;

    console.log("Task Counts: ", taskCounts)

    return (
    <div className="flex flex-col gap-5 bg-slate-50">
        
        <div className="p-5 flex flex-col gap-5">

            <div>
                <h3>Description:</h3>
                {data.description && <p>{data.description}</p>}
            </div>

            <div>
                <h3>Task Overview:</h3>
                {taskCounts.total > 0 ? 
                <div className="flex flex-col gap-2">
                    <h4>Total Tasks: {taskCounts.total}</h4>
                    <div className="w-1/2 bg-slate-200 rounded-full h-6">
                        <div 
                            className="bg-orange-500 h-6 rounded-full" 
                            style={{ width: `${taskCounts.completed / taskCounts.total * 100}%` }}
                        >
                            <p className="ml-2 text-nowrap">Completed Tasks: {taskCounts.completed} / {taskCounts.total}</p>
                        </div>
                    </div>
                    <div>
                        <p>Total Progress: {taskCounts.completed / taskCounts.total * 100}%</p>
                    </div>
                </div> 
                : 
                <p>(No tasks found)</p>
                }
            </div>

            <div>
                <h3>Submittal Overview:</h3>
                {submittals.length > 0 ? (
                    <div>
                        <h4>Total Submittals: {totalSubmittals}</h4>
                        
                        <div className="flex flex-col gap-2">
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-green-200 h-6 rounded-full" style={{ width: `${submittalCounts.mechanical.completed / submittalCounts.mechanical.total * 100}%` }}>
                                    <p className="ml-2 text-nowrap">Mechanical: {submittalCounts.mechanical.completed} / {submittalCounts.mechanical.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-yellow-200 h-6 rounded-full" style={{ width: `${submittalCounts.electrical.completed / submittalCounts.electrical.total * 100}%` }}>
                                    <p className="ml-2 text-nowrap">Electrical: {submittalCounts.electrical.completed} / {submittalCounts.electrical.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-blue-200 h-6 rounded-full" style={{ width: `${submittalCounts.plumbing.completed / submittalCounts.plumbing.total * 100}%` }}>
                                    <p className="ml-2 text-nowrap">Plumbing: {submittalCounts.plumbing.completed} / {submittalCounts.plumbing.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-red-200 h-6 rounded-full" style={{ width: `${submittalCounts.fire_protection.completed / submittalCounts.fire_protection.total * 100}%` }}>
                                    <p className="ml-2 text-nowrap">Fire Protection: {submittalCounts.fire_protection.completed} / {submittalCounts.fire_protection.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-purple-200 h-6 rounded-full" style={{ width: `${submittalCounts.other.completed / submittalCounts.other.total * 100}%` }}>
                                    <p className="ml-2 text-nowrap">Other: {submittalCounts.other.completed} / {submittalCounts.other.total}</p>
                                </div>
                            </div>
                        </div>

                        <h4>Total Progress: {totalProgress.toFixed(2)}%</h4>
                        <div className="w-1/2 bg-slate-200 rounded-full h-6">
                            <div 
                                className="bg-orange-500 h-6 rounded-full" 
                                style={{ width: `${totalProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <p>(No submittals found)</p>
                )}
            </div>

        </div>

        <div className="flex flex-row gap-5 m-5">
            <Route_Button route={"/projects/update_project/" + data.project_id} text="Edit"/>
            <Route_Button route={"/projects/delete/" + data.project_id} text="Delete" isDelete/>
            <a href={'localexplorer:L:\\projects\\' + data.folder_location}>
                <button className="bg-blue-300 rounded p-4 my-2 hover:bg-blue-400 transition">Open Folder</button>
            </a>
        </div>

    </div>
    )
}

/**
 * The Table Component that lists the projects
 * 
 * Features sorting by any field, and filtering by Project Name currently.
 * 
 * @param projectList - List of projects 
 * @param projectLoaded - Boolean to check if projects have been loaded
 */
function ProjectUpdateTable({ projectList, projectLoaded }: { projectList: ProjectProps[], projectLoaded: boolean }) {
    const [filterText, setFilterText] = useState<string>('')
    const [resetPaginationToggle, setResetPaginationToggle] = useState<boolean>(false)

    const filteredProjects: ProjectProps[] = projectList.filter(item => item.project_name.toLowerCase().includes(filterText.toLowerCase()))

    // Column Names
    const columns: TableColumn<ProjectProps>[] = [
        { name: "Project ID", selector: row => row.project_id, sortable: true },
        { name: "Project Name", selector: row => row.project_name, sortable: true },
        { name: "Project Manager", selector: row => row.manager.name, sortable: true },
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
 * TODO: NEEDS AUTHORIZATION FROM ADMIN
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