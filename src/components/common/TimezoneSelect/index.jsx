import React, { useMemo } from 'react';
import CustomSelect from '../CustomSelect';
import { TIMEZONE_OPTIONS, getZoneOffsetLabel } from './timezones';

/**
 * TimezoneSelect - 时区下拉（CustomSelect 封装，选项含实时 UTC 偏移）
 * @param {string} value - 当前时区（IANA ZoneId，如 Asia/Shanghai）
 * @param {function} onChange - 值改变回调
 * @param {string} size - 'md' | 'sm'（紧凑表单）
 * @param {string} className - 额外类名
 * 当 value 不在预置列表（如历史数据的自定义时区）时，仍以原文展示该值。
 */
const TimezoneSelect = ({ value, onChange, size = 'sm', className }) => {
  const options = useMemo(
    () => TIMEZONE_OPTIONS.map((item) => ({
      value: item.value,
      label: item.label.includes('GMT')
        ? item.label
        : `(${getZoneOffsetLabel(item.value)}) ${item.label}`,
    })),
    []
  );
  const effectiveOptions = useMemo(() => {
    if (!value || options.some((option) => option.value === value)) {
      return options;
    }
    return [...options, { value, label: value }];
  }, [options, value]);

  return (
    <CustomSelect
      size={size}
      className={className}
      options={effectiveOptions}
      value={value}
      onChange={onChange}
      placeholder={value || 'Asia/Shanghai'}
    />
  );
};

export default TimezoneSelect;