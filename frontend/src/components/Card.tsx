import { Link } from "react-router-dom"
import { AnnouncementProps } from "../interfaces/announcement_types"
import { ProjectProps } from "../interfaces/project_types"
import { RFIProps } from "../interfaces/rfi_types"
import { SubmittalProps } from "../interfaces/submittal_types"
import { TaskProps } from "../interfaces/tasks_types"

/**
 * TaskCard Component
 * 
 * @param task - The task to be displayed
 * @returns A card displaying the task's details
 * 
 * TODO:
 * - Add the person who created the task
 */
export function TaskCard ({task} : {task: TaskProps}) {
    // The project_id is using the __str__ representation of the object
    // So i just need to split to get the project name and company name
    const formatProjectName = task.project_id.split('|')[1]

    return (
    <Link to={`/tasks/update_task/${task.task_id}`}>
        <div className=" bg-slate-100 p-4 my-4 mx-2 rounded-md shadow-md">
            <h3 className='font-bold'>{task.title}</h3> 
        <h4>Status: <span className={ColorStatus(task.status)}>{task.status}</span></h4>
        <h4>From Project: {formatProjectName}</h4>
        <p className="py-4 break-words">{task.description}</p>
            <p className="text-red-800">Due: {task.due_date}</p>
        </div>
    </Link>
    )
}

export function AnnouncementCard({announcement} : {announcement: AnnouncementProps}) {
    return (
    <div className="bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md">
        <h3>{announcement.title}</h3>
        <p>{announcement.content}</p>
        <p>{announcement.author}</p>
    </div>
    )
}

export function ProjectCard ({project} : {project: ProjectProps}) {
  const manager = typeof project.manager === 'string' ? project.manager : project.manager.name
  return (
    <Link to={`/projects/update_project/${project.project_id}`}>
        <div className="bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md">
            <h3>{project.project_name}</h3>
            <h4>Current Manager: {manager}</h4>
            <p>Client: {project.client_name}</p>
            <p className="py-4">Notes: {project.description ? project.description : '(No Notes Written)'}</p>
            <p className="text-red-800">Next Deadline: {project.end_date}</p>
        </div>
    </Link>
  )
}

export function SubmittalCard ({submittal} : {submittal: SubmittalProps}) {
    return (
    <Link to={`/submittals/update_submittal/${submittal.submittal_id}`}>
        <div className="bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md">
            <h3>{submittal.project_name}</h3>
        <h4>Status: <span className={ColorStatus(submittal.status)}>{submittal.status}</span></h4>
        <p>Received: {submittal.received_date}</p>
        <p>Type: {submittal.type}</p>
        </div>
    </Link>
    )
}

export function RFICard ({rfi} : {rfi: RFIProps}) {
    return (
    <Link to={`/rfi/update_rfi/${rfi.RFI_id}`}>
        <div className="bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md">
            <h3>{rfi.project_name}</h3>
            <h4>Status: <span className={ColorStatus(rfi.status)}>{rfi.status}</span></h4>
            <h4>Days Old: <span className={DaysOldColor(rfi.days_old ?? 0)}>{rfi.days_old}</span></h4>
            <p>Type: {rfi.type}</p>
            <p>Notes: {rfi.notes ? rfi.notes : '(No Notes Written)'}</p>
        </div>
    </Link>
    )
}

// Color Coded Functions to help visually see the status of important fields

function ColorStatus(status : string) {
    if (status === "ACTIVE" || status === "OPEN") {
        return "text-green-500"
    } else if (status === "CLOSING") {
        return "text-yellow-600"
    } else {
        return "text-red-500"
    }
}

function DaysOldColor(days_old : number) {
    if (days_old < 10) {
        return "text-green-500"
    } else if (days_old < 20) {
        return "text-yellow-500"
    } else {
        return "text-red-500"
    }
}
