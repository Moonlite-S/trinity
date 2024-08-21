import React, { useEffect } from "react";
import { Header } from "./misc";
import { useNavigate } from "react-router-dom"
import { logout } from "../api/auth";

type UserProps = {
    name: string
    role: string
    
    tasks?: string
    projects?: string
}
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

    // Get User's name
    const [user, setUser] = React.useState<UserProps>({name: '', role: ''})
    
    useEffect(() => {
        // I'd probably just fetch the user again from backend
        setUser({name: 'Sean', role: 'Manager'})
    }, [])

    return (
        <>
            <Header />
            
            <MainMenuQuickBar
                name={user.name}
                role={user.role}
            />
            
            <div className='bg-slate-50 grid grid-cols-6 p-5 justify-items-center'>

                <Button_Card text="Create Project" route="/create_project" />
                <Button_Card text="Update Project" route="/update_project" />
                <Button_Card text="Project Status Report" route="/" />
                <Button_Card text="Tasks" route="/task" />
                <Button_Card text="Report" route="/" />
                <Button_Card text="Submittal" route="/" />
                <Button_Card text="Proposal" route="/" />
                <Button_Card text="Calendar" route="/" />
                <Button_Card text="Calls" route="/" />
                <Button_Card text="Create Employee" route="/create_employee" />

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
        <button onClick={handleClick} className="w-40 mb-5">

            <div className="bg-orange-300 rounded h-32 min-w-32 max-w-40 justify-center items-center flex">

                <h3>{text}</h3>
                
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
        <div className="mx-auto text-center justify-center ">

            <button className="bg-slate-300 rounded p-4" onClick={handleClick}>

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
function MainMenuQuickBar(
    { name, role }: UserProps
) {
return (
    <>
        <div className="bg-slate-100 flex flex-row justify-center">

            <div className="p-5 basis-1/5">

                <h3>Hello, {name}</h3>

                <h3>Role: {role}</h3>

            </div>

            <div className="p-5 basis-1/3">

                <h3>Tasks:</h3>

                <h3>Tasks go here</h3>

            </div>
        
            <div className="p-5 basis-1/3">

                <h3>Projects:</h3>

                <h3>Projects go here</h3>

            </div>

            <div className="p-5 ">

                <LogOut />

            </div>
            
        </div>
    </>
      );
}