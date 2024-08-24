// For miscelaneous components
import { useNavigate } from 'react-router-dom';
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

/** General Orange button */
export function Route_Button({route, text}: {route: string, text: string}) {
  const navigate = useNavigate();

  return(
    <button className='bg-orange-300 rounded p-4 m-2' onClick={() =>navigate(route)}>{text}</button>
  )
}

export function Error_Component({ errorString }: { errorString: string }) {
  return (
      <div className="justify-center mx-auto p-5 bg-red-500">
          <p className="text-white">{errorString}</p>
      </div>
  )
}
