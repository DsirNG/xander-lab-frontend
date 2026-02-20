import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../CustomSelect/index.jsx';

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
    const [textAlign, setTextAlign] = useState('left');
    const [dropdownAlign, setDropdownAlign] = useState('left');
    const [value, setValue] = useState('');

    const options = [
        { value: 'left', label: 'Left Align Content' },
        { value: 'center', label: 'Center Align Content' },
        { value: 'right', label: 'Right Align Content' }
    ];

    return (
        <div className="space-y-6 w-64">
            <div className="space-y-4">
                <div>
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Trigger Text Align</div>
                    <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {['left', 'center', 'right'].map(a => (
                            <button
                                key={a}
                                onClick={() => setTextAlign(a)}
                                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${textAlign === a
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {a.charAt(0).toUpperCase() + a.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Dropdown Align</div>
                    <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {['left', 'center', 'right'].map(a => (
                            <button
                                key={a}
                                onClick={() => setDropdownAlign(a)}
                                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${dropdownAlign === a
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {a.charAt(0).toUpperCase() + a.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <CustomSelect
                value={value}
                onChange={setValue}
                options={options}
                textAlign={textAlign}
                dropdownAlign={dropdownAlign}
                placeholder="Check behavior..."
            />
        </div>
    );
};

export const StatusDemo = () => {
    const { t } = useTranslation();
    // Case 1: Validation Triggered (Error Active)
    const [formData1, setFormData1] = useState('');
    const [isError1, setIsError1] = useState(false);

    // Case 2: Validation Not Triggered (Normal)
    const [formData2, setFormData2] = useState('');

    const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
    ];

    const handleSubmit1 = () => {
        if (!formData1) {
            setIsError1(true);
        } else {
            setIsError1(false);
            // alert('Submitted successfully!');
        }
    };

    const handleSelect1 = (val) => {
        setFormData1(val);
        if (val) setIsError1(false);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Case 1: Trigger Error */}
            <div className="w-64">
                <div className="mb-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {t('components.customSelect.scenarios.demo.status.required')}
                    </div>
                    <div className="text-xs text-slate-500">
                        {t('components.customSelect.scenarios.demo.status.requiredDesc')}
                    </div>
                </div>
                <div className="space-y-3">
                    <CustomSelect
                        value={formData1}
                        onChange={handleSelect1}
                        options={options}
                        error={isError1}
                        placeholder={t('components.customSelect.scenarios.demo.status.requiredPlaceholder')}
                    />
                    <button
                        onClick={handleSubmit1}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                        {t('components.customSelect.scenarios.demo.status.simulateSubmit')}
                    </button>
                    {isError1 && (
                        <div className="text-xs text-red-500 font-medium flex items-center gap-1 animate-pulse">
                            <span>⚠</span> {t('components.customSelect.scenarios.demo.status.errorMsg')}
                        </div>
                    )}
                </div>
            </div>

            {/* Case 2: No Trigger */}
            <div className="w-64">
                <div className="mb-3">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {t('components.customSelect.scenarios.demo.status.optional')}
                    </div>
                    <div className="text-xs text-slate-500">
                        {t('components.customSelect.scenarios.demo.status.optionalDesc')}
                    </div>
                </div>
                <div className="space-y-3">
                    <CustomSelect
                        value={formData2}
                        onChange={setFormData2}
                        options={options}
                        placeholder={t('components.customSelect.scenarios.demo.status.optionalPlaceholder')}
                    />
                    <button
                        className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 text-sm font-bold rounded-lg transition-colors cursor-default border border-slate-200 dark:border-slate-700"
                    >
                        {t('components.customSelect.scenarios.demo.status.simulateSubmit')}
                    </button>
                    <div className="text-xs text-emerald-600 font-medium opacity-0">
                        Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};
