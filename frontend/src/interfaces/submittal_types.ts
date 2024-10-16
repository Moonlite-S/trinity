import { SelectionButtonProps } from "./button_types"

export type SubmittalProps = {
    submittal_id?: string
    project: string
    received_date: string
    project_name?: string
    project_id?: string
    type: "MECHANICAL" | "ELECTRICAL" | "PLUMBING" | "FIRE_PROTECTION" | "OTHER"
    sub_description: string
    assigned_to: string
    status: "OPEN" | "CLOSING" | "COMPLETED"
    notes?: string
    closing_notes?: string
    sent_item?: string
    send_email?: string
    last_edited_by_name?: string
}

export type SubmittalFormBaseProps = {
    submittal: SubmittalProps;
    projects: SelectionButtonProps[];
    employees: SelectionButtonProps[];
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onProjectChange: (e: unknown) => void;
    onAssignedToChange: (e: unknown) => void;
    method: "POST" | "PUT";
};

export type SubmittalCreationProps = {
    projects: string[][];
    users: string[][];
    client_names: string[];
}


