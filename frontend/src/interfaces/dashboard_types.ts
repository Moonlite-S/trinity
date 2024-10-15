import { AnnouncementProps } from "./announcement_types"
import { EmployeeProps } from "./employee_type"
import { ProjectProps } from "./project_types"
import { RFIProps } from "./rfi_types"
import { SubmittalProps } from "./submittal_types"
import { TaskProps } from "./tasks_types"

export type MainDashboardProps = {
    user: EmployeeProps,
    announcements: AnnouncementProps[],
    sorted_tasks: TaskProps[],
    sorted_projects: ProjectProps[],
    isNewCard: (type: string, id: string) => boolean,
    markAsSeen: (type: string, id: string) => void
}

export type AccountantDashboardProps = {
    user: EmployeeProps,
    announcements: AnnouncementProps[],
    isNewCard: (type: string, id: string) => boolean,
    markAsSeen: (type: string, id: string) => void
}

export type ManagerDashboardProps = {
    user: EmployeeProps,
    announcements: AnnouncementProps[],
    sorted_tasks: TaskProps[],
    sorted_projects: ProjectProps[],
    sorted_submittals: SubmittalProps[],
    sorted_rfis: RFIProps[],
    isNewCard: (type: string, id: string) => boolean,
    markAsSeen: (type: string, id: string) => void
}
