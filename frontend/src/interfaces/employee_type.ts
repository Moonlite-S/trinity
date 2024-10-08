import { FormEvent } from "react"
import { TaskProps } from "./tasks_types"
import { ProjectProps } from "./project_types"

export type Roles = "Administrator" | "Manager" | "Team Member" | "Accountant"

export type EmployeeProps = {
    id?: string,
    name: string,
    email: string,
    username: string,
    password: string,
    role: Roles,
    date_joined?: string,
    projects?: ProjectProps[]
    tasks?: TaskProps[] 
}

export type EmployeeNameEmail = {
    name: string
    email: string
}

export type FilterProps = {
    filterText: string
    onFilter: (e: FormEvent<HTMLInputElement>) => void
    onClear: () => void
}