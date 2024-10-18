import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContactForm, Login } from '../components/Home'
import { vi } from 'vitest'
import { login } from '../api/auth'
import { MemoryRouter } from 'react-router-dom'
import { MainMenu } from '../components/MainMenu'
import { TestRouterWrapper } from './utils'

vi.mock('../api/auth', async(importOriginal) => {
    const original = await importOriginal<typeof import('../api/auth')>()
    return {
        ...original,
        login: vi.fn()
    }
})

describe('Home Page', () => {
    describe('Contact Form', () => {
        beforeEach(() => {
            // Mock window.open before each test
            window.open = vi.fn()
        })

        it('should display the Contact Form', () => {
            render(
                <MemoryRouter>
                    <ContactForm />
                </MemoryRouter>
            )
            const message = screen.queryByText(/Want to know more about us?/i)
            expect(message).toBeVisible()
        })
        
        it('should display a successful message when the email is correctly submitted', async() => {
            render(
                <ContactForm />
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'sean@example.com' } })

            fireEvent.click(screen.getByTestId('send_email'))

            await waitFor(() => {
                expect(screen.getByText(/Submitted/i)).toBeInTheDocument()
            })
        })

        it('should display the correct mailto link upon successful submission', async() => {
            render(
                <ContactForm />
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'sean@example.com' } })

            fireEvent.click(screen.getByTestId('send_email'))

            await waitFor(() => {
                const mailtoLink = `mailto:trinity@mep.com?subject=Contact For More Information&body=Hello, I want to know more about your company.`
                expect(window.open).toHaveBeenCalledWith(mailtoLink)
            })
        })

        it('should display an error message when the email is not correctly submitted', async() => {
            render(
                <ContactForm />
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'sean' } })

            fireEvent.click(screen.getByTestId('send_email'))

            await waitFor(() => {
                expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument()
            })
        })
    })  

    describe('Login Form', () => {
        beforeEach(() => {
            (login as jest.Mock).mockReset()
        })
        
        it('should display the login page', () => {
            render(
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            )
            const message = screen.queryByText(/Login/i)
            const emailInput = screen.getByLabelText(/e-?mail:?/i)
            const passwordInput = screen.getByLabelText(/password/i)
            const loginButton = screen.getByTestId('login_submit')

            expect(message).toBeVisible()
            expect(emailInput).toBeInTheDocument()
            expect(passwordInput).toBeInTheDocument()
            expect(loginButton).toBeInTheDocument()
        })

        it('should login with correct credentials', async() => {
            (login as jest.Mock).mockResolvedValue(200)

            render(
                <TestRouterWrapper 
                routes={[{ path: '/', element: <Login /> },
                    {path: '/main_menu', element: <MainMenu />}]}
                authContextValue={{ auth: true,
                    user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
                    loading: false,
                    setAuth: vi.fn(), 
                    setUser: vi.fn() }} />
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'sean@example.com' } })
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } })

            fireEvent.click(screen.getByTestId('login_submit'))

            await waitFor(() => {
                expect(screen.getByTestId('location-display')).toHaveTextContent('/main_menu')
            })  

            expect(screen.getByText('Main Menu')).toBeInTheDocument()
            expect(screen.getByText('Hello, Sean')).toBeInTheDocument()
            expect(screen.getByText('Role: Manager')).toBeInTheDocument()

        })

        it('should show error message with an invalid email', async() => { 
            (login as jest.Mock).mockResolvedValue(401)

            render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'test' } })
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } })

            fireEvent.click(screen.getByTestId('login_submit'))

            await waitFor(() => {
                expect(screen.getByText('Please enter a valid email and password')).toBeInTheDocument()
            })

        })

        it('should show error message with incorrect password', async() => {

            (login as jest.Mock).mockResolvedValue(403)

            render(
            <MemoryRouter>
            <Login />
            </MemoryRouter>
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'test@test.com' } })
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } })

            fireEvent.click(screen.getByTestId('login_submit'))

            await waitFor(() => {
                expect(screen.getByText('Incorrect email or password')).toBeInTheDocument()
            })

        })

        it('should error message with empty email', async() => {   
            (login as jest.Mock).mockResolvedValue(401)

            render(
            <MemoryRouter>
            <Login />
            </MemoryRouter>
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: '' } })
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } })

            fireEvent.click(screen.getByTestId('login_submit'))

            await waitFor(() => {
                expect(screen.getByText('Please enter a valid email and password')).toBeInTheDocument()
            })

        })

        it('should show error message with empty password', async() => {
            (login as jest.Mock).mockResolvedValue(401)

            render(
            <MemoryRouter>
            <Login />
            </MemoryRouter>
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'test@test.com' } })
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '' } })

            fireEvent.click(screen.getByTestId('login_submit'))

            await waitFor(() => {
                expect(screen.getByText('Please enter a valid email and password')).toBeInTheDocument()
            })

        })

        it('should handle server error', async() => {
            (login as jest.Mock).mockResolvedValue(500)

            render(
            <MemoryRouter>
            <Login />
            </MemoryRouter>
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'test@test.com' } })
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } })

            fireEvent.click(screen.getByTestId('login_submit'))

            await waitFor(() => {
                expect(screen.getByText('Server Error')).toBeInTheDocument()
            })
        })

        it('should handle network error', async() => {
            (login as jest.Mock).mockRejectedValue(new Error('Network Error'))

            render(
            <MemoryRouter>
            <Login />
            </MemoryRouter>
            )

            fireEvent.change(screen.getByLabelText(/e-?mail:?/i), { target: { value: 'test@test.com' } })
            fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test123' } })

            fireEvent.click(screen.getByTestId('login_submit'))

            await waitFor(() => {
                expect(screen.getByText('Network Error')).toBeInTheDocument()
            })
        })

    })
})