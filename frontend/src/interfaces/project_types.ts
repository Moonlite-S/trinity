import { FormEvent } from "react"
import { EmployeeProps } from "./employee_type"
import { SubmittalProps } from "./submittal_types"

export type ProjectStatus = 
    "ACTIVE" |
    "NOT STARTED" |
    "COMPLETED" |
    "CANCELLED"

export type ProjectProps = {
    project_id: string
    project_name: string
    manager: EmployeeProps
    city: string
    client_name: string
    start_date: string
    end_date: string
    description?: string
    status: ProjectStatus
    folder_location: string
    project_template: string,
    submittals?: SubmittalProps[]
}

export type ProjectFilterProps = {
    filterText: string
    onFilter: (e: FormEvent<HTMLInputElement>) => void
    onClear: () => void
}

export type ProjectCreationProps = {
    project_count: number,
    users: string[]
    client_names: string[]
    cities: string[]
    current_user: string[]
}