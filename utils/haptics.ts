/**
 * Haptic feedback utilities for native-like mobile interactions
 * Uses the Vibration API when available
 */

// Check if vibration is supported
const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export const haptics = {
  /**
   * Light tap feedback - for subtle interactions like toggles, selections
   */
  light: () => {
    if (canVibrate) navigator.vibrate(10);
  },

  /**
   * Medium feedback - for button presses, form submissions
   */
  medium: () => {
    if (canVibrate) navigator.vibrate(20);
  },

  /**
   * Heavy feedback - for important actions, confirmations
   */
  heavy: () => {
    if (canVibrate) navigator.vibrate(30);
  },

  /**
   * Success pattern - for completed actions, saves
   */
  success: () => {
    if (canVibrate) navigator.vibrate([10, 50, 20]);
  },

  /**
   * Error pattern - for failed actions, validation errors
   */
  error: () => {
    if (canVibrate) navigator.vibrate([30, 50, 30]);
  },

  /**
   * Warning pattern - for destructive action confirmations
   */
  warning: () => {
    if (canVibrate) navigator.vibrate([20, 30, 20, 30, 20]);
  },

  /**
   * Selection changed - for picker/dropdown changes
   */
  selection: () => {
    if (canVibrate) navigator.vibrate(5);
  },

  /**
   * Impact feedback - for drag release, snap to position
   */
  impact: () => {
    if (canVibrate) navigator.vibrate(15);
  },
};

/**
 * Hook-style wrapper for components that want haptic feedback on click
 */
export const withHaptic = <T extends (...args: any[]) => any>(
  fn: T,
  type: keyof typeof haptics = 'medium'
): T => {
  return ((...args: Parameters<T>) => {
    haptics[type]();
    return fn(...args);
  }) as T;
};

export default haptics;
