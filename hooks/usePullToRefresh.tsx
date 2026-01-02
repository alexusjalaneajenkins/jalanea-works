import React, { useState, useRef, useCallback, useEffect } from 'react';
import { haptics } from '../utils/haptics';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Pull distance to trigger refresh (default: 80px)
  maxPull?: number; // Maximum pull distance (default: 120px)
  disabled?: boolean;
}

interface UsePullToRefreshReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Only enable pull-to-refresh when scrolled to top
    if (container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    hasTriggeredHaptic.current = false;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !isPulling) return;

    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Apply resistance to pull (diminishing returns)
      const resistance = 0.5;
      const pull = Math.min(diff * resistance, maxPull);
      setPullDistance(pull);

      // Trigger haptic when crossing threshold
      if (pull >= threshold && !hasTriggeredHaptic.current) {
        haptics.medium();
        hasTriggeredHaptic.current = true;
      } else if (pull < threshold && hasTriggeredHaptic.current) {
        hasTriggeredHaptic.current = false;
      }

      // Prevent default scroll when pulling down
      if (pull > 10) {
        e.preventDefault();
      }
    }
  }, [disabled, isRefreshing, isPulling, threshold, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      haptics.success();

      try {
        await onRefresh();
      } catch (error) {
        haptics.error();
        console.error('Pull-to-refresh error:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }

    startY.current = 0;
    currentY.current = 0;
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling,
  };
};

/**
 * Pull-to-refresh indicator component
 */
export const PullToRefreshIndicator: React.FC<{
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}> = ({ pullDistance, isRefreshing, threshold = 80 }) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-50 transition-transform duration-200"
      style={{
        top: Math.max(pullDistance - 40, 8),
        opacity: Math.min(pullDistance / 40, 1),
      }}
    >
      <div
        className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center ${
          isRefreshing ? 'animate-spin' : ''
        }`}
      >
        <svg
          className="w-5 h-5 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          style={{ transform: isRefreshing ? 'none' : `rotate(${rotation}deg)` }}
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
    </div>
  );
};

export default usePullToRefresh;
