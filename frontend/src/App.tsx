import { createContext, useContext, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Outlet, useLocation } from 'react-router-dom'
import { MainMenu } from './components/MainMenu'
import Home from './components/Home'
import './App.css'
import { CreateProject, UpdateProject, UpdateProjectList, ProjectStatusReport, ProjectDeleteConfimation } from './components/Project'
import { checkUser } from './api/auth'
import { Tasks } from './components/Tasks';
import { CreateEmployee, EmployeeList } from './components/Employee'
import { TemplateList } from './components/Template'
import { ErrorPage } from './components/Error'
import { Calendar } from './components/Calendar';
import { Header } from './components/misc'
import { EmployeeProps } from './interfaces/employee_type'
import { SetAnnouncement } from './components/Announcement'

// Main Router for the application
export default function App() {
  return (
    <Router>

        <Routes>

            <Route path='/' element={<Home />} />

            {/* All routes here are checked for authentication. */}
            <Route element={<Verification />}>

              <Route path='/main_menu' element={<MainMenu/>} />

              <Route path='/projects/' element={<UpdateProjectList />} />
              <Route path='/projects/create_project' element={<CreateProject />} />
              <Route path='/projects/update_project/:id' element={<UpdateProject />} />
              <Route path='/projects/project_status_report' element={<ProjectStatusReport />} />
              <Route path='/projects/delete/:id' element={<ProjectDeleteConfimation />} />

              <Route path='/task' element={<Tasks />} />
              <Route path='/employees/' element={<EmployeeList />} />
              <Route path='/employees/create_employee' element={<CreateEmployee />} />
              <Route path='/template_list/' element={<TemplateList />} />
              <Route path='/calendar' element={<Calendar />} />

              <Route path='/announcements/create_anncouncement' element={<SetAnnouncement />} />

            </Route>

            <Route path='*' element={<ErrorPage />} />

        </Routes>

    </Router>
  )
}

export interface AuthContextType {
  auth: boolean;
  user: EmployeeProps | null;
  loading: boolean;
  setAuth: (auth: boolean) => void;
  setUser: (user: EmployeeProps | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Get the current auth context
 * 
 * Use this to see through a user's data
 * 
 * @returns the current auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
          console.error("Error checking user:", error);
          isAuth(false)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
      
      console.log("Checking..")

      checkForValidation()

    }, [location]);
    
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
      <h1>Loading...</h1>
    </div>
    </>
  )
}