import { EmployeeCreationProps, EmployeeProps, Roles } from "../interfaces/employee_type"
import { BottomFormButton } from "./Buttons"
import { Error_Component, MethodHandler } from "./misc"
import { GenericForm, GenericInput, GenericSelect } from "./GenericForm"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createEmployee, updateEmployee } from "../api/employee"

// This type uses the old update_employee endpoint. Update this when the endpoint is updated.
type EmployeeUpdateProps = {
    id: string,
    name: string,
    email: string,
    username: string,
    password: string,
    role: Roles,
}

export function EmployeeForm({employee, method}: {employee?: EmployeeProps, method: "POST" | "PUT"}) {
    const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const [errorString, setErrorString] = useState<string>("")
    const currentEmployeeData = useRef<EmployeeProps>(employee ?? {
        id: '',
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'Team Member',
    })

    console.log(currentEmployeeData.current)

    const navigate = useNavigate()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorString("")

        const data = new FormData(e.target as HTMLFormElement)
        const name = data.get('name')
        const password = data.get('password')
        const re_password = data.get('re_password')
        const email = data.get('email')

        if (password !== re_password) {
            setErrorString("Passwords do not match")
            return
        } else if (!email_regex.test(email as string)) {
            setErrorString("Invalid email address")
            return
        }

        let data_to_send: EmployeeCreationProps | EmployeeUpdateProps

        // Hacky dumb thing since Update Employee uses a different type
        if (method === "POST") {
            data_to_send = {
                name: name as string,
                email: email as string,
                username: email as string,
                password1: password as string,
                password2: re_password as string,
                role: data.get('role') as Roles,
            }
        } else {
            data_to_send = {
                id: employee?.id ?? '',
                name: name as string,
                email: email as string,
                username: email as string,
                password: password as string,
                role: data.get('role') as Roles,
            }
        }

        console.log('Current Data:', data_to_send)

        const method_handler = MethodHandler(method, createEmployee, updateEmployee)

        if (method_handler) {
            try {
                const response = await method_handler(data_to_send)
                if (response === 204) {
                    alert("Employee created successfully")
                    navigate('/employees')
                } else if (response === 200) {
                    alert("Employee updated successfully")
                    navigate('/employees')
                } else {
                    setErrorString("Error creating employee")
                }
            } catch (error) {
                if (error instanceof Error) {
                    // Forbidden Clause
                    if (error.message.includes("403")) {
                        setErrorString("You are not authorized to create or update employees. Please contact an admin.")
                    } else {
                        setErrorString("Error sending employee info. Error 500")
                    }
                } else {
                    // Internal Server Error Clause
                    setErrorString("Internal Server Error. Error 500")
                }
            }
        } else {
            setErrorString("Error sending employee info. Error 500")
        }

    }

    return (
        <>
        {errorString && <Error_Component errorString={errorString} />}
        <EmployeeFormBase 
        onSubmit={onSubmit} 
        user={currentEmployeeData.current} 
        method={method}
        />
        </>
    )
}

export function EmployeeFormBase({user, onSubmit, method}: {user: EmployeeProps, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, method: "POST" | "PUT"}) {
    return (
        <GenericForm form_id="employee_creation" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <GenericInput type="text" name="name" label="Name" value={user.name} />
                <GenericInput type="text" name="email" label="Email" value={user.email} readOnly={method === "PUT"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <GenericInput type="password" name="password" label="Password" value={user.password} />
                <GenericInput type="password" name="re_password" label="Re-enter Password" value={user.password} />
            </div>
            <GenericSelect options={["Manager", "Team Member", "Accountant"]} name="role" label="Role" value={user.role} />
            <BottomFormButton button_text={method === "POST" ? "Create Employee" : "Update Employee"} />
        </GenericForm>
    )
}