
'use client';

import React from 'react';

export interface FilterConfig {
    search: string;
    minPE: string;
    maxPE: string;
    minPrice: string;
    maxPrice: string;
    minCap: string;
    minVolume: string;
    minChange: string;
    maxChange: string;
    minEPS: string;
    minROE: string;
    maxDebtToEquity: string;
}

interface FilterPanelProps {
    filters: FilterConfig;
    onFilterChange: (newFilters: FilterConfig) => void;
}

interface InputFieldProps {
    label: string;
    name: keyof FilterConfig;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: 'text' | 'number';
}

const InputField = ({ label, name, value, onChange, placeholder = '', type = 'number' }: InputFieldProps) => (
    <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-slate-900/50 text-gray-900 dark:text-white rounded border border-gray-200 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
    </div>
);

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <InputField
                label="Explore Market"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Adjust values..."
                type="text"
            />

            <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">These controls <span className="font-semibold text-gray-600 dark:text-gray-400">do not update</span> your alerts.</p>

            <div className="grid grid-cols-2 gap-3">
                <InputField label="Min P/E" name="minPE" value={filters.minPE} onChange={handleChange} placeholder="-∞" />
                <InputField label="Max P/E" name="maxPE" value={filters.maxPE} onChange={handleChange} placeholder="∞" />

                <InputField label="Min Price (₹)" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="0" />
                <InputField label="Max Price (₹)" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="∞" />

                <InputField label="Min M-Cap (Cr)" name="minCap" value={filters.minCap} onChange={handleChange} placeholder="Raw" />
                <InputField label="Min Volume" name="minVolume" value={filters.minVolume} onChange={handleChange} placeholder="0" />

                <InputField label="Min EPS" name="minEPS" value={filters.minEPS} onChange={handleChange} placeholder="-∞" />
                <InputField label="Max Debt/Eq" name="maxDebtToEquity" value={filters.maxDebtToEquity} onChange={handleChange} placeholder="∞" />

                <InputField label="Min ROE" name="minROE" value={filters.minROE} onChange={handleChange} placeholder="0" />
                <div>{/* Spacer */}</div>

                <InputField label="Min Change %" name="minChange" value={filters.minChange} onChange={handleChange} placeholder="-∞" />
                <InputField label="Max Change %" name="maxChange" value={filters.maxChange} onChange={handleChange} placeholder="∞" />
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-700 mt-2 italic">
                &lt;30 Oversold, &gt;70 Overbought
            </p>
        </div>
    );
}
