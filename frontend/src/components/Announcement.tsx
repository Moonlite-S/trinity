import { Header } from "./misc";

export function SetAnnouncement() {
    return (
        <>
            <Header />
            <div className="p-2">
                <h1 className="text-center">Create Announcement</h1>
            </div>

            <div className="flex justify-center">
                <form>
                    <label htmlFor="announcement_text">Announcement Text</label>
                    <input type="text" placeholder="Announcement Text" name="announcement_text" />
                </form>
            </div>
        </>
    )
}