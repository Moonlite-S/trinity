import { AnnouncementProps } from "../interfaces/announcement_types"
import { ProjectProps } from "../interfaces/project_types"
import { RFIProps } from "../interfaces/rfi_types"
import { SubmittalProps } from "../interfaces/submittal_types"
import { TaskProps } from "../interfaces/tasks_types"
import { InvoiceProps } from "../interfaces/invoices_types"
import { useEffect, useState } from "react"
import { RouteButton } from "./Buttons"
import { OpenFolderButton } from "./misc"

/**
 * TaskCard Component
 * 
 * @param task - The task to be displayed
 * @returns A card displaying the task's details
 * 
 * TODO:
 * - Add the person who created the task
 */
export function TaskCard ({task, isNew, onView} : {task: TaskProps, isNew: boolean, onView: () => void}) {
    // The project_id is using the project_name from the project object
    // I really need to change around the types...
    const formatProjectName = task.project_id

    // This is used because onView would make isNew false immediately.
    // So we need to use a local state to prevent unnecessary re-renders
    const [isNewLocal, setIsNewLocal] = useState(isNew)

    useEffect(() => {
        if (isNewLocal) {
            setIsNewLocal(true)
            onView()
        }

    }, [])

    return (
        <CardBase 
            isNew={isNewLocal} 
            hoverChildren={<CardHoverTask edit_task_route={`/tasks/update_task/${task.task_id}`} />}
        >
            <h3 className='font-bold'>{task.title}</h3> 
            <h4>Status: <span className={ColorStatus(task.status)}>{task.status}</span></h4>
            {task.status === "CLOSING" && <h4 className="text-red-500">(AWAITING REVIEW)</h4>}
            <h4>From Project: {formatProjectName}</h4>
            <p className="text-red-800">Due: {task.due_date}</p>
            <p>Progress: {task.completion_percentage}% Completed</p>
        </CardBase>
    )
}

export function AnnouncementCard({announcement, isNew, onView} : {announcement: AnnouncementProps, isNew: boolean, onView: () => void}) {

    const [isNewLocal, setIsNewLocal] = useState(isNew)

    useEffect(() => {
        if (isNewLocal) {
            setIsNewLocal(true)
            onView()
        }
    }, [])

    return (
    <div className={`bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md ${isNew ? 'animate-pulse border-2 border-green-500' : ''}'`}>
        <h3>{announcement.title}</h3>
        <p>{announcement.content}</p>
        <p>{announcement.author}</p>
    </div>
    )
}

export function ProjectCard ({project, isNew, onView} : {project: ProjectProps, isNew: boolean, onView: () => void}) {
    const manager = typeof project.manager === 'string' ? project.manager : project.manager.name
    const [isNewLocal, setIsNewLocal] = useState(isNew)

    useEffect(() => {
        if (isNewLocal) {
            setIsNewLocal(true)
            onView()
        }
    }, [])

    return (
        <CardBase 
            isNew={isNewLocal} 
            hoverChildren={<CardHoverProject 
                edit_project_route={`/projects/update_project/${project.project_id}`} 
                create_task_route={`/tasks/create_task_from_project/${project.project_id}`} 
                folder_path={`/projects/${project.project_id}`}
            />}
        >
            <h3>{project.project_name}</h3>
            <h4>Current Manager: {manager}</h4>
            <p>Client: {project.client_name}</p>
            <p className="py-4">Notes: {project.description ? project.description : '(No Notes Written)'}</p>
            <p className="text-red-800">Next Deadline: {project.end_date}</p>
        </CardBase>
  )
}

export function SubmittalCard ({submittal, isNew, onView} : {submittal: SubmittalProps, isNew: boolean, onView: () => void}) {
    const [isNewLocal, setIsNewLocal] = useState(isNew)

    useEffect(() => {
        if (isNewLocal) {
            setIsNewLocal(true)
            onView()
        }
    }, [])

    return (
        <CardBase 
            isNew={isNewLocal} 
            hoverChildren={<CardHoverSubmittal 
                edit_submittal_route={`/submittals/update_submittal/${submittal.submittal_id}`} 
                folder_path={`/projects/${submittal.project}/Submittals/${submittal.submittal_id}`}
            />}
        >
            <h3>{submittal.project_name}</h3>
            <h4>Status: <span className={ColorStatus(submittal.status)}>{submittal.status}</span></h4>
            <p>Received: {submittal.received_date}</p>
            <p>Type: {submittal.type} </p>
            <p>Notes: {submittal.notes ? submittal.notes : '(No Notes Written)'}</p>
        </CardBase>
    )
}

export function RFICard ({rfi, isNew, onView} : {rfi: RFIProps, isNew: boolean, onView: () => void}) {
    const [isNewLocal, setIsNewLocal] = useState(isNew)

    useEffect(() => {
        if (isNewLocal) {
            setIsNewLocal(true)
            onView()
        }
    }, [])

    return (
        <CardBase 
            isNew={isNewLocal} 
            hoverChildren={<CardHoverRFI 
                edit_rfi_route={`/rfi/update_rfi/${rfi.RFI_id}`} 
                folder_path={`/projects/${rfi.project}/RFI/${rfi.RFI_id}`}
            />}
        >
            <h3>{rfi.notes ? rfi.notes : '(No Notes Written)'}</h3>
            <p>{rfi.project_name}</p>
            <h4>Status: <span className={ColorStatus(rfi.status)}>{rfi.status}</span></h4>
            {rfi.status === "CLOSING" && <h4 className="text-red-500">(REQUESTING CLOSURE)</h4>}
            <h4>Days Old: <span className={DaysOldColor(rfi.days_old ?? 0)}>{rfi.days_old}</span></h4>
            <p>Type: {rfi.type}</p>
        </CardBase>
    )
}

export function InvoiceCard ({invoice, isNew, onView} : {invoice: InvoiceProps, isNew: boolean, onView: () => void}) {
    const [isNewLocal, setIsNewLocal] = useState(isNew)

    useEffect(() => {
        if (isNewLocal) {
            setIsNewLocal(true)
            onView()
        }
    }, [])

    return (
        <CardBase 
            isNew={isNewLocal} 
            hoverChildren={<CardHoverInvoice 
                edit_invoice_route={`/invoices/update_invoice/${invoice.invoice_id}`} 
            />}
        >
            <h3>{invoice.project_name ?? 'Project Name Not Found'}</h3>
            <p>Percentage Paid: {invoice.payment_amount}%</p>
            <p>{invoice.invoice_date}</p>
            <p className={ColorStatus(invoice.payment_status)}>{invoice.payment_status}</p>
        </CardBase>
    )
}
// Color Coded Functions to help visually see the status of important fields

function ColorStatus(status : string) {
    if (status === "ACTIVE" || status === "OPEN" || status === "Paid")  {
        return "text-green-500"
    } else if (status === "CLOSING" || status === "Pending") {
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

type CardBaseProps = {
    children: React.ReactNode,
    isNew: boolean,
    hoverChildren: React.ReactNode
}
/**
 * The base card template that all other cards will use
 * 
 * @param children - The children to be rendered inside the card
 * @param isNew - Whether the card is new
 * @param hoverChildren - The buttons to be rendered when the card is hovered over (You'd need to pass the routes on here)
 * @returns A card with the given children and a new tag if isNew is true
 */
function CardBase({children, isNew, hoverChildren} : CardBaseProps){
    const [isHovered, setIsHovered] = useState<boolean>(false)

    return (
        <div className={`bg-slate-100 p-2 my-4 mx-2 rounded-md shadow-md ${isNew ? 'animate-pulse border-2 border-green-500' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isNew && <h4 className="text-green-500">New</h4>}
            {children}
            {isHovered && 
                <CardHoverBase>
                    {hoverChildren}
                </CardHoverBase>
            }
        </div>
    )
}

/**
 * This is the container component for the the CardHover components
 */
function CardHoverBase({children} : {children: React.ReactNode}){
    return (
        <div className="flex justify-center items-center gap-4">
            {children}
        </div>
    )
}

function CardHoverProject({edit_project_route, create_task_route, folder_path } : {edit_project_route: string, create_task_route: string, folder_path: string} ){
    return (
        <>
            <RouteButton text="Edit Project" route={edit_project_route} />
            <RouteButton text="Create Task" route={create_task_route} />
            <OpenFolderButton folder_path={folder_path} />
        </>
    )
}

function CardHoverTask({edit_task_route} : {edit_task_route: string}){
    return (
        <>
            <RouteButton text="Edit Task" route={edit_task_route} />
        </>
    )
}

function CardHoverSubmittal({edit_submittal_route, folder_path} : {edit_submittal_route: string, folder_path: string}){
    return (
        <>
            <RouteButton text="Edit Submittal" route={edit_submittal_route} />
            <OpenFolderButton folder_path={folder_path} />
        </>
    )
}

function CardHoverRFI({edit_rfi_route, folder_path} : {edit_rfi_route: string, folder_path: string}){
    return (
        <>
            <RouteButton text="Edit RFI" route={edit_rfi_route} />
            <OpenFolderButton folder_path={folder_path} />
        </>
    )
}

function CardHoverInvoice({edit_invoice_route} : {edit_invoice_route: string}){
    return (
        <>
            <RouteButton text="Edit Invoice" route={edit_invoice_route} />
        </>
    )
}
