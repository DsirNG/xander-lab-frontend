import React, { useState } from 'react';
import CustomSelect from './index';

export const BasicDemo = () => {
    const [value, setValue] = useState('');

    const options = [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'angular', label: 'Angular' },
        { value: 'svelte', label: 'Svelte' }
    ];

    return (
        <div className="w-64">
            <CustomSelect
                value={value}
                onChange={setValue}
                options={options}
                placeholder="Select a framework"
            />
            <div className="mt-4 text-sm text-slate-500">
                Selected: <span className="font-bold text-slate-900 dark:text-white">{value || 'None'}</span>
            </div>
        </div>
    );
};

export const AlignmentDemo = () => {
    const [align, setAlign] = useState('left');

    const options = [
        { value: 'left', label: 'Left Align' },
        { value: 'center', label: 'Center Align' },
        { value: 'right', label: 'Right Align' }
    ];

    return (
        <div className="space-y-4 w-64">
            <div className="flex space-x-2 text-sm">
                {['left', 'center', 'right'].map(a => (
                    <button
                        key={a}
                        onClick={() => setAlign(a)}
                        className={`px-3 py-1 rounded-md transition-colors ${align === a
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                    >
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                    </button>
                ))}
            </div>

            <CustomSelect
                value={align}
                onChange={setAlign}
                options={options}
                align={align}
            />
        </div>
    );
};

export const StatusDemo = () => {
    const [val1, setVal1] = useState('');
    const [val2, setVal2] = useState('error');

    const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'error', label: 'Error Item' }
    ];

    return (
        <div className="flex gap-8">
            <div className="w-64">
                <div className="mb-2 text-sm font-bold text-slate-500">Normal</div>
                <CustomSelect
                    value={val1}
                    onChange={setVal1}
                    options={options}
                />
            </div>

            <div className="w-64">
                <div className="mb-2 text-sm font-bold text-red-500">Error State</div>
                <CustomSelect
                    value={val2}
                    onChange={setVal2}
                    options={options}
                    error={true}
                />
            </div>
        </div>
    );
};
