export type InvoiceProps = {
    invoice_id?: string
    invoice_date: string
    payment_status: "Pending" | "Paid"
    payment_amount?: number
    project?: string
    project_id: string
    project_name?: string
}