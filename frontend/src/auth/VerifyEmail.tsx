import { useParams } from "react-router-dom"

export function EmailConfirmation() {
    const { key } = useParams()

    if (key) {
        return <div>Verifying Email... {key}</div>
    }
    return <div>Email Confirmation</div>
}