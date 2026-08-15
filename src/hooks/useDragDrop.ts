import { useState, useCallback, useRef } from 'react';

// 鼠标跟随
function moveFloatingPreview(
  el: HTMLElement,
  x: number,
  y: number,
  offsetX = 12,
  offsetY = 12
) {
  el.style.transform = `translate3d(${x - offsetX}px, ${y - offsetY}px, 0)`;
}

function mountFloatingPreview(el: HTMLElement) {
  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.top = '0';
  el.style.zIndex = '999999';
  el.style.pointerEvents = 'none';
  el.style.willChange = 'transform';
  document.body.appendChild(el);
}

/**
 * 拖拽预览控制器接口
 * 让 preview 自己控制如何显示/隐藏提示，而不是让 hook 去猜测 DOM 结构
 */
export interface DragPreviewController {
  /** 显示放置提示 */
  showDropHint(text: string): void;
  /** 隐藏放置提示 */
  hideDropHint(): void;
  /** 更新位置（可选，用于更精细的控制） */
  updatePosition?(x: number, y: number): void;
  /** 销毁时清理（可选） */
  destroy?(): void;
}

/**
 * 拖拽预览结果
 */
export type DragPreviewResult =
  | HTMLElement
  | {
    el: HTMLElement;
    offsetX?: number;
    offsetY?: number;
    /** 预览控制器（可选，提供时优先使用） */
    controller?: DragPreviewController;
  }
  | null;

/**
 * 拖拽 Hook 配置选项
 */
export interface UseDragDropOptions<T = any> {
  /** 拖拽开始回调 */
  onDragStart?: (item: T, e: React.PointerEvent) => void;
  /** 拖拽经过回调，返回 boolean 表示是否允许放置 */
  onDragOver?: (item: T, e: React.PointerEvent) => boolean;
  /** 放置回调 */
  onDrop?: (source: T, target: T, e: React.PointerEvent) => void;
  /** 拖拽结束回调 */
  onDragEnd?: (item: T, e: React.PointerEvent) => void;
  /** 判断是否可以拖拽 */
  canDrag?: (item: T) => boolean;
  /** 判断是否可以放置到目标 */
  canDrop?: (source: T, target: T) => boolean;
  /**获取拖拽预览*/
  getDragPreview?: (item: T, e: React.PointerEvent) => DragPreviewResult;
  /** 获取放置提示文本*/
  getDropHintText?: (source: T, target: T) => string;
}

/**
 * 拖拽 Hook 返回值
 */
export interface UseDragDropReturn<T = any> {
  /** 当前正在拖拽的项 */
  draggedItem: T | null;
  /** 当前拖拽经过的项 */
  dragOverItem: T | null;
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 拖拽开始事件处理 */
  handleDragStart: (item: T, e: React.PointerEvent) => void;
  /** 拖拽经过事件处理 */
  handleDragOver: (item: T, e: React.PointerEvent) => void;
  /** 拖拽离开事件处理 */
  handleDragLeave: (e: React.PointerEvent) => void;
  /** 放置事件处理 */
  handleDrop: (item: T, e: React.PointerEvent) => void;
  /** 拖拽结束事件处理 */
  handleDragEnd: (e: React.PointerEvent) => void;
  /** 重置拖拽状态 */
  reset: () => void;
}

/**
 * 拖拽功能 Hook
 *
 * @description
 * 通用的拖拽功能 Hook，基于 Pointer Events（pointerdown/pointermove/pointerup）实现
 * 统一支持鼠标、触控笔与触摸，提供拖拽状态管理和验证逻辑
 *
 * @example
 * ```tsx
 * const dragDrop = useDragDrop({
 *   onDragStart: (item, e) => {
 *     console.log('开始拖拽:', item);
 *   },
 *   onDrop: (source, target, e) => {
 *     console.log('放置:', source, '到', target);
 *   },
 *   canDrag: (item) => item.draggable,
 *   canDrop: (source, target) => source.type !== target.type,
 * });
 *
 * <div
 *   onPointerDown={(e) => dragDrop.handleDragStart(item, e)}
 *   onPointerMove={(e) => dragDrop.handleDragOver(item, e)}
 *   onPointerUp={(e) => dragDrop.handleDrop(item, e)}
 *   style={{ touchAction: 'none' }}
 * >
 *   可拖拽项
 * </div>
 * ```
 */
export function useDragDrop<T = any>({
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  canDrag,
  canDrop,
  getDragPreview,
  getDropHintText,
}: UseDragDropOptions<T> = {}): UseDragDropReturn<T> {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverItem, setDragOverItem] = useState<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragLeaveTimerRef = useRef<number | null>(null);
  const dragPreviewElRef = useRef<HTMLElement | null>(null);
  const previewCtrlRef = useRef<DragPreviewController | null>(null);
  const dragMoveHandlerRef = useRef<((ev: PointerEvent) => void) | null>(null);
  const dragCleanupRef = useRef<((ev: PointerEvent) => void) | null>(null);
  const draggedItemRef = useRef<T | null>(null);
  const isDraggingRef = useRef(false);

  // 清理拖拽预览
  const cleanupDragPreview = useCallback(() => {
    // 清理 controller（如果有 destroy 方法）
    if (previewCtrlRef.current?.destroy) {
      previewCtrlRef.current.destroy();
    }
    previewCtrlRef.current = null;

    // 清理事件监听器
    if (dragMoveHandlerRef.current) {
      window.removeEventListener('pointermove', dragMoveHandlerRef.current);
      dragMoveHandlerRef.current = null;
    }
    if (dragCleanupRef.current) {
      window.removeEventListener('pointerup', dragCleanupRef.current);
      window.removeEventListener('pointercancel', dragCleanupRef.current);
      dragCleanupRef.current = null;
    }
    // 清理 DOM 元素
    if (dragPreviewElRef.current) {
      dragPreviewElRef.current.remove();
      dragPreviewElRef.current = null;
    }
  }, []);

  // 清理拖拽离开定时器
  const clearDragLeaveTimer = useCallback(() => {
    if (dragLeaveTimerRef.current) {
      clearTimeout(dragLeaveTimerRef.current);
      dragLeaveTimerRef.current = null;
    }
  }, []);

  // 取消/结束拖拽（未放置成功）
  const cancelDrag = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      cleanupDragPreview();
      clearDragLeaveTimer();

      if (draggedItemRef.current) {
        onDragEnd?.(draggedItemRef.current, e as React.PointerEvent);
      }

      draggedItemRef.current = null;
      isDraggingRef.current = false;
      setDraggedItem(null);
      setDragOverItem(null);
      setIsDragging(false);
    },
    [onDragEnd, cleanupDragPreview, clearDragLeaveTimer]
  );

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (item: T, e: React.PointerEvent) => {
      e.preventDefault();

      // 检查是否可以拖拽
      if (canDrag && !canDrag(item)) {
        return;
      }

      // 先清理上一次的预览（保险）
      cleanupDragPreview();

      draggedItemRef.current = item;
      isDraggingRef.current = true;
      setDraggedItem(item);
      setIsDragging(true);

      // 释放触屏/触控笔的隐式指针捕获，让 pointermove/pointerup 按真实命中测试派发
      const target = e.currentTarget as HTMLElement | null;
      const pointerId = e.pointerId;
      setTimeout(() => {
        if (target && target.hasPointerCapture?.(pointerId)) {
          target.releasePointerCapture(pointerId);
        }
      }, 0);

      // window 级 pointerup/pointercancel 兜底：未放置成功则取消拖拽
      const onPointerCancel = (ev: PointerEvent) => {
        cancelDrag(ev);
      };
      window.addEventListener('pointerup', onPointerCancel);
      window.addEventListener('pointercancel', onPointerCancel);
      dragCleanupRef.current = onPointerCancel;

      // 自定义拖拽视图
      if (getDragPreview) {
        const res = getDragPreview(item, e);
        if (res) {
          const {
            el,
            offsetX = 12,
            offsetY = 12,
            controller,
          }: { el: HTMLElement; offsetX?: number; offsetY?: number; controller?: DragPreviewController } = res instanceof HTMLElement ? { el: res } : res;

          // 保存 controller
          previewCtrlRef.current = controller ?? null;

          //  用自己的浮层预览（完全不透明，阴影正常）
          mountFloatingPreview(el);
          dragPreviewElRef.current = el;

          // 初始位置
          moveFloatingPreview(el, e.clientX, e.clientY, offsetX, offsetY);

          // 如果 controller 有 updatePosition，使用它；否则使用默认的 moveFloatingPreview
          const onMove = (ev: PointerEvent) => {
            if (!dragPreviewElRef.current || !isDraggingRef.current) return;

            if (previewCtrlRef.current?.updatePosition) {
              previewCtrlRef.current.updatePosition(ev.clientX, ev.clientY);
            } else {
              moveFloatingPreview(
                dragPreviewElRef.current,
                ev.clientX,
                ev.clientY,
                offsetX,
                offsetY
              );
            }
          };

          window.addEventListener('pointermove', onMove);
          dragMoveHandlerRef.current = onMove;
        }
      }

      // 调用回调
      onDragStart?.(item, e);
    },
    [canDrag, onDragStart, getDragPreview, cleanupDragPreview, cancelDrag]
  );

  // 处理拖拽经过
  const handleDragOver = useCallback(
    (item: T, e: React.PointerEvent) => {
      e.preventDefault();

      if (!isDraggingRef.current) {
        previewCtrlRef.current?.hideDropHint();
        return;
      }

      // 不能拖到自己上
      if (draggedItemRef.current === item) {
        setDragOverItem(null);
        previewCtrlRef.current?.hideDropHint();
        return;
      }

      // 检查是否可以放置
      if (canDrop && !canDrop(draggedItemRef.current, item)) {
        setDragOverItem(null);
        previewCtrlRef.current?.hideDropHint();
        return;
      }

      // 调用 onDragOver 回调，如果返回 false 则不允许放置
      if (onDragOver) {
        const allowDrop = onDragOver(item, e);
        if (!allowDrop) {
          setDragOverItem(null);
          previewCtrlRef.current?.hideDropHint();
          return;
        }
      }

      // 允许时显示并更新文案
      const text = getDropHintText ? getDropHintText(draggedItemRef.current, item) : '';
      if (text) {
        previewCtrlRef.current?.showDropHint(text);
      } else {
        previewCtrlRef.current?.hideDropHint();
      }

      clearDragLeaveTimer();
      setDragOverItem(item);
    },
    [canDrop, onDragOver, clearDragLeaveTimer, getDropHintText]
  );

  // 处理拖拽离开
  const handleDragLeave = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 延迟清除，避免快速移动时闪烁
      clearDragLeaveTimer();
      dragLeaveTimerRef.current = setTimeout(() => {
        previewCtrlRef.current?.hideDropHint();
        setDragOverItem(null);
      }, 50);
    },
    [clearDragLeaveTimer]
  );

  // 处理放置
  const handleDrop = useCallback(
    (item: T, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDraggingRef.current) return;
      const source = draggedItemRef.current;

      // 不能拖到自己上
      if (source === item) {
        return;
      }

      // 检查是否可以放置
      if (canDrop && !canDrop(source, item)) {
        return;
      }

      clearDragLeaveTimer();

      try {
        // 调用回调
        onDrop?.(source, item, e);
      } finally {
        // 清理预览
        cleanupDragPreview();
        // 重置状态
        draggedItemRef.current = null;
        isDraggingRef.current = false;
        setDraggedItem(null);
        setDragOverItem(null);
        setIsDragging(false);
      }
    },
    [canDrop, onDrop, clearDragLeaveTimer, cleanupDragPreview]
  );

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    (e: React.PointerEvent) => {
      cancelDrag(e);
    },
    [cancelDrag]
  );

  // 重置拖拽状态
  const reset = useCallback(() => {
    cleanupDragPreview();
    clearDragLeaveTimer();
    draggedItemRef.current = null;
    isDraggingRef.current = false;
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
  }, [clearDragLeaveTimer, cleanupDragPreview]);

  return {
    draggedItem,
    dragOverItem,
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    reset,
  };
}