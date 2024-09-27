export type TaskProps = {
    task_id: string
    title: string
    description: string
    assigned_to: string
    project_id: string
    due_date: string
    status: "active" | "completed"
    //priority: string
}