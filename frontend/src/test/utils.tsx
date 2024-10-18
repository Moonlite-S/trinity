// Utility functions for testing

import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { AuthContext, AuthContextType } from "../App"

// Display the current location
// Since MemoryRouter is being used for testing,
// using window.location.pathname will not work.
// Instead, we use this.
export const LocationDisplay = () => {
    const location = useLocation()
    return <div data-testid="location-display">{location.pathname}</div>
}

type RouteType = {
  path: string
  element: React.ReactNode
}

type TestRouterWrapper = {
  children?: React.ReactNode
  initialEntries?: string[]
  routes: RouteType[]
  authContextValue?: Partial<AuthContextType>
}

export const test_user_dummy: Partial<AuthContextType> = {
  auth: true,
  user: { name: 'Sean', email: 'sean@example.com', username: 'sean', password: '123', role: 'Manager' },
  loading: false,
  setAuth: vi.fn(), 
  setUser: vi.fn() 
}

// Wrapper for Routing Testing
export function TestRouterWrapper({
  children,
  initialEntries = ['/'],
  routes,
  authContextValue
}: TestRouterWrapper) {
  const defaultAuthContextValue: AuthContextType = {
    auth: false,
    user: { name: '', email: '', username: '', password: '', role: 'Team Member' },
    loading: false,
    setAuth: vi.fn(),
    setUser: vi.fn(),
    ...authContextValue
  }
  
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider value={defaultAuthContextValue}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
        {children}
        <LocationDisplay />
      </AuthContext.Provider>
    </MemoryRouter>
  )
}