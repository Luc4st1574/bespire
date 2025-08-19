"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { X, Calendar, CalendarClock, CheckIcon, ChevronDown, Plus } from 'lucide-react';
import Image from 'next/image';
import { EventCategory } from '@/app/calendar/page';
import { Event } from '@/components/calendar/CalendarMain';
import { toISODateString } from '@/utils/getDates';
import CheckSquare from '@/assets/icons/add_task.svg';
import Users from '@/assets/icons/meeting_add.svg';
import InvitePeoplePopover, { Person } from '@/components/ui/InvitePeoplePopover';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEvent: (newEvent: Omit<Event, 'id'>) => void;
    eventCategories: EventCategory[];
    initialDate: Date;
}

export default function AddEventModal({ isOpen, onClose, onAddEvent, eventCategories, initialDate }: AddEventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('11:00');
    const [isAllDay, setIsAllDay] = useState(false);
    const [description, setDescription] = useState('');
    const [activeType, setActiveType] = useState('');
    const [error, setError] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [notifyOption, setNotifyOption] = useState('1 hour before');
    const [visibilityOption, setVisibilityOption] = useState('Only Invited');
    const [invitedPeople, setInvitedPeople] = useState<Person[]>([]);
    const dateInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setDate(''); 
            setTitle('');
            setStartTime('10:00');
            setEndTime('11:00');
            setActiveType('');
            setDescription('');
            setIsAllDay(false);
            setIsRecurring(false);
            setError('');
            setNotifyOption('1 hour before');
            setVisibilityOption('Only Invited');
            setInvitedPeople([]);
        }
    }, [isOpen, initialDate]);

    const handleDoneInviting = (people: Person[]) => {
        setInvitedPeople(people);
    };

    // 1. Added function to handle removing an invited person
    const handleRemovePerson = (personToRemove: Person) => {
        setInvitedPeople(prev => prev.filter(p => p.id !== personToRemove.id));
    };

    useEffect(() => {
        if (isAllDay) {
            setStartTime('09:00');
            setEndTime('17:00');
        }
    }, [isAllDay]);

    const otherCategories = eventCategories.filter(
        cat => cat.type !== 'Tasks' && cat.type !== 'Meetings' && cat.type !== 'Time Off'
    );

    const otherCategoryOptions = otherCategories.map(category => ({
        value: category.type,
        label: category.type,
    }));

    const notifyOptions = [
        { value: '5 mins before', label: '5 mins before' },
        { value: '15 mins before', label: '15 mins before' },
        { value: '30 minutes before', label: '30 minutes before' },
        { value: '1 hour before', label: '1 hour before' },
        { value: '1 day before', label: '1 day before' },
    ];

    const visibilityOptions = [
        { value: 'Only Invited', label: 'Only Invited' },
        { value: 'Public', label: 'Public' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        if (!date) {
            setError('Please select a date.');
            return;
        }

        if (!activeType) {
            setError('Please select an event type.');
            return;
        }
        const selectedCategory = eventCategories.find(cat => cat.type === activeType);
        if (!selectedCategory) {
            setError(`Category "${activeType}" is not configured.`);
            return;
        }

        const baseEvent = {
            title,
            startTime: isAllDay ? undefined : startTime,
            endTime: isAllDay ? undefined : endTime,
            type: activeType,
            bgColor: selectedCategory.bgColor,
            rectColor: selectedCategory.rectColor,
        };

        if (isRecurring) {
            const selectedDate = new Date(date + 'T00:00:00');
            const dayOfWeek = selectedDate.getDay();
            const monday = new Date(selectedDate);
            const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            monday.setDate(selectedDate.getDate() + offset);

            for (let i = 0; i < 5; i++) {
                const eventDate = new Date(monday);
                eventDate.setDate(monday.getDate() + i);
                onAddEvent({
                    ...baseEvent,
                    date: toISODateString(eventDate),
                });
            }
        } else {
            onAddEvent({
                ...baseEvent,
                date: date,
            });
        }
        onClose();
    };

    const selectedOptionForButton = otherCategoryOptions.find(opt => opt.value === activeType);
    const buttonText = selectedOptionForButton?.label ?? "Select Category";

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-end p-2 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-x-full" enterTo="opacity-100 translate-x-0" leave="ease-in duration-200" leaveFrom="opacity-100 translate-x-0" leaveTo="opacity-0 translate-x-full">
                            <Dialog.Panel className="relative w-full max-w-lg max-h-[calc(100vh-1rem)] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#697d67]" aria-label="Close add event modal">
                                    <X size={32} />
                                </button>

                                <div className="flex-shrink-0 mt-4">
                                    <Dialog.Title as="h3" className="text-xl font-light leading-6 text-gray-900">
                                        Add Event
                                    </Dialog.Title>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="mt-4 flex-1 overflow-y-auto pr-2 space-y-9">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2 mt-3">Frequently Requested</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button type="button" onClick={() => setActiveType('Tasks')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Tasks' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                                                <CheckSquare title="Task Icon" size={24} className="text-[#697d67]" />
                                                <span>Task</span>
                                            </button>
                                            <button type="button" onClick={() => setActiveType('Meetings')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Meetings' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                                                <Users title="Meeting Icon" size={24} className="text-[#697d67]" />
                                                <span>Meeting</span>
                                            </button>
                                            <button type="button" onClick={() => setActiveType('Time Off')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Time Off' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                                                <CalendarClock size={24} className="text-[#697d67]" />
                                                <span>Time Off</span>
                                            </button>
                                        </div>
                                        <label className="block text-sm font-medium text-black mb-2 mt-5">Or choose from the list</label>
                                        {otherCategoryOptions.length > 0 && (
                                            <div className="mt-2">
                                                <Listbox value={activeType} onChange={setActiveType}>
                                                    <div className="relative">
                                                        <Listbox.Button className="relative h-[50px] w-full cursor-default rounded-md border border-gray-200 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none sm:text-sm">
                                                            <span className="block truncate">{buttonText}</span>
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200`} aria-hidden="true"/></span>
                                                        </Listbox.Button>
                                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 left-0 right-0 overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm border border-gray-300">
                                                                {otherCategoryOptions.map((option) => (
                                                                    <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                                                        {({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="h-5 w-5" aria-hidden="true" /></span> : null}</>)}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </div>
                                                </Listbox>
                                            </div>
                                        )}
                                        <div className="mt-4 border-t border-gray-200" />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full h-[50px] rounded-md border-gray-400 shadow-sm px-3 py-2 placeholder:text-gray-400 sm:text-sm focus:ring-0 focus:outline-none focus:border-[#697d67]" placeholder="Enter Event Title" />
                                    </div>

                                    {error && <p className="text-sm text-red-600 -my-2">{error}</p>}
                                    
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <label htmlFor="date-button" className="block text-sm font-medium text-gray-700">Date</label>
                                                <div className="flex items-center">
                                                    <input 
                                                        id="recurring" 
                                                        type="checkbox" 
                                                        checked={isRecurring} 
                                                        onChange={(e) => setIsRecurring(e.target.checked)} 
                                                        className="h-4 w-4 rounded border-gray-400 text-[#697d67] focus:ring-[#697d67] accent-[#697d67]" 
                                                    />
                                                    <label htmlFor="recurring" className="ml-2 block text-sm text-gray-600">Recurring</label>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <div
                                                    id="date-button"
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => dateInputRef.current?.showPicker()}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dateInputRef.current?.showPicker(); }}
                                                    className="block w-full h-[50px] rounded-lg border border-gray-200 shadow-sm pl-4 pr-4 text-left focus:outline-none flex items-center justify-between cursor-pointer"
                                                >
                                                    <span className={date ? "text-gray-900" : "text-gray-500"}>
                                                        {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'UTC' }) : "Select Date"}
                                                    </span>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {date && (
                                                            <span
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDate('');
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.stopPropagation();
                                                                        setDate('');
                                                                    }
                                                                }}
                                                                aria-label="Clear date"
                                                                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 cursor-pointer focus:outline-none"
                                                            >
                                                                <X size={16} />
                                                            </span>
                                                        )}
                                                        <Calendar className="h-5 w-5 text-[#697d67]" aria-hidden="true" />
                                                    </div>
                                                </div>
                                                <input
                                                    ref={dateInputRef}
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="opacity-0 absolute top-0 left-0 w-1 h-1"
                                                    aria-hidden="true"
                                                    tabIndex={-1}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Time</label>
                                                <div className="flex items-center">
                                                    <input 
                                                        id="all-day" 
                                                        type="checkbox" 
                                                        checked={isAllDay} 
                                                        onChange={(e) => setIsAllDay(e.target.checked)} 
                                                        className="h-4 w-4 rounded border-gray-400 text-[#697d67] focus:ring-[#697d67] accent-[#697d67]" 
                                                    />
                                                    <label htmlFor="all-day" className="ml-2 block text-sm text-gray-600">All Day</label>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="time" 
                                                    id="startTime" 
                                                    title="Start time" 
                                                    value={startTime} 
                                                    onChange={(e) => setStartTime(e.target.value)} 
                                                    disabled={isAllDay} 
                                                    className="flex items-center justify-center w-full h-[50px] rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-0 text-center text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" 
                                                />
                                                <span className="text-gray-500">–</span>
                                                <input 
                                                    type="time" 
                                                    id="endTime" 
                                                    title="End time" 
                                                    value={endTime} 
                                                    onChange={(e) => setEndTime(e.target.value)} 
                                                    disabled={isAllDay} 
                                                    className="flex items-center justify-center w-full h-[50px] rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-0 text-center text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notify</label>
                                            <Listbox value={notifyOption} onChange={setNotifyOption}>
                                                <div className="relative">
                                                    <Listbox.Button className="relative h-[50px] w-full cursor-default rounded-md border border-gray-200 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none sm:text-sm">
                                                        <span className="block truncate">{notifyOption}</span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm border border-gray-300">
                                                            {notifyOptions.map((option) => (
                                                                <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                                {option.label}
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]">
                                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                                            <Listbox value={visibilityOption} onChange={setVisibilityOption}>
                                                <div className="relative">
                                                    <Listbox.Button className="relative h-[50px] w-full cursor-default rounded-md border border-gray-200 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none sm:text-sm">
                                                        <span className="block truncate">{visibilityOption}</span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm border border-gray-300">
                                                            {visibilityOptions.map((option) => (
                                                                <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                                {option.label}
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]">
                                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea 
                                            id="description" 
                                            value={description} 
                                            onChange={(e) => setDescription(e.target.value)} 
                                            rows={5} 
                                            className="mt-2 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-none sm:text-sm" 
                                            placeholder="Enter Description">
                                        </textarea>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Invite People</span>
                                            <InvitePeoplePopover 
                                                onDone={handleDoneInviting}
                                                invitedPeople={invitedPeople}
                                            >
                                                <button type="button" className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50">
                                                    <Plus size={16} />
                                                    <span>Add</span>
                                                </button>
                                            </InvitePeoplePopover>
                                        </div>
                                        
                                        {/* 2. Updated the display for invited people */}
                                        {invitedPeople.length > 0 && (
                                            <div className="pt-2 max-h-40 overflow-y-auto">
                                                <ul className="space-y-2">
                                                    {invitedPeople.map(person => (
                                                        <li key={person.id} className="flex items-center justify-between py-1 pr-1">
                                                            <div className="flex items-center gap-3">
                                                                <Image src={person.avatar} alt={person.name} width={32} height={32} className="h-8 w-8 rounded-full" />
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-900">{person.name}</span>
                                                                    <p className="text-xs text-gray-500">{person.role}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                title={`Remove ${person.name}`}
                                                                onClick={() => handleRemovePerson(person)}
                                                                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-0"
                                                            >
                                                                <X size={30} />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Links</span>
                                            <button
                                                type="button"
                                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                <Plus size={16} />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Files</span>
                                            <button
                                                type="button"
                                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                <Plus size={16} />
                                                <span>Add</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex w-full gap-4 flex-shrink-0 pt-4">
                                        <button 
                                            type="button" 
                                            onClick={onClose} 
                                            className="flex w-full justify-center px-10 py-3 text-sm font-medium text-[#697D67] bg-white border border-[#697D67] rounded-full hover:bg-gray-50 focus:outline-none transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="flex w-full justify-center px-12 py-3 text-sm font-medium text-white bg-[#697d67] rounded-full hover:bg-[#556654] focus:outline-none transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}