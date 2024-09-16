import { Header } from "./misc";
import { useNavigate } from "react-router-dom"
import { logout } from "../api/auth";
import { EmployeeProps } from "../interfaces/employee_type";
import { useAuth } from "../App";
import { useState, useEffect } from "react";
import { TaskProps } from "../interfaces/tasks_types";
import { ProjectProps } from "../interfaces/project_types";

/**
 * ### [Route for ('/main_menu')]
 * 
 * This component shows brief information about the user, their tasks and projects.
 * 
 * Based on the user's role, it will show / hide different buttons.
 * 
 * TODO:
 *  - Actually implement the user role system
 */
export function MainMenu() {
    // Check what roles the user has
    // and show / hide buttons accordingly

    const [errorString, setErrorString] = useState<string>('')

    // Get User's name
    const { user } = useAuth();

    if (!user) {
        setErrorString("User not authenticated")
        return <MainMenuError error={"User not authenticated"} />
    }

    
    useEffect(() => {

    }, [])

    return (
        <>
            <Header />
            
            {errorString && <MainMenuError error={errorString} />}

            <div className="m-5">
                <h2>Main Menu</h2>
            </div>

            <div className="flex flex-row w-full bg-gray-50">

                <MainNavBar/>

                <MainMenuDashboard user={user} />

            </div>
        
        </>
    )
}

function MainMenuError({ error } : { error: string }) {
    return (
        <>
            <div className='bg-red-400 p-2'>

                <h1 className="text-center">{error}</h1>

            </div>
        </>
    )
}

type ButtonProps = {
    text: string, 
    route: string
}

/**
 * A button component that serves as main buttons for the Main Menu
 * 
 * @param text - The text of the button
 * @param route - The route of the button
 * 
 */
function Button_Card(
    {text, route}: ButtonProps
) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(route)
    }

    return (
        <button onClick={handleClick} className="w-40 my-2">

            <div className="bg-orange-200 rounded h-14 justify-center items-center flex hover:bg-orange-300 transition">

                <h4>{text}</h4>
                
            </div>

        </button>
    )
}

/**
 * Component for the log out button in the Main Menu
 * 
 * Deletes the session token and logs the user out
 * 
 */
function LogOut() {
    const navigate = useNavigate();

    const handleClick = async() => {
        try {
            const response = await logout()
            
            if (response === 200) {
                console.log("Logged out")
                navigate("/")
            } else {
                console.log("Error: ", response)
            }
        }
        catch {
            console.log("Server Error: ")
        }
    }
 
    return(
        <div className="bg-slate-300 mx-auto text-center justify-center w-40 h-14 rounded mt-2 hover:bg-slate-400 transition">

            <button className="p-4" onClick={handleClick}>

                <h6 className="inline-block">Logout</h6>

            </button>

        </div>
    )
}

/**
 * A small component for the Main Menu component
 * 
 * Shows the user's name and role, along with tasks and projects
 * 
 * TODO:
 *  - Maybe place the tasks and projects below the Buttons? It wouldn't have enough space to show all of the tasks the way it currently is
 */
function MainMenuDashboard(
    {user}: {user: EmployeeProps}
) {
    const sort_tasks = (tasks: TaskProps[]) => {
        return tasks.sort((a, b) => a.due_date.localeCompare(b.due_date))
    }

    const sorted_tasks = sort_tasks(user.tasks)

    const sort_projects = (projects: ProjectProps[]) => {
        return projects.sort((a, b) => a.end_date.localeCompare(b.end_date))
    }

    const sorted_projects = sort_projects(user.projects)

return (
    <div className="grid grid-cols-2 grid-flow-row gap-3 justify-center w-screen p-5 h-screen">

        <div className="p-5 mx-auto border row-span-1 w-full">

            <h3>Hello, {user.name}</h3>

            <h3>Role: {user.role}</h3>

        </div>

        <div className="flex flex-row justify-center row-span-6 w-full">
            <div className="p-5 mx-auto border w-full overflow-hidden">

                <h3>Tasks:</h3>

                <div className="overflow-y-auto h-full">
                    {sorted_tasks ? sorted_tasks.map((task) => (
                        <MainMenuTasks key={task.project_id} task={task} />
                    ))
                    :
                    <h3>No Tasks</h3>}
                </div>

            </div>

        </div>

        <div className="p-5 mx-auto border row-span-1 w-full">

            <h3>Announcements:</h3>

            <h3>- Announcements go here</h3>

        </div>

        <div className="p-5 mx-auto border row-span-4 w-full overflow-hidden">

            <h3>Projects:</h3>
            
            <div className="overflow-y-auto h-full">
                {sorted_projects ? sorted_projects.map((project) => (
                    <MainMenuProjects key={project.project_id} project={project} />
                ))
                :
                <h3>No Projects</h3>
                }
            </div>

        </div>

    </div>
    );
}

function MainMenuProjects ({project} : {project: ProjectProps}) {
    return (
    <div className="bg-slate-100 p-2 my-4 rounded-md">
        <h3>{project.project_name}</h3>
        <p>Client: {project.client_name}</p>
        <p>Notes: {project.notes}</p>
        <p>Due Date: {project.end_date}</p>
        <p>Status: {project.status}</p>
    </div>
    )
}

function MainMenuTasks ({task} : {task: TaskProps}) {
    const formatProjectName = task.project_id.split('|')[1]
    const formatCompanyName = task.project_id.split('|')[2]

    return (
    <div className=" bg-slate-100 p-2 my-4 rounded-md">
        <h3>{formatProjectName}</h3>
        <h4>Task: {task.title}</h4> 
        <p>{task.description}</p>
        <p>Due: {task.due_date}</p>
        <p>From Project: {formatCompanyName}</p>
    </div>
    )
}

export function MainNavBar() {
    return (
    <div className='p-2 flex flex-col justify-items-center'>
        <Button_Card text="Create Announcement" route="/announcements/create_anncouncement" />
        <Button_Card text="Create Project" route="/projects/create_project" />
        <Button_Card text="Update Project" route="/projects/" />
        <Button_Card text="Project Status Report" route="/projects/project_status_report" />
        <Button_Card text="Import Projects" route="/projects/" />
        <Button_Card text="Tasks" route="/task" />
        <Button_Card text="Report" route="/" />
        <Button_Card text="Submittal" route="/" />
        <Button_Card text="Proposal" route="/" />
        <Button_Card text="Calendar" route="/calendar" />
        <Button_Card text="Calls" route="/" />
        <Button_Card text="Employee List" route="/employees/" />
        <Button_Card text="Create Employee" route="/employees/create_employee" />
        <Button_Card text="Create Client" route="/client/create_client" />

        <LogOut />

    </div>
        
    );
}
