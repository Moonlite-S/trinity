import { useParams } from "react-router-dom";
import { InvoiceForm } from "./InvoiceForm";
import { GenericTable, Header } from "./misc";
import { InvoiceProps } from "../interfaces/invoices_types";
import { useState } from "react";
import { useEffect } from "react";
import { getInvoiceById, getInvoices } from "../api/invoices";
import { TableColumn } from "react-data-table-component";
import { RouteButton } from "./Buttons";

export function CreateInvoice() {
    return (
        <div>
            <Header />
            <div className="justify-center mx-auto p-5">
                <h1>Create Invoice</h1>
            </div>

            <InvoiceForm method="POST" />
        </div>
    )
}

export function EditInvoice() {
    const { id } = useParams<string>()
    if (!id) return <div>Loading...</div>

    const [invoice, setInvoice] = useState<InvoiceProps>()

    useEffect(() => {
        const getInvoice = async () => {
            const response = await getInvoiceById(id)
            setInvoice({...response, invoice_id: id})

            console.log("Invoice: ", response)
        }

        getInvoice()
    }, [])

    return (
        <div>
            <Header />
            <div className="justify-center mx-auto p-5">
                <h1>Edit Invoice</h1>
            </div>

            {invoice && <InvoiceForm method="PUT" current_invoice_data={invoice} />}
        </div>
    )
}

export function ViewInvoices() {
    const [invoices, setInvoices] = useState<InvoiceProps[]>([])
    const [invoicesLoaded, setInvoicesLoaded] = useState<boolean>(false)

    useEffect(() => {
        const fetchInvoices = async () => {
            const data = await getInvoices()    
            setInvoices(data)
            setInvoicesLoaded(true)
        }

        fetchInvoices()
    }, [])

    const invoiceColumns: TableColumn<InvoiceProps>[] = [
        { name: "Invoice Date", selector: (row: InvoiceProps) => row.invoice_date, sortable: true, cell: (row: InvoiceProps) => <div className="">{row.invoice_date}</div> },
        { name: "Due Date", selector: (row: InvoiceProps) => row.due_date, sortable: true, cell: (row: InvoiceProps) => <div className="">{row.due_date}</div> },
        { name: "Bill To Name", selector: (row: InvoiceProps) => row.bill_to_name, sortable: true, cell: (row: InvoiceProps) => <div className="">{row.bill_to_name}</div> },
        { name: "Bill To Address", selector: (row: InvoiceProps) => row.bill_to_address, sortable: true, cell: (row: InvoiceProps) => <div className="">{row.bill_to_address}</div> },
        { name: "Bill To Email", selector: (row: InvoiceProps) => row.bill_to_email, sortable: true, cell: (row: InvoiceProps) => <div className="">{row.bill_to_email}</div> },
        { name: "From Name", selector: (row: InvoiceProps) => row.from_name, sortable: true, cell: (row: InvoiceProps) => <div className="">{row.from_name}</div> },
    ]

    return (
        <div>
            <Header />
            <div className="justify-center mx-auto p-5">
                <h1>Invoices</h1>
            </div>

            <GenericTable
                dataList={invoices}
                isDataLoaded={invoicesLoaded}
                columns={invoiceColumns}
                FilterComponent={FilterComponent}
                expandableRowComponent={({data}) => <ExpandableRowComponent data={data} />}
                filterField="invoice_id"
            />
        </div>
    )
}

function FilterComponent() {
    return <div></div>
}

function ExpandableRowComponent({data}: {data: InvoiceProps}) {
    return (
        <div>
            <div className="flex flex-row ml-4">
                <RouteButton route={`/invoices/update_invoice/${data.invoice_id}`} text="Edit Invoice" />
            </div>
        </div>
    )
}
