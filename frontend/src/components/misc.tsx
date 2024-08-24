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
export function Route_Button({route, text, isDelete}: {route: string, text: string, isDelete?: boolean}) {
  const navigate = useNavigate();
  const css = isDelete ? 'bg-red-300 rounded p-4 my-2 hover:bg-red-400 transition' : 
  'bg-orange-300 rounded p-4 my-2 hover:bg-orange-400 transition';

  return(
    <button className={css} onClick={() =>navigate(route)}>{text}</button>
  )
}

export function Error_Component({ errorString }: { errorString: string }) {
  return (
      <div className="justify-center mx-auto p-5 bg-red-500">
          <p className="text-white">{errorString}</p>
      </div>
  )
}
