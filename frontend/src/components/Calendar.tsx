import { useEffect, useState } from 'react';
import { Header } from "./misc";
import { format, addMonths, subMonths, getDaysInMonth } from 'date-fns';
import { getProjectList } from '../api/projects';
import { UpdateProjectProps } from '../interfaces/project_types';

export function Calendar() {

    const [projectList, setProjectList] = useState<UpdateProjectProps[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const daysInMonth = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };
    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjectList()

                if (!response) {
                    throw new Error("Error fetching project list")
                }

                setProjectList(response)
            } catch (error) {
                console.error("Server Error: ",error)
            }

        fetchProjects()
        }
    }, [])

    console.log(projectList)
    //max-w-md my-5 mx-auto bg-slate-200 rounded-lg shadow-md p-6
    return (
        <>
        <Header />
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

            <MonthLayout daysInMonth={daysInMonth} currentMonth={currentMonth} />
        </div>
        </>
    )
}

function MonthLayout({ daysInMonth, currentMonth }: { daysInMonth: number, currentMonth: Date }) {

    // Pads days to the beginning of the month
    const days_to_skip = () => {
        currentMonth.setDate(1)
        const day = currentMonth.toLocaleDateString('en-US', { weekday: 'long' })

        if (day === 'Monday') {
            return 1
        } else if (day === 'Tuesday') {
            return 2
        } else if (day === 'Wednesday') {
            return 3
        } else if (day === 'Thursday') {
            return 4
        } else if (day === 'Friday') {
            return 5
        } else if (day === 'Saturday') {
            return 6
        } else 
            return 0
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">

            {Array.from({ length: days_to_skip() }, (_, index) => (
                <div key={index} className="p-14 border border-gray-300 text-center"/>
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => (
                <DayButton key={index} day_number={index} />
            ))}
        </div>
    )
}

function DayButton({ day_number }: { day_number: number }) {

    return (
        <div className="h-52 border border-gray-300 text-center shadow-md">
            <div className="text-xl font-bold">
                {day_number + 1}
            </div>

            <div className='group'>
                <div className='text-lg group-hover:bg-slate-400'>
                    Project Title
                </div>

                <div className='bg-slate-50 p-4 text-sm hidden group-hover:block'>
                    Project Deadline
                </div>
            </div>
        </div>
    )
}