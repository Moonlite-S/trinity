//*Import necessary modules/functions. 'useState' hook for managing state w/in funct components.
//'date-fns' library for date manipulation.
import React, { useState } from 'react';
import { Header } from "./misc";
import { format, addMonths, subMonths, getDaysInMonth, isSameDay } from 'date-fns';

//** Component definition
export function Calendar() {

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null); //State to track the selected date
    const today = new Date();

    const daysInMonth = getDaysInMonth(currentMonth);

    //*** Handles month navigation
    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    };

    const closeModal = () => {
        setSelectedDate(null);
    };

    //**** Render component. 'Array.from' creates an array, maps, and render the days in the current month
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
                    
                    {Array.from({ length: daysInMonth }, (_, index) => {
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
                        const isToday = isSameDay(date, today);
                        return (
                            <div 
                                key={index} 
                                className={`relative p-4 h-24 border border-gray-300 hover:bg-orange-100`}
                                onClick={() => setSelectedDate(date)} //Set the selected date on click
                            >
                                {isToday && <div className="absolute top-0 left-0 right-0 h-2 bg-orange-500"></div>}
                                <div className="absolute top-0 right-0 m-1 text-sm">
                                    {index + 1}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                        <h2 className="text-lg font-semibold mb-4">
                            {format(selectedDate, 'MMMM dd, yyyy')}
                        </h2>
                        <div className="text-sm">
                            <div className="bg-yellow-200 p-2 rounded mb-2">
                                Example Task or Project
                            </div>
                        </div>
                        <button 
                            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

//Will add 'update calendar feature'.
//1. Create a Data Structure for Tasks, Projects, etc, (May have to import).
//Not sure if I make an array/data structure here or in the Tasks, I am guessing in Tasks
//2. Fetch and Display Tasks on the Calendar to update.
//3. Ensure Calendar reflects changes.
//Error on line 51, not sure what to do with it tbh, but it works.