import { useNavigate } from "react-router-dom"
import { logout } from "../api/auth"
import { Button_Card } from "./Dashboard"

export function MainNavBar(
    {role}: {role: string}
) {
    return (
    <div className='p-2 flex flex-col justify-items-center'>
        {(role === "Manager" || role === "Administrator") && <Button_Card text="Create Announcement" route="/announcements/create_anncouncement" />}  
        {(role === "Accountant" || role === "Administrator") && <Button_Card text="View Invoices" route="/invoices/" />}
        {(role === "Manager" || role === "Administrator" )&& <Button_Card text="Create Project" route="/projects/create_project" />}
        {(role === "Manager" || role === "Administrator") && <Button_Card text="View Projects" route="/projects/" />}
        <Button_Card text="Project Status Report" route="/projects/project_status_report" popup_window additional_window="/weekly_calendar" />
        {(role === "Manager" || role === "Administrator" || role === "Team Member") && <Button_Card text="Your Tasks" route="/tasks" />}
        {(role === "Manager" || role === "Administrator") && <Button_Card text="Create Task" route="/tasks/create_task" />}
        <Button_Card text="View RFI" route="/rfi" />
        {(role === "Manager" || role === "Administrator") && <Button_Card text="Create RFI" route="/rfi/create_rfi" />}
        {(role === "Manager" || role === "Administrator") && <Button_Card text="Create Submittal" route="/submittals/create_submittal" />}
        <Button_Card text="View Submittals" route="/submittals" />
        {(role === "Manager" || role === "Administrator") && <Button_Card text="Proposal" route="/proposal" />}
        <Button_Card text="Calendar" route="/monthly_calendar" />
        <Button_Card text="Calls" route="/calls" />
        {(role === "Manager" || role === "Administrator") && <Button_Card text="Employee List" route="/employees/" />}
        {(role === "Manager" || role === "Administrator") && <Button_Card text="Create Employee" route="/employees/create_employee" />}

        <LogOut />

    </div>
        
    )
}

/**
 * Component for the log out button in the Main Menu
 * 
 * Deletes the session token and logs the user out
 * 
 */
function LogOut() {
    const navigate = useNavigate()

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