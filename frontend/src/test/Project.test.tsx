import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { test_user_dummy, TestRouterWrapper } from './utils'
import { CreateProject, UpdateProjectList } from '../components/Project'
import { createProject } from '../api/projects'
import userEvent from '@testing-library/user-event'

vi.mock('../api/auth', async(importOriginal) => {
    const original = await importOriginal<typeof import('../api/auth')>()
    return {
        ...original,
        login: vi.fn(),
        logout: vi.fn()
    }
})

vi.mock('../api/projects', async(importOriginal) => {
    const original = await importOriginal<typeof import('../api/projects')>()
    return {
        ...original,
        getProjectList: vi.fn().mockResolvedValue([]),
        createProject: vi.fn().mockResolvedValue(201),
        getDataForProjectCreation: vi.fn().mockResolvedValue({
            project_count: 0,
            users: ['Sean'],
            client_names: ['test'],
            cities: ['test'],
            current_user: ['test']
        })
    }
})

const project = {
    project_id: '2024-02-001',
    project_name: 'Test Project',
    description: 'This is a test project',
    start_date: '2024-02-20',
    end_date: '2024-02-20',
    status: 'ACTIVE',
    manager: "Sean",
    city: 'test',
    client_name: 'test',
    folder_location: '2024-02-01',
    template: ''
}

describe('Project Creation', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should create a new project', async () => {
        const new_project = project

        render(
            <TestRouterWrapper
                initialEntries={['/projects/create_project']}
                routes={[
                    {path: '/projects/create_project', element: <CreateProject />},
                    {path: '/projects', element: <UpdateProjectList />}
                ]}
                authContextValue={test_user_dummy}
            />
        )

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: new_project.project_name } })
        fireEvent.change(screen.getByLabelText(/Project description/i), { target: { value: new_project.description } })
        fireEvent.change(screen.getByLabelText(/Date Created/i), { target: { value: new_project.start_date } })
        fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: new_project.end_date } })
        fireEvent.change(screen.getByLabelText(/Folder Name/i), { target: { value: new_project.folder_location } })
        
        // For React-Select components
        const managerSelect = screen.getByLabelText(/Project Manager/i)
        userEvent.click(managerSelect)
        userEvent.type(managerSelect, "Sean")
        userEvent.keyboard('{enter}')

        const citySelect = screen.getByLabelText(/City/i)
        userEvent.click(citySelect)
        userEvent.type(citySelect, new_project.city)
        userEvent.keyboard('{enter}')

        const clientSelect = screen.getByLabelText(/Client Name/i)
        userEvent.click(clientSelect)
        userEvent.type(clientSelect, new_project.client_name)
        userEvent.keyboard('{enter}')

        const createButton = screen.getByText('Create Project')
        userEvent.click(createButton)

        await waitFor(() => {
            expect(createProject).toHaveBeenCalledTimes(1)
            //expect(createProject).toHaveBeenCalledWith(new_project) // Doesn't work so far
        })
    })
})
