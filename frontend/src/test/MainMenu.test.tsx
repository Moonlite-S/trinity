import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Login } from '../components/Home'
import { MainMenu } from '../components/MainMenu'
import { TestRouterWrapper } from './utils'

vi.mock('../api/auth', async(importOriginal) => {
    const original = await importOriginal<typeof import('../api/auth')>()
    return {
        ...original,
        checkUser: vi.fn(),
        login: vi.fn()
    }
})

describe('MainMenu', () => {
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
        it('should display the main menu', async () => {
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
                expect(screen.getByTestId('location-display')).toHaveTextContent('/main_menu')
            }) 

            expect(screen.getByText(/main menu/i)).toBeInTheDocument()
            expect(screen.getByText(/logout/i)).toBeInTheDocument()
        })
        
        it('should display the nav buttons', () => {
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

            expect(screen.getByText(/create announcement/i)).toBeInTheDocument()
            expect(screen.getByText(/create project/i)).toBeInTheDocument()
            expect(screen.getByText(/update project/i)).toBeInTheDocument()
            expect(screen.getByText(/project status report/i)).toBeInTheDocument()
            expect(screen.getByText(/your tasks/i)).toBeInTheDocument()
            expect(screen.getByText(/create task/i)).toBeInTheDocument()

            expect(screen.getByText(/calendar/i)).toBeInTheDocument()
            expect(screen.getByText(/employee list/i)).toBeInTheDocument()
            expect(screen.getByText(/create employee/i)).toBeInTheDocument()
        })
    })
})
