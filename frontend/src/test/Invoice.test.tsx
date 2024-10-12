import { test_user_dummy, TestRouterWrapper } from "./utils"
import { InvoiceForm } from "../components/InvoiceForm"
import { CreateInvoice } from "../components/Invoice"
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InvoiceProps } from "../interfaces/invoices_types"
import { createInvoice } from "../api/invoices"

const mockInvoice: InvoiceProps = {
    invoice_date: "2024-01-01",
    due_date: "2024-01-01",
    bill_to_name: "test bill to name",
    bill_to_address: "test bill to address",
    bill_to_email: "test@test.com",
    from_name: "test from name",
    from_address: "test from address",
    from_email: "test@test.com",
    subtotal: 100,
    tax: 10,
    total_amount: 110,
    payment_status: "Pending",
    payment_method: "Credit Card",
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

        fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: invoice.due_date } })
        expect(screen.getByLabelText(/Due Date/i)).toHaveValue(invoice.due_date)

        fireEvent.change(screen.getByLabelText(/Bill To Name/i), { target: { value: invoice.bill_to_name } })
        expect(screen.getByLabelText(/Bill To Name/i)).toHaveValue(invoice.bill_to_name)

        fireEvent.change(screen.getByLabelText(/Bill To Address/i), { target: { value: invoice.bill_to_address } })
        expect(screen.getByLabelText(/Bill To Address/i)).toHaveValue(invoice.bill_to_address)

        fireEvent.change(screen.getByLabelText(/Bill To Email/i), { target: { value: invoice.bill_to_email } })
        expect(screen.getByLabelText(/Bill To Email/i)).toHaveValue(invoice.bill_to_email)

        fireEvent.change(screen.getByLabelText(/From Name/i), { target: { value: invoice.from_name } })
        expect(screen.getByLabelText(/From Name/i)).toHaveValue(invoice.from_name)

        fireEvent.change(screen.getByLabelText(/From Address/i), { target: { value: invoice.from_address } })
        expect(screen.getByLabelText(/From Address/i)).toHaveValue(invoice.from_address)

        fireEvent.change(screen.getByLabelText(/From Email/i), { target: { value: invoice.from_email } })
        expect(screen.getByLabelText(/From Email/i)).toHaveValue(invoice.from_email)

        fireEvent.change(screen.getByLabelText(/Subtotal/i), { target: { value: invoice.subtotal.toString() } })
        expect(screen.getByLabelText(/Subtotal/i)).toHaveValue(invoice.subtotal.toString())

        fireEvent.change(screen.getByLabelText(/Tax/i), { target: { value: invoice.tax.toString() } })
        expect(screen.getByLabelText(/Tax/i)).toHaveValue(invoice.tax.toString())

        fireEvent.change(screen.getByLabelText(/Total Amount/i), { target: { value: invoice.total_amount.toString() } })
        expect(screen.getByLabelText(/Total Amount/i)).toHaveValue(invoice.total_amount.toString())
        
        fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: invoice.payment_method } })
        expect(screen.getByLabelText(/Payment Method/i)).toHaveValue(invoice.payment_method)

        fireEvent.submit(screen.getByTestId('invoice_form'))
        
        await waitFor(() => {
            expect(createInvoiceMock).toHaveBeenCalledWith({...invoice, 
                invoice_id: undefined})
        })

        expect(createInvoiceMock).toHaveBeenCalledTimes(1)
    })
})