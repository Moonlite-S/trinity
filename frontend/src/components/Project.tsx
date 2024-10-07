/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { GenericTable, Header } from "./misc";
import { getProjectList, getProject, deleteProject } from "../api/projects";
import { useNavigate, useParams } from "react-router-dom";
import { TableColumn } from "react-data-table-component";
import { ProjectFilterProps, ProjectProps } from "../interfaces/project_types";
import { ProjectFormCreation, ProjectFormUpdate } from "./ProjectForm";
import { OrangeButton, RouteButton } from "./Buttons";
import { filterTasksByProject } from "../api/tasks";
import { SubmittalProps } from "../interfaces/submittal_types";
import { AxiosError } from "axios";

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

    const projectColumns: TableColumn<ProjectProps>[] = [
        { name: "Project Name", selector: (row: ProjectProps) => row.project_name, sortable: true, cell: (row: ProjectProps) => <div className="">{row.project_name}</div> },
        { name: "Project ID", selector: (row: ProjectProps) => row.project_id ?? "N/A", sortable: true, cell: (row: ProjectProps) => <div className="">{row.project_id}</div> },
        { name: "Client Name", selector: (row: ProjectProps) => row.client_name, sortable: true, cell: (row: ProjectProps) => <div className="">{row.client_name}</div> },
        { name: "Manager", selector: (row: ProjectProps) => row.manager.name, sortable: true, cell: (row: ProjectProps) => <div className="">{row.manager.name}</div> },
        { name: "City", selector: (row: ProjectProps) => row.city, sortable: true, cell: (row: ProjectProps) => <div className="">{row.city}</div> },
        { name: "Next Deadline", selector: (row: ProjectProps) => row.end_date, sortable: true, cell: (row: ProjectProps) => <div className="">{row.end_date}</div> }
    ]

    return(
        <>
            <Header />
            <h1 className="mx-4 text-x1 font-semibold">Projects</h1>
            
            <GenericTable
                dataList={projectList}
                isDataLoaded={projectLoaded}
                columns={projectColumns}
                FilterComponent={FilterComponent}
                expandableRowComponent={ExpandableRowComponent}
                filterField="project_name"
            />

            <div className="flex flex-row justify-center gap-3 m-2">
                <RouteButton route={"/main_menu"} text="Back"/>
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
        const fetchProject = async () => {
            try {
                const data = await getProject(id)

                setCurrentProject({...data, project_id: id})

                setLoading(false)
            } catch (error) {
                console.error("Error fetching project:", error);
                navigate("/*")
            }
        }

        fetchProject()
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
                <RouteButton route="/main_menu" text="Back to Projects" />
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
 * @param data The props of a given row
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
        MECHANICAL: { total: number, completed: number },
        ELECTRICAL: { total: number, completed: number },
        PLUMBING: { total: number, completed: number },
        FIRE_PROTECTION: { total: number, completed: number },
        OTHER: { total: number, completed: number }
    }>({
        MECHANICAL: { total: 0, completed: 0 },
        ELECTRICAL: { total: 0, completed: 0 },
        PLUMBING: { total: 0, completed: 0 },
        FIRE_PROTECTION: { total: 0, completed: 0 },
        OTHER: { total: 0, completed: 0 }
    })

    useEffect(() => {
        const get_tasks = async () => {
            
            if (!data.project_id) {
                throw new Error("Project ID not found")
            }

            const response = await filterTasksByProject(data.project_id)

            const calculateTaskCounts = () => {
                const counts = {
                    total: 0,
                    completed: 0
                };
                
                response.forEach(task => {
                    counts.total++;
                    if (task.status === "COMPLETED") {
                        counts.completed++;
                    }
                });
                
                setTaskCounts(counts);
            };
            
            calculateTaskCounts();
        }
        
        if (data.submittals) {
            console.log("Data Sub", data.submittals)
            setSubmittals(data.submittals)
            
            const calculateSubmittalCounts = () => {
                const counts = {
                    MECHANICAL: { total: 0, completed: 0 },
                    ELECTRICAL: { total: 0, completed: 0 },
                    PLUMBING: { total: 0, completed: 0 },
                    FIRE_PROTECTION: { total: 0, completed: 0 },
                    OTHER: { total: 0, completed: 0 },
            };
            
            submittals.forEach(submittal => {
                counts[submittal.type].total++;
                if (submittal.status === "CLOSED") {
                    counts[submittal.type].completed++;
                }
            });
            
            setSubmittalCounts(counts);
        };

        calculateSubmittalCounts();
        }
        
        get_tasks()
    }, [data, submittals])

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this project?") && confirm("Are you really sure?")) {
            try {
                if (!data.project_id) {
                    throw new Error("Project ID is undefined");
                }

                const response = await deleteProject(data.project_id);
                if (response === 204) {
                    alert("Project deleted successfully");
                    window.location.href = "/projects/"
                } else {
                    alert("Error deleting project:" + response);
                }
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    if (error.response?.status === 400) {
                        // 400 Bad Request
                        return 400
                    } else if (error.response?.status === 403) {
                        // 403 Forbidden
                        return 403
                    }
                }
                alert("Error deleting project: Error" + error);
            }
        }
    };
    

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
                            style={{ width: `${taskCounts.completed === 0 && taskCounts.total === 0 ? 0 : (taskCounts.completed / taskCounts.total * 100)}%` }}
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
                                <div className="bg-green-200 h-6 rounded-full" style={{ width: `${submittalCounts.MECHANICAL.completed === 0 && submittalCounts.MECHANICAL.total === 0 ? 0 : (submittalCounts.MECHANICAL.completed / submittalCounts.MECHANICAL.total * 100)}%` }}>
                                    <p className="ml-2 text-nowrap">Mechanical: {submittalCounts.MECHANICAL.completed} / {submittalCounts.MECHANICAL.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-yellow-200 h-6 rounded-full" style={{ width: `${submittalCounts.ELECTRICAL.completed === 0 && submittalCounts.ELECTRICAL.total === 0 ? 0 : (submittalCounts.ELECTRICAL.completed / submittalCounts.ELECTRICAL.total * 100)}%` }}>
                                    <p className="ml-2 text-nowrap">Electrical: {submittalCounts.ELECTRICAL.completed} / {submittalCounts.ELECTRICAL.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-blue-200 h-6 rounded-full" style={{ width: `${submittalCounts.PLUMBING.completed === 0 && submittalCounts.PLUMBING.total === 0 ? 0 : (submittalCounts.PLUMBING.completed / submittalCounts.PLUMBING.total * 100)}%` }}>
                                    <p className="ml-2 text-nowrap">Plumbing: {submittalCounts.PLUMBING.completed} / {submittalCounts.PLUMBING.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-red-200 h-6 rounded-full" style={{ width: `${submittalCounts.FIRE_PROTECTION.completed === 0 && submittalCounts.FIRE_PROTECTION.total === 0 ? 0 : (submittalCounts.FIRE_PROTECTION.completed / submittalCounts.FIRE_PROTECTION.total * 100)}%` }}>
                                    <p className="ml-2 text-nowrap">Fire Protection: {submittalCounts.FIRE_PROTECTION.completed} / {submittalCounts.FIRE_PROTECTION.total}</p>
                                </div>
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-1/2">
                                <div className="bg-purple-200 h-6 rounded-full" style={{ width: `${submittalCounts.OTHER.completed === 0 && submittalCounts.OTHER.total === 0 ? 0 : (submittalCounts.OTHER.completed / submittalCounts.OTHER.total * 100)}%` }}>
                                    <p className="ml-2 text-nowrap">Other: {submittalCounts.OTHER.completed} / {submittalCounts.OTHER.total}</p>
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
            <RouteButton route={"/projects/update_project/" + data.project_id} text="Edit"/>
            <OrangeButton onClick={handleDelete}>Delete Project</OrangeButton>
            <a href={'localexplorer:L:\\projects\\' + data.folder_location}>
                <button className="bg-blue-300 rounded p-4 my-2 hover:bg-blue-400 transition">Open Folder</button>
            </a>
        </div>

    </div>
    )
}