import { Navigate, Outlet } from "react-router-dom"

type LoginProps = {
    isAuth: boolean,
    redirectPath: string
}
/**
 * Bridge Component for login verification
 * 
 * Check if user is authenticated,
 * 
 * if so, go to main menu
 * 
 * if not, redirect to login
 * 
 * @param isAuth: boolean
 * @param redirectPath: string
 */
export function Verification(
    {isAuth, redirectPath = "/"}: LoginProps
) {
    if (!isAuth) {
        console.log("Not logged in")
        return <Navigate to={redirectPath} replace/>
    }

    return (<Outlet/>)
}