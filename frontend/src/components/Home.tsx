import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "./misc"
import { get_auth_and_redirect, login, microsoftLogin } from "../api/auth"
import microsoft_logo from '/microsoft_logo.png'
/**
 * Index Home Page
 */
export default function Home() {
    return (
      <>
        <Header />

        <div className='w-screen'>
            
          <div className='flex flex-row justify-center gap-3 mx-auto'>
  
            <ContactForm />
  
            <div className='border-2' />
  
            <Login />
  
          </div>
  
        </div>
  
      </>
    )
  }

/**
 * Component where the user can contact Trinity for more information
 */
export function ContactForm() {
  const [email, setEmail] = React.useState<string>('')
  const [submitted, setSubmitted] = React.useState<boolean>(false)
  const [error, setError] = React.useState<boolean>(false)
  const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  const handleSubmit = () => {
    // Do Validation Here
    if (email === '' || !email_regex.test(email)) {
      setError(true)
      return
    }

    // Removes leading and trailing whitespace
    setEmail(email.trim())

    window.open(`mailto:trinity@mep.com?subject=Contact For More Information&body=Hello, I want to know more about your company.`)

    setSubmitted(true)
    setError(false)
  }
  return (
    <div className='m-5'>

        <h2 className='p-3'>Want to know more about us?</h2>

        <div className='flex flex-col'>

          <label htmlFor='email' className='mb-3 mt-3'>E-mail</label>
          <input id='email' type='text' name='email' className='bg-slate-100' onChange={(e) => setEmail(e.target.value)}/>

        </div>

        {submitted ? <p className='mt-3 text-green-500'>Submitted. We will get back to you as soon as we can!</p> : <button data-testid='send_email' type='submit' onClick={handleSubmit} className='mt-3 bg-red-100 p-3'>Submit</button>}
        {error && <p className='mt-3 text-red-500'>Please Enter a Valid Email</p>}

    </div>
  )
}

/**
 * Login Component
 */
export function Login(){
  const [email, setEmail] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [error, setError] = React.useState<boolean>(false)
  const [errorCode, setErrorCode] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false)
  const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const navigate = useNavigate()

  const handleSubmit = async (event: any) => { 
    event.preventDefault()
    setLoading(true)

    // Do Validation Here
    if (email_regex.test(email) === false || !email || !password) {
      setError(true)
      setErrorCode("Please enter a valid email and password")
      return
    }

    setError(false)

    try {
      const response: string = await login({email, password})
      console.log(response)

      if (response === "200") {
        navigate("/main_menu")

      } else if (response === "Unable to log in with provided credentials.") {
        setErrorCode("Incorrect email or password")
      }
      else if (response === "E-mail is not verified.") {
        setErrorCode("Email on file is not verified")
      }
      else {
        setErrorCode("Server Error")
      }

      setLoading(false)
      setError(true)
    }
    catch (error) {
      setLoading(false)
      setError(true)
      setErrorCode("Network Error")
    }
  }

  const handleMicrosoftLogin = async () => {
    const response = await microsoftLogin()
    console.log(response)
  }

  return(
    <div className='m-5'>

      <h2 className='p-3'>Existing User? Login Here:</h2>

      <form onSubmit={handleSubmit} className='p-3'>

        <div className='flex flex-col'>

          <label htmlFor='email' className='mb-3'>E-mail:</label>
          <input id='email' type='text' name='email' className='bg-slate-100' onChange={(e) => setEmail(e.target.value)}/>

          <label htmlFor='password' className='mb-3'>Password:</label>
          <input id='password' type='password' name='password' className='bg-slate-100' onChange={(e) => setPassword(e.target.value)}/>

        </div>

        {(!error && loading) ? <p className='mt-3'>Loading...</p> : <button data-testid='login_submit' type='submit' className='mt-3 bg-red-100 p-3' onSubmit={handleSubmit}>Submit</button>}

        {error && <p className='mt-3 text-red-500'>{errorCode}</p>}
      
      </form>

      <div className='my-4 flex flex-row justify-center items-center'>
        <div className='border-2 w-full' />
        <div className='text-center mx-3'>OR</div>
        <div className='border-2 w-full' />
      </div>

      <button onClick={handleMicrosoftLogin} className='flex flex-row justify-center items-center p-3 border rounded-md group hover:shadow-md transition-all duration-300'>
        <img src={microsoft_logo} alt='Microsoft Logo' className='w-10 h-10 mr-3 group-hover:scale-110 transition-all duration-300' />
        <div className='text-center '>Login with Microsoft</div>
      </button>

    </div>
  )
}

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const get_token = async () => {
      const token = new URLSearchParams(window.location.search).get('token')
      if (token) {
        const response = await get_auth_and_redirect(token)
        console.log(response)
        if (response === 200) {
          navigate('/main_menu')
        } else {
          console.log("Error: ", response)
        }
      }
    }
    get_token()

  }, [])

  return(
    <div>
      <p>Authenticating...</p>
    </div>
  )
}