"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Check, Minus } from 'lucide-react';
import { generateCalendarDays, toISODateString } from '@/utils/getDates';

// --- Data ---
const currentUser = { id: 2, name: 'Ila Hart' };

const fullTeamMembers = [
    { id: 2, name: 'Ila Hart' },
    { id: 3, name: 'Noah Sinclair' },
    { id: 4, name: 'Owen Pierce' },
    { id: 5, name: 'Liam Thompson' },
    { id: 6, name: 'Mason King' },
    { id: 7, name: 'Logan Ward' },
    { id: 8, name: 'Ethan Brooks' }
];
const initialVisibleTeamCount = 4;

// NEW: Client data based on the image
const fullClients = [
    { id: 101, name: 'Scherule Inc.' },
    { id: 102, name: 'EcoWave Solutions' },
    { id: 103, name: 'Quantum Leap Technologies' },
    { id: 104, name: 'Skyward Ventures' },
    { id: 105, name: 'BrightFuture Labs' },
    { id: 106, name: 'Innovate LLC' },
    { id: 107, name: 'NextGen Systems' }
];
const initialVisibleClientCount = 5;


type SidebarCalendarProps = {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
};

export default function SidebarCalendar({ selectedDate, onDateSelect }: SidebarCalendarProps) {
    const [displayDate, setDisplayDate] = useState(selectedDate);

    // --- State for Team Listbox ---
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({ [currentUser.id]: true });
    const [visibleTeamCount, setVisibleTeamCount] = useState(initialVisibleTeamCount);
    const [teamSearchQuery, setTeamSearchQuery] = useState('');

    // --- State for Client Listbox ---
    const [isClientOpen, setIsClientOpen] = useState(false);
    const [checkedClients, setCheckedClients] = useState<{ [key: number]: boolean }>({});
    const [visibleClientCount, setVisibleClientCount] = useState(initialVisibleClientCount);
    const [clientSearchQuery, setClientSearchQuery] = useState('');

    // --- Logic for Team Checkboxes ---
    const checkedTeamCount = Object.values(checkedItems).filter(isChecked => isChecked).length;
    const isAllTeamsChecked = fullTeamMembers.length > 0 && checkedTeamCount === fullTeamMembers.length;
    const isTeamIndeterminate = checkedTeamCount > 0 && !isAllTeamsChecked;
    const filteredTeamMembers = fullTeamMembers.filter(member => member.name.toLowerCase().includes(teamSearchQuery.toLowerCase()));

    // --- Logic for Client Checkboxes ---
    const checkedClientCount = Object.values(checkedClients).filter(isChecked => isChecked).length;
    const isAllClientsChecked = fullClients.length > 0 && checkedClientCount === fullClients.length;
    const isClientsIndeterminate = checkedClientCount > 0 && !isAllClientsChecked;
    const filteredClients = fullClients.filter(client => client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()));

    // --- Handlers for Client Listbox ---
    const handleAllClientsChange = () => {
        const newCheckedState: { [key: number]: boolean } = {};
        if (!isAllClientsChecked) {
            fullClients.forEach(client => { newCheckedState[client.id] = true; });
        }
        setCheckedClients(newCheckedState);
    };
    const handleClientCheckboxChange = (clientId: number) => {
        setCheckedClients(prev => ({ ...prev, [clientId]: !prev[clientId] }));
    };
    const handleSeeMoreClients = () => setVisibleClientCount(filteredClients.length);
    const handleSeeLessClients = () => setVisibleClientCount(initialVisibleClientCount);
    
    // (Existing handlers for teams would be here)
    const handleAllTeamsChangeImpl = () => {
        const newCheckedState: { [key: number]: boolean } = {};
        if (!isAllTeamsChecked) {
            fullTeamMembers.forEach(member => { newCheckedState[member.id] = true; });
        }
        setCheckedItems(newCheckedState);
    };
    const handleTeamCheckboxChangeImpl = (memberId: number) => {
        setCheckedItems(prev => ({ ...prev, [memberId]: !prev[memberId] }));
    };
    const handleSeeMoreTeams = () => setVisibleTeamCount(filteredTeamMembers.length);
    const handleSeeLessTeams = () => setVisibleTeamCount(initialVisibleTeamCount);


    // --- useEffect Hooks ---
    useEffect(() => {
        setDisplayDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }, [selectedDate]);
    
    useEffect(() => {
        if (!isTeamOpen) {
            const timer = setTimeout(() => {
                setVisibleTeamCount(initialVisibleTeamCount);
                setTeamSearchQuery('');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isTeamOpen]);
    
    useEffect(() => {
        if (!isClientOpen) {
            const timer = setTimeout(() => {
                setVisibleClientCount(initialVisibleClientCount);
                setClientSearchQuery('');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isClientOpen]);


    // --- Render Logic ---
    const selectedDateString = toISODateString(selectedDate);
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const calendarDays = generateCalendarDays(displayDate).slice(0, 35); 
    const customGreen = "#697d67";
    const handlePrevMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));

    return (
        <div className="w-64 p-2">
            {/* Calendar Header and Grid (Omitted for brevity) */}
            <div className="flex items-center justify-between mb-4 bg-[#f3fee7] rounded-lg p-2">
                <button title="Previous month" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-[#e1f0cc]"><ChevronLeft size={20} style={{ color: customGreen }} /></button>
                <h3 className="font-semibold" style={{ color: customGreen }}>{displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button title="Next month" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-[#e1f0cc]"><ChevronRight size={20} style={{ color: customGreen }} /></button>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-gray-500 font-medium">{daysOfWeek.map(day => <div key={day}>{day}</div>)}{calendarDays.map((day, index) => { const isSelected = day.date === selectedDateString; return (<button key={index} onClick={() => onDateSelect(new Date(day.date.replace(/-/g, '/')))} style={{ backgroundColor: isSelected ? customGreen : undefined }} className={`w-7 h-7 flex items-center justify-center rounded-full relative mx-auto ${day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'} ${isSelected ? 'text-white' : ''} ${!isSelected && day.isCurrentMonth ? 'hover:bg-gray-100' : ''}`}>{day.dayOfMonth}</button>);})}</div>

            {/* List Boxes Section */}
            <div className="mt-6 space-y-3">
                {/* --- Bespire Team Listbox --- */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm transition-all duration-300">
                    <button onClick={() => setIsTeamOpen(!isTeamOpen)} className="w-full flex items-center justify-between p-3">
                        <span className="font-medium text-sm text-gray-700 pl-2">Bespire Team</span>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isTeamOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isTeamOpen && (
                        <div className="px-3 pb-3">
                             <div className="relative mb-3">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Search size={20} className="text-gray-400" /></div>
                                <input type="text" placeholder="Search a team" value={teamSearchQuery} onChange={(e) => setTeamSearchQuery(e.target.value)} className="w-full pl-4 pr-10 py-2 text-sm text-gray-700 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-gray-300 focus:outline-none placeholder-gray-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" checked={isAllTeamsChecked} onChange={handleAllTeamsChangeImpl} className="hidden" />
                                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${(isAllTeamsChecked || isTeamIndeterminate) ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                        {isAllTeamsChecked && <Check size={14} className="text-white" />}
                                        {isTeamIndeterminate && <Minus size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-gray-800 font-light">All</span>
                                </label>
                                {filteredTeamMembers.slice(0, visibleTeamCount).map(member => (
                                    <label key={member.id} className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" checked={!!checkedItems[member.id]} onChange={() => handleTeamCheckboxChangeImpl(member.id)} className="hidden" />
                                        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${checkedItems[member.id] ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                            {checkedItems[member.id] && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-800">{member.name}</span>
                                        {member.id === currentUser.id && (<span className="text-sm text-gray-500">(You)</span>)}
                                    </label>
                                ))}
                            </div>
                            {filteredTeamMembers.length > initialVisibleTeamCount && ( visibleTeamCount < filteredTeamMembers.length ? (<button onClick={handleSeeMoreTeams} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">+</span> See more</button>) : (<button onClick={handleSeeLessTeams} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">−</span> See less</button>))}
                        </div>
                    )}
                </div>

                {/* --- Bespire Client Listbox --- */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm transition-all duration-300">
                    <button onClick={() => setIsClientOpen(!isClientOpen)} className="w-full flex items-center justify-between p-3">
                        <span className="font-medium text-sm text-gray-700 pl-2">Bespire Client</span>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isClientOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isClientOpen && (
                        <div className="px-3 pb-3">
                            <div className="relative mb-3">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Search size={20} className="text-gray-400" /></div>
                                <input type="text" placeholder="Search a client" value={clientSearchQuery} onChange={(e) => setClientSearchQuery(e.target.value)} className="w-full pl-4 pr-10 py-2 text-sm text-gray-700 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-gray-300 focus:outline-none placeholder-gray-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" checked={isAllClientsChecked} onChange={handleAllClientsChange} className="hidden" />
                                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${(isAllClientsChecked || isClientsIndeterminate) ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                        {isAllClientsChecked && <Check size={14} className="text-white" />}
                                        {isClientsIndeterminate && <Minus size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-gray-800 font-light">All</span>
                                </label>
                                {filteredClients.slice(0, visibleClientCount).map(client => (
                                    <label key={client.id} className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" checked={!!checkedClients[client.id]} onChange={() => handleClientCheckboxChange(client.id)} className="hidden" />
                                        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${checkedClients[client.id] ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                            {checkedClients[client.id] && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-800">{client.name}</span>
                                    </label>
                                ))}
                            </div>
                            {filteredClients.length > initialVisibleClientCount && (visibleClientCount < filteredClients.length ? (<button onClick={handleSeeMoreClients} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">+</span> See more</button>) : (<button onClick={handleSeeLessClients} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">−</span> See less</button>))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};