import React, { useMemo } from 'react';
import { Event } from './CalendarMain';
import { toISODateString, Day } from '@/utils/getDates';
import CalendarPopover from '../ui/EventsPopover';

interface CalendarGridProps {
    days: Day[];
    events: Event[];
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export default function CalendarGrid({ days, events, selectedDate, onDateSelect }: CalendarGridProps) {
    const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
    const selectedDateString = toISODateString(selectedDate);

    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {} as Record<string, Event[]>);
    }, [events]);

    return (
        <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-200">
                {dayHeaders.map(header => (
                    <div key={header} className="p-2 text-xs font-bold text-center text-gray-500 uppercase">
                        {header}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {days.map((day, index) => {
                    const dailyEvents = eventsByDate[day.date] || [];
                    const eventsToShow = dailyEvents.slice(0, 2);
                    const remainingEvents = dailyEvents.length - eventsToShow.length;
                    const isSelected = selectedDateString === day.date;
                    const columnIndex = index % 7;

                    return (
                        <CalendarPopover 
                            key={index} 
                            events={dailyEvents} 
                            date={day.date}
                            columnIndex={columnIndex}
                        >
                            <div
                                onClick={() => {
                                    onDateSelect(new Date(day.date.replace(/-/g, '/')));
                                }}
                                className={`h-32 border-b border-r border-gray-200 p-2 flex flex-col justify-between hover:bg-gray-50 transition-colors duration-200 ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'}`}
                            >
                                <span className={`self-start text-sm ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-300'} ${
                                    isSelected ? 'bg-[#697d67] text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                                }`}>
                                    {day.dayOfMonth}
                                </span>
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    {eventsToShow.map((event, eventIndex) => (
                                        // --- MODIFICATION START ---
                                        // Conditionally apply grey styles if the day is not in the current month
                                        <div key={eventIndex} className={`flex items-center w-full p-1 rounded-md text-xs ${day.isCurrentMonth ? event.bgColor : 'bg-gray-100'}`}>
                                            <div className={`w-1 h-3 rounded-full mr-2 ${day.isCurrentMonth ? event.rectColor : 'bg-gray-400'}`}></div>
                                            <span className={`${day.isCurrentMonth ? 'text-black' : 'text-gray-500'} flex-1 truncate`}>{event.title}</span>
                                        </div>
                                        // --- MODIFICATION END ---
                                    ))}
                                    {remainingEvents > 0 && (
                                        <div className="flex items-center w-full p-1 rounded-md text-xs bg-gray-100">
                                            <div className="w-1 h-3 rounded-full mr-2 bg-gray-400"></div>
                                            <span className="text-black flex-1 truncate">+ {remainingEvents} more</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CalendarPopover>
                    );
                })}
            </div>
        </div>
    );
};