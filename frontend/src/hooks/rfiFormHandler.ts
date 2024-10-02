import { RFIProps } from "../interfaces/rfi_types"
import { MethodHandler } from "../components/misc"
import { NavigateFunction } from "react-router-dom"
import { createRFI, updateRFI } from "../api/rfi"

type RFIFormHandlerProps = {
    setCurrentRFIData: React.Dispatch<React.SetStateAction<RFIProps>>
    navigate: NavigateFunction
    setErrorString: React.Dispatch<React.SetStateAction<string | undefined>>
    method: "POST" | "PUT"
}

export function useRFIFormHandler (
    { setCurrentRFIData, navigate, setErrorString, method }: RFIFormHandlerProps
) {
    
    const handleProjectChange = (e: unknown) => {
        console.log(e)

        if (typeof e === "object" && e !== null && "value" in e && "label" in e){
            setCurrentRFIData(prev => ({...prev, project_id: e.value as string}))
        }
    }

    const handleEmployeeChange = (e: unknown) => {
        console.log(e)

        if (typeof e === "object" && e !== null && "value" in e && "label" in e){
            setCurrentRFIData(prev => ({...prev, created_by: 
                {
                    name: e.label as string,
                    email: e.value as string,
                    username: "",
                    password: "",
                    role: ""

                }
            }))
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");

        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData.entries())

        const method_handler = MethodHandler(method, createRFI, updateRFI)

        try {
            method_handler(data as unknown as RFIProps)
        }
        catch (error: unknown){
            console.log(error)
            setErrorString("Error submitting RFI")
        }

        navigate("/rfi")

    }

    return { handleProjectChange, handleEmployeeChange, handleSubmit }
}