import { FormEvent } from "react"

export type ProjectStatus = 
    "ACTIVE" |
    "NOT STARTED" |
    "COMPLETED" |
    "CANCELLED"

export type quarter = "Q1" | "Q2" | "Q3" | "Q4"

export type UpdateProjectProps = {
    project_id: string
    project_name: string
    manager: string
    city: string
    quarter: quarter
    client_name: string
    start_date: string
    end_date: string
    notes?: string
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
    button_text: string
    projectManagerList?: string[]
    onSubmit: (event: FormEvent<HTMLFormElement>) => void

    // For Project Update
    formProps?: UpdateProjectProps
}

export type ProjectCreationProps = {
    project_count: number,
    users: string[]
    client_names: string[]
    cities: string[]
}