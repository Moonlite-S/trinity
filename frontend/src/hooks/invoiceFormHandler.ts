import { InvoiceProps } from "../interfaces/invoices_types"
import { createInvoice, updateInvoice } from "../api/invoices"
import { NavigateFunction } from "react-router-dom"

type InvoiceFormHandlerProps = {
    method: string
    setCurrentInvoiceData: React.Dispatch<React.SetStateAction<InvoiceProps>>
    currentInvoiceData: InvoiceProps
    navigate: NavigateFunction
    setErrorString: React.Dispatch<React.SetStateAction<string>>
}

export function useInvoiceFormHandler({ method, setCurrentInvoiceData, currentInvoiceData, navigate, setErrorString }: InvoiceFormHandlerProps) {
    const handleSubmit = async (data: React.FormEvent<HTMLFormElement>) => {
        data.preventDefault()

        setErrorString("")  

        console.log("Current Invoice Data: ", currentInvoiceData)

        const data_to_send: InvoiceProps = {
            invoice_id: currentInvoiceData.invoice_id,
            invoice_date: currentInvoiceData.invoice_date as string,
            payment_status: currentInvoiceData.payment_status as "Pending" | "Paid",
            payment_amount: currentInvoiceData.payment_amount as unknown as number,
            project_id: currentInvoiceData.project as string,
        }

        console.log("data_to_send: ", data_to_send)

        if (method === "POST") {
            const response = await createInvoice(data_to_send)
            if (response === 201) {
                alert("Invoice created successfully")
                navigate("/invoices")
            } else if (response === 400) {
                setErrorString("Bad Request")
            } else if (response === 401) {
                setErrorString("Unauthorized")
            } else {
                setErrorString("Internal Server Error")
            }
        } else if (method === "PUT") {
            const response = await updateInvoice(data_to_send)
            if (response === 200) {
                alert("Invoice updated successfully")
                navigate("/invoices")
            } else if (response === 400) {
                setErrorString("Bad Request")
            } else if (response === 401) {
                setErrorString("Unauthorized")
            } else {
                setErrorString("Internal Server Error")
            }
        }
    }

    const handleNumeralChange = (event: number) => {
        setCurrentInvoiceData({ ...currentInvoiceData, payment_amount: event})
    }

    const onStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentInvoiceData({ ...currentInvoiceData, payment_status: event.target.value as "Pending" | "Paid" })
    }

    const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentInvoiceData({ ...currentInvoiceData, invoice_date: event.target.value })
    }

    return { handleSubmit, handleNumeralChange, onStatusChange, onDateChange }
}