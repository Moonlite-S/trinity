export type InvoiceProps = {
    invoice_id?: string
    invoice_date: string
    due_date: string

    bill_to_name: string
    bill_to_address: string
    bill_to_email: string

    from_name: string
    from_address: string
    from_email: string

    subtotal: number
    tax: number
    total_amount: number

    payment_status: "Pending" | "Paid" | "Overdue"
    payment_method: string
    transaction_id?: string

    created_at?: string
    updated_at?: string

}