import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.css';

const EMPTY_OPTIONS = [];

const DownIcon = () => (
  <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const getAlignClass = (alignment) => {
  const validAlign = ['left', 'center', 'right'].includes(alignment) ? alignment : 'left';
  return styles[`align${validAlign.charAt(0).toUpperCase() + validAlign.slice(1)}`];
};

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpward, setIsUpward] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  const listboxId = useId();

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const textAlignClass = getAlignClass(textAlign || align);
  const dropdownAlignClass = getAlignClass(dropdownAlign || align);

  const getAvailableSpace = useCallback((trigger) => {
    const triggerRect = trigger.getBoundingClientRect();
    let topBound = 0;
    let bottomBound = window.innerHeight;
    let parent = trigger.parentElement;

    while (parent && parent !== document.documentElement) {
      const { overflowY } = window.getComputedStyle(parent);
      if (['auto', 'scroll', 'hidden', 'clip'].includes(overflowY)) {
        const parentRect = parent.getBoundingClientRect();
        topBound = Math.max(topBound, parentRect.top);
        bottomBound = Math.min(bottomBound, parentRect.bottom);
      }
      parent = parent.parentElement;
    }

    return {
      triggerRect,
      spaceAbove: Math.max(0, triggerRect.top - topBound),
      spaceBelow: Math.max(0, bottomBound - triggerRect.bottom),
    };
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (!selectRef.current || !isOpen) return;

    const { triggerRect, spaceAbove, spaceBelow } = getAvailableSpace(selectRef.current);
    const optionHeight = size === 'sm' ? 32 : 40;
    const desiredHeight = Math.min(options.length * optionHeight + 12, 252);
    const gap = 4;
    const upward = spaceBelow < desiredHeight + gap && spaceAbove > spaceBelow;
    const availableHeight = Math.max(optionHeight + 8, (upward ? spaceAbove : spaceBelow) - gap);
    const renderedHeight = Math.min(desiredHeight, availableHeight);

    setIsUpward(upward);
    setDropdownStyle({
      left: triggerRect.left,
      top: upward ? triggerRect.top - gap - renderedHeight : triggerRect.bottom + gap,
      width: triggerRect.width,
      maxHeight: availableHeight,
    });
  }, [getAvailableSpace, isOpen, options.length, size]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        selectRef.current
        && !selectRef.current.contains(event.target)
        && !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsUpward(false);
      setDropdownStyle(null);
      setHighlightedIndex(-1);
      return undefined;
    }

    const frame = window.requestAnimationFrame(updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  const open = () => {
    setIsOpen(true);
    const selectedIndex = options.findIndex((option) => option.value === value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const close = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    close();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex].value);
      } else if (isOpen) close();
      else open();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    event.preventDefault();
    if (!isOpen) {
      open();
      return;
    }
    setHighlightedIndex((current) => {
      if (event.key === 'ArrowDown') return Math.min(current + 1, options.length - 1);
      return Math.max(current - 1, 0);
    });
  };

  const activeDescendantId = highlightedIndex >= 0 && highlightedIndex < options.length
    ? `${listboxId}-option-${highlightedIndex}`
    : undefined;

  const dropdown = isOpen && dropdownStyle ? (
    <div
      ref={dropdownRef}
      className={`${styles.selectDropdown} ${styles.portaled} ${size === 'sm' ? styles.smDropdown : ''} ${isUpward ? styles.upward : ''}`}
      style={dropdownStyle}
    >
      <div id={listboxId} className={styles.optionsList} role="listbox" style={{ maxHeight: dropdownStyle.maxHeight }}>
        {options.map((option, index) => (
          <button
            type="button"
            role="option"
            key={option.value}
            id={`${listboxId}-option-${index}`}
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
  ) : null;

  return (
    <div className={`${styles.customSelect} ${size === 'sm' ? styles.sm : ''} ${className}`} ref={selectRef}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={placeholder || '选择'}
        aria-activedescendant={activeDescendantId}
        className={`${styles.selectTrigger} ${isOpen ? styles.active : ''} ${value ? styles.hasValue : ''} ${error ? styles.error : ''} ${textAlignClass}`}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.selectText}>{displayText}</span>
        <span className={`${styles.selectArrow} ${isOpen ? styles.rotated : ''}`}><DownIcon /></span>
      </button>
      {dropdown && createPortal(dropdown, document.body)}
    </div>
  );
};

export default CustomSelect;
