import { test_user_dummy, TestRouterWrapper } from "./utils"
import CreateSubmittal from "../components/Submittal"
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from "vitest"
import { SubmittalProps } from "../interfaces/submittal_types"
import { createSubmittal } from "../api/submittal"
import { SubmittalForm } from "../components/SubmittalForm"

const test_submittal: SubmittalProps = {
    project: "Test Project",
    received_date: new Date().toLocaleDateString('en-CA'),
    project_name: "(Search Project)",
    type: "MECHANICAL",
    sub_description: "Test Submittal",
    notes: "Test Notes",
    sent_item: "Cool item",
    send_email: "send@email.com",
    assigned_to: "test user",
    status: "OPEN",
}

// const test_creation_data: SubmittalCreationProps = {
//     projects: [['Test Project', '1']],
//     users: [['Test User', '1']],
//     client_names: ['Test Client']
// }

vi.mock('../api/submittal', async (importOriginal) => {
    const original = await importOriginal<typeof import('../api/submittal')>()
    return {
        ...original,
        createSubmittal: vi.fn()
    }
})

describe('Submittal Form', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render the submittal form', () => {
        render(
            <TestRouterWrapper 
                routes={[]}
                authContextValue={test_user_dummy}
            >
                <CreateSubmittal />
            </TestRouterWrapper>
        )


        // There's a "Create Submittal" button on the navbar and on the page itself lol
        expect(screen.getByText(/Create Submittal/i)).toBeInTheDocument()
    })

    it('should render the submittal form with the correct initial values', async () => {
        const createSubmittalMock = vi.mocked(createSubmittal)

        createSubmittalMock.mockResolvedValue(201)

        render(
            <TestRouterWrapper
                routes={[
                    {path: '/submittals/create_submittal', element: <CreateSubmittal />}
                ]}
                authContextValue={test_user_dummy}
            >
                <SubmittalForm method="POST" />
            </TestRouterWrapper>
        )

        fireEvent.change(screen.getByLabelText(/Project/i), { target: { value: test_submittal.project } })
        expect(screen.getByLabelText(/Project/i)).toHaveValue(test_submittal.project)

        fireEvent.change(screen.getByLabelText(/Received Date/i), { target: { value: test_submittal.received_date } })
        expect(screen.getByLabelText(/Received Date/i)).toHaveValue(test_submittal.received_date)

        fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: test_submittal.project_name } })
        expect(screen.getByLabelText(/Project Name/i)).toHaveValue(test_submittal.project_name)

        fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: test_submittal.type } })
        expect(screen.getByLabelText(/Type/i)).toHaveValue(test_submittal.type)

        fireEvent.change(screen.getByLabelText(/Submittal Description/i), { target: { value: test_submittal.sub_description } })
        expect(screen.getByLabelText(/Submittal Description/i)).toHaveValue(test_submittal.sub_description)

        fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: test_submittal.notes } })
        expect(screen.getByLabelText(/Notes/i)).toHaveValue(test_submittal.notes)

        fireEvent.change(screen.getByLabelText(/Sent Item/i), { target: { value: test_submittal.sent_item } })
        expect(screen.getByLabelText(/Sent Item/i)).toHaveValue(test_submittal.sent_item)

        fireEvent.change(screen.getByLabelText(/Send Email/i), { target: { value: test_submittal.send_email } })
        expect(screen.getByLabelText(/Send Email/i)).toHaveValue(test_submittal.send_email)

        fireEvent.change(screen.getByLabelText(/Assigned To/i), { target: { value: test_submittal.assigned_to } })
        expect(screen.getByLabelText(/Assigned To/i)).toHaveValue(test_submittal.assigned_to)

        // TODO: Fix this
        //fireEvent.submit(screen.getByText(/Create Submittal/i))
        //expect(createSubmittalMock).toHaveBeenCalledTimes(1)
    })
})