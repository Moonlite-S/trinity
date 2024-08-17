import React, { useEffect } from "react";
import { Header } from "./misc";
import { useNavigate } from "react-router-dom"

type UserProps = {
    name: string
    role: string
    
    tasks?: string
    projects?: string
}
/**
 * Home Menu
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

            <div className="bg-slate-400 flex flex-row justify-center">

                <div className="bg-red-300 p-5 basis-1/5">

                    <h3>Hello, {user.name}</h3>

                    <h3>Role: {user.role}</h3>

                </div>

                <div className="bg-green-300 p-5 basis-1/3">
                    <h3>Tasks:</h3>
                    <h3>Tasks go here</h3>
                </div>
            
                <div className="bg-teal-400 p-5 basis-1/3">
                    <h3>Projects:</h3>
                    <h3>Projects go here</h3>
                </div>

                <div className="bg-amber-300 p-5 ">
                    <LogOut />
                </div>
                
            </div>

            <div className='w-screen h-full bg-slate-900 grid grid-cols-6 p-5 gap-10'>

                <Button text="Create Project" route="/create_project" />
                <Button text="Update Project" route="/update_project" />
                <Button text="Project Status Report" route="/" />
                <Button text="Tasks" route="/" />
                <Button text="Report" route="/" />
                <Button text="Submittal" route="/" />
                <Button text="Proposal" route="/" />
                <Button text="Calendar" route="/" />
                <Button text="Calls" route="/" />

            </div>

        </>
    )
}

type ButtonProps = {
    text: string,
    route: string
}

function Button(
    {text, route}: ButtonProps
) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(route)
    }

    return (
        <button onClick={handleClick}>

            <div className=" bg-orange-300 rounded h-32 min-w-32 max-w-52 justify-center items-center flex">

                <h3>{text}</h3>
                
            </div>

        </button>
    )
}

function LogOut() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/")
        console.log("Logged out")
        // Also call the backend to clear the session token
    }

    return(
        <div className="mx-auto text-center justify-center ">

            <button className="bg-orange-300 rounded p-4" onClick={handleClick}>

                <h6 className="inline-block">Logout</h6>

            </button>

        </div>
    )
}