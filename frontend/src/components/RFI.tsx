import { useState, useEffect } from "react"
import { TableColumn } from "react-data-table-component"
import { GenericTable, Header, OpenFolderButton } from "./misc"
import { RFIForm } from "./RFIForm"
import { RFIProps } from "../interfaces/rfi_types"
import { deleteRFI, getRFI, getRFIList } from "../api/rfi"
import { useNavigate, useParams } from "react-router-dom"
import { OrangeButton, RouteButton } from "./Buttons"

export function CreateRFI() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Create RFI</h1>
            </div>

            <RFIForm method="POST"/>
        </>
    )
}

export function EditRFI() {
    const { id } = useParams<string>()
    if (!id) return <div>Loading...</div>

    const [currentRFIData, setCurrentRFIData] = useState<RFIProps>()
    const [loading, setLoading] = useState<boolean>(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchRFI = async () => {
            try {
                const response = await getRFI(id)

                setCurrentRFIData({...response, RFI_id: id})
                setLoading(false)
            } catch (error) {
                console.error("Error fetching RFI:", error)
                navigate("/*")
            }
        }

        fetchRFI()
    }, [id, navigate])

    if (loading) return <div>Loading...</div>

    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Update RFI</h1>
            </div>

            {currentRFIData && <RFIForm RFIProps={currentRFIData} method="PUT"/>}
        </>
    )
}

export default function ViewRFI() {

    const [rfiList, setRfiList] = useState<RFIProps[]>([])
    const [rfiLoaded, setRfiLoaded] = useState<boolean>(false)

    useEffect(() => {
        const fetchRFIs = async () => {
            try {
                const data: RFIProps[] = await getRFIList()
                setRfiList(data)
                setRfiLoaded(true)
            } catch (error) {
                console.error("Error fetching RFIs:", error)
            }
        }

        fetchRFIs()
    }, [])

    const columns: TableColumn<RFIProps>[] = [
        { 
            name: "Days Old", 
            selector: row => row.days_old !== undefined ? row.days_old.toString() : "N/A", 
            sortable: true,
            conditionalCellStyles: [
                { when: row => row.days_old !== undefined && row.days_old <= 3, style: { backgroundColor: '#90EE90' } },
                { when: row => row.days_old !== undefined && row.days_old > 3, style: { backgroundColor: '#FFEE99' } }, // Light yellow
                { when: row => row.days_old !== undefined && row.days_old > 6, style: { backgroundColor: '#FFCCCC' } }, // Light red
            ]
        },
        { name: "RFI ID", selector: row => row.RFI_id ? row.RFI_id : "N/A", sortable: true },
        { name: "Assigned To", selector: row => row.assigned_to ? row.assigned_to.name : "N/A", sortable: true },
        { name: "Created By", selector: row => row.created_by ? row.created_by.name : "N/A", sortable: true },
        { name: "Type", selector: row => row.type, sortable: true },
        { name: "Project", selector: row => row.project_name || "N/A", sortable: true },
        { name: "Date Sent", selector: row => row.sent_out_date, sortable: true },
        { name: "Date Received", selector: row => row.date_received, sortable: true },
    ]


    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>RFI</h1>
            </div>

            <GenericTable dataList={rfiList} isDataLoaded={rfiLoaded} columns={columns} FilterComponent={FilterComponent} expandableRowComponent={ExpandableRowComponent} filterField={""} />
        </>
    )
}

function ExpandableRowComponent({ data }: { data: RFIProps }) {
    const navigate = useNavigate()

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this RFI?") && confirm("Are you really sure?")) {
            try {
                if (!data.RFI_id) {
                    throw new Error("RFI ID is undefined")
                }

                await deleteRFI(data)
                navigate("/rfi")
            } catch (error) {
                console.error("Error deleting RFI:", error)
            }
        }
    }

    return (
        <div className="ml-2 flex gap-2">
            <RouteButton route={"/rfi/update_rfi/" + data.RFI_id} text="Update" />
            <OrangeButton onClick={handleDelete}>Delete</OrangeButton>
            <OpenFolderButton folder_path={data.project_id ? 'projects\\' + data.project_id + '\\RFI\\' + data.RFI_id : 'RFIs'} />
        </div>
    )
}

function FilterComponent({ filterText, onFilter, onClear }: { filterText: string, onFilter: (e: any) => void, onClear: () => void }) {
    return (
        <div>
            <input type="text" value={filterText} onChange={onFilter} />
            <button onClick={onClear}>Clear</button>
        </div>
    )
}
