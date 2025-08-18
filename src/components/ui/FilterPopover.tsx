"use client";

import { Popover } from '@headlessui/react';
import { Check } from 'lucide-react';
import { EventCategory } from '@/app/calendar/page';
import { ReactNode } from 'react';

// Helper function to extract the hex color from a Tailwind class string
const extractHexFromTailwind = (className: string): string => {
    const match = className.match(/\[(.*?)\]/);
    return match ? match[1] : '#888'; // Return a default color if not found
};

interface FilterPopoverProps {
    children: ReactNode;
    eventCategories: EventCategory[];
    activeFilters: string[];
    onFilterToggle: (category: string) => void;
}

export default function FilterPopover({
    children,
    eventCategories,
    activeFilters,
    onFilterToggle,
}: FilterPopoverProps) {
    const allCategory: EventCategory = { type: 'All', bgColor: 'bg-gray-100', rectColor: 'bg-[#697d67]' };
    const categoriesWithAll = [allCategory, ...eventCategories];

    return (
        <Popover className="relative">
            <Popover.Button as="div" className="focus:outline-none">
                {children}
            </Popover.Button>

            <Popover.Panel className="absolute z-10 mt-2 w-64 transform px-4 sm:px-0">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                    <div className="relative bg-white p-4 grid gap-3">
                        {categoriesWithAll.map((category) => {
                            const isChecked = category.type === 'All' 
                                ? activeFilters.length === eventCategories.length 
                                : activeFilters.includes(category.type);

                            // --- CHANGE 1: Logic for Dynamic Checkbox Color ---
                            const checkedColor = extractHexFromTailwind(category.rectColor);
                            const checkboxStyle = isChecked ? {
                                backgroundColor: checkedColor,
                                borderColor: checkedColor,
                            } : {};

                            return (
                                <label key={category.type} htmlFor={category.type} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id={category.type}
                                        checked={isChecked}
                                        onChange={() => onFilterToggle(category.type)}
                                        className="sr-only"
                                    />
                                    <div
                                        // The style attribute now controls the checked colors
                                        style={checkboxStyle}
                                        // We removed the data-[] color classes and use a base border color
                                        className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 transition-colors"
                                    >
                                        <Check
                                            data-state={isChecked ? 'checked' : 'unchecked'}
                                            className="w-3.5 h-3.5 text-white hidden data-[state=checked]:block"
                                            strokeWidth={3}
                                        />
                                    </div>
                                    
                                    <div className="ml-3 flex-1 flex items-center text-sm font-medium text-gray-800">
                                        {category.type === 'All' ? (
                                            <span>All</span>
                                        ) : (
                                            // --- CHANGE 2: Expanded Badge Width ---
                                            // Added 'flex-1' to make the badge container expand
                                            <div
                                                className="flex flex-1 items-center px-2 py-0.5 rounded"
                                                style={{ backgroundColor: extractHexFromTailwind(category.bgColor) }}
                                            >
                                                <span
                                                    className="w-1 h-3 mr-2"
                                                    style={{ backgroundColor: extractHexFromTailwind(category.rectColor) }}
                                                ></span>
                                                {category.type}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </Popover.Panel>
        </Popover>
    );
}