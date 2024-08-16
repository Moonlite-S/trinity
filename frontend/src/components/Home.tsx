import React from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "./misc"
import { login } from "../api/auth"

/**
 * Index Home Page
 */
export default function Home() {
    // Handle consistent login authentication
  
    return (
      <>
        <Header />

        <div className='w-screen'>
            
          <div className='flex flex-row justify-center gap-3'>
  
            <ContactForm />
  
            <div className='border-2' />
  
            <Login />
  
          </div>
  
        </div>
  
      </>
    )
  }

  function ContactForm() {
    const [email, setEmail] = React.useState<string>('')
    const [submitted, setSubmitted] = React.useState<boolean>(false)
    const [error, setError] = React.useState<boolean>(false)
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    const handleSubmit = () => {
      // Do Validation Here
      if (email === '' || !email_regex.test(email)) {
        console.log("Nuh uh");
        setError(true)
        return
      }
  
      // Removes leading and trailing whitespace
      setEmail(email.trim())
  
      setSubmitted(true)
      setError(false)
  
      console.log('email: ' + email)
            
    }
    return (
      <div className='m-5'>
  
          <h2 className='p-3'>Want to know more about us?</h2>
  
  
          <div className='flex flex-col'>
  
            <label className='mb-3 mt-3'>E-mail</label>
            <input type='text' name='email' className='bg-slate-100' onChange={(e) => setEmail(e.target.value)}/>
  
          </div>
  
          {submitted ? <p className='mt-3'>Submitted</p> : <button type='submit' onClick={handleSubmit} className='mt-3 bg-red-100 p-3'>Submit</button>}
          {error && <p className='mt-3 text-red-500'>Please Enter a Valid Email</p>}
  
      </div>
    )
}

/**
 * Login Component
 * 
 */
  function Login(){
    const [username, setUsername] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')
    const [error, setError] = React.useState<boolean>(false)
    const [loading, setLoading] = React.useState<boolean>(false)
    const navigate = useNavigate();
  
    const handleSubmit = async (e: any) => { 
      e.preventDefault()

      setLoading(true)

      // Do Validation Here
      if (!username || !password) {
        console.log("Nuh uh");
        setError(true)
        return
      }
  
      setError(false)

      // Get results of login()
      try {
        const response: number = await login({username, password})
        console.log(response)

        if (response === 200) {
          navigate("/main_menu")
        }
        else if (response === 401) {
          console.log("login failed")
          navigate("/main_menu") // DEBUG    
        }
        else {
          console.log("Another Error")
          navigate("/main_menu") // DEBUG
        }
      }
      catch (error) {
        console.error("Network Error: ",error)
        navigate("/main_menu") // DEBUG
      }

      // POST form to backend
      // If successful, go to main page
      // If not, show error

    }

    return(
      <div className='m-5'>
  
        <h2 className='p-3'>Existing User? Login Here:</h2>
  
        <form onSubmit={handleSubmit} className='p-3'>
  
          <div className='flex flex-col'>
  
            <label className='mb-3'>Username:</label>
            <input type='text' name='email' className='bg-slate-100' onChange={(e) => setUsername(e.target.value)}/>
  
            <label className='mb-3'>Password:</label>
            <input type='password' name='password' className='bg-slate-100' onChange={(e) => setPassword(e.target.value)}/>
  
          </div>
  
          {(!error && loading) ? <p className='mt-3'>Loading...</p> : <button type='submit' className='mt-3 bg-red-100 p-3' onSubmit={handleSubmit}>Submit</button>}

          {error && <p className='mt-3 text-red-500'>Invalid Credentials</p>}
        
        </form>
  
      </div>
    )
  }