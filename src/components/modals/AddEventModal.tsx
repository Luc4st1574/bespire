"use client";

import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition, Listbox, Menu } from '@headlessui/react';
import { useForm, FormProvider } from "react-hook-form";
import { X, Calendar, CalendarClock, CheckIcon, ChevronDown, Plus, Download, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { EventCategory } from '@/app/calendar/page';
import { Event } from '@/components/calendar/CalendarMain';
import { toISODateString } from '@/utils/getDates';
import { getFileIcon } from "@/utils/getFileIcon"; // Assuming you have this utility from your project
import CheckSquare from '@/assets/icons/add_task.svg';
import Users from '@/assets/icons/meeting_add.svg';
import InvitePeoplePopover, { Person } from '@/components/ui/InvitePeoplePopover';
import { LinkInputList } from '../form/LinkInputList';
import Cloud from '@/assets/icons/cloud_check.svg';

// Interface for files being uploaded
export interface UploadingFile {
    file: File;
    progress?: number;
    done?: boolean;
    error?: boolean;
    uploadDate?: string;
}

// Updated Event type to include files
interface EventWithFiles extends Omit<Event, 'id'> {
    files: File[];
}

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEvent: (newEvent: EventWithFiles) => void;
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
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    
    const dateInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const methods = useForm();

    useEffect(() => {
        if (isOpen) {
            // Reset all state when modal opens
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
            setUploadingFiles([]); // Reset files
            methods.reset();
        }
    }, [isOpen, initialDate, methods]);

    const handleDoneInviting = (people: Person[]) => {
        setInvitedPeople(people);
    };

    const handleRemovePerson = (personToRemove: Person) => {
        setInvitedPeople(prev => prev.filter(p => p.id !== personToRemove.id));
    };

    useEffect(() => {
        if (isAllDay) {
            setStartTime('09:00');
            setEndTime('17:00');
        }
    }, [isAllDay]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newUploadingFiles: UploadingFile[] = files.map(file => ({
            file,
            progress: 0,
            done: false,
            error: false,
        }));

        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

        // Simulate upload progress for each new file
        newUploadingFiles.forEach((_, index) => {
            const overallIndex = uploadingFiles.length + index;
            const interval = setInterval(() => {
                setUploadingFiles(prev =>
                    prev.map((f, i) => {
                        if (i === overallIndex && !f.done) {
                            const newProgress = (f.progress || 0) + 10;
                            if (newProgress >= 100) {
                                clearInterval(interval);
                                // When done, add the uploadDate
                                return { 
                                    ...f, 
                                    progress: 100, 
                                    done: true, 
                                    uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                };
                            }
                            return { ...f, progress: newProgress };
                        }
                        return f;
                    })
                );
            }, 200);
        });
        
        if(event.target) {
            event.target.value = '';
        }
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        setUploadingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteFile = (fileToDelete: UploadingFile) => {
        // This function removes the file from the state
        setUploadingFiles(prev => prev.filter(f => f.file.name !== fileToDelete.file.name));
    };

    const handleShareFile = (fileToShare: UploadingFile) => {
        // Placeholder for your share logic (e.g., navigator.share or copy link)
        alert(`Sharing ${fileToShare.file.name}`);
    };


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

    interface AddEventFormData {
        links?: string[];
    }

    const onSubmit = (data: AddEventFormData) => {
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

        // Ensure you only pass successfully uploaded files
        const completedFiles = uploadingFiles.filter(f => f.done).map(f => f.file);

        const baseEvent = {
            title,
            startTime: isAllDay ? undefined : startTime,
            endTime: isAllDay ? undefined : endTime,
            type: activeType,
            bgColor: selectedCategory.bgColor,
            rectColor: selectedCategory.rectColor,
            links: data.links || [],
            files: completedFiles, // Include completed files
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
                    <div className="flex items-center justify-end min-h-full p-2 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-x-full" enterTo="opacity-100 translate-x-0" leave="ease-in duration-200" leaveFrom="opacity-100 translate-x-0" leaveTo="opacity-0 translate-x-full">
                            <Dialog.Panel className="relative flex flex-col w-full max-w-lg max-h-[calc(100vh-1rem)] p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 transition-colors rounded-full hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#697d67]" aria-label="Close add event modal">
                                    <X size={32} />
                                </button>

                                <div className="flex-shrink-0 mt-4">
                                    <Dialog.Title as="h3" className="text-xl font-light leading-6 text-gray-900">
                                        Add Event
                                    </Dialog.Title>
                                </div>

                                <FormProvider {...methods}>
                                    <form onSubmit={methods.handleSubmit(onSubmit)} className="flex-1 mt-4 pr-2 overflow-y-auto space-y-9">
                                        {/* --- Event Type Selection --- */}
                                        <div>
                                            <label className="block mb-2 mt-3 text-sm font-medium text-black">Frequently Requested</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button type="button" title="Select Task" onClick={() => setActiveType('Tasks')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Tasks' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                                                    <CheckSquare title="Task Icon" size={24} className="text-[#697d67]" />
                                                    <span>Task</span>
                                                </button>
                                                <button type="button" title="Select Meeting" onClick={() => setActiveType('Meetings')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Meetings' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                                                    <Users title="Meeting Icon" size={24} className="text-[#697d67]" />
                                                    <span>Meeting</span>
                                                </button>
                                                <button type="button" title="Select Time Off" onClick={() => setActiveType('Time Off')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Time Off' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                                                    <CalendarClock size={24} className="text-[#697d67]" />
                                                    <span>Time Off</span>
                                                </button>
                                            </div>
                                            <label className="block mt-5 mb-2 text-sm font-medium text-black">Or choose from the list</label>
                                            {otherCategoryOptions.length > 0 && (
                                                <div className="mt-2">
                                                    <Listbox value={activeType} onChange={setActiveType}>
                                                        <div className="relative">
                                                            <Listbox.Button className="relative w-full h-[50px] py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:outline-none sm:text-sm">
                                                                <span className="block truncate">{buttonText}</span>
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200`} aria-hidden="true" /></span>
                                                            </Listbox.Button>
                                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                                <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                                                    {otherCategoryOptions.map((option) => (
                                                                        <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                                                            {({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true" /></span> : null}</>)}
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

                                        {/* --- Event Title --- */}
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                                            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full mt-1 h-[50px] px-3 py-2 placeholder-gray-400 border-gray-400 rounded-md shadow-sm sm:text-sm focus:ring-0 focus:outline-none focus:border-[#697d67]" placeholder="Enter Event Title" />
                                        </div>

                                        {error && <p className="text-sm text-red-600 -my-2">{error}</p>}
                                        
                                        {/* --- Date and Time --- */}
                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <label htmlFor="date-button" className="block text-sm font-medium text-gray-700">Date</label>
                                                    <div className="flex items-center">
                                                        <input id="recurring" type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 text-[#697d67] border-gray-400 rounded accent-[#697d67] focus:ring-[#697d67]" />
                                                        <label htmlFor="recurring" className="block ml-2 text-sm text-gray-600">Recurring</label>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <div id="date-button" role="button" tabIndex={0} onClick={() => dateInputRef.current?.showPicker()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dateInputRef.current?.showPicker(); }} className="flex items-center justify-between w-full h-[50px] pl-4 pr-4 text-left border border-gray-200 rounded-lg shadow-sm cursor-pointer focus:outline-none">
                                                        <span className={date ? "text-gray-900" : "text-gray-500"}>{date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'UTC' }) : "Select Date"}</span>
                                                        <div className="flex items-center gap-2">
                                                            {date && (<span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setDate(''); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setDate(''); } }} aria-label="Clear date" className="p-1 text-gray-400 rounded-full cursor-pointer hover:bg-gray-200 hover:text-gray-600 focus:outline-none"><X size={16} /></span>)}
                                                            <Calendar className="h-5 w-5 text-[#697d67]" aria-hidden="true" />
                                                        </div>
                                                    </div>
                                                    <input ref={dateInputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute top-0 left-0 w-1 h-1 opacity-0" aria-hidden="true" tabIndex={-1} />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Time</label>
                                                    <div className="flex items-center">
                                                        <input id="all-day" type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="w-4 h-4 text-[#697d67] border-gray-400 rounded accent-[#697d67] focus:ring-[#697d67]" />
                                                        <label htmlFor="all-day" className="block ml-2 text-sm text-gray-600">All Day</label>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input type="time" id="startTime" title="Start time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isAllDay} className="flex items-center justify-center w-full h-[50px] text-center border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-0 text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" />
                                                    <span className="text-gray-500">–</span>
                                                    <input type="time" id="endTime" title="End time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isAllDay} className="flex items-center justify-center w-full h-[50px] text-center border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-0 text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* --- NOTIFY AND VISIBILITY SECTION --- */}
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Notify</label>
                                                <Listbox value={notifyOption} onChange={setNotifyOption}>
                                                    <div className="relative">
                                                        <Listbox.Button className="relative w-full h-[50px] py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:outline-none sm:text-sm">
                                                            <span className="block truncate">{notifyOption}</span>
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                                <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                            <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                                                {notifyOptions.map((option) => (
                                                                    <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                                                        {({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true"/></span>) : null}</>)}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </div>
                                                </Listbox>
                                            </div>

                                            <div className="flex-1">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">Visibility</label>
                                                <Listbox value={visibilityOption} onChange={setVisibilityOption}>
                                                    <div className="relative">
                                                        <Listbox.Button className="relative w-full h-[50px] py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:outline-none sm:text-sm">
                                                            <span className="block truncate">{visibilityOption}</span>
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                                <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                                            </span>
                                                        </Listbox.Button>
                                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                            <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                                                {visibilityOptions.map((option) => (
                                                                    <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                                                        {({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true"/></span>) : null}</>)}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Transition>
                                                    </div>
                                                </Listbox>
                                            </div>
                                        </div>
                                        
                                        {/* --- Description --- */}
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-2 border-gray-200 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-none" placeholder="Enter Description"></textarea>
                                        </div>
                                        
                                        {/* --- Attachments and Invites --- */}
                                        <div className="space-y-4">
                                            {/* Invite People */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Invite People</span>
                                                <InvitePeoplePopover onDone={handleDoneInviting} invitedPeople={invitedPeople}>
                                                    <button type="button" title="Add People" className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50">
                                                        <span>Add</span>
                                                        <Plus size={16} />
                                                    </button>
                                                </InvitePeoplePopover>
                                            </div>
                                            {invitedPeople.length > 0 && (
                                                <div className="pt-2 overflow-y-auto max-h-40">
                                                    <ul className="space-y-2">
                                                        {invitedPeople.map(person => (
                                                            <li key={person.id} className="flex items-center justify-between py-1 pr-1">
                                                                <div className="flex items-center gap-3">
                                                                    <Image src={person.avatar} alt={person.name} width={32} height={32} className="w-8 h-8 rounded-full" />
                                                                    <div>
                                                                        <span className="text-sm font-medium text-gray-900">{person.name}</span>
                                                                        <p className="text-xs text-gray-500">{person.role}</p>
                                                                    </div>
                                                                </div>
                                                                <button type="button" title={`Remove ${person.name}`} onClick={() => handleRemovePerson(person)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-0">
                                                                    <X size={24} />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {/* Links */}
                                            <LinkInputList />

                                            {/* --- Files Upload Section --- */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Files</span>
                                                    <button type="button" onClick={triggerFileSelect} title="Add Files" className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                                                        <span>Add</span>
                                                        <Plus size={16} />
                                                    </button>
                                                    <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" aria-hidden="true" />
                                                </div>

                                                {(() => {
                                                    const inProgressFiles = uploadingFiles.filter(f => !f.done);
                                                    const completedFiles = uploadingFiles.filter(f => f.done);

                                                    return (
                                                        <>
                                                            {/* COMPLETED LIST (Moved to appear first) */}
                                                            {completedFiles.length > 0 && (
                                                                <div className="pt-2">
                                                                    <div className="space-y-2">
                                                                        {completedFiles.map((item, index) => (
                                                                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                                                <div className="flex items-center gap-3">
                                                                                    <Image src={getFileIcon(item.file.name)} alt={`${item.file.name} file icon`} width={20} height={20} className="w-5 h-5" />
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-gray-800">{item.file.name}</p>
                                                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                                                            <Cloud size={14} className="text-[#5e6b66]" />
                                                                                            <p className="text-xs text-gray-500">{item.uploadDate}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-3">
                                                                                    <button type="button" aria-label={`Download ${item.file.name}`} title={`Download ${item.file.name}`} className="text-[#5e6b66] hover:text-green-800">
                                                                                        <Download size={18} />
                                                                                    </button>
                                                                                    
                                                                                    {/* --- DROPDOWN MENU START --- */}
                                                                                    <Menu as="div" className="relative inline-block text-left">
                                                                                        <Menu.Button className="p-1 text-[#5e6b66] hover:text-green-800 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                                                                                            <MoreHorizontal size={18} aria-hidden="true" />
                                                                                        </Menu.Button>
                                                                                        <Transition
                                                                                            as={Fragment}
                                                                                            enter="transition ease-out duration-100"
                                                                                            enterFrom="transform opacity-0 scale-95"
                                                                                            enterTo="transform opacity-100 scale-100"
                                                                                            leave="transition ease-in duration-75"
                                                                                            leaveFrom="transform opacity-100 scale-100"
                                                                                            leaveTo="transform opacity-0 scale-95"
                                                                                        >
                                                                                            <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                                                                                                <div className="px-1 py-1">
                                                                                                    <Menu.Item>
                                                                                                        {({ active }) => (
                                                                                                            <button onClick={() => handleShareFile(item)} className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}>
                                                                                                                <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                                                                                Share
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </Menu.Item>
                                                                                                </div>
                                                                                                <div className="px-1 py-1">
                                                                                                    <Menu.Item>
                                                                                                        {({ active }) => (
                                                                                                            <button onClick={() => handleDeleteFile(item)} className={`${active ? 'bg-red-500 text-white' : 'text-red-600'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                                                                                                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                                                                                Delete
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </Menu.Item>
                                                                                                </div>
                                                                                            </Menu.Items>
                                                                                        </Transition>
                                                                                    </Menu>
                                                                                    {/* --- DROPDOWN MENU END --- */}

                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* IN-PROGRESS LIST (Moved to appear second) */}
                                                            {inProgressFiles.length > 0 && (
                                                                <ul className="space-y-4 max-h-[160px] overflow-auto pr-2">
                                                                    {inProgressFiles.map((f, idx) => (
                                                                        <li key={`${f.file.name}-${idx}`} className="flex items-center gap-3">
                                                                            <Image src={getFileIcon(f.file.name)} width={40} height={40} className="w-10 h-10 flex-shrink-0" alt="file icon" />
                                                                            <div className="flex-1 overflow-hidden">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-sm font-medium text-gray-800 truncate block pr-2" title={f.file.name}>{f.file.name}</span>
                                                                                    <span className="text-xs text-gray-500">{f.progress || 0}%</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                                                                                        <FontAwesomeIcon icon={faSpinner} className="fa-spin w-4 h-4 text-gray-400" />
                                                                                    </div>
                                                                                    <div className="h-2 flex-1 rounded bg-gray-200 overflow-hidden">
                                                                                        <div className="h-2 rounded bg-[#869d84] transition-all" style={{ width: `${f.progress || 0}%` }} />
                                                                                    </div>
                                                                                    <button type="button" onClick={() => handleRemoveFile(uploadingFiles.indexOf(f))} className="text-gray-400 hover:text-red-600 flex-shrink-0 ml-1" title="Cancel upload">
                                                                                        <X size={16} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        {/* --- Action Buttons --- */}
                                        <div className="flex w-full gap-4 pt-4 flex-shrink-0">
                                            <button type="button" onClick={onClose} className="flex justify-center w-full px-10 py-3 text-sm font-medium text-[#697D67] bg-white border border-[#697D67] rounded-full hover:bg-gray-50 focus:outline-none transition-colors">
                                                Cancel
                                            </button>
                                            <button type="submit" className="flex justify-center w-full px-12 py-3 text-sm font-medium text-white bg-[#697d67] rounded-full hover:bg-[#556654] focus:outline-none transition-colors">
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </FormProvider>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}