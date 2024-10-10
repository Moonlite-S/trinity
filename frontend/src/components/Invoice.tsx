import { InvoiceForm } from "./InvoiceForm";
import { Header } from "./misc";

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
    return (
        <div>
            <Header />
            <div className="justify-center mx-auto p-5">
                <h1>Edit Invoice</h1>
            </div>

            <InvoiceForm method="PUT" />
        </div>
    )
}

export function ViewInvoices() {
    return (
        <div>
            <Header />
            <div className="justify-center mx-auto p-5">
                <h1>Invoices</h1>
            </div>
        </div>
    )
}
