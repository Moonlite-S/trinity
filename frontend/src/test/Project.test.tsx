import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { test_user_dummy, TestRouterWrapper } from './utils'
import { CreateProject, UpdateProjectList } from '../components/Project'
import { createProject } from '../api/projects'
import selectEvent from 'react-select-event';
import { act } from 'react'
import { ProjectForm } from '../components/ProjectForm'

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
        getDataForProjectCreation: vi.fn().mockResolvedValue(
            Promise.resolve({
                project_count: 0,
                users: [['Sean', 'sean@example.com']],
                client_names: ['test client'],
                cities: ['test city'],
                current_user: ['test user']
            })
        )
    }
})

const project = {
    project_name: 'Test Project',
    description: 'This is a test project',
    start_date: '2024-02-20',
    end_date: '2024-02-20',
    status: 'ACTIVE',
    manager: 'sean@example.com',
    city: 'test city',
    client_name: 'test client',
    template: 'default'
}

describe('Project Creation', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should create a new project', async () => {
        const new_project = project

        render(
            <TestRouterWrapper
                routes={[
                    {path: '/projects/create_project', element: <CreateProject />},
                    {path: '/projects', element: <UpdateProjectList />}
                ]}
                authContextValue={test_user_dummy}
            >
                <ProjectForm method="POST" />
            </TestRouterWrapper>
        )

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: new_project.project_name } })
        fireEvent.change(screen.getByLabelText(/Project description/i), { target: { value: new_project.description } })
        fireEvent.change(screen.getByLabelText(/Date Created/i), { target: { value: new_project.start_date } })
        fireEvent.change(screen.getByLabelText(/Date Due/i), { target: { value: new_project.end_date } })
        
        // For React-Select components
        const managerSelect = screen.getByLabelText(/Project Manager/i)
        expect(managerSelect).toBeInTheDocument()

        const citySelect = screen.getByLabelText(/City/i)
        fireEvent.keyDown(citySelect, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('test city')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('test city'))

        const clientSelect = screen.getByLabelText(/Client Name/i)
        await act(async () => {
            selectEvent.openMenu(clientSelect)
        })
        fireEvent.keyDown(clientSelect, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('test client')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('test client'))

        fireEvent.submit(screen.getByTestId('project_creation'))

        await waitFor(() => {
            expect(createProject).toHaveBeenCalledWith({...new_project, 
                project_id: expect.any(String)})
        })

        expect(createProject).toHaveBeenCalledTimes(1)
    })
})
