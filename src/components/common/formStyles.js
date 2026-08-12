/** 表单控件共享样式（FormField / TimeInput 及业务表单统一引用） */

export const formLabelCls = 'block text-xs font-medium text-ink-secondary mb-1';

export const formInputCls =
  'w-full rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40';

export const formInputSmCls =
  'h-9 w-full min-w-0 rounded-lg border border-border bg-canvas px-2.5 text-xs font-medium text-ink-secondary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10';

/** 让原生 time/datetime 输入整块可点击打开选择器（WebKit 下隐藏小图标、铺满可点区域） */
export const timePickerOverlayCls =
  '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0';