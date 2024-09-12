import { UpdateProjectProps } from "./project_types"

export type DayButtonProps = {
    day_number: number
    projects?: UpdateProjectProps[]
}

export type CalendarProps = {
    projects?: UpdateProjectProps[]
    day: number
}