import { useState } from 'react';
import { Header } from "./misc";
import { format, addMonths, subMonths, getDaysInMonth } from 'date-fns';

export function Calendar() {

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    };

    //max-w-md my-5 mx-auto bg-slate-200 rounded-lg shadow-md p-6
    return (
        <>
            <Header />
            <div className="my-5 mx-auto bg-slate-200 rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-4">
                <button onClick={handlePrevMonth}>Previous</button>
                <h2 className="text-lg font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button onClick={handleNextMonth}>Next</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {Array.from({ length: daysInMonth }, (_, index) => (
                    <div key={index} className="p-2 border border-gray-300 text-center">
                        {index + 1}
                    </div>
                ))}
            </div>
        </div>
        </>
    )
}