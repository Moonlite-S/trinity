import { FormEvent } from "react"

export type EmployeeProps = {
    id: string,
    name: string,
    email: string,
    password: string,
    role: string,
    date_joined: string
}

export type FilterProps = {
    filterText: string
    onFilter: (e: FormEvent<HTMLInputElement>) => void
    onClear: () => void
}