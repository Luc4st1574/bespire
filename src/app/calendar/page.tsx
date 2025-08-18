"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import CalendarMain from '@/components/calendar/CalendarMain';
import { Event } from '@/components/calendar/CalendarMain';
import EventViewModal from '@/components/modals/EventViewModal';
import AddEventModal from '@/components/modals/AddEventModal';
import EventCreatedToast from '@/components/ui/EventCreatedToast';
import EventDetailModal from '@/components/modals/EventDetailModal';
import initialEventsData from '@/data/events.json';
import { showSuccessToast } from "@/components/ui/toast";

const getInitialEvents = (): Event[] => {
    return initialEventsData.map(event => ({
        ...event,
        id: crypto.randomUUID(),
    }));
};

export interface EventCategory {
    type: string;
    bgColor: string;
    rectColor: string;
}

export default function CalendarPage() {
    const [events, setEvents] = useState<Event[]>(getInitialEvents);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEventViewModalOpen, setIsEventViewModalOpen] = useState(false);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const uniqueCategories = useMemo((): EventCategory[] => {
        const categories = new Map<string, EventCategory>();
        initialEventsData.forEach(event => {
            if (!categories.has(event.type)) {
                categories.set(event.type, {
                    type: event.type,
                    bgColor: event.bgColor,
                    rectColor: event.rectColor,
                });
            }
        });
        return Array.from(categories.values());
    }, []);

    const [activeFilters, setActiveFilters] = useState<string[]>(() =>
        uniqueCategories.map(cat => cat.type)
    );

    const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
        const newEvent: Event = {
            ...eventData,
            id: crypto.randomUUID(),
        };
        setEvents(prev => [...prev, newEvent]);
        setIsAddEventModalOpen(false);

        const handleReview = () => {
            setSelectedEvent(newEvent);
            setIsDetailModalOpen(true);
        };

        toast.custom((t) => (
            <EventCreatedToast toastId={t} onReview={handleReview} />
        ), { duration: 6000 });
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        showSuccessToast("Event deleted!");
    };

    const handleArchiveEvent = (eventId: string) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        showSuccessToast("Event archived!");
    };
    
    const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const handleGoToToday = () => setCurrentDate(new Date());
    const handleDateChange = (newDate: Date) => {
        newDate.setHours(12, 0, 0, 0);
        setCurrentDate(newDate);
    };

    const handleFilterToggle = (eventType: string) => {
        if (eventType === 'All') {
            const allTypes = uniqueCategories.map(cat => cat.type);
            if (activeFilters.length === allTypes.length) {
                setActiveFilters([]);
            } else {
                setActiveFilters(allTypes);
            }
        } else {
            setActiveFilters(prev =>
                prev.includes(eventType)
                    ? prev.filter(type => type !== eventType)
                    : [...prev, eventType]
            );
        }
    };
    
    const filteredEvents = useMemo(() => {
        if (activeFilters.length === 0) return [];
        return events.filter(event => activeFilters.includes(event.type));
    }, [activeFilters, events]);

    return (
        <DashboardLayout>
            <CalendarMain
                events={filteredEvents}
                currentDate={currentDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onDateChange={handleDateChange}
                onGoToToday={handleGoToToday}
                eventCategories={uniqueCategories}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
                onSeeAllEvents={() => setIsEventViewModalOpen(true)}
                onAddEvent={() => setIsAddEventModalOpen(true)}
            />
            
            <EventViewModal
                isOpen={isEventViewModalOpen}
                onClose={() => setIsEventViewModalOpen(false)}
                initialDate={currentDate}
                events={events}
                eventCategories={uniqueCategories}
                onEventAdded={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onArchiveEvent={handleArchiveEvent}
            />

            <AddEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
                onAddEvent={handleAddEvent}
                eventCategories={uniqueCategories}
                initialDate={currentDate}
            />

            <EventDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                event={selectedEvent}
                onArchiveEvent={handleArchiveEvent}
                onDeleteEvent={handleDeleteEvent}
            />
        </DashboardLayout>
    );
}