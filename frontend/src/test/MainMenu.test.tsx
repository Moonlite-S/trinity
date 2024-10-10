import { render, screen, waitFor } from '@testing-library/react'
import { Login } from '../components/Home'
import { MainMenu } from '../components/MainMenu'
import { TestRouterWrapper } from './utils'
import { AnnouncementProps } from '../interfaces/announcement_types'
import { EmployeeProps } from '../interfaces/employee_type'
import { getAnnouncements } from '../api/announcements'

vi.mock('../api/auth', async(importOriginal) => {
    const original = await importOriginal<typeof import('../api/auth')>()
    return {
        ...original,
        checkUser: vi.fn(),
        login: vi.fn()
    }
})

vi.mock('../api/announcements', () => ({
    getAnnouncements: vi.fn()
}))

describe('MainMenu Dashboard', () => {
    describe('when the user is not logged in', () => {
        it('should display the home page', async () => {
            render(
                <TestRouterWrapper 
                routes={[{ path: '/', element: <Login /> },
                    {path: '/main_menu', element: <MainMenu />}]}
                authContextValue={{ auth: false,
                    user: null, loading: false, setAuth: vi.fn(), setUser: vi.fn() }} />
            )

            await waitFor(() => {
                expect(screen.getByTestId('location-display')).toHaveTextContent('/')
            }) 
        })
    })

    describe('when the user is logged in', () => {
        it('should display the user information', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/sean/i)).toBeInTheDocument()
            expect(screen.getByText(/manager/i)).toBeInTheDocument()
        })

        it('should display the logout button', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/logout/i)).toBeInTheDocument()
        })

        it('should display no announcements', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/no announcements at the moment/i)).toBeInTheDocument()
        })

        it('should display no projects', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/no projects assigned to you/i)).toBeInTheDocument()
        })

        it('should display no tasks', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/no tasks assigned to you/i)).toBeInTheDocument()
        })

    })

    describe('when the user is a manager', () => {
        it('should display the manager dashboard', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/role: manager/i)).toBeInTheDocument()

            // All the buttons should be displayed
            expect(screen.getByText(/create announcement/i)).toBeInTheDocument()
            expect(screen.getByText(/create project/i)).toBeInTheDocument()
            expect(screen.getByText(/update project/i)).toBeInTheDocument()
            expect(screen.getByText(/project status report/i)).toBeInTheDocument()
            expect(screen.getByText(/your tasks/i)).toBeInTheDocument()
            expect(screen.getByText(/create task/i)).toBeInTheDocument()
            expect(screen.getByText(/view rfi/i)).toBeInTheDocument()
            expect(screen.getByText(/create rfi/i)).toBeInTheDocument()
            expect(screen.getByText(/create submittal/i)).toBeInTheDocument()
            expect(screen.getByText(/view submittals/i)).toBeInTheDocument()
            expect(screen.getByText(/proposal/i)).toBeInTheDocument()
            expect(screen.getByText(/calendar/i)).toBeInTheDocument()
            expect(screen.getByText(/calls/i)).toBeInTheDocument()
            expect(screen.getByText(/employee list/i)).toBeInTheDocument()
            expect(screen.getByText(/create employee/i)).toBeInTheDocument()
            expect(screen.getByText(/logout/i)).toBeInTheDocument()
        })
    })

    describe('when the user is a admin', () => {
        it('should display the admin dashboard', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Administrator' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/role: administrator/i)).toBeInTheDocument()

            // All the buttons should be displayed
            expect(screen.getByText(/create announcement/i)).toBeInTheDocument()
            expect(screen.getByText(/create project/i)).toBeInTheDocument()
            expect(screen.getByText(/update project/i)).toBeInTheDocument()
            expect(screen.getByText(/project status report/i)).toBeInTheDocument()
            expect(screen.getByText(/your tasks/i)).toBeInTheDocument()
            expect(screen.getByText(/create task/i)).toBeInTheDocument()
            expect(screen.getByText(/view rfi/i)).toBeInTheDocument()
            expect(screen.getByText(/create rfi/i)).toBeInTheDocument()
            expect(screen.getByText(/create submittal/i)).toBeInTheDocument()
            expect(screen.getByText(/view submittals/i)).toBeInTheDocument()
            expect(screen.getByText(/proposal/i)).toBeInTheDocument()
            expect(screen.getByText(/calendar/i)).toBeInTheDocument()
            expect(screen.getByText(/calls/i)).toBeInTheDocument()
            expect(screen.getByText(/employee list/i)).toBeInTheDocument()
            expect(screen.getByText(/create employee/i)).toBeInTheDocument()
            expect(screen.getByText(/logout/i)).toBeInTheDocument()
        })
    })

    describe('when the user is a team member', () => {
        it('should display the team member dashboard', () => {
            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Team Member' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            expect(screen.getByText(/role: team member/i)).toBeInTheDocument()

            // Only the following buttons should be displayed
            expect(screen.getByText(/project status report/i)).toBeInTheDocument()
            expect(screen.getByText(/your tasks/i)).toBeInTheDocument()
            expect(screen.getByText(/view rfi/i)).toBeInTheDocument()
            expect(screen.getByText(/view submittals/i)).toBeInTheDocument()
            expect(screen.getByText(/calendar/i)).toBeInTheDocument()
            expect(screen.getByText(/calls/i)).toBeInTheDocument()
            expect(screen.getByText(/logout/i)).toBeInTheDocument()
        })
    })

    describe('when the dashboard has an announcement', () => {
        it('should display the announcement', async () => {
            const author: EmployeeProps = {
                name: 'Tester',
                email: 'sean@example.com',
                username: 'sean',
                password: '123',
                role: 'Manager'
            }

            const announcement: AnnouncementProps = {
                title: 'Test Announcement',
                content: 'This is a test announcement',
                date_created: new Date().toISOString(),
                author: author.name
            }

            const announcementList: AnnouncementProps[] = [announcement]

            vi.mocked(getAnnouncements).mockResolvedValue(announcementList)

            render(
                <TestRouterWrapper 
                initialEntries={['/main_menu']}
                routes={[
                    {path: '/main_menu', element: <MainMenu />}
                ]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            await waitFor(() => {
                expect(getAnnouncements).toHaveBeenCalled()
            })

            await waitFor(() => {
                expect(screen.getByText('Test Announcement')).toBeInTheDocument()
                expect(screen.getByText('This is a test announcement')).toBeInTheDocument()
                expect(screen.getByText('Tester')).toBeInTheDocument()
            })
        })
    })
})