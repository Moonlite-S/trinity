// For miscelaneous components
import {useNavigate } from 'react-router-dom';
import logo from '/trinity_logo.png'

// Header Component for all pages
export function Header() {
  const navigate = useNavigate();

  return(
    <header className='w-full h-32 relative'>

      <div className='h-4 w-full bg-orange-400 absolute -z-10' />

      <img src={logo} alt='Trinity MEP Logo' className="h-32 cursor-pointer" onClick={() => navigate('/main_menu')}/>

    </header>
  )
}

export function Error_Component({ errorString }: { errorString: string }) {
  return (
      <div className="justify-center mx-auto p-5 bg-red-500">
          <p className="text-white">{errorString}</p>
      </div>
  )
}