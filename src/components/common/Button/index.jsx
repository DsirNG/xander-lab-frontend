import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 全局统一按钮组件（按钮规范见根目录 COMPONENTS.md「通用交互」Button 条目）。
 *
 * 规格约定：
 * - size：xs(32px) / sm(36px) / md(40px) / lg(44px)，均为固定高度 + 圆角 + 字号
 *   的组合，禁止在业务里另写高度 / padding / 圆角 / 字号类覆盖（有特殊排版诉求时
 *   才允许通过 className 增量覆盖）。
 * - variant：primary / ink / outline / ghost / danger / dangerOutline / link，
 *   同一语义的按钮全项目只允许使用对应 variant，禁止手写底色类。
 * - loading 内置 spinner 并自动禁用；带 icon 时 spinner 替换图标。
 * - 纯图标按钮（有 icon 且无 children）自动正方形（w=h），且必须传 aria-label。
 */
const SIZE_CLASSES = {
    xs: 'h-8 gap-1.5 px-3 text-caption rounded-lg',
    sm: 'h-9 gap-1.5 px-3.5 text-caption rounded-lg',
    md: 'h-10 gap-2 px-4 text-sm rounded-xl',
    lg: 'h-11 gap-2 px-5 text-sm rounded-xl',
};

const ICON_CLASSES = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
};

const SQUARE_CLASSES = {
    xs: 'h-8 w-8',
    sm: 'h-9 w-9',
    md: 'h-10 w-10',
    lg: 'h-11 w-11',
};

const VARIANT_CLASSES = {
    primary: 'bg-accent text-white shadow-sm hover:bg-accent-700 focus-visible:ring-accent-200',
    ink: 'bg-ink text-white hover:bg-ink-secondary focus-visible:ring-accent-200',
    outline:
        'border border-border bg-canvas text-ink-secondary hover:border-accent-600 hover:text-accent-600 focus-visible:ring-accent-200',
    ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-accent-200',
    danger: 'bg-danger text-white shadow-sm hover:bg-danger-fg focus-visible:ring-danger/40',
    dangerOutline: 'border border-danger/40 bg-canvas text-danger hover:bg-danger-soft focus-visible:ring-danger/30',
    link: 'text-accent hover:underline underline-offset-4 focus-visible:ring-accent/40',
};

const BASE =
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const Button = forwardRef(
    (
        {
            variant = 'primary',
            size = 'md',
            icon: Icon,
            iconPosition = 'left',
            loading = false,
            disabled = false,
            block = false,
            className = '',
            type = 'button',
            children,
            ...rest
        },
        ref
    ) => {
        const isLink = variant === 'link';
        const iconOnly = !!Icon && !children;

        const classes = twMerge(
            clsx(
                BASE,
                !isLink && SIZE_CLASSES[size],
                !isLink && iconOnly && SQUARE_CLASSES[size],
                VARIANT_CLASSES[variant],
                block && 'w-full',
                className
            )
        );

        const renderIcon = () =>
            loading ? (
                <Loader2 className={`${ICON_CLASSES[size]} shrink-0 animate-spin`} aria-hidden="true" />
            ) : (
                <Icon className={`${ICON_CLASSES[size]} shrink-0`} aria-hidden="true" />
            );

        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || loading}
                aria-busy={loading || undefined}
                className={classes}
                {...rest}
            >
            {(!Icon || iconPosition === 'left') && (Icon || loading) ? renderIcon() : null}
            {children}
            {Icon && iconPosition === 'right' ? renderIcon() : null}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
