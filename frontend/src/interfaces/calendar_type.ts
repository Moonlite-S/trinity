import { ProjectProps } from "./project_types"

export type DayButtonProps = {
    day_number: number
    projects?: ProjectProps[]
}

export type CalendarProps = {
    projects?: ProjectProps[]
    day: number
}