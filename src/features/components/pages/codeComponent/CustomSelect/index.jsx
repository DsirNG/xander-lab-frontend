import React, { useState, useRef, useEffect } from 'react';
import styles from './index.module.css';

const DownIcon = () => (
  <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="#999999" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * CustomSelect - 自定义下拉选择组件
 * @param {Array} options - 选项数组 [{value: '', label: ''}]
 * @param {string} value - 当前选中的值
 * @param {function} onChange - 值改变回调
 * @param {string} placeholder - 占位符文字
 * @param {string} className - 额外的类名
 * @param {string} align - 文字对齐方式: 'left' | 'center' | 'right'，默认 'left'
 * @param {boolean} error - 是否显示错误状态
 */
const CustomSelect = ({
                        options = [],
                        value,
                        onChange,
                        placeholder = '请选择',
                        className = '',
                        align = 'left',
                        error = false
                      }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // 获取当前选中项的显示文本
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // 根据 align 属性生成对齐类名
  const alignClass = styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`];

  return (
    <div className={`${styles.customSelect} ${className}`} ref={selectRef}>
      <div
        className={`${styles.selectTrigger} ${isOpen ? styles.active : ''} ${value ? styles.hasValue : ''} ${error ? styles.error : ''} ${alignClass}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.selectText}>{displayText}</span>
        <span className={`${styles.selectArrow} ${isOpen ? styles.rotated : ''}`}>
          <DownIcon />
        </span>
      </div>

      {isOpen && (
        <div className={styles.selectDropdown}>
          <div className={styles.optionsList}>
            {options.map((option) => (
              <div
                key={option.value}
                className={`${styles.option} ${value === option.value ? styles.selected : ''} ${alignClass}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
