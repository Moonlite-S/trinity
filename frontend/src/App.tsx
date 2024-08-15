import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import {MainMenu} from './components/MainMenu'
import Home from './components/Home'
import { Verification } from './components/Verify'
import { CreateProject, UpdateProject } from './components/Project'

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(true)

  useEffect(() => {
    // Check if user is logged in
    checkAuth()
  }, []);

  const checkAuth = () => {
    // Either use tokens, maybe an API call, both, etc.
    setIsAuth(true)
  }

  return (
    <Router>

        <Routes>

            <Route path='/' element={<Home />} />

            <Route element={<Verification isAuth={isAuth} redirectPath='/' />}>

              <Route path='/main_menu' element={<MainMenu />} />
              <Route path='/create_project' element={<CreateProject />} />
              <Route path='/update_project' element={<UpdateProject />} />

            </Route>

        </Routes>

    </Router>
  )
}

export default App

