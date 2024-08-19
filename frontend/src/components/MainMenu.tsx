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

            <div className="bg-slate-100 flex flex-row justify-center">

                <div className="p-5 basis-1/5">

                    <h3>Hello, {user.name}</h3>

                    <h3>Role: {user.role}</h3>

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

            <div className='bg-slate-50 w-screen h-full grid grid-cols-6 p-5 gap-104'>

                <Button_Card text="Create Project" route="/create_project" />
                <Button_Card text="Update Project" route="/update_project" />
                <Button_Card text="Project Status Report" route="/" />
                <Button_Card text="Tasks" route="/" />
                <Button_Card text="Report" route="/" />
                <Button_Card text="Submittal" route="/" />
                <Button_Card text="Proposal" route="/" />
                <Button_Card text="Calendar" route="/" />
                <Button_Card text="Calls" route="/" />

            </div>

        </>
    )
}

type ButtonProps = {
    text: string,
    route: string
}

function Button_Card(
    {text, route}: ButtonProps
) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(route)
    }

    return (
        <button onClick={handleClick} className="min-w-32 max-w-40 mb-5">

            <div className=" bg-orange-300 rounded h-32 min-w-32 max-w-40 justify-center items-center flex">

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

            <button className="bg-slate-300 rounded p-4" onClick={handleClick}>

                <h6 className="inline-block">Logout</h6>

            </button>

        </div>
    )
}