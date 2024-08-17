import { useEffect } from "react";
import { Header, Back_Button } from "./misc";
import React from "react";

// TO DO FINISH AUTO UPDATE OF UPDATE PROJECTS

/**
 * Create Project
 */
export function CreateProject() {
    const [projectManagers, setProjectManagers] = React.useState<string[]>([])

    const onSubmit = (event: any) => {
        event.preventDefault()

        const formData = new FormData(event.target)
        const data = Object.fromEntries(formData)

        // Also do some light validation here
        // like no symbols on the project name, or something

        console.log(data)

        fetch('/create_project', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(
            (response) => {
                if (response.ok) {
                    console.log("Success")
                }
                else {
                    console.log("Error")
                }
                response.json()
            }
        ).catch(
            (error) => console.log(error)
        )
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

            <div className="justify-center mx-auto">

                <Form button_text="Create Project" projectManagerList={projectManagers} onSubmit={onSubmit} />

            </div>
        </>
    )
}

type UpdateProjectProps = {
    project_name?: string
    date_created?: string
    current_project_manager?: string
    project_description?: string
    project_status?: string
    project_id?: number
    customer_name?: string
    city?: string
}
/**
 * Update Project
 */
export function UpdateProject() {
    // Then, fetch list of projects
    //  (THE LIST SHOULD ONLY SHOW PROJECTS THAT THE USER IS AUTHORIZED WITH)
    // Finally, use same layout as create project
    const [projects, setProjects] = React.useState<string[]>([])
    const [projectManager, setProjectManagers] = React.useState<string[]>([])
    const [currentProject, setCurrentProject] = React.useState<UpdateProjectProps>()
    const [hasEdited, setHasEdited] = React.useState<boolean>(false) // To prevent accidental switching to a different project

    useEffect(() => {
        // We need to fetch a list of projects

        fetch('http://localhost:3306/project_list', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(
            (response) => {
                if (response.ok) {
                    console.log("Success")
                }
                else {
                    console.log("Error")
                }
                response.json()
            }
        ).catch((error) => console.log(error))

        setProjects(['Project 1', 'Project 2', 'Project 3'])
        setProjectManagers(['Sean', 'Israel', 'Leo'])
        setCurrentProject({
            project_name: 'Project 1',
            date_created: '2022-01-01',
            current_project_manager: 'Leo',
            project_description: 'Project 1 description',
            project_status: 'Completed'
        })
    }, [])

    const handleChange = (event: any) => {
        // TODO: Make sure to add the information to the current project
        event.preventDefault()
        const project_selected = event.target.value

        const switchProject = () => {
            setCurrentProject({project_name: project_selected})
            setHasEdited(true)
            console.log("We got here: " + project_selected)
        }

        if (hasEdited) {
            if (window.confirm("Are you sure you want to switch projects? All unsaved changes will be lost.")) {
                switchProject()
            }
            else {
                console.log("User cancelled project switch")
                event.target.value = currentProject?.project_name || '';
            }
        }
        else {
            switchProject()          
        }
    }

    const onSubmit = (event: any) => {
        event.preventDefault()
        console.log("We got here")
    }

    return (
        <>
            <Header />

            <div className='w-screen h-full p-5 gap-10 flex flex-col justify-center'>

                <select defaultValue={"= Select Project ="} value={currentProject?.project_name} name="project_name" form="project_creation" onChange={handleChange} className="p-2" required>

                    <option disabled>= Select Project =</option>

                    {projects.map((project, index) => ProjectList(project, index))}

                </select>

                {currentProject && <Form button_text="Update Project" projectManagerList={projectManager} onSubmit={onSubmit} {...currentProject}/>}

            </div>
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


// Helper Comonents

function ProjectManager(name: string, id: number) {
    return(
        <option value={name} key={id}>{name}</option>
    )
}

function ProjectList(project_name: string, id: number){
    return(
        <option value={project_name} key={id}>{project_name}</option>
    )
}

type FormProps = {
    button_text: string
    projectManagerList?: string[]
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void

    // For Project Update
    project_name?: string
    date_created?: string
    current_project_manager?: string
    project_description?: string
    project_status?: string
    project_id?: number
    customer_name?: string
    city?: string
}
function Form(
    {button_text, projectManagerList, onSubmit, ...props}: FormProps
) {

    return (
        <form id="project_creation" onSubmit={onSubmit}  method="post">

        <div className="flex flex-row justify-center gap-10 p-5" >

            <div className="flex flex-col ">

                <label htmlFor="project_name">Project Name:</label>
                <input defaultValue={props?.project_name} className="bg-slate-100" type="text" name="project_name" autoFocus required/>

                <label  htmlFor="date_created">Date Created:</label>
                <input defaultValue={props?.date_created} className="bg-slate-100" type="date" name="date_created" required/>

                <label  htmlFor="project_description">Project Description:</label>
                <textarea defaultValue={props.project_description} className="bg-slate-100" placeholder="Enter Project Description" name="project_description" required/>

                <label >Project Status:</label>
                <select defaultValue={props.project_status} name="project_status">

                    <option value="Active">Active</option>
                    <option value="Inactive">Completed</option>
                    <option value="Cancelled">Cancelled</option>

                </select>
            </div>

            <div className="flex flex-col">

                <label >Project ID</label>
                <input defaultValue={props.project_id} className="bg-slate-100" type="text" name="project_id"/>

                <label >Customer Name</label>
                <input defaultValue={props.customer_name} className="bg-slate-100" type="text" name="customer_name"/>

                <label >City</label>
                <input defaultValue={props.city} className="bg-slate-100" type="text" name="city"/>

                <label  htmlFor="project_manager">Project Manager:</label>
                <select defaultValue={props.current_project_manager} name="project_manager" form="project_creation" required>
                    {projectManagerList &&projectManagerList.map((projectManager, index) => ProjectManager(projectManager, index))}
                </select>



            </div>  

        </div>

        <div className="mx-auto text-center justify-center pb-5">
            <Back_Button route="/main_menu" />
            <button type="submit" className="bg-orange-300 rounded p-4 ml-5">{button_text}</button>
        </div>

    </form>

    )
}