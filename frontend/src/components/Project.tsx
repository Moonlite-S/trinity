import { FormEvent, useEffect, useState } from "react";
import { Header, Back_Button } from "./misc";
import { create_project, get_project_list, get_project } from "../api/projects";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Create Project 
 * 
 * ### [Main Component]
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
            await create_project(data)
            // Component that signals that a project has been created
            alert("Project created successfully!")
            navigate("/main_menu")
            //event.target.reset()
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

                <Form button_text="Create Project" projectManagerList={projectManagers} onSubmit={onSubmit} />

        </>
    )
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
    project_status?: string
}
/**
 * Update Project List
 * 
 * ### [Main Component]
 */
export function UpdateProjectList() {
    const [projectList, setProjectList] = useState<UpdateProjectProps[]>([])
    const [projectLoaded, setProjectLoaded] = useState<boolean>(false)

    useEffect(() => {
        // This is where the list of projects will be fetched
        const fetchProjects = async () => {
            try {
                const data: Array<UpdateProjectProps> = await get_project_list()
                
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

                <h2>Project List:</h2>

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
 * Update Project
 * 
 * ### [Main Component]
 */
export function UpdateProject() {
    const { id } = useParams<string>()
    const [projectManager, setProjectManagers] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState<UpdateProjectProps>()

    useEffect(() => {
        // We need to fetch a list of projects

        const project = async () => {
            if (!id) return

            const data = await get_project(id)
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

            <Form button_text="Update Project" projectManagerList={projectManager} onSubmit={onSubmit} formProps={currentProject}/>

        </>
    )
}

function Project_Status_Report() {
    // Maybe this is about showing the status of the project
    return(
        <>
            <Header />


        </>
    )
}


// Helper Components

function ProjectManager(name: string, id: number) {
    return(
        <option value={name} key={id}>{name}</option>
    )
}

type FormProps = {
    button_text: string
    projectManagerList?: string[]
    onSubmit: (event: FormEvent<HTMLFormElement>) => void

    // For Project Update
    formProps?: UpdateProjectProps
}

function Form(
    {button_text, projectManagerList, onSubmit, formProps}: FormProps
) { 
    const {
        project_id = '',
        project_name = '',
        current_manager = '',
        city = '',
        customer_name = '',
        start_date = '',
        end_date = '',
        project_status = '',
        project_description = '',
    } = formProps ?? {}

    // YOU BETTER REFACROT THIS LATER
    return (
        <form id="project_creation" onSubmit={onSubmit}  method="post">

        <div className="flex flex-col gap-10 p-24 mx-auto max-w-screen-lg bg-zinc-50" >

            <div className="flex flex-row justify-center gap-5">

                <label htmlFor="project_name">Project Name:</label>
                <input defaultValue={project_name} className="bg-slate-100 border border-zinc-300" type="text" name="project_name" autoFocus required/>

                <label >Project ID:</label>
                <input defaultValue={project_id} className="bg-slate-100 border-zinc-300" type="text" name="project_id"/>

            </div>

            <div className="flex flex-col gap-5">

                <label  htmlFor="project_description">Project Description:</label>
                <textarea defaultValue={project_description} className="bg-slate-100 border border-zinc-300" placeholder="Enter Project Description" name="project_description" required/>
            
            </div>

            <div className="flex flex-row gap-5 justify-between">

                <div className="flex flex-col gap-5 justify-between">

                    <div className="flex flex-row justify-between gap-5">

                        <label >Project Status:</label>
                        <select defaultValue={project_status} name="project_status">

                            <option value="Active">Active</option>
                            <option value="Inactive">Completed</option>
                            <option value="Cancelled">Cancelled</option>

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
                </div>

                <div className="flex flex-col gap-5 justify-between">
                    
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


                    </div>
            </div>  

        </div>

        <div className="mx-auto text-center justify-center pt-5">
            <Back_Button route="/main_menu" />
            <button type="submit" className="bg-orange-300 rounded p-4 ml-5">{button_text}</button>
        </div>

    </form>

    )
}

function ProjectCardLegend() {
    return(
        <div className="grid grid-cols-9 justify-between border-b-2 border-black">

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
            <div className="bg-slate-100 ">

            </div>
        </div>
    )
}

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
        project_status = 'Active',
    } = project ?? {}

    const navigate = useNavigate();
    const handleClick = () => {
        console.log("Clicked")
        navigate(`/update_project/${project_id}`)
    }

    return(
        <div className="grid grid-cols-9 justify-between">

            <div className="bg-slate-200 ">
                <h5>{project_id}</h5>
            </div>
            <div className="bg-slate-100 ">
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
                <button className="border-2 w-full bg-slate-300 hover:bg-slate-400 transition" onClick={handleClick}>Edit</button>
            </div>
        </div>
    )
}