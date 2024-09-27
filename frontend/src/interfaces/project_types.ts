import { FormEvent } from "react"
import { EmployeeProps } from "./employee_type"

export type ProjectStatus = 
    "ACTIVE" |
    "NOT STARTED" |
    "COMPLETED" |
    "CANCELLED"

export type quarter = "Q1" | "Q2" | "Q3" | "Q4"

export type ProjectProps = {
    project_id: string
    project_name: string
    manager: EmployeeProps
    city: string
    quarter: quarter
    client_name: string
    start_date: string
    end_date: string
    description?: string
    status: ProjectStatus
    folder_location: string
    project_template: string,
}

export type FilterProps = {
    filterText: string
    onFilter: (e: FormEvent<HTMLInputElement>) => void
    onClear: () => void
}

export type ProjectFormProps = {
    onSubmit: (event: FormEvent<HTMLFormElement>) => void

    // For Project Update
    formProps?: ProjectProps
}

export type ProjectCreationProps = {
    project_count: number,
    users: string[]
    client_names: string[]
    cities: string[]
    current_user: string[]
}


export type SelectionComponentProps = {
    defaultValue?: string,
    value?: string,
    multiple?: boolean,
    options: { value: string, label: string }[] | undefined,
    name: string    
    onChange?: (e: unknown) => void
}

export type ProjectSelectProps = {
    label: string
    value: string
}
