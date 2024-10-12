import { useState, useEffect } from "react";
import { GenericTable, Header } from "./misc";
import { ProposalProps } from "../interfaces/proposal_types";
import { getProposalList } from "../api/proposal";
import { TableColumn } from "react-data-table-component";
export default function ProposalList() {
    const [proposals, setProposals] = useState<ProposalProps[]>([])
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    useEffect(() => {
        const getProposals = async () => {
            const response = await getProposalList()
            setProposals(response)
            setIsDataLoaded(true)
        }
        setIsDataLoaded(true)

        getProposals()
    }, [])

    const columns: TableColumn<ProposalProps>[] = [
        {
            name: "Name",
            selector: (row) => row.proposal_name,
        },
        {
            name: "Description",
            selector: (row) => row.proposal_description,
        },
        {
            name: "Date",
            selector: (row) => row.proposal_date,
        },
        {
            name: "Status",
            selector: (row) => row.proposal_status,
        },
    ]


    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h2>Proposals:</h2>
            </div>

            <GenericTable
                dataList={proposals}
                columns={columns} 
                isDataLoaded={isDataLoaded} 
                FilterComponent={FilterComponent} 
                expandableRowComponent={ExampleExpandableRowComponent} 
                filterField={"proposal_name"}            
                />
        </>
    )
}

function FilterComponent() {
    return (
        <div>
            <input type="text" placeholder="Filter by name" />
        </div>
    )
}

function ExampleExpandableRowComponent() {
    return (
        <div>
            <p>Example Expandable Row Component</p>
        </div>
    )
}
