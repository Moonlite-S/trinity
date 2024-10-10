import { InvoiceProps } from "../interfaces/invoices_types"
import { createInvoice, updateInvoice } from "../api/invoices"
import { NavigateFunction } from "react-router-dom"

export function useInvoiceFormHandler(
    { method, setCurrentInvoiceData, currentInvoiceData, navigate, setErrorString }: { method: string, setCurrentInvoiceData: React.Dispatch<React.SetStateAction<InvoiceProps>>, currentInvoiceData: InvoiceProps, navigate: NavigateFunction, setErrorString: React.Dispatch<React.SetStateAction<string>> }
) {
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const handleSubmit = async (data: React.FormEvent<HTMLFormElement>) => {
        data.preventDefault()

        setErrorString("")  

        const formData = new FormData(data.target as HTMLFormElement)
        const data_obj = Object.fromEntries(formData.entries())

        if (!email_regex.test(data_obj.bill_to_email as string) || !email_regex.test(data_obj.from_email as string)) {
            console.log("Invalid email address")
            setErrorString("Invalid email address. Please enter a valid email address.")
            return
        }

        const data_to_send: InvoiceProps = {
            invoice_id: currentInvoiceData.invoice_id,
            invoice_date: data_obj.invoice_date as string,
            due_date: data_obj.due_date as string,
            bill_to_name: data_obj.bill_to_name as string,
            bill_to_address: data_obj.bill_to_address as string,
            bill_to_email: data_obj.bill_to_email as string,
            from_name: data_obj.from_name as string,
            from_address: data_obj.from_address as string,
            from_email: data_obj.from_email as string,
            subtotal: parseFloat(data_obj.subtotal as string),
            tax: parseFloat(data_obj.tax as string),
            total_amount: parseFloat(data_obj.total_amount as string),
            payment_status: data_obj.payment_status as "Pending" | "Paid" | "Overdue",
            payment_method: data_obj.payment_method as string,
            transaction_id: data_obj.transaction_id as string,
        }

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

    return { handleSubmit, handleNumeralChange }
}