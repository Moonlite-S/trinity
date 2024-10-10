import { useState } from "react"
import { InvoiceProps } from "../interfaces/invoices_types"
import { BottomFormButton } from "./Buttons"
import { GenericForm, GenericInput, GenericSelect } from "./GenericForm"

export function InvoiceForm({ method, current_invoice_data }: { method: string, current_invoice_data?: InvoiceProps }) {
    const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceProps>(current_invoice_data || {
        invoice_date: "",
        due_date: "",
        bill_to_name: "",
        bill_to_address: "",
        bill_to_email: "",
        from_name: "",
        from_address: "",
        from_email: "",
        subtotal: 0,
        tax: 0,
        total_amount: 0,
        payment_status: "Pending",
        payment_method: "",
        transaction_id: "",
        created_at: "",
        updated_at: "",
    })
    
    const handleSubmit = (data: React.FormEvent<HTMLFormElement>) => {
        console.log(data)
    }

    const handleNumeralChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (name === "subtotal" || name === "tax" || name === "total_amount") {
            const numericValue = value.replace(/[^\d.]/g, '');
            event.target.value = numericValue; 
            const parsedValue = parseFloat(numericValue);
            if (!isNaN(parsedValue)) {
                setCurrentInvoiceData({ ...currentInvoiceData, [name]: parsedValue });
            }
        }
    }

    return (
        <InvoiceFormBase method={method} handleSubmit={handleSubmit} currentInvoiceData={currentInvoiceData} handleNumeralChange={handleNumeralChange} />
    )
}

export function InvoiceFormBase({ method, handleSubmit, currentInvoiceData, handleNumeralChange }: { method: string, handleSubmit: (data: React.FormEvent<HTMLFormElement>) => void, currentInvoiceData?: InvoiceProps, handleNumeralChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <GenericForm form_id="invoice_form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <GenericInput type="date" name="invoice_date" label="Invoice Date" value={currentInvoiceData?.invoice_date} />
                <GenericInput type="date" name="due_date" label="Due Date" value={currentInvoiceData?.due_date} />
            </div>
            <GenericInput type="text" name="bill_to_name" label="Bill To Name" value={currentInvoiceData?.bill_to_name} />
            <GenericInput type="text" name="bill_to_address" label="Bill To Address" value={currentInvoiceData?.bill_to_address} />
            <GenericInput type="text" name="bill_to_email" label="Bill To Email" value={currentInvoiceData?.bill_to_email} />
            <GenericInput type="text" name="from_name" label="From Name" value={currentInvoiceData?.from_name} />
            <GenericInput type="text" name="from_address" label="From Address" value={currentInvoiceData?.from_address} />
            <GenericInput type="text" name="from_email" label="From Email" value={currentInvoiceData?.from_email} />
            <GenericInput type="text" name="subtotal" label="Subtotal" value={currentInvoiceData?.subtotal?.toString()} onChange={handleNumeralChange} /> 
            <GenericInput type="text" name="tax" label="Tax" value={currentInvoiceData?.tax?.toString()} onChange={handleNumeralChange} />
            <GenericInput type="text" name="total_amount" label="Total Amount" value={currentInvoiceData?.total_amount?.toString()} onChange={handleNumeralChange} />
            <GenericSelect options={["Pending", "Paid", "Overdue"]} name="payment_status" label="Payment Status" value={currentInvoiceData?.payment_status} />

            <BottomFormButton button_text={method === "POST" ? "Create Invoice" : "Update Invoice"} />
        </GenericForm>
    )
}
