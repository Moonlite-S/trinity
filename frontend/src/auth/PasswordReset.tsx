import { useParams } from "react-router-dom";

export function PasswordReset() {
    const { key } = useParams();

    if (key) {
        return <div>Resetting Password... {key}</div>
    }
    return <div>Password Reset</div>
}