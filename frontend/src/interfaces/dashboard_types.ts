import { AnnouncementProps } from "./announcement_types"
import { EmployeeProps } from "./employee_type"
import { ProjectProps } from "./project_types"
import { TaskProps } from "./tasks_types"

export type ManagerDashboardProps = {
    user: EmployeeProps,
    announcements: AnnouncementProps[],
    sorted_tasks: TaskProps[],
    sorted_projects: ProjectProps[]
}