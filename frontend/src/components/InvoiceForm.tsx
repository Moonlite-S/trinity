import { useState } from "react"
import { InvoiceProps } from "../interfaces/invoices_types"
import { BottomFormButton } from "./Buttons"
import { GenericForm, GenericInput, GenericSelect } from "./GenericForm"
import { useNavigate } from "react-router-dom"
import { useInvoiceFormHandler } from "../hooks/invoiceFormHandler"
import { Error_Component } from "./misc"

export function InvoiceForm({ method, current_invoice_data }: { method: string, current_invoice_data?: InvoiceProps }) {
    const navigate = useNavigate()

    const[errorString, setErrorString] = useState<string>("")
    
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

    console.log(currentInvoiceData)
    
    const { handleSubmit, handleNumeralChange } = useInvoiceFormHandler({ method, setCurrentInvoiceData, currentInvoiceData, navigate, setErrorString })

    return (
        <InvoiceFormBase 
        method={method} 
        errorString={errorString} 
        handleSubmit={handleSubmit} 
        currentInvoiceData={currentInvoiceData} 
        handleNumeralChange={handleNumeralChange} />
    )
}

export function InvoiceFormBase({ method, errorString, handleSubmit, currentInvoiceData, handleNumeralChange }: { method: string, errorString: string, handleSubmit: (data: React.FormEvent<HTMLFormElement>) => void, currentInvoiceData?: InvoiceProps, handleNumeralChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <>
            {errorString && <Error_Component errorString={errorString} />}
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
            <GenericInput type="text" name="payment_method" label="Payment Method" value={currentInvoiceData?.payment_method} />
            <GenericInput type="text" name="transaction_id" label="Transaction ID" value={currentInvoiceData?.transaction_id} />
            <GenericSelect options={["Pending", "Paid", "Overdue"]} name="payment_status" label="Payment Status" value={currentInvoiceData?.payment_status} />

            <BottomFormButton button_text={method === "POST" ? "Create Invoice" : "Update Invoice"} />
            </GenericForm>
        </>
    )
}
