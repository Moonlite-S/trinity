import { Header } from "./misc";
import { useNavigate } from "react-router-dom"

/**
 * Home Menu
 */
export function MainMenu() {
    // Check what roles the user has
    // and show / hide buttons accordingly
    return (
        <>
            <Header />

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

            <LogOut />
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
        <div className="mx-auto text-center justify-center py-5">

            <button className="bg-orange-300 rounded p-4" onClick={handleClick}>

                <h6 className="inline-block">Logout</h6>

            </button>

        </div>
    )
}