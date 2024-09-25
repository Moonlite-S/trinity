import { Header } from "./misc";

export default function CreateSubmittal() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Create Submittal</h1>
            </div>

            <SubmittalFormCreation />
        </>
    )
}

export function ViewSubmittals() {
    return (
        <>
            <Header />

            <div className="flex flex-col gap-5 bg-slate-50">
                <h1>Submittals</h1>
            </div>
        </>
    )
}

function SubmittalFormCreation() {
    return (
        <form className="flex flex-col gap-5 ">
            <label>Project Name</label>
            <input type="text" placeholder="Project Name" name="project_name" />

            <label>Client Name</label>
            <input type="text" placeholder="Client Name" name="client_name" />
                
            <label>Recieved Date</label>
            <input type="text" placeholder="Submittal Date" name="submittal_date" />

            <label>Project Name</label>
            <input type="text" placeholder="Project Name" name="project_name" />

            <label>Description</label>
            <input type="text" placeholder="Description" name="description" />

            <label>Submittal Type</label>
            <input type="text" placeholder="Submittal Type" name="submittal_type" />

            <label>Submittal Status</label>
            <input type="text" placeholder="Submittal Status" name="submittal_status" />

            <label>Assigned To</label>
            <input type="text" placeholder="Assigned To" name="assigned_to" />

            <label>Notes</label>
            <input type="textarea" placeholder="Notes" name="notes" />
            <button type="submit">Create</button>
        </form>
    )
}


