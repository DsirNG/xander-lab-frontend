import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import Button from '@components/common/Button';

const SIZE_CLASSES = {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
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
        <Button
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
          variant="ghost"
          size={SIZE_CLASSES[size] || 'sm'}
          icon={MoreHorizontal}
        />
      </div>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={position ? { top: position.top, left: position.left, width: position.width } : undefined}
              className={`fixed z-50 max-h-[70vh] w-40 overflow-y-auto overflow-x-hidden rounded-xl bg-canvas py-1.5 shadow-lg shadow-black/10 ${position ? '' : 'invisible'}`}
            >
              {actions.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.key}
                    role="menuitem"
                    disabled={item.disabled || item.loading}
                    loading={item.loading}
                    icon={Icon}
                    variant={item.danger ? 'dangerOutline' : 'ghost'}
                    size="sm"
                    onClick={() => handleItemClick(item)}
                    className={`h-auto w-full justify-start border-0 px-3 py-2 text-left truncate ${
                      item.danger
                        ? 'text-danger hover:bg-danger-soft'
                        : 'text-ink-secondary hover:bg-surface-muted hover:text-ink'
                    }`}
                  >
                    {item.loading && item.loadingLabel ? item.loadingLabel : item.label}
                  </Button>
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
