import React, { useRef } from "react";
import {
    formInputCls,
    formInputSmCls,
    timePickerOverlayCls,
} from "../formStyles";

/**
 * TimeInput - HH:mm 时间输入（原生 type="time"，统一样式）
 * @param {string} size - 'md' | 'sm'（sm 为紧凑表单高度，匹配 CustomSelect/TimezoneSelect sm）
 * @param {boolean} openOnClick - 点击整块直接呼出原生时间选择器（WebKit 隐藏小图标、铺满可点区域）
 * @param {string} className - 额外类名
 * 其余 props（value / onChange / required / min / max 等）透传给原生 input。
 */
const TimeInput = ({
    size = "md",
    openOnClick,
    className,
    onClick,
    ...rest
}) => {
    const inputRef = useRef(null);

    const handleClick = (event) => {
        onClick?.(event);
        if (!openOnClick) return;
        const input = inputRef.current;
        if (!input || typeof input.showPicker !== "function") return;
        try {
            input.showPicker();
        } catch {
            // 部分浏览器仅允许在直接用户手势中调用 showPicker
        }
    };

    const baseCls = size === "sm" ? formInputSmCls : formInputCls;
    const extraCls = [
        openOnClick ? "relative cursor-pointer" : "",
        openOnClick ? timePickerOverlayCls : "",
        className || "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <input
            ref={inputRef}
            type="time"
            step="60"
            className={[baseCls, extraCls].join(" ").trim()}
            onClick={handleClick}
            {...rest}
        />
    );
};

export default TimeInput;
