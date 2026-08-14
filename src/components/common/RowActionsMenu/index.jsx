import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MoreHorizontal } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'h-7 w-7 rounded-md',
  md: 'h-8 w-8 rounded-lg',
  lg: 'h-9 w-9 rounded-xl',
};

/**
 * 列表行操作菜单：单个图标按钮触发，点击外部 / Esc 关闭，
 * 点击菜单项后自动收起并执行对应操作。
 */
const RowActionsMenu = ({ actions = [], size = 'md', align = 'right', ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleItemClick = (item) => {
    setOpen(false);
    item.onClick?.();
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`grid place-items-center text-ink-faint transition hover:bg-surface-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent-200 ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute top-full z-50 mt-1 min-w-36 overflow-hidden rounded-xl border border-border bg-canvas py-1.5 shadow-lg shadow-black/5 ${align === 'left' ? 'left-0' : 'right-0'}`}
        >
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled || item.loading}
                onClick={() => handleItemClick(item)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition disabled:opacity-50 ${
                  item.danger
                    ? 'text-danger hover:bg-danger-soft'
                    : 'text-ink-secondary hover:bg-surface-muted hover:text-ink'
                }`}
              >
                {item.loading ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
                ) : Icon ? (
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : null}
                {item.loading && item.loadingLabel ? item.loadingLabel : item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default RowActionsMenu;
