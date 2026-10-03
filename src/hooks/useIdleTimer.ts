import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeoutMs?: number; // Defaults to 30 minutes (30 * 60 * 1000)
  onIdle: () => void;
  enabled?: boolean;
}

/**
 * useIdleTimer Hook
 * Automatically invokes onIdle when the user has been inactive for the specified duration.
 * Detects mouse, keyboard, touch, and scroll interactions.
 */
export const useIdleTimer = ({
  timeoutMs = 30 * 60 * 1000, // 30 minutes default
  onIdle,
  enabled = true,
}: UseIdleTimerOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onIdleRef.current();
    }, timeoutMs);
  }, [enabled, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Set initial timer
    resetTimer();

    // Event listeners for user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    let lastActivityTime = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      // Throttle event handling to once every 2 seconds to reduce CPU overhead
      if (now - lastActivityTime > 2000) {
        lastActivityTime = now;
        resetTimer();
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimer]);
};
