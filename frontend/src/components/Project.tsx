import { FormEvent, useEffect, useState } from "react";
import { Header, Back_Button } from "./misc";
import { createProject, getProjectList, getProject } from "../api/projects";
import { useNavigate, useParams } from "react-router-dom";

/**
 * ### [Route for ('/create_project')]
 * 
 * This component shows a Form component to create a new project.
 */
export function CreateProject() {
    const [projectManagers, setProjectManagers] = useState<string[]>([])
    const navigate = useNavigate()

    const onSubmit = async (event: any) => {
        event.preventDefault()

        const formData = new FormData(event.target)
        const data = Object.fromEntries(formData)

        console.log("Sending data:", data);

        try {
            await createProject(data)
            // Component that signals that a project has been created
            alert("Project created successfully!")
            navigate("/main_menu")
        } catch (error) {
            console.error("Error creating project:", error);
            throw error; // Re-throw the error so the caller can handle it if needed
        }
    }

    useEffect(() => {
        // [TODO]:
        // We need to fetch a list of project managers

        // fetch('/get_project_managers', {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        // }).then(
        //     (response) => {
        //         response.json()
        // }
        // ).catch((error) => console.log(error))

        setProjectManagers(['Sean', 'Israel', 'Leo'])

    }, [])
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">

                <h2 className="text-center">Create Project:</h2>

            </div>

                <ProjectForm button_text="Create Project" projectManagerList={projectManagers} onSubmit={onSubmit} />

        </>
    )
}

enum ProjectStatus {
    ACTIVE = "Active",
    NOT_STARTED = "Not Started",
    COMPLETED = "Completed",
    CANCELLED = "Cancelled",
}

type UpdateProjectProps = {
    project_id: number
    project_name?: string
    current_manager?: string
    city?: string
    customer_name?: string
    start_date?: string
    end_date?: string
    project_description?: string
    project_status?: ProjectStatus
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
                console.log(data)
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

            <div className="bg-slate-50 p-5">

                <h2 className="mb-5">Project List:</h2>

                <div>

                    <ProjectCardLegend />

                    {projectLoaded && 
                        projectList.map((project) =>
                            <ProjectCard key={project.project_id} project={project}/>)}

                </div>

            </div>
        </>
    )
}

/**
 * ### [Route for ('/update_project/:id')]
 * 
 *  This component shows a Form component to update an existing project.
 */
export function UpdateProject() {
    const { id } = useParams<string>()
    const [projectManager, setProjectManagers] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState<UpdateProjectProps>()

    useEffect(() => {
        // We need to fetch a list of projects
        const project = async () => {
            if (!id) return

            const data = await getProject(id)
            setCurrentProject(data)
        }

        project()

        setProjectManagers(['Sean', 'Israel', 'Leo', 'Matt'])
    }, [])

    const onSubmit = (event: any) => {
        event.preventDefault()
        console.log("We got here")
    }

    return (
        <>
            <Header />

            <ProjectForm button_text="Update Project" projectManagerList={projectManager} onSubmit={onSubmit} formProps={currentProject}/>

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

            {project && <ProjectCard project={project} />}
        </>
    )
}

/**
 * Small component option tag to be used in the ProjectForm.
 * 
 * Used to combo this with the select tag to list off all possible project managers
 * 
 * @param name name of the manager
 * @param id unique key used for mapping
 * @returns 
 */
function ProjectManager(name: string, id: number) {
    return(
        <option value={name} key={id}>{name}</option>
    )
}

type ProjectFormProps = {
    button_text: string
    projectManagerList?: string[]
    onSubmit: (event: FormEvent<HTMLFormElement>) => void

    // For Project Update
    formProps?: UpdateProjectProps
}
/**
 * This component shows the user the form to create a new project.
 * 
 * @param FormProps : ( see type FormProps )  
 * 
 * TODO:
 *  - Currently does not save these: description, status [fix'em in the backend]
 */
function ProjectForm(
    {button_text, projectManagerList, onSubmit, formProps}: ProjectFormProps
) { 
    const {
        project_id = '',
        project_name = '',
        current_manager = '',
        city = '',
        customer_name = '',
        start_date = '',
        end_date = '',
        project_status = ProjectStatus.NOT_STARTED,
        project_description = '',
    } = formProps ?? {}

    // Uhh maybe there's a better way to refactor than prop drilling?
    // useContext? Maybe a free library?
    return (
        <form id="project_creation" onSubmit={onSubmit}  method="post">

        <div className="flex flex-col gap-10 p-24 mx-auto max-w-screen-lg bg-zinc-50" >

            <ProjectTop
                project_id={project_id}
                project_name={project_name}
            />
        
            <ProjectFormMiddle
                city={city}
                current_manager={current_manager}
                customer_name={customer_name}
                end_date={end_date}
                project_status={project_status}
                projectManagerList={projectManagerList}
                start_date={start_date}
            />

            <ProjectFormBottom
                project_description={project_description}
            />

        </div>

        <MainMenuFormButton
        button_text={button_text}
        />

    </form>

    )
}

type ProjectNameIDProps =  {
    project_id: number | "";
    project_name: string;
};
/**
 * Renders the top section of the form.
 * 
 * Consists of Project Name and Project ID
 */
function ProjectTop({ project_id, project_name }: ProjectNameIDProps) {
    return (
        <div className="flex flex-row justify-center gap-5">

            <label htmlFor="project_name">Project Name:</label>
            <input defaultValue={project_name} className="bg-slate-100 border border-zinc-300" type="text" name="project_name" autoFocus required/>

            <label >Project ID:</label>
            <input defaultValue={project_id} className="bg-slate-100 border-zinc-300" type="text" name="project_id"/>

        </div>
    );
}

type ProjectFormMiddleProps =  {
    city: string;
    current_manager: string;
    customer_name: string;
    end_date: string;
    project_status: ProjectStatus;
    projectManagerList?: string[];
    start_date: string;
};
    
/**
 * Renders the middle section of the form.
 * 
 * Consists of two inner components: ProjectStatusAndDate and ProjectManagerCustomerCity
 * 
 */
function ProjectFormMiddle({ 
    city,
    current_manager,
    customer_name,
    end_date,
    project_status,
    projectManagerList,
    start_date 
}: ProjectFormMiddleProps) {
      return (
        <div className="flex flex-row gap-5 justify-between">

            <div className="flex flex-col gap-5 justify-between">

                <ProjectStatusAndDate
                    end_date={end_date}
                    project_status={project_status}
                    start_date={start_date}
                />

            </div>

            <div className="flex flex-col gap-5 justify-between">
                                
                <ProjectManagerCustomerCity
                    city={city}
                    current_manager={current_manager}
                    customer_name={customer_name}
                    projectManagerList={projectManagerList}
                    />

            </div>

        </div>  
    );
}

type ProjectFormBottomProps =  {
    project_description: string;
};

/**
 * Renders the bottom section of the form. 
 * 
 * Consists of ProjectDescription
 */
function ProjectFormBottom({ project_description }: ProjectFormBottomProps) {
    return (
        <div className="flex flex-col gap-5">

            <label  htmlFor="project_description">Project Description:</label>
            <textarea defaultValue={project_description} className="bg-slate-100 border border-zinc-300" placeholder="Enter Project Description" name="project_description" required/>
            
        </div>
    );
}

type ProjectStatusAndDateProps =  {
    end_date: string;
    project_status: ProjectStatus;
    start_date: string;
};
    
/**
 * For the ProjectMiddle component. 
 */
function ProjectStatusAndDate({ 
    end_date,
    project_status,
    start_date 
}: ProjectStatusAndDateProps) {
      return (
        <>
            <div className="flex flex-row justify-between gap-5">

                <label >Project Status:</label>
                <select defaultValue={project_status} name="project_status">

                    <option value={ProjectStatus.ACTIVE}>Active</option>
                    <option value={ProjectStatus.COMPLETED}>Completed</option>
                    <option value={ProjectStatus.CANCELLED}>Cancelled</option>
                    <option value={ProjectStatus.NOT_STARTED}>Not Started</option>

                </select>
                
            </div>

            <div className="flex flex-row justify-between gap-5">

                <label  htmlFor="start_date">Date Created:</label>
                <input defaultValue={start_date} className="bg-slate-100 border border-zinc-300" type="date" name="start_date" required/>
            
            </div>

            <div className="flex flex-row justify-between gap-5">

                <label  htmlFor="end_date">Date Ended:</label>
                <input defaultValue={end_date} className="bg-slate-100 border border-zinc-300" type="date" name="end_date" required/>
            
            </div>
        </>
    );
}

/**
 * The legend layer that sits atop the ProjectCard in the UpdateProjectList component.
 */
function ProjectCardLegend() {
    return(
        <div className="grid grid-cols-10 justify-between border-b-2 border-black">

            <div className="bg-slate-200 ">
                <h5>Project ID</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>Project Name</h5>
            </div>
            <div className="bg-slate-200 ">
                <h5>Project Manager</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>Status</h5>
            </div>
            <div className="bg-slate-200 ">
                <h5>Customer Name</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>City</h5>
            </div>
            <div className="bg-slate-200 ">
                <h5>Date Created</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>Date Ended</h5>
            </div>
            <div className="bg-slate-200 ">
                <h5>Edit Project</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>Project Status</h5>
            </div>
        </div>
    )
}

/**
 * For the ProjectMiddle component.
 * 
 * A template that uses the {UpdateProjectProps} props to fill in the form
 */
function ProjectCard(
    { project } : { project: UpdateProjectProps}
) {
    const {
        project_id = '',
        project_name = '',
        current_manager = '',
        city = '',
        customer_name = '',
        start_date = '',
        end_date = '',
        project_status = ProjectStatus.NOT_STARTED,
    } = project ?? {}

    const navigate = useNavigate();
    const handleEditClick = () => {
        console.log("Clicked")
        navigate(`/update_project/${project_id}`)
    }

    const handleStatusClick = () => {
        console.log("Clicked")
        navigate(`/project_status_report/${project_id}`)
    }

    return(
        <div className="grid grid-cols-10 justify-between border-b-2 border-stone-300">

            <div className="bg-slate-200 ">
                <h5>{project_id}</h5>
            </div>
            <div className="bg-slate-100 truncate">
                <h5>{project_name}</h5>
            </div>
            <div className="bg-slate-200 ">
                <h5>{current_manager}</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>{project_status}</h5>
            </div>
            <div className="bg-slate-200 ">
                <h5>{customer_name}</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>{city}</h5>
            </div>
            <div className="bg-slate-200 ">
                <h5>{start_date}</h5>
            </div>
            <div className="bg-slate-100 ">
                <h5>{end_date}</h5>
            </div>
            <div className="bg-slate-100 ">
                <button className="border-2 w-full h-full bg-slate-300 hover:bg-slate-400 transition" onClick={handleEditClick}>Edit</button>
            </div>
            <div className="bg-slate-100 ">
                <button className="border-2 w-full h-full bg-slate-300 hover:bg-slate-400 transition" onClick={handleStatusClick}>Status</button>
            </div>
        </div>
    )
}

type ProjectManagerCustomerCityProps =  {
    city: string;
    current_manager: string;
    customer_name: string;
    projectManagerList: string[] | undefined;
};

/**
 * For use in the ProjectFormMiddle component
 */
function ProjectManagerCustomerCity({ 
    city,
    current_manager,
    customer_name,
    projectManagerList 
}: ProjectManagerCustomerCityProps) {
      return (
    <>
        <div className="flex flex-row justify-between gap-5">

            <label  htmlFor="current_manager" >Project Manager:</label>
            <select defaultValue={current_manager} name="current_manager" form="project_creation" required>
                {projectManagerList &&projectManagerList.map((projectManager, index) => ProjectManager(projectManager, index))}
            </select>
        
        </div>

        <div className="flex flex-row justify-between gap-5">

            <label >Customer Name</label>
            <input defaultValue={customer_name} className="bg-slate-100 border border-zinc-300" type="text" name="customer_name"/>
        
        </div>
        
        <div className="flex flex-row justify-between gap-5">

            <label >City</label>
            <input defaultValue={city} className="bg-slate-100 border border-zinc-300" type="text" name="city"/>
        
        </div>
    </>
      );
    }

/**
 * For use in the MainMenu component
 *  
 * There are two buttons: One that goes back to the main menu and one that creates or updates a project
 * 
 * @params {string} button_text - The text of the second button
 * 
 * This is usually either "Create Project" or "Update Project"
 */
function MainMenuFormButton({ button_text }: { button_text: string }) {
    return (
    <div className="mx-auto text-center justify-center pt-5">

        <Back_Button route="/main_menu" />
        
        <button type="submit" className="bg-orange-300 rounded p-4 ml-5">
            {button_text}
        </button>

    </div>
    );
}
    