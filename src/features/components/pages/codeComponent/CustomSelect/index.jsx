import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './index.module.css';

const DownIcon = () => (
  <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="#999999" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * CustomSelect - 自定义下拉选择组件
 * @param {Array} options - 选项数组 [{value: '', label: ''}]
 * @param {string} value - 当前选中的值
 * @param {function} onChange - 值改变回调
 * @param {string} placeholder - 占位符文字
 * @param {string} className - 额外的类名
 * @param {string} align - [Deprecated] 统一对齐方式，建议使用 textAlign 和 dropdownAlign
 * @param {string} textAlign - 触发器文字对齐方式: 'left' | 'center' | 'right'，默认 'left'
 * @param {string} dropdownAlign - 下拉选项对齐方式: 'left' | 'center' | 'right'，默认 'left'
 * @param {boolean} error - 是否显示错误状态
 */
const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = '请选择',
  className = '',
  align = 'left',
  textAlign,
  dropdownAlign,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpward, setIsUpward] = useState(false);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // 确定最终的对齐方式
  // 如果提供了 textAlign 或 dropdownAlign，则优先使用；否则回退到 align
  const finalTextAlign = textAlign || align;
  const finalDropdownAlign = dropdownAlign || align;

  // 获取当前选中项的显示文本
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // 检测边界并决定下拉框方向
  const checkBoundary = useCallback(() => {
    if (!selectRef.current || !isOpen) return;

    const triggerRect = selectRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // 估算下拉框高度（最大高度 15rem + padding）
    const estimatedDropdownHeight = Math.min(
      options.length * 2.5 + 0.5, // 每个选项约 2.5rem + padding
      15 + 0.5 // 最大高度 15rem + padding
    ) * 16; // 转换为像素（假设 1rem = 16px）

    // 如果下方空间不足，且上方空间足够，则向上展开
    const shouldUpward = spaceBelow < estimatedDropdownHeight && spaceAbove >= estimatedDropdownHeight;

    // 如果下拉框已渲染，使用实际高度进行二次检测
    if (dropdownRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const actualBottomPosition = triggerRect.bottom + dropdownRect.height;
      const actualShouldUpward = actualBottomPosition > viewportHeight && spaceAbove >= dropdownRect.height;

      setIsUpward(actualShouldUpward);
    } else {
      setIsUpward(shouldUpward);
    }
  }, [isOpen, options.length]);

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

  // 当下拉框打开时检测边界
  useEffect(() => {
    if (isOpen) {
      // 使用 requestAnimationFrame 确保 DOM 已渲染
      requestAnimationFrame(() => {
        checkBoundary();
        // 再次检测，确保使用实际渲染后的尺寸
        requestAnimationFrame(() => {
          checkBoundary();
        });
      });
    } else {
      // 关闭时重置方向
      setIsUpward(false);
    }
  }, [isOpen, checkBoundary]);

  // 监听滚动事件，重新检测边界
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      checkBoundary();
    };

    // 监听窗口滚动和容器滚动
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, checkBoundary]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // 生成对齐类名
  const getAlignClass = (alignment) => {
    const validAlign = ['left', 'center', 'right'].includes(alignment) ? alignment : 'left';
    return styles[`align${validAlign.charAt(0).toUpperCase() + validAlign.slice(1)}`];
  };

  const textAlignClass = getAlignClass(finalTextAlign);
  const dropdownAlignClass = getAlignClass(finalDropdownAlign);

  return (
    <div className={`${styles.customSelect} ${className}`} ref={selectRef}>
      <div
        className={`${styles.selectTrigger} ${isOpen ? styles.active : ''} ${value ? styles.hasValue : ''} ${error ? styles.error : ''} ${textAlignClass}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.selectText}>{displayText}</span>
        <span className={`${styles.selectArrow} ${isOpen ? styles.rotated : ''}`}>
          <DownIcon />
        </span>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`${styles.selectDropdown} ${isUpward ? styles.upward : ''}`}
        >
          <div className={styles.optionsList}>
            {options.map((option) => (
              <div
                key={option.value}
                className={`${styles.option} ${value === option.value ? styles.selected : ''} ${dropdownAlignClass}`}
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
