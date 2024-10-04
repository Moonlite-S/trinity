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
            setCurrentRFIData(prev => ({...prev, project: e.value as string}))
        }
    }

    const handleSentByEmployeeChange = (e: unknown) => {
        console.log(e)

        if (typeof e === "object" && e !== null && "value" in e && "label" in e){
            setCurrentRFIData(prev => ({...prev, sent_by: 
                {
                    name: e.label as string,
                    email: e.value as string,
                    username: "",
                    password: "",
                    role: prev.sent_by.role
                }
            }))
        }
    }

    const handleCreatedByEmployeeChange = (e: unknown) => {
        console.log(e)

        if (typeof e === "object" && e !== null && "value" in e && "label" in e){
            setCurrentRFIData(prev => ({...prev, created_by: 
                {
                    name: e.label as string,
                    email: e.value as string,
                    username: "",
                    password: "",
                    role: prev.created_by.role
                }
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");

        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData.entries())
        const method_handler = MethodHandler(method, createRFI, updateRFI)

        const response = await method_handler(data as unknown as RFIProps)
        
        if (response === 200) {
            console.log("RFI updated successfully")
            setErrorString(undefined)
            alert("RFI updated successfully")
            navigate("/rfi")
        } else if (response === 201) {
            console.log("RFI created successfully")
            setErrorString(undefined)
            alert("RFI created successfully")
            navigate("/rfi")
        }
        else {
            console.log("Error with RFI")
            setErrorString("Error with RFI")
        }

    }

    return { handleProjectChange, handleSentByEmployeeChange, handleCreatedByEmployeeChange, handleSubmit }
}