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

        console.log(data)

        fetch('/create_project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
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

            <div className="bg-slate-400 justify-center mx-auto">

                    <form id="project_creation" onSubmit={onSubmit}  method="post">

                        <div className="flex flex-row justify-center gap-10 p-5" >

                            <div className="flex flex-col ">

                                <label htmlFor="project_name">Project Name:</label>
                                <input type="text" name="project_name" autoFocus required/>

                                <label htmlFor="date_created">Date Created:</label>
                                <input type="date" name="date_created" required/>

                                <label htmlFor="project_description">Project Description:</label>
                                <textarea placeholder="Enter Project Description" name="project_description" required/>

                            </div>

                            <div className="flex flex-col">

                                <label htmlFor="project_manager">Project Manager:</label>
                                <select name="project_manager" form="project_creation" required>
                                    {projectManagers.map((projectManager, index) => ProjectManager(projectManager, index))}
                                </select>

                                <label>Project Name:</label>
                                <input type="text" name=""/>

                                <label>Project Description:</label>
                                <input type="text" name=""/>

                            </div>  

                        </div>

                        <div className="mx-auto text-center justify-center pb-5">
                            <button type="submit" className="bg-orange-300 rounded p-4">Create Project</button>
                        </div>

                    </form>


            </div>
        </>
    )
}

/**
 * Update Project
 */
export function UpdateProject() {
    return (
        <>
            <Header />

            <div className='w-screen h-full bg-slate-900 grid grid-cols-6 p-5 gap-10'>

            </div>
        </>
    )
}

function ProjectManager(name: string, id: number) {
    return(
        <option value={name} key={id}>{name}</option>
    )
}