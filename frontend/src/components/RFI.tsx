import { Header } from "./misc";
import RFIForm from "./RFIForm";

export default function ViewRFI() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>RFI</h1>
            </div>
        </>
    )
}

export function CreateRFI() {
    return (
        <>
            <Header />

            <div className="justify-center mx-auto p-5">
                <h1>Create RFI</h1>
            </div>

            <RFIForm />
        </>
    )
}
