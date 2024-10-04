import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { test_user_dummy, TestRouterWrapper } from './utils'
import { CreateProject, UpdateProjectList } from '../components/Project'
import { createProject } from '../api/projects'
import userEvent from '@testing-library/user-event'
import { ProjectFormProps } from '../interfaces/project_types'
import selectEvent from 'react-select-event';
import { act } from 'react'
import { ProjectFormCreation } from '../components/ProjectForm'

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

const project: ProjectFormProps = {
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
                initialEntries={['/']}
                routes={[
                    {path: '/projects/create_project', element: <CreateProject />},
                    {path: '/projects', element: <UpdateProjectList />}
                ]}
                authContextValue={test_user_dummy}
            >
                <ProjectFormCreation />
            </TestRouterWrapper>
        )

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/Project Name/i), { target: { value: new_project.project_name } })
        fireEvent.change(screen.getByLabelText(/Project description/i), { target: { value: new_project.description } })
        fireEvent.change(screen.getByLabelText(/Date Created/i), { target: { value: new_project.start_date } })
        fireEvent.change(screen.getByLabelText(/Date Due/i), { target: { value: new_project.end_date } })
        fireEvent.change(screen.getByLabelText(/Folder Name/i), { target: { value: new_project.folder_location } })
        
        // For React-Select components
        const managerSelect = screen.getByLabelText(/Project Manager/i)
        expect(managerSelect).toBeInTheDocument()

        const citySelect = screen.getByLabelText(/City/i)
        fireEvent.keyDown(citySelect, { key: 'ArrowDown' })
        await waitFor(() => {
            expect(screen.getByText('test city')).toBeInTheDocument()
        })
        fireEvent.click(screen.getByText('test city'))
        console.log(screen.debug())
        expect(citySelect).toHaveValue('test city')

        const clientSelect = screen.getByLabelText(/Client Name/i)
        await act(async () => {
            await selectEvent.openMenu(clientSelect)
        })

        const createButton = screen.getByText('Create Project')
        userEvent.click(createButton)

        await waitFor(() => {
            expect(createProject).toHaveBeenCalledTimes(1)
        })
    })
})
