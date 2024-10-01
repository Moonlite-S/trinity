import { SelectionButtonProps } from "./button_types"

export type SubmittalProps = {
    submittal_id: string
    project: string
    received_date: string
    project_name?: string
    type: "mechanical" | "electrical" | "plumbing" | "fire_protection" | "other"
    sub_description: string
    assigned_to: string
    status: "open" | "closed"
    notes: string
}

export type SubmittalFormBaseProps = {
    submittal: SubmittalProps;
    projects: SelectionButtonProps[];
    employees: SelectionButtonProps[];
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onProjectChange: (e: unknown) => void;
    onAssignedToChange: (e: unknown) => void;
};

export type SubmittalCreationProps = {
    projects: string[][];
    users: string[][];
    client_names: string[];
}


