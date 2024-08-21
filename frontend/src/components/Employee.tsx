import { useNavigate } from "react-router-dom";
import { createEmployee } from "../api/employee";
import { Back_Button, Header } from "./misc";
import { useState } from "react";
/**
 *  ### [Route for ('/create_employee')]
 * 
 * Create an employee and sends a POST request to the backend
 * 
 */
export function CreateEmployee() {
    const [errorString, setErrorString] = useState<string>("")
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const navigate = useNavigate();

    const onSubmit = async(e: any) => {
        e.preventDefault()
        
        setErrorString("")

        if (e.target.password.value !== e.target.re_password.value) {
            setErrorString("Passwords do not match.")
            return
        } else if (!email_regex.test(e.target.email.value)) {
            setErrorString("Invalid email.")
            return
        }

        try {
            const code = await createEmployee({
                name: e.target.name.value,
                email: e.target.email.value,
                password: e.target.password.value
            })

            if (code === 200) {
                alert("Employee created successfully!")
                navigate("/main_menu")
            } else if (code === 403) {
                setErrorString("Not Authorized to create Employee. Please contact the admin. Error code: " + code)
            } else {
                setErrorString("Employee creation failed! Error code: " + code)
            }

        } catch (error) {
            console.error("Error creating employee:", error);
            setErrorString("Network Error. Employee was not created.")
            throw error; // Re-throw the error so the caller can handle it if needed
        }
    }

    return (
        <>
            <Header />

            <div className="px-5">

                <h1 className="text-center">Create Employee Form:</h1>
                <form id="project_creation" onSubmit={onSubmit}  method="post">

                    <div className="flex flex-col gap-5 p-24 mx-auto max-w-screen-lg bg-zinc-50 mt-5" >

                        <div className="flex flex-row gap-3 justify-center">

                            <label htmlFor="name">Name:</label>
                            <input type="text" name="name" className="bg-slate-100 border border-zinc-300" required/>

                            <label htmlFor="name">Email:</label>
                            <input type="text" name="email"  className="bg-slate-100 border border-zinc-300" required/>

                        </div>

                        <div className="flex flex-row gap-3 justify-center">

                            <label htmlFor="name">Password:</label>
                            <input type="password" name="password" className="bg-slate-100 border border-zinc-300" required/>

                            <label htmlFor="name">Re-enter Password:</label>
                            <input type="password" name="re_password" className="bg-slate-100 border border-zinc-300" required/>

                        </div>

                    </div>

                    <div className="flex flex-row justify-center gap-3 mt-5">

                        <Back_Button route={"/main_menu"} />

                        <button type="submit" className="bg-orange-300 rounded p-4">
                            <h6 className="inline-block">Submit</h6>    
                        </button>

                    </div>

                    <div className="mt-5">
                        {errorString && <p className="text-red-500 text-center">{errorString}</p>}
                    </div>

                </form>
            </div>
        </>
    )
}