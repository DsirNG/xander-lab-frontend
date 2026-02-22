import React, { useState, useRef, useEffect } from 'react';
import { X, Hash } from 'lucide-react';

/**
 * CreatableMultiSelect 组件
 * 支持从预设列表中选择，也支持手动输入创建新选项。
 *
 * @param {Object} props
 * @param {string[]} props.value - 已选中的数据项数组
 * @param {(items: string[]) => void} props.onChange - 数据项变更回调
 * @param {string[]} [props.options=[]] - 可用的推荐选项列表
 * @param {string} [props.placeholder='请选择或输入...'] - 输入框提示文字
 * @param {string} [props.className=''] - 附加的 CSS class
 */
const CreatableMultiSelect = ({
    value = [],
    onChange,
    options = [],
    placeholder = '请选择或输入...',
    className = ''
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // 点击外部时关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                addItem(inputValue.trim());
            }
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // 当输入框为空且按下退格键时，删除最后一个项
            removeItem(value[value.length - 1]);
        }
    };

    const addItem = (itemName) => {
        const trimmed = itemName.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue('');
        setIsDropdownOpen(false);
        inputRef.current?.focus();
    };

    const removeItem = (itemToRemove) => {
        onChange(value.filter(t => t !== itemToRemove));
    };

    return (
        <div
            ref={containerRef}
            className={`relative flex flex-wrap gap-2 min-h-[56px] p-3 bg-white  border border-slate-200/60  rounded-2xl focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm ${className}`}
            onClick={() => inputRef.current?.focus()}
        >
            {value.map(item => (
                <span
                    key={item}
                    className="px-3 py-1.5 bg-slate-50  border border-slate-100  text-[11px] font-bold text-slate-700  rounded-xl flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200    transition-colors group/item cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); removeItem(item); }}
                >
                    {item}
                    <X className="w-3.5 h-3.5 opacity-50 group-hover/item:opacity-100" />
                </span>
            ))}

            <div className="relative flex-1 min-w-[120px]">
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => {
                        setInputValue(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="w-full bg-transparent border-none outline-none text-sm px-2 py-1.5  text-slate-800 "
                />

                {/* 自定义下拉选择器 */}
                {isDropdownOpen && (inputValue || options.length > 0) && (
                    <div className="absolute top-full left-0 mt-2 w-[240px] max-h-48 overflow-y-auto custom-scrollbar bg-white  border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-1">
                        {options
                            .filter(t => !value.includes(t) && t.toLowerCase().includes(inputValue.toLowerCase()))
                            .map(item => (
                                <div
                                    key={item}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addItem(item);
                                    }}
                                    className="px-4 py-2.5 text-[12px] font-medium text-slate-600  hover:bg-slate-50 hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2"
                                >
                                    <Hash className="w-3.5 h-3.5 opacity-50" /> {item}
                                </div>
                            ))}
                        {/* 如果用户输入了一个不存在的新选项，给个提示 */}
                        {inputValue.trim() && !options.includes(inputValue.trim()) && (
                            <div
                                className="px-4 py-2.5 text-[12px] font-medium text-slate-400  border-t border-slate-100 mt-1 first:border-0 first:mt-0 italic flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addItem(inputValue.trim());
                                }}
                            >
                                <span>创建项 "{inputValue}"</span>
                                <span className="text-[9px] uppercase tracking-wider bg-slate-100  px-1.5 py-0.5 rounded font-bold">Enter</span>
                            </div>
                        )}
                        {/* 如果全部选完并且没有输入内容 */}
                        {!inputValue && options.filter(t => !value.includes(t)).length === 0 && (
                            <div className="px-4 py-3 text-[11px] text-center text-slate-400 italic">
                                暂无推荐项，输入按回车创建
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatableMultiSelect;
