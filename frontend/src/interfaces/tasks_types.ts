import { FormEvent } from "react"
import { SelectionButtonProps } from "./button_types"

export type TaskProps = {
    project: string
    task_id: string
    title: string
    description: string
    assigned_to: string
    project_id: string
    due_date: string
    status: "active" | "completed"
    //priority: string
}

export type TaskCreationProps = {
    projects: string[][]
    employees: string[][]
}

export type TaskFormBaseProps = {
    projects: SelectionButtonProps[]
    employees: SelectionButtonProps[]
    currentTaskData: TaskProps
    onProjectSelectionChange: (e: unknown) => void
    onAssignedToChange: (e: unknown) => void
    onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

