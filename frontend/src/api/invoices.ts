import { AxiosInstance } from "../components/Axios"
import { InvoiceProps } from "../interfaces/invoices_types"

export async function getInvoices(): Promise<InvoiceProps[]> {
    try {
        const response = await AxiosInstance.get('/api/invoice/')
        return response.data
    } catch (error) {
        console.log(error)
        return []
    }
}

export async function postInvoice(invoice: InvoiceProps): Promise<number> {
    try {
        const response = await AxiosInstance.post('/api/invoice/', invoice)

        if (response.status === 201) {
            return response.status
        } else if (response.status === 400) {
            return response.status
        } else if (response.status === 401) {
            return response.status
        } else {
            return 0
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}
