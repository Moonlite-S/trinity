import { SelectionButtonProps } from "./button_types";
import { EmployeeProps } from "./employee_type";

export type RFIProps = {
    rfi_id?: string; // Optional because we create one in the backend
    title: string;
    description: string;
    sent_out_date: string;
    date_received: string;
    created_by: EmployeeProps;
    type: "MECHANICAL" | "ELECTRICAL" | "PLUMBING" | "FIRE_PROTECTION" | "OTHER";
    project_id: string;
    status: "ACTIVE" | "COMPLETED";
}

export type RFICreationProps = {
    projects: SelectionButtonProps[]
    employees: SelectionButtonProps[]
}