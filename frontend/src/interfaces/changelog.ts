import { EmployeeProps } from "./employee_type"

export type ChangelogProjectProps = {
    project_id: string
    project_name: string
    manager: EmployeeProps
    changed_by: EmployeeProps
    changed_time: string
    change_description: string
}