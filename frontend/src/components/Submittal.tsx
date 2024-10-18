import { useEffect, useState } from "react"
import { deleteSubmittal, getSubmittalById, getSubmittals} from "../api/submittal"
import { OrangeButton, RouteButton } from "./Buttons"
import { GenericTable, Header, OpenFolderButton } from "./misc"
import { TableColumn } from "react-data-table-component"
import { SubmittalProps } from "../interfaces/submittal_types"
import { useParams } from "react-router-dom"
import { SubmittalForm } from "./SubmittalForm"
import { useAuth } from "../App"
import { EmployeeProps } from "../interfaces/employee_type"

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
                <h1>Submittal Creation</h1>
            </div>

            <SubmittalForm method="POST" />
        </>
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
            
            setSubmittal({...response, submittal_id: id})
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

            {submittal && <SubmittalForm submittal={submittal} method="PUT" />}
        </>
    )
}

/**
 * ### Route for ('/submittals')   
 * 
 * Shows the list of active submittals
 * 
 */
export function SubmittalList() {
    const { user } = useAuth()

    if (!user) {
        return <div>Loading...</div>
    }

    const [submittals, setSubmittals] = useState<SubmittalProps[]>([])
    const [submittalsLoaded, setSubmittalsLoaded] = useState<boolean>(false)
    useEffect(() => {
        const get_submittals = async () => {
            try {
                const response = await getSubmittals()
                setSubmittals(response)
                console.log("Submittals: ", response)
                setSubmittalsLoaded(true)
            } catch (error) {
                console.error("Error fetching submittals: ", error)
            }
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

            {submittalsLoaded && <GenericTable
                dataList={submittals}
                isDataLoaded={submittalsLoaded}
                columns={columns}
                expandableRowComponent={({data}) => ExpandableRowComponent({data: data, user: user})}
                filterField="submittal_id"
                FilterComponent={FilterComponent}
            />}

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



function ExpandableRowComponent({ data, user }: { data: SubmittalProps, user: EmployeeProps }) {
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this submittal?")) {
            try {
                if (!data.submittal_id) {
                    alert("Submittal ID is undefined")
                    return
                }
                const response = await deleteSubmittal(data.submittal_id)
                if (response === 204) {
                    alert("Submittal deleted successfully")
                    window.location.reload()
                } else {
                    alert("Error deleting submittal: " + response)
                }
            } catch (error) {
                alert("Error deleting submittal: " + error)
            }
        }
    }

    return (
        <div className="flex flex-row gap-2 mx-2">
            <RouteButton route={`/submittals/update_submittal/${data.submittal_id}`} text="Edit" />
            {(user.role === "Manager" || user.role === "Administrator") && <OrangeButton onClick={handleDelete}>Delete</OrangeButton>}
            <OpenFolderButton folder_path={data.project_id ? 'projects\\' + data.project_id + '\\Submittals\\' + data.submittal_id : 'Submittals'} />
        </div>
    )
}