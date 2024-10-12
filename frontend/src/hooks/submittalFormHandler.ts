import { NavigateFunction } from "react-router-dom"
import { createSubmittal, getSubmittalsByProjectId, updateSubmittal } from "../api/submittal"
import { SubmittalProps } from "../interfaces/submittal_types"
import { MethodHandler } from "../components/misc"

/**
 * This custom hook handles the submittal form for both creation and editing
 * 
 * @param setCurrentSubmittalData Submittal setter from useState<Submittal>
 * @param navigate using the react-router-dom NavigateFunction
 * @returns the functions to handle the submittal form
 */
export const useSubmittalFormHandler = (
    setCurrentSubmittalData: React.Dispatch<React.SetStateAction<SubmittalProps>>,
    setErrorString: React.Dispatch<React.SetStateAction<string>>,
    currentSubmittalData: SubmittalProps,
    navigate: NavigateFunction,
    method: "POST" | "PUT"
) => {
    const onProjectChange = async (e: unknown) => {
        // This is to ensure that the value is of the correct type (ProjectSelectProps)
        if (e && typeof e === 'object' && 'value' in e && 'label' in e) {
            try {
                setCurrentSubmittalData(prev => ({...prev, project_name: e.label as string, project: e.value as string}))
                const response = await getSubmittalsByProjectId(e.value as string)
                const submittal_count = response.length + 1
                const project_id = e.value
                setCurrentSubmittalData(prev => ({...prev, submittal_id: 'S-' + project_id + '-' + submittal_count.toString().padStart(3, '0')}))
            }
            catch (error) {
                console.log(error)
            }
        }
    }

    const onAssignedToChange = async (e: unknown) => {
        if (e && typeof e === 'object' && 'value' in e && 'label' in e) {
            setCurrentSubmittalData(prev => ({...prev, assigned_to: e.label as string}))
            console.log("Assigned To: ", e.label as string)
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorString("")

        const formData = new FormData(e.target as HTMLFormElement)
        const formDataObj = Object.fromEntries(formData.entries())
        console.log("Form Data: ", formDataObj)

        const method_handler = MethodHandler(method, createSubmittal, updateSubmittal)

        const data = {
            ...formDataObj,
            submittal_id: currentSubmittalData.submittal_id
        }

        if (method_handler) {
            const response = await method_handler(data as SubmittalProps)
            console.log("Response: ", response)

            if (response === 200) {
                alert("Submittal updated successfully")
                navigate('/submittals/')
            } else if (response === 201) {
                alert("Submittal created successfully")
                navigate('/submittals/')
            }
            else {
                setErrorString("Error sending submittal info. Please double check all fields.")
            }
        } else {
            setErrorString("Error sending submittal info. Error: " + method_handler)
        }
    }

    return { onProjectChange, onAssignedToChange, onSubmit }
}