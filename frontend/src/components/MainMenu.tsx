import { Header } from "./misc";
import { useAuth } from "../App";
import { useState, useEffect } from "react";
import { getAnnouncements } from "../api/announcements";
import { AnnouncementProps } from "../interfaces/announcement_types";
import { MainMenuDashboard } from "./Dashboard";

/**
 * ### [Route for ('/main_menu')]
 * 
 * This component shows brief information about the user, their tasks and projects.
 * 
 * Based on the user's role, it will show / hide different buttons.
 * 
 * TODO:
 *  - Make sure to filter out projects and tasks that are passed due dates
 * - Make sure that projects and tasks are sorted by due date
 * - Still fix that grid layout
 */
export function MainMenu() {
    // Check what roles the user has
    // and show / hide buttons accordingly

    useEffect(() => {
        const get_announcements = async () => {
            try {
                const response = await getAnnouncements()
                console.log(response)
                setAnnouncements(response)
            } catch (error) {
                console.log(error)
                setErrorString("Error fetching announcements")
            }
        }

        get_announcements()
    }, [])

    const [errorString, setErrorString] = useState<string>('')
    const [announcements, setAnnouncements] = useState<AnnouncementProps[]>([])

    // Get User's name
    const { user } = useAuth();

    if (!user) {
        setErrorString("User not authenticated")
        return <MainMenuError error={"User not authenticated"} />
    }

    return (
        <>
            <Header />
            
            {errorString && <MainMenuError error={errorString} />}

            <div className="m-5">
                <h2>Main Menu</h2>
            </div>
            
            <MainMenuDashboard user={user} announcements={announcements}/>
        
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
