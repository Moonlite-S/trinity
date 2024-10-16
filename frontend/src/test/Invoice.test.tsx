import { test_user_dummy, TestRouterWrapper } from "./utils"
import { InvoiceForm } from "../components/InvoiceForm"
import { CreateInvoice } from "../components/Invoice"
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InvoiceProps } from "../interfaces/invoices_types"
import { createInvoice } from "../api/invoices"

const mockInvoice: InvoiceProps = {
    invoice_date: "2024-01-01",
    payment_status: "Pending",
    project_id: "1",
}

vi.mock('../api/invoices', async(importOriginal) => {
    const original = await importOriginal<typeof import('../api/invoices')>()
    return {
        ...original,
        createInvoice: vi.fn()
    }
})

describe('Invoice Creation', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should render the invoice creation page', () => {
        render(
            <TestRouterWrapper
                routes={[
                    {path: '/invoices/create_invoice', element: <CreateInvoice />}
                ]}
                authContextValue={test_user_dummy}
            >
                <InvoiceForm method="POST" />
            </TestRouterWrapper>
        )

        expect(screen.getByText(/Create Invoice/i)).toBeInTheDocument()
        expect(screen.getByTestId('invoice_form')).toBeInTheDocument()
    })

    it('should create a new invoice', async () => {
        const invoice = mockInvoice
        const createInvoiceMock = vi.mocked(createInvoice)
        createInvoiceMock.mockResolvedValue(201)

        render(
            <TestRouterWrapper
                routes={[
                    {path: '/invoices/create_invoice', element: <CreateInvoice />}
                ]}
                authContextValue={test_user_dummy}
            >
                <InvoiceForm method="POST" />
            </TestRouterWrapper>
        )

        fireEvent.change(screen.getByLabelText(/Invoice Date/i), { target: { value: invoice.invoice_date } })
        expect(screen.getByLabelText(/Invoice Date/i)).toHaveValue(invoice.invoice_date)
        fireEvent.submit(screen.getByTestId('invoice_form'))
        
        await waitFor(() => {
            expect(createInvoiceMock).toHaveBeenCalledWith({...invoice, 
                invoice_id: undefined})
        })

        expect(createInvoiceMock).toHaveBeenCalledTimes(1)
    })
})