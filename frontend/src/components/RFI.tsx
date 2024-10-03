import { useState, useEffect } from "react";
import DataTable, { TableColumn, Direction } from "react-data-table-component";
import { Header } from "./misc";
import RFIFormCreation from "./RFIForm";
import { RFIProps } from "../interfaces/rfi_types";
import { getRFIList } from "../api/rfi";

export function CreateRFI() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Create RFI</h1>
            </div>

            <RFIFormCreation />
        </>
    )
}

export function UpdateRFI() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Update RFI</h1>
            </div>
        </>
    )
}

export default function ViewRFI() {

    const [rfiList, setRfiList] = useState<RFIProps[]>([])
    const [rfiLoaded, setRfiLoaded] = useState<boolean>(false)

    useEffect(() => {
        const fetchRFIs = async () => {
            const data: RFIProps[] = await getRFIList()
            console.log(data)
            console.log(typeof data[0].date_received)
            setRfiList(data)
            setRfiLoaded(true)
        }

        fetchRFIs()
    }, [])


    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>RFI</h1>
            </div>

            <RFI_Table rfi_list={rfiList} rfi_loaded={rfiLoaded} />
        </>
    )
}

/**
 * The Table Component that lists the projects
 * 
 * Features sorting by any field, and filtering by Project Name currently.
 * 
 * @param projectList - List of projects 
 * @param projectLoaded - Boolean to check if projects have been loaded
 */
function RFI_Table({ rfi_list, rfi_loaded }: { rfi_list: RFIProps[], rfi_loaded: boolean }) {
    // Column Names
    const columns: TableColumn<RFIProps>[] = [
        { name: "Days Old", selector: row => row.days_old ? row.days_old : "N/A", sortable: true },
        { name: "RFI ID", selector: row => row.RFI_id ? row.RFI_id : "N/A", sortable: true },
        { name: "Description", selector: row => row.description, sortable: true },
        { name: "Type", selector: row => row.type, sortable: true },
        { name: "Project", selector: row => row.project, sortable: true },
        { name: "Date Sent", selector: row => row.sent_out_date, sortable: true },
        { name: "Date Received", selector: row => row.date_received, sortable: true },
        { name: "Notes", selector: row => row.notes, sortable: true },
    ]

    return(
        <DataTable
        title="Project List"
        columns={columns}
        data={rfi_list}
        direction={Direction.AUTO}
        progressPending={!rfi_loaded}
        persistTableHead
        highlightOnHover
        expandableRows
        selectableRows
        pagination
        subHeader
        />        
    )
}
