import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
  showHandle?: boolean;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const sheetHeight = useRef(0);

  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Only allow drag from handle or header area
    if (!target.closest('[data-drag-handle]')) return;

    startY.current = e.touches[0].clientY;
    sheetHeight.current = sheetRef.current?.offsetHeight || 0;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only allow dragging down
    if (diff > 0) {
      setDragY(diff);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // If dragged more than 30% of height, close the sheet
    if (dragY > sheetHeight.current * 0.3) {
      haptics.impact();
      onClose();
    }

    setDragY(0);
  }, [isDragging, dragY, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      haptics.light();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${heightClasses[height]} ${className}`}
        style={{
          transform: isOpen
            ? `translateY(${dragY}px)`
            : 'translateY(100%)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            data-drag-handle
          >
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-slate-100"
            data-drag-handle
          >
            {title ? (
              <h2 id="bottom-sheet-title" className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                onClick={() => {
                  haptics.light();
                  onClose();
                }}
                className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} className="text-slate-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </>
  );
};

/**
 * BottomSheet with action buttons
 */
export const ActionSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }>;
}> = ({ isOpen, onClose, title, actions }) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <div className="p-4 space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              haptics.medium();
              action.onClick();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-medium transition-colors min-h-[52px] ${
              action.variant === 'destructive'
                ? 'text-red-600 hover:bg-red-50 active:bg-red-100'
                : 'text-slate-800 hover:bg-slate-100 active:bg-slate-200'
            }`}
          >
            {action.icon && <span className="shrink-0">{action.icon}</span>}
            {action.label}
          </button>
        ))}

        {/* Cancel button */}
        <button
          onClick={() => {
            haptics.light();
            onClose();
          }}
          className="w-full px-4 py-3.5 rounded-xl text-center font-medium text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors min-h-[52px] mt-2 border-t border-slate-100 pt-4"
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  );
};

export default BottomSheet;
