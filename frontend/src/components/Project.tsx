import { useEffect } from "react";
import { Header } from "./misc";
import React from "react";

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

                <Form button_text="Create Project" projectManagers={projectManagers} onSubmit={onSubmit} />

            </div>
        </>
    )
}

type UpdateProjectProps = {
    project_name?: string
    date_created?: string
    project_manager?: string
    project_description?: string
    project_status?: string
}
/**
 * Update Project
 */
export function UpdateProject() {
    // Then, fetch list of projects
    //  (THE LIST SHOULD ONLY SHOW PROJECTS THAT THE USER IS AUTHORIZED WITH)
    // Finally, use same layout as create project
    const [projects, setProjects] = React.useState<string[]>([])
    const [currentProject, setCurrentProject] = React.useState<UpdateProjectProps>()
    const [hasEdited, setHasEdited] = React.useState<boolean>(false) // To prevent accidental switching to a different project

    useEffect(() => {
        // We need to fetch a list of projects

        // fetch('/get_projects', {
        //     method: 'GET',
        //     mode: 'cors',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        // }).then(
        //     (response) => {
        //         if (response.ok) {
        //             console.log("Success")
        //         }
        //         else {
        //             console.log("Error")
        //         }
        //         response.json()
        //     }
        // ).catch((error) => console.log(error))

        setProjects(['Project 1', 'Project 2', 'Project 3'])
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

                {currentProject && <Form button_text="Update Project" projectManagers={[]} onSubmit={onSubmit} />}

            </div>
        </>
    )
}

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
    projectManagers?: string[]
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}
function Form(
    {button_text, projectManagers, onSubmit}: FormProps
) {

    return (
        <form id="project_creation" onSubmit={onSubmit}  method="post">

        <div className="flex flex-row justify-center gap-10 p-5" >

            <div className="flex flex-col ">

                <label htmlFor="project_name">Project Name:</label>
                <input className="bg-slate-100" type="text" name="project_name" autoFocus required/>

                <label htmlFor="date_created">Date Created:</label>
                <input className="bg-slate-100" type="date" name="date_created" required/>

                <label htmlFor="project_description">Project Description:</label>
                <textarea className="bg-slate-100" placeholder="Enter Project Description" name="project_description" required/>

            </div>

            <div className="flex flex-col">

                <label htmlFor="project_manager">Project Manager:</label>
                <select name="project_manager" form="project_creation" required>
                    {projectManagers &&projectManagers.map((projectManager, index) => ProjectManager(projectManager, index))}
                </select>

                <label>Project Status:</label>
                <select name="project_status">

                    <option value="Active">Active</option>
                    <option value="Inactive">Completed</option>
                    <option value="Cancelled">Cancelled</option>

                </select>

                <label>Something else</label>
                <input className="bg-slate-100" type="text" name=""/>

            </div>  

        </div>

        <div className="mx-auto text-center justify-center pb-5">
            <button type="submit" className="bg-orange-300 rounded p-4">{button_text}</button>
        </div>

    </form>

    )
}