import { useEffect, useState } from 'react';
import { Header } from "./misc";
import { format, addMonths, subMonths, getDaysInMonth, subWeeks, addWeeks, addDays } from 'date-fns';
import { ProjectProps } from '../interfaces/project_types';
import { getProjectByDate } from '../api/projects';
import { useNavigate } from 'react-router-dom';
import { CalendarProps, DayButtonProps } from '../interfaces/calendar_type';
import { Route_Button } from './Buttons';

/**
 * ### [Route for ('/calendar')]
 * 
 * This component shows the calendar for the current month.
 * The calendar shows projects that are due in that month.
 * 
 * TODO:
 * - Show links to each project due
 */
export function Calendar() {
    const [currentFormat, setCurrentFormat] = useState<string>("full")

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentWeek, setCurrentWeek] = useState(() => {
        const today = new Date();
        const diff = today.getDate() - today.getDay();
        return new Date(today.setDate(diff));
    });
    const [projectsDueThisMonth, setProjectsDueThisMonth] = useState<CalendarProps[]>([]);
    const daysInMonth = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    }

    const handleNextWeek = () => {
        setCurrentWeek(addWeeks(currentWeek, 1))
    }

    const handlePrevWeek = () => {
        setCurrentWeek(subWeeks(currentWeek, 1))
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

        <div className='flex justify-center'>
            <select onChange={(e) => setCurrentFormat(e.target.value)} className='max-w-md my-5 mx-auto rounded-lg shadow-md p-6 bg-slate-100 hover:bg-slate-200 transition cursor-pointer' defaultValue={currentFormat}>
                <option value="full">Full Calendar</option>
                <option value="weekly">Weekly Calendar</option>
            </select>
        </div>

        {currentFormat === "full" &&
            <FullCalendar currentMonth={currentMonth} handlePrevMonth={handlePrevMonth} handleNextMonth={handleNextMonth} daysInMonth={daysInMonth} projectsDueToday={projectsDueThisMonth} />
        }

        {currentFormat === "weekly" &&
            <WeeklyCalendar currentWeek={currentWeek} handlePrevWeek={handlePrevWeek} handleNextWeek={handleNextWeek} projectsDueToday={projectsDueThisMonth} />
        }

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
            <Route_Button route="/main_menu" text="Back to Main Menu" />
        </div>
        </>
    )
}

type WeeklyCalendarProps = {
    currentWeek: Date
    handlePrevWeek: () => void
    handleNextWeek: () => void
    projectsDueToday: CalendarProps[]
}

function WeeklyCalendar({ currentWeek, handlePrevWeek, handleNextWeek, projectsDueToday }: WeeklyCalendarProps) {
    return (
        <>
        <div className="my-5 mx-auto rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-4">
                <button onClick={handlePrevWeek} className='p-4 bg-orange-300 rounded hover:bg-orange-400 transition'>
                    Previous
                </button>

                <h2 className="text-2xl font-semibold">
                    {format(currentWeek, 'MMMM yyyy')}
                </h2>

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

            <WeekLayout currentWeek={currentWeek} projectList={projectsDueToday}  />
    
        </div>

        <div className="flex justify-center mt-4">
            <Route_Button route="/main_menu" text="Back to Main Menu" />
        </div>
        </>
    )
}

/**
 * Component that layouts and renders each day of the week
 * 
 * TODO: 
 * - Pad out the last week with blanks so that it connects well with the next month. (Just like how you padded it out in the begining)
 * - Add the project list
 * - Refactor the code so that I can just map out the divs instead of manually puttting each day ofthe week
 */
function WeekLayout({ currentWeek, projectList }: { currentWeek: Date, projectList: CalendarProps[] }) {

    //Pads days to the beginning of the week
    const days_to_skip = () => {
        const firstDayOfMonth = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1);
        const day = firstDayOfMonth.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(currentWeek)
        console.log(day);
        console.log(currentWeek.getDate());
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
        <div className="grid grid-cols-7 gap-2">
            {currentWeek.getDate() <= 7 && Array.from({ length: days_to_skip() }, (_, index) => (
                <div key={index} className="p-14 border border-gray-300 bg-gray-200 text-center"/>
            ))}

            <div className='h-screen bg-slate-100 text-center'>
                <h4 className='text-xl font-semibold'>{format(currentWeek, 'dd')}</h4>
            </div>

            <div className='h-screen text-center'>
                <h4 className='text-xl font-semibold'>{format(addDays(currentWeek, 1), 'dd') }</h4>
            </div>

            <div className='h-screen bg-slate-100 text-center'>
                <h4 className='text-xl font-semibold'>{format(addDays(currentWeek, 2), 'dd')}</h4>
            </div>

            <div className='h-screen  text-center'>
                <h4 className='text-xl font-semibold'>{format(addDays(currentWeek, 3), 'dd')}</h4>
            </div>

            <div className='h-screen bg-slate-100 text-center'>
                <h4 className='text-xl font-semibold'>{format(addDays(currentWeek, 4), 'dd')}</h4>
            </div>

            <div className='h-screen text-center'>
                <h4 className='text-xl font-semibold'>{format(addDays(currentWeek, 5), 'dd')}</h4>
            </div>

            <div className='h-screen bg-slate-100 text-center'>
                <h4 className='text-xl font-semibold'>{format(addDays(currentWeek, 6), 'dd')}</h4>
            </div>

            {/* 
            ))}

            {projectList.map((project_day, index) => (
               <WeekDayCard key={index} day_number={project_day.day} projects={project_day.projects} /> 
            ))} */}
        </div>
    )
}




/**
 * Component that layouts and renders each day of the month
 * @param {number} daysInMonth
 */
function MonthLayout({ currentMonth, projectList }: { daysInMonth: number, currentMonth: Date, projectList: CalendarProps[] }) {

    // Pads days to the beginning of the month
    const days_to_skip = () => {
        currentMonth.setDate(1)
        const day = currentMonth.toLocaleDateString('en-US', { weekday: 'long' })

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

function WeekDayCard({ day_number, projects }: DayButtonProps) {
    return (
        <div className="h-screen border border-gray-300  text-center shadow-md ">
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
    const navigate = useNavigate();

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