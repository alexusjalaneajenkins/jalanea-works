import React, { useState, useRef, useCallback, useEffect } from 'react';
import { haptics } from '../utils/haptics';

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
  threshold?: number; // Minimum distance to trigger swipe (default: 50px)
  velocityThreshold?: number; // Minimum velocity to trigger swipe (default: 0.3)
  preventDefaultOnSwipe?: boolean;
  hapticFeedback?: boolean;
}

interface UseSwipeGestureReturn {
  ref: React.RefObject<HTMLDivElement>;
  swipeProgress: { x: number; y: number };
  isSwiping: boolean;
  direction: SwipeDirection | null;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipe,
  threshold = 50,
  velocityThreshold = 0.3,
  preventDefaultOnSwipe = false,
  hapticFeedback = true,
}: UseSwipeGestureOptions): UseSwipeGestureReturn => {
  const ref = useRef<HTMLDivElement>(null);
  const [swipeProgress, setSwipeProgress] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [direction, setDirection] = useState<SwipeDirection | null>(null);

  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const hasTriggered = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startTime.current = Date.now();
    hasTriggered.current = false;
    setIsSwiping(true);
    setDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;

    setSwipeProgress({ x: deltaX, y: deltaY });

    // Determine dominant direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY && absX > 10) {
      setDirection(deltaX > 0 ? 'right' : 'left');
    } else if (absY > absX && absY > 10) {
      setDirection(deltaY > 0 ? 'down' : 'up');
    }

    if (preventDefaultOnSwipe && (absX > 10 || absY > 10)) {
      e.preventDefault();
    }
  }, [isSwiping, preventDefaultOnSwipe]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isSwiping || hasTriggered.current) {
      setIsSwiping(false);
      setSwipeProgress({ x: 0, y: 0 });
      setDirection(null);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    const deltaTime = Date.now() - startTime.current;

    // Calculate velocity (pixels per ms)
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    let triggered = false;

    // Horizontal swipe
    if (absX > absY && (absX > threshold || velocityX > velocityThreshold)) {
      if (deltaX > 0 && onSwipeRight) {
        if (hapticFeedback) haptics.impact();
        onSwipeRight();
        onSwipe?.('right');
        triggered = true;
      } else if (deltaX < 0 && onSwipeLeft) {
        if (hapticFeedback) haptics.impact();
        onSwipeLeft();
        onSwipe?.('left');
        triggered = true;
      }
    }

    // Vertical swipe
    if (absY > absX && (absY > threshold || velocityY > velocityThreshold)) {
      if (deltaY > 0 && onSwipeDown) {
        if (hapticFeedback) haptics.impact();
        onSwipeDown();
        onSwipe?.('down');
        triggered = true;
      } else if (deltaY < 0 && onSwipeUp) {
        if (hapticFeedback) haptics.impact();
        onSwipeUp();
        onSwipe?.('up');
        triggered = true;
      }
    }

    hasTriggered.current = triggered;
    setIsSwiping(false);
    setSwipeProgress({ x: 0, y: 0 });
    setDirection(null);
  }, [isSwiping, threshold, velocityThreshold, hapticFeedback, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultOnSwipe });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefaultOnSwipe]);

  return {
    ref,
    swipeProgress,
    isSwiping,
    direction,
  };
};

/**
 * Hook for swipe-to-dismiss modal/sheet behavior
 */
export const useSwipeToDismiss = (
  onDismiss: () => void,
  options?: { threshold?: number; direction?: 'down' | 'up' }
) => {
  const { threshold = 100, direction = 'down' } = options || {};

  return useSwipeGesture({
    [direction === 'down' ? 'onSwipeDown' : 'onSwipeUp']: onDismiss,
    threshold,
    hapticFeedback: true,
    preventDefaultOnSwipe: true,
  });
};

/**
 * Hook for swipe-to-action on list items (like swipe to delete)
 */
export const useSwipeActions = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 80
) => {
  return useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    threshold,
    hapticFeedback: true,
    preventDefaultOnSwipe: true,
  });
};

export default useSwipeGesture;
