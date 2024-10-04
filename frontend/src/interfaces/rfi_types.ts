import { SelectionButtonProps } from "./button_types";
import { EmployeeProps } from "./employee_type";

export type RFIProps = {
    RFI_id?: string; // Optional because we create one in the backend
    notes: string;
    notes_closed?: string;
    sent_out_date: string;
    date_received: string;
    created_by: EmployeeProps;
    sent_by: EmployeeProps;
    description: string;
    type: "MECHANICAL" | "ELECTRICAL" | "PLUMBING" | "FIRE_PROTECTION" | "OTHER";
    project: string;
    days_old?: number;
    status: "ACTIVE" | "COMPLETED"
}

export type RFICreationProps = {
    projects: SelectionButtonProps[]
    employees: SelectionButtonProps[]
}

export type RFIFormBaseProps = {
    errorString: string | undefined
    currentRFIData: RFIProps
    projects: SelectionButtonProps[]
    employees: SelectionButtonProps[]
    method: "POST" | "PUT"
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    handleProjectChange: (e: unknown) => void
    handleCreatedByEmployeeChange: (e: unknown) => void
    handleSentByEmployeeChange: (e: unknown) => void
}
