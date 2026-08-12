import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.css';

const EMPTY_OPTIONS = [];
/** 浮层 z-index：高于 Modal 容器(z-[1000])，确保不被弹窗标题/遮罩覆盖 */
const DROPDOWN_Z_INDEX = 1100;
const DROPDOWN_MAX_HEIGHT = 15 * 16;

const DownIcon = () => (
  <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * CustomSelect - 自定义下拉选择组件
 * 下拉浮层通过 Portal 渲染到 document.body 并基于视口 fixed 定位，
 * 不受弹窗滚动容器裁剪与层级影响，永远浮于弹窗标题之上。
 *
 * 硬性规定：默认不响应"点击空白收起"；只有显式传 closeOnOutsideClick
 * 的调用方才允许点击外部关闭，其余只能通过选择选项 / Esc / 弹窗右上角关闭。
 *
 * @param {Array} options - 选项数组 [{value: '', label: ''}]
 * @param {string} value - 当前选中的值
 * @param {function} onChange - 值改变回调
 * @param {string} placeholder - 占位符文字
 * @param {string} className - 额外的类名
 * @param {string} size - 尺寸: 'md'(默认) | 'sm'(紧凑，匹配表单 h-9)
 * @param {string} align - [Deprecated] 统一对齐方式，建议使用 textAlign 和 dropdownAlign
 * @param {string} textAlign - 触发器文字对齐方式: 'left' | 'center' | 'right'，默认 'left'
 * @param {string} dropdownAlign - 下拉选项对齐方式: 'left' | 'center' | 'right'，默认 'left'
 * @param {boolean} error - 是否显示错误状态
 * @param {boolean} closeOnOutsideClick - 是否允许点击外部收起（默认 false）
 */
const CustomSelect = ({
  options = EMPTY_OPTIONS,
  value,
  onChange,
  placeholder = '请选择',
  className = '',
  size = 'md',
  align = 'left',
  textAlign,
  dropdownAlign,
  error = false,
  closeOnOutsideClick = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpward, setIsUpward] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // 确定最终的对齐方式
  // 如果提供了 textAlign 或 dropdownAlign，则优先使用；否则回退到 align
  const finalTextAlign = textAlign || align;
  const finalDropdownAlign = dropdownAlign || align;

  // 获取当前选中项的显示文本
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // 基于视口计算浮层几何（fixed 定位不受 overflow 祖先裁剪）
  const computeDropdownGeometry = useCallback(() => {
    if (!selectRef.current) return null;

    const triggerRect = selectRef.current.getBoundingClientRect();
    const measuredRect = dropdownRef.current?.getBoundingClientRect();
    const optionHeightPx = size === 'sm' ? 32 : 40;
    const dropdownHeight = measuredRect?.height
      || Math.min(options.length * optionHeightPx + 12, DROPDOWN_MAX_HEIGHT + 12);
    const dropdownWidth = measuredRect?.width || triggerRect.width;

    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const overflowsBelow = spaceBelow < dropdownHeight + 8;
    let shouldUpward = false;
    if (overflowsBelow) {
      // 下方不够时：上方够就上翻；两边都不够则选更大一侧
      shouldUpward = spaceAbove >= dropdownHeight + 8 || spaceAbove > spaceBelow;
    }

    const alignOffset = {
      left: 0,
      center: (triggerRect.width - dropdownWidth) / 2,
      right: triggerRect.width - dropdownWidth,
    }[finalDropdownAlign] ?? 0;

    return {
      shouldUpward,
      top: shouldUpward ? triggerRect.top - dropdownHeight - 4 : triggerRect.bottom + 4,
      left: triggerRect.left + alignOffset,
      width: dropdownWidth,
    };
  }, [options.length, size, finalDropdownAlign]);

  // 应用浮层位置
  const applyPosition = useCallback(() => {
    const geometry = computeDropdownGeometry();
    if (!geometry) return;
    setIsUpward(geometry.shouldUpward);
    setPosition({ top: geometry.top, left: geometry.left, width: geometry.width });
  }, [computeDropdownGeometry]);

  // 打开时重算位置（双帧确保使用实际渲染尺寸）；关闭时重置方向
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        applyPosition();
        requestAnimationFrame(() => {
          applyPosition();
        });
      });
    } else {
      setIsUpward(false);
      setHighlightedIndex(-1);
    }
  }, [isOpen, applyPosition]);

  // 滚动/窗口变化时同步浮层位置（保持与触发器对齐）
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleScroll = () => {
      applyPosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, applyPosition]);

  // 点击外部收起：仅显式开启 closeOnOutsideClick 时生效（项目硬性规定）
  useEffect(() => {
    if (!closeOnOutsideClick) return undefined;

    const handleClickOutside = (event) => {
      const contains = (el) => el && el.contains(event.target);
      if (!contains(selectRef.current) && !contains(dropdownRef.current)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnOutsideClick]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
          // Select the highlighted option
          handleSelect(options[highlightedIndex].value);
        } else {
          // Toggle dropdown
          setIsOpen(!isOpen);
          if (!isOpen) {
            // When opening, highlight the currently selected option or first option
            const selectedIdx = options.findIndex(opt => opt.value === value);
            setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const selectedIdx = options.findIndex(opt => opt.value === value);
          setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
        } else if (highlightedIndex < options.length - 1) {
          setHighlightedIndex(highlightedIndex + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const selectedIdx = options.findIndex(opt => opt.value === value);
          setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
        } else if (highlightedIndex > 0) {
          setHighlightedIndex(highlightedIndex - 1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // 生成对齐类名
  const getAlignClass = (alignment) => {
    const validAlign = ['left', 'center', 'right'].includes(alignment) ? alignment : 'left';
    return styles[`align${validAlign.charAt(0).toUpperCase() + validAlign.slice(1)}`];
  };

  const textAlignClass = getAlignClass(finalTextAlign);
  const dropdownAlignClass = getAlignClass(finalDropdownAlign);

  // Compute the id of the highlighted option for aria-activedescendant
  const activeDescendantId = highlightedIndex >= 0 && highlightedIndex < options.length
    ? `option-${options[highlightedIndex].value}`
    : undefined;

  const dropdown = (
    <div
      ref={dropdownRef}
      className={`${styles.selectDropdown} ${isUpward ? styles.upward : ''}`}
      style={{ position: 'fixed', top: position.top, left: position.left, width: position.width, zIndex: DROPDOWN_Z_INDEX }}
    >
      <div className={styles.optionsList} role="listbox">
        {options.map((option, index) => (
          <button
            type="button"
            role="option"
            key={option.value}
            id={`option-${option.value}`}
            aria-selected={option.value === value}
            className={`${styles.option} ${value === option.value ? styles.selected : ''} ${dropdownAlignClass} ${index === highlightedIndex ? 'bg-accent/10' : ''}`}
            onClick={() => handleSelect(option.value)}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${styles.customSelect} ${size === 'sm' ? styles.sm : ''} ${className}`} ref={selectRef}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder || '选择'}
        aria-activedescendant={activeDescendantId}
        className={`${styles.selectTrigger} ${isOpen ? styles.active : ''} ${value ? styles.hasValue : ''} ${error ? styles.error : ''} ${textAlignClass}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.selectText}>{displayText}</span>
        <span className={`${styles.selectArrow} ${isOpen ? styles.rotated : ''}`}>
          <DownIcon />
        </span>
      </button>

      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
};

export default CustomSelect;