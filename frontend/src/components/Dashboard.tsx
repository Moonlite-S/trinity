import { useNavigate } from "react-router-dom"
import { logout } from "../api/auth"
import { AnnouncementProps } from "../interfaces/announcement_types"
import { ManagerDashboardProps } from "../interfaces/dashboard_types"
import { EmployeeProps } from "../interfaces/employee_type"
import { ProjectProps } from "../interfaces/project_types"
import { TaskProps } from "../interfaces/tasks_types"
import { TaskCard, AnnouncementCard, ProjectCard } from "./misc"

/**
 * A small component for the Main Menu component
 * 
 * Shows the user's name and role, along with tasks and projects
 * 
 * Dashboard will show different things depending on the user's role
 * 
 * @param user The user to display the dashboard for
 * @param announcements The announcements to display
 */
export function MainMenuDashboard(
    {user, announcements}: {user: EmployeeProps, announcements: AnnouncementProps[]}
) {
    const sort_tasks = (tasks: TaskProps[]) => {
        return tasks.sort((a, b) => a.due_date.localeCompare(b.due_date))
    }

    const sorted_tasks = sort_tasks(user.tasks ?? [])

    const sort_projects = (projects: ProjectProps[]) => {
        return projects.sort((a, b) => a.end_date.localeCompare(b.end_date))
    }

    const sorted_projects = sort_projects(user.projects ?? [])

    return (
        <div className="flex flex-row">
            <MainNavBar role={user.role} />
            {user.role === "Manager" &&
            <ManagerDashboard user={user} announcements={announcements} sorted_tasks={sorted_tasks} sorted_projects={sorted_projects}/>}
        </div>
    );
}

function ManagerDashboard(
    {user, announcements, sorted_tasks, sorted_projects}: ManagerDashboardProps
) {
    return (
    <div className="grid grid-cols-2 grid-flow-row gap-3 justify-center w-screen p-5 h-screen">

        <div className="p-5 mx-auto border row-span-1 w-full">

            <h3>Hello, {user.name}</h3>

            <h3>Role: {user.role}</h3>

        </div>

        <div className="flex flex-row justify-center row-span-5 w-full">
            <div className="p-5 mx-auto border w-full overflow-hidden">

                <h3>Tasks:</h3>

                <div className="overflow-y-auto h-full">
                    {sorted_tasks.length > 0 ? sorted_tasks.map((task) => (
                        <TaskCard key={task.project_id} task={task} />
                    ))
                    :
                    <h3>No Tasks assigned to you</h3>}
                </div>

            </div>
        </div>

        <div className="p-5 mx-auto border row-span-1 w-full overflow-hidden">

            <h3>Announcements:</h3>

            <div className="overflow-y-auto h-full">
                {announcements.length > 0 ? announcements.reverse().map((announcement, index) => (
                    <AnnouncementCard key={index} announcement={announcement} />
                ))
                : 
                <h3>No Announcements at the moment</h3>
                }
            </div>

        </div>
        <div className="flex flex-row justify-center row-span-5 w-full">
            <div className="p-5 mx-auto border w-full overflow-hidden">
                <h3>Submittals:</h3>
            </div>
        </div>
        <div className="p-5 mx-auto border row-span-2 w-full overflow-hidden">

            <h3 className="py-2">Projects:</h3>
            
            <div className="overflow-y-auto h-full">
                {sorted_projects.length > 0 ? sorted_projects.map((project) => (
                    <ProjectCard key={project.project_id} project={project} />
                ))
                :
                <h3>No Projects assigned to you</h3>
                }
            </div>

        </div>

    </div>
    )
}

export function MainNavBar(
    {role}: {role: string}
) {
    return (
    <div className='p-2 flex flex-col justify-items-center'>
        {role === "Manager" || role === "Administrator" && <Button_Card text="Create Announcement" route="/announcements/create_anncouncement" />}  
        {role === "Manager" || role === "Administrator" && <Button_Card text="Create Project" route="/projects/create_project" />}
        <Button_Card text="Update Project" route="/projects/" />
        <Button_Card text="Project Status Report" route="/projects/project_status_report" popup_window />
        <Button_Card text="Your Tasks" route="/tasks" />
        {role === "Manager" || role === "Administrator" && <Button_Card text="Create Task" route="/tasks/create_task" />}
        {role === "Manager" || role === "Administrator" && <Button_Card text="Report" route="/report" />}
        {role === "Manager" || role === "Administrator" && <Button_Card text="Create Submittal" route="/submittal/create_submittal" />}
        {role === "Manager" || role === "Administrator" && <Button_Card text="View Submittals" route="/submittal" />}
        {role === "Manager" || role === "Administrator" && <Button_Card text="Proposal" route="/proposal" />}
        <Button_Card text="Calendar" route="/monthly_calendar" />
        {role === "Manager" || role === "Administrator" && <Button_Card text="Calls" route="/calls" />}
        {role === "Manager" || role === "Administrator" && <Button_Card text="Employee List" route="/employees/" />}
        {role === "Manager" || role === "Administrator" && <Button_Card text="Create Employee" route="/employees/create_employee" />}

        <LogOut />

    </div>
        
    );
}


type ButtonProps = {
    text: string, 
    route: string,
    popup_window?: boolean
}

/**
 * A button component that serves as main buttons for the Main Menu
 * 
 * @param text - The text of the button
 * @param route - The route of the button
 * 
 */
function Button_Card(
    {text, route, popup_window = false}: ButtonProps
) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (popup_window) {
            window.open(route, '_blank', 'width=1000,height=1000')
        } else {
            navigate(route)
        }
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

