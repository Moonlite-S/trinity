import { SelectionButtonProps } from "./button_types";
import { EmployeeProps } from "./employee_type";

export type RFIProps = {
    RFI_id?: string; // Optional because we create one in the backend
    notes: string;
    notes_closed: string;
    sent_out_date: string;
    date_received: string;
    user: EmployeeProps;
    description: string;
    type: "MECHANICAL" | "ELECTRICAL" | "PLUMBING" | "FIRE_PROTECTION" | "OTHER";
    project: string;
    days_old?: number;
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
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    handleProjectChange: (e: unknown) => void
    handleEmployeeChange: (e: unknown) => void
}
