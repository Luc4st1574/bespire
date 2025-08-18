"use client";

import { useMemo } from 'react';
import { generateCalendarDays } from '@/utils/getDates';
import CalendarHeader from './CalendarHeader';
import SidebarCalendar from './CalendarSidebar';
import CalendarGrid from './CalendarGrid';
import { EventCategory } from '@/app/calendar/page'; 

// --- MODIFICATION START ---
// Add 'id' to the Event interface.
export interface Event {
    id: string; // A unique identifier is crucial for managing items in a list
    date: string;
    title: string;
    type: string;
    bgColor: string;
    rectColor: string;
    startTime?: string;
    endTime?: string;
}
// --- MODIFICATION END ---

interface CalendarMainProps {
    events: Event[];
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onDateChange: (date: Date) => void;
    onGoToToday: () => void;
    eventCategories: EventCategory[];
    activeFilters: string[];
    onFilterToggle: (category: string) => void;
    onSeeAllEvents: () => void;
    onAddEvent: () => void; // <-- Add prop to trigger the add modal
}

export default function CalendarMain({
    events,
    currentDate,
    onPrevMonth,
    onNextMonth,
    onDateChange,
    onGoToToday,
    eventCategories,
    activeFilters,
    onFilterToggle,
    onSeeAllEvents,
    onAddEvent, // <-- Receive new prop
}: CalendarMainProps) {

    const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

    return (
        <div className="h-full flex flex-col">
            <div className="px-4">
                <CalendarHeader 
                    currentDate={currentDate}
                    onPrevMonth={onPrevMonth}
                    onNextMonth={onNextMonth}
                    onGoToToday={onGoToToday}
                    eventCategories={eventCategories}
                    activeFilters={activeFilters}
                    onFilterToggle={onFilterToggle}
                    onSeeAllEvents={onSeeAllEvents}
                    onAddEvent={onAddEvent}
                />
            </div>
            <div className="flex flex-1 mt-4 px-4 pb-4 gap-4">
                <SidebarCalendar 
                    selectedDate={currentDate}
                    onDateSelect={onDateChange} 
                />
                <CalendarGrid 
                    days={calendarDays} 
                    events={events}
                    selectedDate={currentDate}
                    onDateSelect={onDateChange}
                />
            </div>
            <div className="border-t border-t-[#fbfff7] pt-[500px]">
            </div>
        </div>
    );
}