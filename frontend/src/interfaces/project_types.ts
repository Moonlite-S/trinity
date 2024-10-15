import { FormEvent } from "react"
import { EmployeeProps } from "./employee_type"
import { SubmittalProps } from "./submittal_types"
import { RFIProps } from "./rfi_types"
import { InvoiceProps } from "./invoices_types"

export type ProjectStatus = 
    "ACTIVE" |
    "NOT STARTED" |
    "COMPLETED" |
    "CANCELLED"

export type ProjectProps = {
    project_id?: string
    project_name: string
    manager: EmployeeProps
    city: string
    client_name: string
    start_date: string
    end_date: string
    description?: string
    status: ProjectStatus
    folder_location?: string
    template: string,
    submittals?: SubmittalProps[],
    rfis?: RFIProps[]
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

export type ProjectFormBaseProps = {
    currentProjectData: ProjectProps
    projectManagerListOptions: { value: string, label: string }[]
    Clients: { value: string, label: string }[]
    Cities: { value: string, label: string }[]
    templates: string[]
    method: "POST" | "PUT"
    invoiceData: InvoiceProps
    setInvoiceData: (data: InvoiceProps) => void
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    onManagerChange: (e: unknown) => void
    onClientChange: (e: unknown) => void
    onCityChange: (e: unknown) => void
    onSendInvoice: () => void
}