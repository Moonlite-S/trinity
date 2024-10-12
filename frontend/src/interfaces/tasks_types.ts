import { FormEvent } from "react"
import { SelectionButtonProps } from "./button_types"
import { EmployeeProps } from "./employee_type"

export type TaskProps = {
    project: string
    task_id?: string
    title: string
    description: string
    assigned_to: string
    project_id: string
    due_date: string
    status: "ACTIVE" | "CLOSING" | "COMPLETED"
    completion_percentage: number // 0-100
    //priority: string
}

export type TaskCreationProps = {
    projects: string[][]
    employees: string[][]
}

export type TaskFormBaseProps = {
    user: EmployeeProps
    projects: SelectionButtonProps[]
    employees: SelectionButtonProps[]
    currentTaskData: TaskProps
    method: "POST" | "PUT"
    onProjectSelectionChange: (e: unknown) => void
    onAssignedToChange: (e: unknown) => void
    onSliderChange: (e: unknown) => void
    onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

