/** 表单控件共享样式（FormField / TimeInput 及业务表单统一引用） */

export const formLabelCls =
    "mb-2 block text-caption font-medium text-ink-secondary";

export const formInputCls =
    "min-h-10 w-full min-w-0 rounded-xl border border-border bg-canvas px-3 py-2 text-body text-ink placeholder:text-ink-faint focus:outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-faint";

export const formInputSmCls =
    "h-9 w-full min-w-0 rounded-lg border border-border bg-canvas px-3 text-caption text-ink placeholder:text-ink-faint outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-faint";

/** 让原生 time/datetime 输入整块可点击打开选择器（WebKit 下隐藏小图标、铺满可点区域） */
export const timePickerOverlayCls =
    "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";
