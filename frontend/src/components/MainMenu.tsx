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
type MainMenuProps = {
    error?: string
}
export function MainMenu({ error='' } : MainMenuProps) {
    // Check what roles the user has
    // and show / hide buttons accordingly

    // Get User's name
    const [user, setUser] = React.useState<UserProps>({name: '', role: ''})
    const [errorString, setErrorString] = React.useState<string>('')
    
    useEffect(() => {
        // I'd probably just fetch the user again from backend
        setUser({name: 'Sean', role: 'Manager'})

        if (error) {
            setErrorString(error)
        }
    }, [])

    return (
        <>
            <Header />
            
            {errorString && <MainMenuError error={errorString} />}

            <div className="m-5">
                <h2>Main Menu</h2>
            </div>


            <MainNavBar
            user={user}
            />
        
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
function MainMenuQuickBar(
    { name, role }: UserProps
) {
return (
    <div className="grid grid-cols-2 grid-flow-row gap-3 justify-center w-screen p-5 ">

        <div className="p-5 mx-auto border row-span-1 w-full">

            <h3>Hello, {name}</h3>

            <h3>Role: {role}</h3>

        </div>

        <div className="flex flex-row justify-center row-span-6 w-full">

            <div className="p-5 mx-auto border w-full">

                <h3>Tasks:</h3>

                <h3>Tasks go here</h3>

            </div>

        </div>

        <div className="p-5 mx-auto border row-span-1 w-full">

            <h3>Announcements:</h3>

            <h3>- Announcements go here</h3>

        </div>

        <div className="p-5 mx-auto border row-span-4 w-full">

            <h3>Projects:</h3>

            <h3>Projects go here</h3>

        </div>

    </div>
    );
}

type MainNavBarProps =  {
    user: UserProps;
};

export function MainNavBar({ user }: MainNavBarProps) {
    return (
    <div className="flex flex-row w-full bg-gray-50">

        <div className='p-2 flex flex-col justify-items-center'>

            <Button_Card text="Create Project" route="/create_project" />
            <Button_Card text="Update Project" route="/update_project" />
            <Button_Card text="Project Status Report" route="/" />
            <Button_Card text="Tasks" route="/task" />
            <Button_Card text="Report" route="/" />
            <Button_Card text="Submittal" route="/" />
            <Button_Card text="Proposal" route="/" />
            <Button_Card text="Calendar" route="/calendar" />
            <Button_Card text="Calls" route="/" />
            <Button_Card text="Create Employee" route="/create_employee" />
            <Button_Card text="Employee List" route="/employee" />

            <LogOut />

        </div>

        <MainMenuQuickBar
            name={user.name}
            role={user.role}
        />
            
    </div>
    );
}
