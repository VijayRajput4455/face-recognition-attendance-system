import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  footer,
  className,
  resizable = true,
  defaultWidth,
  minWidth = 440,
}) {
  const defaultSizeWidths = {
    sm: 480,
    md: 620,
    lg: 780,
    xl: 960,
  };

  const initialWidth = defaultWidth || defaultSizeWidths[size] || 620;
  const [width, setWidth] = useState(initialWidth);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const widthBeforeExpandRef = useRef(initialWidth);

  // Sync width when size prop changes
  useEffect(() => {
    if (!defaultWidth && defaultSizeWidths[size]) {
      setWidth(defaultSizeWidths[size]);
      widthBeforeExpandRef.current = defaultSizeWidths[size];
    }
  }, [size, defaultWidth]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Resizing mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const maxAvailableWidth = window.innerWidth - 40;
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, minWidth), maxAvailableWidth);
      setWidth(newWidth);
      setIsExpanded(newWidth >= maxAvailableWidth - 20);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, minWidth]);

  const toggleExpand = () => {
    const maxAvailableWidth = window.innerWidth - 40;
    if (isExpanded) {
      setWidth(widthBeforeExpandRef.current || initialWidth);
      setIsExpanded(false);
    } else {
      widthBeforeExpandRef.current = width;
      setWidth(Math.min(1050, maxAvailableWidth));
      setIsExpanded(true);
    }
  };

  const handleDoubleClickResizer = () => {
    toggleExpand();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          style={{ width: `min(${width}px, calc(100vw - 20px))` }}
          className={cn(
            'relative bg-white shadow-2xl border-l border-slate-200 flex flex-col',
            !isDragging && 'transition-[width] duration-150',
            className
          )}
        >
          {/* Draggable Resize Handle on Left Edge */}
          {resizable && (
            <div
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClickResizer}
              title="Drag left/right to resize panel width (Double-click to expand/restore)"
              className={cn(
                'absolute -left-3 top-0 bottom-0 w-6 z-20 cursor-ew-resize flex items-center justify-center group select-none',
                isDragging ? 'cursor-ew-resize' : ''
              )}
            >
              <div
                className={cn(
                  'w-1.5 h-16 rounded-full bg-slate-300 transition-all duration-150 group-hover:w-2 group-hover:h-24 group-hover:bg-blue-500 group-hover:shadow-md flex items-center justify-center',
                  isDragging ? 'w-2 h-28 bg-blue-600 shadow-md ring-2 ring-blue-400/40' : ''
                )}
              >
                <GripVertical className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
            <div className="min-w-0 pr-4">
              {title && (
                <h3 className="text-base font-semibold text-slate-900 leading-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {resizable && (
                <button
                  type="button"
                  onClick={toggleExpand}
                  title={isExpanded ? 'Restore standard width' : 'Expand panel width'}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Drawer;
