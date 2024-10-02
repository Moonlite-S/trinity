import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ProjectProps } from '../interfaces/project_types'
import { TestRouterWrapper } from './utils'
import { CreateProject } from '../components/Project'

vi.mock('../api/auth', async(importOriginal) => {
    const original = await importOriginal<typeof import('../api/auth')>()
    return {
        ...original,
        login: vi.fn()
    }
})

describe('Project Creation', () => {
    it('should create a new project', async () => {
        const project: ProjectProps = {
            project_name: 'Test Project',
            description: 'This is a test project',
            start_date: '2024-02-20',
            end_date: '2024-02-20',
            status: 'ACTIVE',
            project_id: '2024-02-01',
            manager: {
                id: '1',
                name: 'Test Manager',
                email: 'test@test.com',
                username: 'test',
                password: 'test',
                role: 'MANAGER',
                date_joined: new Date().toLocaleTimeString(),
                projects: [],
                tasks: []
            },
            city: 'test',
            quarter: 'Q1',
            client_name: 'test',
            folder_location: '2024-02-01',
            project_template: 'test'
        }

        render(
            <TestRouterWrapper
                initialEntries={['/projects/create_project']}
                routes={[
                    {path: '/projects/create_project', element: <CreateProject />}
                ]}
            />
        )

        const projectNameInput = screen.getByLabelText(/Project Name/i)
        const statusSelect = screen.getByLabelText(/Status/i)
        const startDateInput = screen.getByLabelText(/Date Created/i)
        const endDateInput = screen.getByLabelText(/Due Date/i)
        const folderLocationInput = screen.getByLabelText(/Folder Name/i)
        const managerInput = screen.getByLabelText(/Manager/i)
        const clientNameInput = screen.getByLabelText(/Client Name/i)
        const cityInput = screen.getByLabelText(/City:/i)
        const descriptionInput = screen.getByLabelText(/Description/i)

        fireEvent.change(projectNameInput, { target: { value: project.project_name } })
        fireEvent.change(descriptionInput, { target: { value: project.description } })
        fireEvent.change(startDateInput, { target: { value: project.start_date } })
        fireEvent.change(endDateInput, { target: { value: project.end_date } })
        fireEvent.change(statusSelect, { target: { value: project.status } })
        fireEvent.change(cityInput, { target: { value: project.city } })
        fireEvent.change(clientNameInput, { target: { value: project.client_name } })
        fireEvent.change(folderLocationInput, { target: { value: project.folder_location } })
        fireEvent.change(managerInput, { target: { value: project.manager.id } })

        const createButton = screen.getByText('Create Project')
        fireEvent.click(createButton)

        await waitFor(() => {
            expect(window.location.pathname).toBe('/projects')
        })
    })
})
