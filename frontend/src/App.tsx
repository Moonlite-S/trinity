import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Outlet, useLocation } from 'react-router-dom'
import { MainMenu } from './components/MainMenu'
import Home from './components/Home'
import './App.css'
import { CreateProject, UpdateProject, UpdateProjectList, ProjectStatusReport } from './components/Project'
import { checkUser } from './api/auth'
import { Tasks } from './components/Tasks';

// Main Router for the application
export default function App() {
  return (
    <Router>

        <Routes>

            <Route path='/' element={<Home />} />

            <Route element={<Verification />}>

              <Route path='/main_menu' element={<MainMenu />} />
              <Route path='/create_project' element={<CreateProject />} />
              <Route path='/update_project' element={<UpdateProjectList />} />
              <Route path='/update_project/:id' element={<UpdateProject />} />
              <Route path='/project_status_report/:id' element={<ProjectStatusReport />} />
              <Route path='/task' element={<Tasks />} />

            </Route>

        </Routes>

    </Router>
  )
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
    const location = useLocation()

    useEffect(() => {
      // Check if user is logged in
      const checkForValidation = async () => {
        setLoading(true)
        try {
          const reponse_code = await checkUser()
          
          if (reponse_code === 200) {
            console.log("User verified")
            isAuth(true)
          }
        } catch (error) {
          console.error("Error checking user:", error);
          isAuth(false)
          setLoading(false)
        } finally {
          setLoading(false)
        }
      }
      console.log("Checking..")

      checkForValidation()

    }, [location]);
    
    // Change this to a custom loading screen
    if (loading) {
      return <div>Loading...</div>
    }

    return (auth ? <Outlet/> : <Home />)
}