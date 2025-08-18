"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateCalendarDays, toISODateString } from '@/utils/getDates';

interface SidebarCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export default function SidebarCalendar({ selectedDate, onDateSelect }: SidebarCalendarProps) {
    const [displayDate, setDisplayDate] = useState(selectedDate);

    useEffect(() => {
        setDisplayDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }, [selectedDate]);
    
    const selectedDateString = toISODateString(selectedDate);
    
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const calendarDays = generateCalendarDays(displayDate).slice(0, 35); 
    const customGreen = "#697d67";

    const handlePrevMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));

    return (
        <div className="w-64 p-2">
            <div className="flex items-center justify-between mb-4 bg-[#f3fee7] rounded-lg p-2">
                <button title="Previous month" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-[#e1f0cc]">
                    <ChevronLeft size={20} style={{ color: customGreen }} />
                </button>
                <h3 className="font-semibold" style={{ color: customGreen }}>
                    {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button title="Next month" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-[#e1f0cc]">
                    <ChevronRight size={20} style={{ color: customGreen }} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-gray-500 font-medium">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                
                {calendarDays.map((day, index) => {
                    const isSelected = day.date === selectedDateString;

                    return (
                        <button 
                            key={index}
                            onClick={() => onDateSelect(new Date(day.date.replace(/-/g, '/')))}
                            className={`
                                w-7 h-7 flex items-center justify-center rounded-full relative
                                ${day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
                                ${isSelected ? `bg-[${customGreen}] text-white` : ''}
                                ${!isSelected && day.isCurrentMonth ? 'hover:bg-gray-100' : ''}
                            `}
                        >
                            {day.dayOfMonth}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};