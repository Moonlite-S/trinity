import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom'
import { MainMenu } from './components/MainMenu'
import Home from './components/Home'
import './App.css'
import { CreateProject, UpdateProject, UpdateProjectList } from './components/Project'
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
 * if not, redirect to login
 * 
 * @param isAuth: boolean
 * @param redirectPath: string
 */
export function Verification() {
    const [auth, isAuth] = useState<boolean>(true)

    useEffect(() => {
      // Check if user is logged in
      checkUser()
      isAuth(true)
      console.log("Checking..")
    }, []);

    return (auth ? <Outlet/> : <Home />)
}