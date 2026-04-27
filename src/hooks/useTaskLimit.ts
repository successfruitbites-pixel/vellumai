import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';

/**
 * Custom hook to manage the daily task limit for free users.
 * Reads and writes from local storage using a date key to naturally reset at midnight.
 */
export function useTaskLimit() {
  const isPro = useAppStore((state) => state.isPro);
  const MAX_FREE_TASKS = 5;

  const [count, setCount] = useState(0);

  const getTodayKey = () => {
    return `vellum_tasks_${new Date().toDateString()}`;
  };

  useEffect(() => {
    // Clean up old date keys
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('vellum_tasks_') && key !== getTodayKey()) {
        localStorage.removeItem(key);
      }
    });

    const storedStr = localStorage.getItem(getTodayKey());
    if (storedStr) {
      setCount(parseInt(storedStr, 10));
    } else {
      setCount(0);
      localStorage.setItem(getTodayKey(), '0');
    }
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      localStorage.setItem(getTodayKey(), next.toString());
      return next;
    });
  }, []);

  const remaining = Math.max(0, MAX_FREE_TASKS - count);
  const allowed = isPro || remaining > 0;

  return {
    count,
    remaining,
    allowed,
    increment,
    isPro,
    MAX_FREE_TASKS,
  };
}
