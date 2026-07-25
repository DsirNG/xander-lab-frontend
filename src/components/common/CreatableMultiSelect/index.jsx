import React, { useState, useRef, useEffect } from 'react';
import { X, Hash } from 'lucide-react';

const EMPTY_ARRAY = [];

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
    value = EMPTY_ARRAY,
    onChange,
    options = EMPTY_ARRAY,
    placeholder = '请选择或输入...',
    className = ''
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Compute filtered options for keyboard navigation
    const filteredOptions = options.filter(
        t => !value.includes(t) && t.toLowerCase().includes(inputValue.toLowerCase())
    );

    // 点击外部时关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If an option is highlighted in dropdown, select it
            if (isDropdownOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                addItem(filteredOptions[highlightedIndex]);
            } else if (inputValue.trim()) {
                addItem(inputValue.trim());
            }
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // 当输入框为空且按下退格键时，删除最后一个项
            removeItem(value[value.length - 1]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isDropdownOpen) {
                setIsDropdownOpen(true);
                setHighlightedIndex(0);
            } else if (filteredOptions.length > 0) {
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isDropdownOpen) {
                setIsDropdownOpen(true);
                setHighlightedIndex(Math.max(0, filteredOptions.length - 1));
            } else if (filteredOptions.length > 0) {
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsDropdownOpen(false);
            setHighlightedIndex(-1);
        }
    };

    const addItem = (itemName) => {
        const trimmed = itemName.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue('');
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const removeItem = (itemToRemove) => {
        onChange(value.filter(t => t !== itemToRemove));
    };

    return (
        <div
            ref={containerRef}
            className={`relative flex flex-wrap gap-2 p-3 bg-canvas border border-border rounded-[8px] focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10 transition-all shadow-sm ${className}`}
            onClick={() => inputRef.current?.focus()}
        >
            {value.map(item => (
                <button
                    type="button"
                    key={item}
                    aria-label={`移除 ${item}`}
                    className="px-3 py-1.5 bg-surface border border-border text-micro font-bold text-ink-secondary rounded-xl flex items-center gap-1.5 hover:bg-danger-soft hover:text-danger hover:border-danger/30 transition-colors group/item cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); removeItem(item); }}
                >
                    {item}
                    <X className="w-3.5 h-3.5 opacity-50 group-hover/item:opacity-100" />
                </button>
            ))}

            <div className="relative flex-1 min-w-[120px]">
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => {
                        setInputValue(e.target.value);
                        setIsDropdownOpen(true);
                        setHighlightedIndex(-1);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="w-full bg-transparent border-none outline-none text-body px-2 py-1.5 text-ink"
                />

                {/* 自定义下拉选择器 */}
                {isDropdownOpen && (inputValue || options.length > 0) && (
                    <div role="listbox" className="absolute top-full left-0 mt-2 w-[240px] max-h-48 overflow-y-auto custom-scrollbar bg-canvas border border-border rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-1">
                        {filteredOptions
                            .map((item, index) => (
                                <button
                                    type="button"
                                    role="option"
                                    key={item}
                                    aria-selected={value.includes(item)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addItem(item);
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`px-4 py-2.5 text-caption font-medium text-ink-muted hover:bg-surface hover:text-accent cursor-pointer transition-colors flex items-center gap-2 w-full text-left ${index === highlightedIndex ? 'bg-accent/10' : ''}`}
                                >
                                    <Hash className="w-3.5 h-3.5 opacity-50" /> {item}
                                </button>
                            ))}
                        {/* 如果用户输入了一个不存在的新选项，给个提示 */}
                        {inputValue.trim() && !options.includes(inputValue.trim()) && (
                            <div
                                className="px-4 py-2.5 text-caption font-medium text-ink-faint border-t border-border mt-1 first:border-0 first:mt-0 italic flex items-center justify-between cursor-pointer hover:bg-surface"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addItem(inputValue.trim());
                                }}
                            >
                                <span>创建项 "{inputValue}"</span>
                                <span className="text-micro uppercase tracking-wider bg-surface-muted px-1.5 py-0.5 rounded font-bold">Enter</span>
                            </div>
                        )}
                        {/* 如果全部选完并且没有输入内容 */}
                        {!inputValue && options.filter(t => !value.includes(t)).length === 0 && (
                            <div className="px-4 py-3 text-micro text-center text-ink-faint italic">
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
