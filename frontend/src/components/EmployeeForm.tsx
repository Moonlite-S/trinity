import { EmployeeProps, Roles } from "../interfaces/employee_type";
import { BottomFormButton } from "./Buttons";
import { Error_Component, MethodHandler } from "./misc";
import { GenericForm, GenericInput, GenericSelect } from "./GenericForm";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee, updateEmployee } from "../api/employee";

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

        const data_to_send: EmployeeProps = {
            id: currentEmployeeData.current.id ?? "",
            name: data.get('name') as string,
            email: email as string,
            username: "",
            password: password as string,
            role: data.get('role') as Roles,
        }

        const method_handler = MethodHandler(method, createEmployee, updateEmployee)

        if (method_handler) {
            const response = await method_handler(data_to_send)

            if (response === 200) {
                alert("Employee created successfully")
                navigate('/employees')
            } else if (response === 201) {
                alert("Employee updated successfully")
                navigate('/employees')
            } else {
                setErrorString("Error creating employee")
            }
        } else {
            setErrorString("Error sending employee info. Error: " + method_handler)
        }

    }

    return (
        <>
        {errorString && <Error_Component errorString={errorString} />}
        <EmployeeFormBase 
        onSubmit={onSubmit} 
        user={currentEmployeeData.current} />
        </>
    )
}

export function EmployeeFormBase({user, onSubmit}: {user: EmployeeProps, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void}) {
    return (
        <GenericForm form_id="employee_creation" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <GenericInput type="text" name="name" label="Name" value={user.name} />
                <GenericInput type="text" name="email" label="Email" value={user.email} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <GenericInput type="password" name="password" label="Password" value={user.password} />
                <GenericInput type="password" name="re_password" label="Re-enter Password" value={user.password} />
            </div>
            <GenericSelect options={["Manager", "Team Member", "Accountant"]} name="role" label="Role" value={user.role} />
            <BottomFormButton button_text="Create Employee" />
        </GenericForm>
    )
}