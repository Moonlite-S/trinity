import { useEffect, useState } from 'react';
import { Header } from "./misc";
import { format, addMonths, subMonths, getDaysInMonth, subWeeks, addWeeks, addDays, endOfWeek, startOfWeek } from 'date-fns';
import { ProjectProps } from '../interfaces/project_types';
import { getProjectByDate } from '../api/projects';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarProps, DayButtonProps } from '../interfaces/calendar_type';
import { RouteButton } from './Buttons';

/**
 * ### [Route for ('/monthly_calendar')]
 * 
 * This component shows the calendar for the current month.
 * The calendar shows projects that are due in that month.
 * 
 * TODO:
 * - Show links to each project due
 */
export function MonthlyCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    const [projectsDueThisMonth, setProjectsDueThisMonth] = useState<CalendarProps[]>([]);
    const daysInMonth = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    }

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjectByDate(currentMonth.getFullYear().toString(), (currentMonth.getMonth() + 1).toString())

                if (!response) {
                    throw new Error("Error fetching project list")
                }

                setProjectsDueThisMonth(Array.from({ length: daysInMonth }, (_, index) => {
                    const projects_due = response.filter(
                        (project) => project.end_date === currentMonth.getFullYear().toString() + "-" + (currentMonth.getMonth() + 1).toString().padStart(2, "0") + "-" + (index + 1).toString()
                    )

                    return {
                        day: index,
                        projects: projects_due
                    }
                }))

            } catch (error) {
                console.error("Server Error: ",error)
            }
        }
        fetchProjects()

    }, [currentMonth])

    //max-w-md my-5 mx-auto bg-slate-200 rounded-lg shadow-md p-6
    return (
        <>
        <Header />

        <div className='flex justify-center gap-4'>
            <button onClick={() => setCurrentMonth(new Date())} className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                Today
            </button>

            <Link to="/weekly_calendar" className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                Weekly Calendar
            </Link>
        </div>

        <FullCalendar currentMonth={currentMonth} handlePrevMonth={handlePrevMonth} handleNextMonth={handleNextMonth} daysInMonth={daysInMonth} projectsDueToday={projectsDueThisMonth} />
        </>
    )
}

type FullCalendarProps = {
    currentMonth: Date
    handlePrevMonth: () => void
    handleNextMonth: () => void
    daysInMonth: number
    projectsDueToday: CalendarProps[]
}

function FullCalendar({ currentMonth, handlePrevMonth, handleNextMonth, daysInMonth, projectsDueToday }: FullCalendarProps) {
    return (
        <>
        <div className="my-5 mx-auto rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-4">
                <button onClick={handlePrevMonth} className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                    Previous
                </button>

                <h2 className="text-2xl font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>

                <button onClick={handleNextMonth} className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                    Next
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                <h4 className="text-center">Sun</h4>
                <h4 className="text-center">Mon</h4>
                <h4 className="text-center">Tue</h4>
                <h4 className="text-center">Wed</h4>
                <h4 className="text-center">Thu</h4>
                <h4 className="text-center">Fri</h4>
                <h4 className="text-center">Sat</h4>
            </div>

            <MonthLayout daysInMonth={daysInMonth} currentMonth={currentMonth} projectList={projectsDueToday}  />
    
        </div>

        <div className="flex justify-center mt-4">
            <RouteButton route="/main_menu" text="Back to Main Menu" />
        </div>
        </>
    )
}

/**
 * Component that layouts and renders each day of the month
 * @param {number} daysInMonth
 */
function MonthLayout({ currentMonth, projectList }: { daysInMonth: number, currentMonth: Date, projectList: CalendarProps[] }) {
    // Pads days to the beginning of the month
    const days_to_skip = () => {
        const tempMonth = currentMonth
        tempMonth.setDate(1)
        const day = tempMonth.toLocaleDateString('en-US', { weekday: 'long' })

        switch (day) {
            case 'Monday':
                return 1
            case 'Tuesday':
                return 2
            case 'Wednesday':
                return 3
            case 'Thursday':
                return 4
            case 'Friday':
                return 5
            case 'Saturday':
                return 6
            default:
                return 0
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">

            {Array.from({ length: days_to_skip() }, (_, index) => (
                <div key={index} className="p-14 border border-gray-300 bg-gray-200 text-center"/>
            ))}

            {projectList.map((project_day, index) => (
               <MonthDayCard key={index} day_number={project_day.day} projects={project_day.projects} /> 
            ))}
        </div>
    )
}

/**
 * A component for each day on the calendar
 * @param {number} day_number the day of the month
 */
function MonthDayCard({ day_number, projects }: DayButtonProps) {
    return (
        <div className="h-52 border border-gray-300  text-center shadow-md ">
            <div className="text-xl font-bold">
                {day_number + 1}
            </div>

            <div className="overflow-y-auto h-44">
            {projects && projects.length > 0 && 
                <ListProjectsOnDay projects={projects} />
            }
            </div>
        </div>
    )
}

/**
 * Renders all projects due on a specific day
 * @param projects list of projects on a specific day
 */
function ListProjectsOnDay({ projects }: { projects: ProjectProps[] }) {
    const navigate = useNavigate()

    return(
        <>
        {projects.map((project) => (
            <button key={project.project_id} onClick={() =>navigate('/projects/update_project/' + project.project_id)} className='w-full'>
                <div className='group bg-orange-100 overflow-hidden'>
                    <div className='text-blue-800 underline font-semibold text-base'>
                        {project.project_name}
                    </div>

                    <div className='bg-orange-200 text-xs '>
                        {project.description}
                    </div>
                </div>
            </button>
        ))
        }
        </>
    )
}

/**
 * ### [Route for ('/calendar/weekly')]
 * 
 * This component shows the calendar for the current week.
 * The calendar shows projects that are due in that week.
 * 
 * TODO:
 * - Show links to each project due
 */
export function WeeklyCalendar() {
    const [currentWeek, setCurrentWeek] = useState(new Date())
    const [projectsDueThisWeek, setProjectsDueThisWeek] = useState<CalendarProps[]>([])
    
    const handlePrevWeek = () => {
        setCurrentWeek(subWeeks(currentWeek, 1))
    }

    const handleNextWeek = () => {
        setCurrentWeek(addWeeks(currentWeek, 1))
    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjectByDate(currentWeek.getFullYear().toString(), (currentWeek.getMonth() + 1).toString())

                const weekStart = startOfWeek(currentWeek)
                const weekEnd = endOfWeek(currentWeek)

                console.log("weekStart: ", weekStart)
                console.log("weekEnd: ", weekEnd)

                setProjectsDueThisWeek(Array.from({ length: 7 }, (_, index) => {
                    const currentDay = addDays(weekStart, index)
                    const formattedDate = format(currentDay, 'yyyy-MM-dd')

                    const projects_due = response.filter(
                        (project) => project.end_date === formattedDate
                    )

                    return {
                        day: index,
                        projects: projects_due
                    }
                }))

                console.log("projectsDueThisWeek: ", projectsDueThisWeek)

            } catch (error) {
                console.error("Server Error: ", error)
            }
        }
        fetchProjects()
    }, [currentWeek])
    
    return (
        <>
        <Header />

        <div className='flex justify-center gap-4'>
            <button onClick={() => setCurrentWeek(new Date())} className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                Today
            </button>

            <Link to="/monthly_calendar" className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                Monthly Calendar
            </Link>
        </div>

        <div className='my-5 mx-auto rounded-lg shadow-md p-6'>
            <div className='flex justify-between mb-4'>
                <button onClick={handlePrevWeek} className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                    Previous
                </button>

                <div className='flex justify-center'>
                    <h2 className="text-2xl font-semibold">
                    {format(currentWeek, 'MMMM yyyy')}
                </h2>
                </div>

                <button onClick={handleNextWeek} className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                    Next
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                <h4 className="text-center">Sun</h4>
                <h4 className="text-center">Mon</h4>
                <h4 className="text-center">Tue</h4>
                <h4 className="text-center">Wed</h4>
                <h4 className="text-center">Thu</h4>
                <h4 className="text-center">Fri</h4>
                <h4 className="text-center">Sat</h4>
            </div>

            <div className='grid grid-cols-7 gap-2 text-center'>
                {Array.from({ length: 7 }, (_, index) => {
                    const currentDate = addDays(startOfWeek(currentWeek), index);
                    return (
                        <WeekDayCard 
                            key={index}
                            date={currentDate}
                            projects={projectsDueThisWeek[index]?.projects}
                            alternate_color={index % 2 === 0}
                        />
                    );
                })}
            </div>
        </div>

        <div className="flex justify-center mt-4">
            <RouteButton route="/main_menu" text="Back to Main Menu" />
        </div>
        </>
    )
}

type WeekDayCardProps = {
    date: Date;
    projects?: ProjectProps[];
    alternate_color: boolean;
}

function WeekDayCard({ date, projects, alternate_color }: WeekDayCardProps) {
    return (
        <div className={`h-screen border border-gray-300 text-center ${alternate_color ? 'bg-gray-200' : 'bg-gray-100'}`}>  
            <div className='text-xl font-semibold mb-5'>
                {format(date, 'd')}
            </div>

            <div className='overflow-y-auto'>
                {projects && projects.length > 0 && (
                    <ListProjectsOnDayWeekly projects={projects} />
                )}
            </div>
        </div>
    );
}

/**
 * Renders all projects due on a specific day
 * @param projects list of projects on a specific day
 */
function ListProjectsOnDayWeekly({ projects }: { projects: ProjectProps[] }) {
    const navigate = useNavigate()

    return(
        <>
        {projects.map((project) => (
            <button key={project.project_id} onClick={() =>navigate('/projects/update_project/' + project.project_id)} className='w-full mb-5'>
                <div className='group bg-orange-100 overflow-hidden'>
                    <div className='text-blue-800 underline font-semibold text-xl'>
                        {project.project_name}
                    </div>

                    <div className='bg-orange-200 text-base '>
                        {project.description}
                    </div>
                </div>
            </button>
        ))
        }
        </>
    )
}