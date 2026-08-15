import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MoreHorizontal } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'h-7 w-7 rounded-md',
  md: 'h-8 w-8 rounded-lg',
  lg: 'h-9 w-9 rounded-xl',
};

const VIEWPORT_GAP = 8;

/**
 * 列表行操作菜单：单个图标按钮触发，点击外部 / Esc 关闭，
 * 点击菜单项后自动收起并执行对应操作。
 *
 * 菜单通过 Portal 挂到 body，并做视口边界检查：
 * 下方空间不足时自动向上展开，左右边距不足时自动收拢到视口内，
 * 跟随滚动 / 缩放重新定位，避免被列表的滚动容器裁剪。
 */
const RowActionsMenu = ({ actions = [], size = 'md', align = 'right', ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState(null);

  const layoutMenu = useCallback(() => {
    const anchor = anchorRef.current;
    const menu = menuRef.current;
    if (!anchor || !menu) return;

    const anchorRect = anchor.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    const placeAbove = menuHeight > spaceBelow && spaceAbove > spaceBelow;

    const maxWidth = Math.min(menuWidth, viewportWidth - VIEWPORT_GAP * 2);

    let left = align === 'left' ? anchorRect.left : anchorRect.right - maxWidth;
    left = Math.min(Math.max(left, VIEWPORT_GAP), viewportWidth - VIEWPORT_GAP - maxWidth);

    let top = placeAbove ? anchorRect.top - menuHeight : anchorRect.bottom;
    top = placeAbove
      ? Math.max(top, VIEWPORT_GAP)
      : Math.min(top, viewportHeight - menuHeight - VIEWPORT_GAP);

    setPosition({ top, left, width: maxWidth });
  }, [align]);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return undefined;
    }

    const handleMouseDown = (event) => {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (anchor?.contains(event.target) || menu?.contains(event.target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const reposition = () => layoutMenu();

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, layoutMenu]);

  useLayoutEffect(() => {
    if (open) layoutMenu();
  }, [open, layoutMenu]);

  const handleItemClick = (item) => {
    setOpen(false);
    item.onClick?.();
  };

  return (
    <>
      <div className="relative" ref={anchorRef}>
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
      </div>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={position ? { top: position.top, left: position.left, width: position.width } : undefined}
              className={`fixed z-50 max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-canvas py-1.5 shadow-lg shadow-black/5 ${position ? 'min-w-36' : 'invisible'}`}
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
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition disabled:opacity-50 truncate ${
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
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default RowActionsMenu;