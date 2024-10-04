import { useEffect, useState } from "react";
import { deleteSubmittal, getSubmittalById, getSubmittals} from "../api/submittal";
import { OrangeButton, RouteButton } from "./Buttons";
import { GenericTable, Header } from "./misc";
import { TableColumn } from "react-data-table-component";
import { SubmittalProps } from "../interfaces/submittal_types";
import { useParams } from "react-router-dom";
import { SubmittalFormCreation, SubmittalFormEdit } from "./SubmittalForm";

/**
 * ### Route for ('/submittals/create_submittal')   
 * 
 * Shows the form to create a new submittal
 * 
 */
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

/**
 * ### Route for ('/submittals')   
 * 
 * Shows the list of active submittals
 * 
 */
export function ViewSubmittals() {
    const [submittals, setSubmittals] = useState<SubmittalProps[]>([])

    useEffect(() => {
        const get_submittals = async () => {
            const response = await getSubmittals()
            setSubmittals(response)
            console.log("Submittals: ", response)
        }

        get_submittals()
    }, [])

    const columns: TableColumn<SubmittalProps>[] = [
        { name: "Submittal ID", selector: row => row.submittal_id ?? "N/A", sortable: true },
        { name: "Project", selector: row => row.project_name ?? "N/A", sortable: true },
        { name: "Assigned To", selector: row => row.assigned_to, sortable: true },
        { name: "Submitted On", selector: row => row.received_date, sortable: true },
        { name: "Status", selector: row => row.status, sortable: true },
    ]
    
    return (
        <>
            <Header />

            <div className="flex flex-col gap-5 p-5 ">
                <h1>Submittals</h1>
            </div>

            <GenericTable
                dataList={submittals}
                isDataLoaded={submittals.length > 0}
                columns={columns}
                expandableRowComponent={ExpandableRowComponent}
                filterField="submittal_id"
                FilterComponent={FilterComponent}
            />

            <div className="flex flex-row justify-center gap-3 m-2">
                <RouteButton route={"/main_menu"} text="Back"/>
            </div>
        </>
    )
}

function FilterComponent({ filterText, onFilter, onClear }: { filterText: string, onFilter: (e: any) => void, onClear: () => void }) {
    return (
        <div className="flex flex-row gap-2">
            <input type="text" placeholder="Filter by Submittal ID" value={filterText} onChange={onFilter} />
            <button onClick={onClear}>Clear</button>
        </div>
    )
}

export function EditSubmittal() {
    const { id } = useParams<string>()
    const [submittal, setSubmittal] = useState<SubmittalProps>()

    if (!id) {
        return <div>Submittal ID not found</div>
    }

    useEffect(() => {
        const get_submittal = async () => {
            const response = await getSubmittalById(id)
            
            setSubmittal(response)
        }

        get_submittal()
    }, [id])

    console.log("Submittal: ", submittal)
    
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Edit Submittal: {id}</h1>
            </div>

            {submittal && <SubmittalFormEdit submittal={submittal} />}
        </>
    )
}

function ExpandableRowComponent({ data }: { data: SubmittalProps }) {
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this submittal?")) {
            try {
                if (!data.submittal_id) {
                    alert("Submittal ID is undefined");
                    return;
                }
                const response = await deleteSubmittal(data.submittal_id);
                if (response === 204) {
                    alert("Submittal deleted successfully");
                } else {
                    alert("Error deleting submittal: " + response);
                }
            } catch (error) {
                alert("Error deleting submittal: " + error);
            }
        }
    }

    return (
        <div className="flex flex-row gap-2 mx-2">
            <RouteButton route={`/submittal/${data.submittal_id}`} text="Edit" />
            <RouteButton route={`/submittal/${data.submittal_id}/close`} text="Request to Close" />
            <OrangeButton onClick={handleDelete}>Delete</OrangeButton>
        </div>
    )
}