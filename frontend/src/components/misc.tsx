// For miscelaneous components
import { useNavigate } from 'react-router-dom';
import logo from '/trinity_logo.png'

// Header Component for all pages
export function Header() {
  const navigate = useNavigate();

  return(
    <header className='w-screen h-32 relative'>

      <div className='h-4 w-screen bg-orange-400 absolute -z-10' />

      <img src={logo} alt='Trinity MVP Logo' className="h-32 cursor-pointer" onClick={() => navigate('/main_menu')}/>

    </header>
  )
}

type Back_Button_Props = {
  route: string
}
export function Back_Button({route}: Back_Button_Props) {
  const navigate = useNavigate();

  return(
    <button className='bg-orange-300 rounded p-4' onClick={() =>navigate(route)}>Back</button>
  )
}