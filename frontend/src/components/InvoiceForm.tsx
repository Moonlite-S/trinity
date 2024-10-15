import { useState } from "react"
import { InvoiceProps } from "../interfaces/invoices_types"
import { BottomFormButton } from "./Buttons"
import { GenericForm, GenericInput, GenericSelect, GenericSlider } from "./GenericForm"
import { useNavigate } from "react-router-dom"
import { useInvoiceFormHandler } from "../hooks/invoiceFormHandler"
import { Error_Component } from "./misc"

export function InvoiceForm({ method, current_invoice_data }: { method: string, current_invoice_data?: InvoiceProps }) {
    const navigate = useNavigate()

    const[errorString, setErrorString] = useState<string>("")
    
    const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceProps>(current_invoice_data || {
        invoice_date: "",
        payment_status: "Pending",
        payment_amount: 0,
        project_id: "",
        project_name: "",
    })

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

type InvoiceFormBaseProps = {
    method: string
    errorString: string
    handleSubmit: (data: React.FormEvent<HTMLFormElement>) => void
    currentInvoiceData?: InvoiceProps
    handleNumeralChange: (value: number) => void
}

export function InvoiceFormBase({ method, errorString, handleSubmit, currentInvoiceData, handleNumeralChange }: InvoiceFormBaseProps) {
    return (
        <>
            {errorString && <Error_Component errorString={errorString} />}
            <GenericForm form_id="invoice_form" onSubmit={handleSubmit}>
                <GenericInput type="text" name="project_id" label="Project ID" value={currentInvoiceData?.project_name} readOnly/>
                <div className="grid grid-cols-2 gap-4">
                    <GenericInput type="date" name="invoice_date" label="Invoice Date" value={currentInvoiceData?.invoice_date} />
                    <GenericSelect options={["Pending", "Paid"]} name="payment_status" label="Payment Status" value={currentInvoiceData?.payment_status} />
                </div>
                <GenericSlider name="payment_amount" label="Payment Amount" value={currentInvoiceData?.payment_amount ?? 0} onChange={handleNumeralChange} />
                <BottomFormButton button_text={method === "POST" ? "Create Invoice" : "Update Invoice"} />
            </GenericForm>
        </>
    )
}
