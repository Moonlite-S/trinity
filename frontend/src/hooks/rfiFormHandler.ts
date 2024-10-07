import { RFIProps } from "../interfaces/rfi_types"
import { MethodHandler } from "../components/misc"
import { NavigateFunction } from "react-router-dom"
import { closeRFI, createRFI, updateRFI } from "../api/rfi"

type RFIFormHandlerProps = {
    setCurrentRFIData: React.Dispatch<React.SetStateAction<RFIProps>>
    currentRFIData: RFIProps
    navigate: NavigateFunction
    setErrorString: React.Dispatch<React.SetStateAction<string | undefined>>
    method: "POST" | "PUT" | "CLOSE"
}

export function useRFIFormHandler (
    { setCurrentRFIData, currentRFIData, navigate, setErrorString, method }: RFIFormHandlerProps
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
            setCurrentRFIData(prev => ({...prev, assigned_to_pk: e.value as string}))
        }
    }

    const handleCreatedByEmployeeChange = (e: unknown) => {
        console.log(e)

        if (typeof e === "object" && e !== null && "value" in e && "label" in e){
            setCurrentRFIData(prev => ({...prev, created_by_pk: e.value as string}))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");

        const formData = new FormData(e.target as HTMLFormElement)
        const formDataObj = Object.fromEntries(formData.entries())
        const method_handler = MethodHandler(method, createRFI, updateRFI, closeRFI)

        const data = {
            ...formDataObj,
            RFI_id: currentRFIData.RFI_id
        }
        const response = await method_handler(data as RFIProps)
        console.log(method)
        if (response === 200) {
            if (method === "CLOSE"){
                console.log("RFI closed successfully")
                setErrorString(undefined)
                alert("RFI closed successfully")
                navigate("/rfi")
            } else {
                console.log("RFI updated successfully")
                setErrorString(undefined)
                alert("RFI updated successfully")
                navigate("/rfi")
            }
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