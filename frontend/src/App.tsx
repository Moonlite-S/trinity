import { createContext, useContext, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Home from './components/Home'
import './App.css'
import { checkUser } from './api/auth'
import { Header } from './components/misc'
import { EmployeeProps } from './interfaces/employee_type'
import { AppRoutes } from './Routes'

// Main Router for the application
export default function App() {
  return (
    <AppRoutes />
  )
} 

export interface AuthContextType {
  auth: boolean
  user: EmployeeProps | null
  loading: boolean
  setAuth: (auth: boolean) => void
  setUser: (user: EmployeeProps | null) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Get the current auth context
 * 
 * Use this to see through a user's data
 * 
 * @returns the current auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Bridge Component for login verification
 * 
 * Check if user is authenticated,
 * 
 * if so, go to where the user wants to go
 * 
 * if not, redirect to login.
 * 
 * #### This component triggers EVERY time the user navigates anywhere in it's children.
 * 
 * @param isAuth: boolean
 * @param redirectPath: string
 */
export function Verification() {
    const [auth, isAuth] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [user, setUser] = useState<EmployeeProps | null>(null)
    const location = useLocation()

    useEffect(() => {
      // Check if user is logged in
      const checkForValidation = async () => {
        setLoading(true)

        try {
          const user = await checkUser()
          setUser(user)
          isAuth(true)
        } catch (error) {
          console.error("Error checking user:", error)
          isAuth(false)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
      
      console.log("Checking..")

      checkForValidation()
    }, [location])
    
    console.log("User: ", user)
    // Change this to a custom loading screen
    if (loading) {
      return <LoadingComponent />
    }

    return (
      <AuthContext.Provider value={{ auth, user, loading, setAuth: isAuth, setUser }}>
        {auth ? <Outlet /> : <Home />}
      </AuthContext.Provider>
    )
}

/**
 * Maybe add some flair to this later
 * 
 */
function LoadingComponent() {
  return (
    <>
    <Header />
    <div className='mx-auto flex justify-center'>
    <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900' />
    </div>
    </>
  )
}