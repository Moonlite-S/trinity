import { useNavigate } from "react-router-dom"
import { AnnouncementProps } from "../interfaces/announcement_types"
import { AccountantDashboardProps, MainDashboardProps, ManagerDashboardProps, } from "../interfaces/dashboard_types"
import { EmployeeProps } from "../interfaces/employee_type"
import { ProjectProps } from "../interfaces/project_types"
import { TaskProps } from "../interfaces/tasks_types"
import { TaskCard, AnnouncementCard, ProjectCard, RFICard, SubmittalCard, InvoiceCard } from "./Card"
import { useEffect, useMemo, useState } from "react"
import { RFIProps } from "../interfaces/rfi_types"
import { SubmittalProps } from "../interfaces/submittal_types"
import { InvoiceProps } from "../interfaces/invoices_types"
import { getInvoicesNotPaid } from "../api/invoices"
import useDashboardFunc from "../hooks/useDashboard"
import { MainNavBar } from "./NavBar"

type BaseDashboardLayoutProps = {
    user: EmployeeProps, 
    announcements: AnnouncementProps[],
}

/**
 * A small component for the Main Menu component
 * 
 * Shows the user's name and role, along with tasks and projects
 * 
 * Dashboard will show different panels depending on the user's role
 * 
 * @param user The user to display the dashboard for
 * @param announcements The announcements to display
 */
export function BaseDashboardLayout(
    {user, announcements}: BaseDashboardLayoutProps
) {
    const { isNewCard, markAsSeen } = useDashboardFunc()

    // Sorts all the Cards by those that are new, then by the date
    // Using memo to make it only render once
    const sort_tasks = useMemo(() => {
        return (tasks: TaskProps[]) => {
            return [...tasks].sort((a, b) => {
                const aIsNew = isNewCard('task', a.task_id ?? '')
                const bIsNew = isNewCard('task', b.task_id ?? '')
                if (aIsNew && !bIsNew) return -1
                if (!aIsNew && bIsNew) return 1
                return a.due_date.localeCompare(b.due_date)
            })
        }
    }, [])

    const sort_projects = useMemo(() => {
        return (projects: ProjectProps[]) => {
            return [...projects].sort((a, b) => {
                const aIsNew = isNewCard('project', a.project_id ?? '')
                const bIsNew = isNewCard('project', b.project_id ?? '')
                if (aIsNew && !bIsNew) return -1
                if (!aIsNew && bIsNew) return 1
                return a.end_date.localeCompare(b.end_date)
            })
        }
    }, [])

    const sort_submittals = useMemo(() => {
        return (submittals: SubmittalProps[]) => {
            return [...submittals].sort((a, b) => {
                const aIsNew = isNewCard('submittal', a.submittal_id ?? '')
                const bIsNew = isNewCard('submittal', b.submittal_id ?? '')
                if (aIsNew && !bIsNew) return -1
                if (!aIsNew && bIsNew) return 1
                if (a.status !== b.status) {
                    const statusOrder = ['CLOSING', 'OPEN', 'CLOSED']
                    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
                }
                return a.received_date.localeCompare(b.received_date)
            })
        }
    }, [])

    const sort_rfis = useMemo(() => {
        return (rfis: RFIProps[]) => {
            return [...rfis].sort((a, b) => {
                const aIsNew = isNewCard('rfi', a.RFI_id ?? '')
                const bIsNew = isNewCard('rfi', b.RFI_id ?? '')
                if (aIsNew && !bIsNew) return -1
                if (!aIsNew && bIsNew) return 1
                return a.sent_out_date.localeCompare(b.sent_out_date)
            })
        }
    }, [])

    const sorted_tasks = useMemo(() => sort_tasks(user.tasks ?? []), [user.tasks, sort_tasks])
    const sorted_projects = useMemo(() => sort_projects(user.projects ?? []), [user.projects, sort_projects])
    const sorted_submittals = useMemo(() => sort_submittals(user.submittals ?? []), [user.submittals, sort_submittals])
    const sorted_rfis = useMemo(() => sort_rfis(user.RFIs ?? []), [user.RFIs, sort_rfis])


    return (
        <div className="flex flex-row">
            <MainNavBar role={user.role} />
            {(user.role === "Manager" || user.role === "Administrator") &&
            <ManagerDashboard user={user} announcements={announcements} sorted_tasks={sorted_tasks} sorted_projects={sorted_projects} sorted_submittals={sorted_submittals} sorted_rfis={sorted_rfis} isNewCard={isNewCard} markAsSeen={markAsSeen} />}
            {user.role === "Team Member" &&
            <TeamMemberDashboard user={user} announcements={announcements} sorted_tasks={sorted_tasks} sorted_projects={sorted_projects} isNewCard={isNewCard} markAsSeen={markAsSeen}/>}
            {user.role === "Accountant" &&
            <AccountantDashboard user={user} announcements={announcements} isNewCard={isNewCard} markAsSeen={markAsSeen}/>}
        </div>
    )
}

function ManagerDashboard(
    {user, announcements, sorted_tasks, sorted_projects, sorted_submittals, sorted_rfis, isNewCard, markAsSeen}: ManagerDashboardProps
) {
    return (
    <div className="flex flex-col w-screen pr-2 h-screen">

        <div className="p-5 mx-auto border flex flex-col mb-2 w-full">
            <h3>Hello, {user.name}</h3>

            <h3>Role: {user.role}</h3>
        </div>
        
        <AnnouncementSection 
            announcements={announcements}
            isNewCard={isNewCard}
            markAsSeen={markAsSeen}
        />
        
        <GridPartitionWrapper>

            <TaskSection
                sorted_tasks={sorted_tasks}
                isNewCard={isNewCard}
                markAsSeen={markAsSeen}
            />

            <ProjectSection
                sorted_projects={sorted_projects}
                isNewCard={isNewCard}
                markAsSeen={markAsSeen}
            />

            <RFISection
                sorted_rfis={sorted_rfis}
                isNewCard={isNewCard}
                markAsSeen={markAsSeen}
            />

            <SubmittalSection
                sorted_submittals={sorted_submittals}
                isNewCard={isNewCard}
                markAsSeen={markAsSeen}
            />

        </GridPartitionWrapper>
    </div>
    )
}

function TeamMemberDashboard(
    {user, announcements, sorted_tasks, sorted_projects, isNewCard, markAsSeen}: MainDashboardProps
) {
    return (
    <div className="flex flex-col w-screen pr-2 h-screen">

        <div className="p-5 mx-auto border flex flex-col mb-2 w-full">
            <h3>Hello, {user.name}</h3>

            <h3>Role: {user.role}</h3>
        </div>
        
        <AnnouncementSection
            announcements={announcements}
            isNewCard={isNewCard}
            markAsSeen={markAsSeen}
        />
        
        <GridPartitionWrapper>

            <TaskSection
                sorted_tasks={sorted_tasks}
                isNewCard={isNewCard}
                markAsSeen={markAsSeen}
            />

            <ProjectSection
                sorted_projects={sorted_projects}
                isNewCard={isNewCard}
                markAsSeen={markAsSeen}
            />

        </GridPartitionWrapper>
    </div>
    )
}

function AccountantDashboard(
    {user, announcements, isNewCard, markAsSeen}: AccountantDashboardProps
) {
    const [invoices, setInvoices] = useState<InvoiceProps[]>([])

    useEffect(() => {
        const get_invoices = async () => {
            try {
                const response = await getInvoicesNotPaid()
                setInvoices(response)
            } catch (error) {
                console.log(error)
            }
        }

        get_invoices()
    }, [])

    const sort_invoices = useMemo(() => {
        return (invoices: InvoiceProps[]) => {
            return [...invoices].sort((a, b) => {
                const aIsNew = isNewCard('invoice', a.invoice_id ?? '')
                const bIsNew = isNewCard('invoice', b.invoice_id ?? '')
                if (aIsNew && !bIsNew) return -1
                if (!aIsNew && bIsNew) return 1
                return a.invoice_date.localeCompare(b.invoice_date)
            })
        }
    }, [])

    const sorted_invoices = useMemo(() => sort_invoices(invoices), [invoices, sort_invoices])

    return (
        <div className="flex flex-col w-screen pr-2 h-screen">

        <div className="p-5 mx-auto border flex flex-col mb-2 w-full">
            <h3>Hello, {user.name}</h3>

            <h3>Role: {user.role}</h3>
        </div>
        
        <AnnouncementSection
            announcements={announcements}
            isNewCard={isNewCard}
            markAsSeen={markAsSeen}
        />
        
        <InvoiceSection
            invoices={sorted_invoices}
            isNewCard={isNewCard}
            markAsSeen={markAsSeen}
        />
        
    </div>
    )
}


type ButtonProps = {
    text: string, 
    route: string,
    popup_window?: boolean,
    additional_window?: string
}

/**
 * A button component that serves as main buttons for the Main Menu
 * 
 * @param text - The text of the button
 * @param route - The route of the button
 * @param popup_window - Whether the button should open a new window
 * @param additional_window - The route of one additional window (Used for the Project Status Report)
 */
export function Button_Card(
    {text, route, popup_window = false, additional_window}: ButtonProps
) {
    const navigate = useNavigate()

    const handleClick = () => {
        if (popup_window) {
            window.open(route, '_blank', 'width=1000,height=1000')

            if (additional_window) {
                window.open(additional_window, '_blank', 'width=1000,height=1000')
            }
        } else {
            navigate(route)
        }
    }

    return (
        <button onClick={handleClick} className="w-40 my-2">

            <div className="bg-orange-200 rounded h-14 justify-center items-center flex hover:bg-orange-300 transition">

                <h4>{text}</h4>
                
            </div>

        </button>
    )
}



/**
 * Just a small wrapper to make the dashboard look cleaner
 */
function GridPartitionWrapper(
    {children}: {children: React.ReactNode}
) {
    return (
        <div className="grid grid-cols-2 gap-3 justify-center pb-5 h-full mb-4">
            {children}
        </div>
    )
}

type AnnouncementSectionProps = {
    announcements: AnnouncementProps[],
    isNewCard: (cardType: string, id: string) => boolean,
    markAsSeen: (cardType: string, id: string) => void
}

function AnnouncementSection(
    {announcements, isNewCard, markAsSeen}: AnnouncementSectionProps
) {
    return (
        <div className="p-5 mx-auto border w-full mb-2">

            <h3>Announcements:</h3>

            <div className="overflow-y-auto h-full">
                {announcements.length > 0 ? announcements.reverse().map((announcement, index) => (
                    <AnnouncementCard 
                    key={index} 
                    announcement={announcement} 
                    isNew={isNewCard('announcement', announcement.title ?? '')} 
                    onView={() => markAsSeen('announcement', announcement.title ?? '')} />
                ))
                : 
                <h3>No Announcements at the moment</h3>
                }
            </div>

        </div>
    )
}

type TaskSectionProps = {
    sorted_tasks: TaskProps[],
    isNewCard: (cardType: string, id: string) => boolean,
    markAsSeen: (cardType: string, id: string) => void
}

function TaskSection(
    {sorted_tasks, isNewCard, markAsSeen}: TaskSectionProps
) {
    return (
        <div className="p-5 mx-auto border w-full overflow-hidden">
            <h3>Tasks:</h3>

            <div className="overflow-y-auto h-full">
                {sorted_tasks.length > 0 ? sorted_tasks.map((task) => (
                    <TaskCard 
                        key={task.task_id} 
                        task={task} 
                        isNew={isNewCard('task', task.task_id ?? '')}
                        onView={() => markAsSeen('task', task.task_id ?? '')}
                    />
                ))
                :
                <h3>No Tasks assigned to you</h3>}
            </div>

        </div>
    )
}

type ProjectSectionProps = {
    sorted_projects: ProjectProps[],
    isNewCard: (cardType: string, id: string) => boolean,
    markAsSeen: (cardType: string, id: string) => void
}

function ProjectSection(
    {sorted_projects, isNewCard, markAsSeen}: ProjectSectionProps
) {
    return (
        <div className="p-5 mx-auto border w-full overflow-hidden">
                <h3 className="py-2">Projects:</h3>
                
                <div className="overflow-y-auto h-full">
                    {sorted_projects.length > 0 ? sorted_projects.map((project) => (
                        <ProjectCard 
                            key={project.project_id} 
                            project={project} 
                            isNew={isNewCard('project', project.project_id ?? '')}
                            onView={() => markAsSeen('project', project.project_id ?? '')}
                        />
                    ))
                    :
                    <h3>No Projects assigned to you</h3>
                    }
            </div>
        </div>
    )
}

type RFISectionProps = {
    sorted_rfis: RFIProps[],
    isNewCard: (cardType: string, id: string) => boolean,
    markAsSeen: (cardType: string, id: string) => void
}

function RFISection(
    {sorted_rfis, isNewCard, markAsSeen}: RFISectionProps   
) {
    return (
        <div className="p-5 mx-auto border w-full overflow-hidden">
            <h3>RFIs</h3>

            <div className="overflow-y-auto h-full">
                {sorted_rfis.length > 0 ? sorted_rfis.map((rfi) => (
                    <RFICard 
                        key={rfi.RFI_id} 
                        rfi={rfi} 
                        isNew={isNewCard('rfi', rfi.RFI_id ?? '')}
                        onView={() => markAsSeen('rfi', rfi.RFI_id ?? '')}  
                    />
                ))
                :
                <h3>No RFIs assigned to you</h3>}
            </div>

        </div>
    )   
}

type SubmittalSectionProps = {
    sorted_submittals: SubmittalProps[],
    isNewCard: (cardType: string, id: string) => boolean,
    markAsSeen: (cardType: string, id: string) => void
}

function SubmittalSection(
    {sorted_submittals, isNewCard, markAsSeen}: SubmittalSectionProps
) {
    return (
        <div className="p-5 mx-auto border w-full overflow-hidden">
            <h3>Submittals:</h3>

            <div className="overflow-y-auto h-full">
                {sorted_submittals.length > 0 ? sorted_submittals.map((submittal) => (
                    <SubmittalCard 
                    key={submittal.submittal_id} 
                        submittal={submittal} 
                        isNew={isNewCard('submittal', submittal.submittal_id ?? '')}
                        onView={() => markAsSeen('submittal', submittal.submittal_id ?? '')}
                    />
                ))
                :
                <h3>No Submittals assigned to you</h3>}
            </div>
        </div>
    )
}

type InvoiceSectionProps = {
    invoices: InvoiceProps[],
    isNewCard: (cardType: string, id: string) => boolean,
    markAsSeen: (cardType: string, id: string) => void
}

function InvoiceSection(
    {invoices, isNewCard, markAsSeen}: InvoiceSectionProps
) {
    return (
        <div className="grid grid-cols-1 gap-3 justify-center pb-5 h-full mb-4">

            <div className="p-5 mx-auto border w-full overflow-hidden">
                <h3>Invoices:</h3>

                {invoices.length > 0 ? invoices.map((invoice) => (
                    <InvoiceCard 
                        key={invoice.invoice_id} 
                        invoice={invoice} 
                        isNew={isNewCard('invoice', invoice.invoice_id ?? '')}
                        onView={() => markAsSeen('invoice', invoice.invoice_id ?? '')}
                    />
                ))
                :
                <h3>No Invoices at the moment</h3>}

            </div>

        </div>
    )
}
