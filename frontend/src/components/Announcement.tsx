import { useNavigate } from "react-router-dom";
import { postAnnouncement } from "../api/announcements";
import { useAuth } from "../App";
import { Header } from "./misc";
import { FormEvent } from "react";

/**
 * ### Route for ('/announcements/create')
 * 
 * Creates an announcement
 * 
 * TODO: Should be a manager or admin
 * TODO: Need to automatically delete after a certain amount of time
 */
export function SetAnnouncement() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = formData.get("title");
        const content = formData.get("content");
        const author = user?.email;
        const date = new Date().toLocaleDateString("en-CA");

        const data = {
            title: title as string,
            content: content as string,
            author: author as string,
            date_created: date
        }

        console.log(data);

        const response = await postAnnouncement(data);
        console.log(response)
        
        switch (response) {
            case 400:
                alert("Error: Invalid input");
                break;
            case 403:
                alert("Error: Forbidden");
                break;
            case 500:
                alert("Error: Server error");
                break;
            case 201:
                alert("Announcement created successfully!");
                navigate("/main_menu");
                break;
        }
    };
    return (
        <>
            <Header />
            <div className="p-2">
                <h1 className="text-center">Create Announcement</h1>
            </div>

            <form id="announcement_creation" method="post" className="flex flex-col p-5 justify-center w-1/2 mx-auto" onSubmit={handleSubmit}>
                <label htmlFor="title" className="p-5 text-xl ">Announcement Title</label>
                <input type="text" placeholder="Title" name="title" className="border-black border" required/>

                <label htmlFor="text" className="p-5 text-xl ">Announcement Text</label>
                <textarea placeholder="Announcement" name="content" className="border-black border h-36" required/>

                {/* <label htmlFor="duration" className="p-5 text-xl ">Announcement Duration</label>
                <select name="duration" className=" border p-2">
                    <option value="5">5 Seconds</option>
                    <option value="1">1 Day</option>
                    <option value="7">1 Week</option>
                    <option value="30">1 Month</option>
                </select> */}

                <button type="submit" className="my-5 rounded-md py-2 bg-orange-300 hover:bg-orange-400 transition text-lg">Submit</button>
            </form>
        </>
    )
}