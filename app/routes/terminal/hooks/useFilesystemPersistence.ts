import { useCallback, useEffect, useRef } from 'react';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import type { FilesystemMode } from '~/routes/terminal/utils/defaultFilesystems';
import { saveFilesystemState } from '~/routes/terminal/utils/persistence';

interface UseFilesystemPersistenceOptions {
  debounceMs?: number;
  maxDebounceMs?: number;
  enableLogs?: boolean;
}

interface FilesystemPersistenceHook {
  saveImmediately: () => Promise<boolean>;
  scheduleAutoSave: () => void;
  cancelPendingSave: () => void;
  isAutoSaveScheduled: () => boolean;
}

/**
 * Hook for intelligent filesystem persistence with optimized saving
 */
export function useFilesystemPersistence(
  filesystem: FileSystemState,
  mode: FilesystemMode,
  options: UseFilesystemPersistenceOptions = {},
): FilesystemPersistenceHook {
  const { debounceMs = 500, maxDebounceMs = 2000, enableLogs = false } = options;

  const timeoutRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(Date.now());
  const lastFilesystemHashRef = useRef<string>('');

  /**
   * Creates a simple hash of the filesystem for change detection
   */
  const createFilesystemHash = useCallback((fs: FileSystemState): string => {
    return JSON.stringify({
      path: fs.currentPath,
      rootModified: fs.root.modifiedAt.getTime(),
      // Simple hash of filesystem structure without full content
      structure: JSON.stringify(fs.root, (key, value) => {
        if (key === 'content' && typeof value === 'string' && value.length > 100) {
          return value.slice(0, 100) + `...${value.length}`;
        }
        return value;
      }),
    });
  }, []);

  /**
   * Performs immediate save without debounce
   */
  const saveImmediately = useCallback(async (): Promise<boolean> => {
    try {
      const result = saveFilesystemState(filesystem.root, mode, filesystem.currentPath);

      if (result.success) {
        lastSaveRef.current = Date.now();
        lastFilesystemHashRef.current = createFilesystemHash(filesystem);

        if (enableLogs && process.env.NODE_ENV === 'development') {
          console.debug('Filesystem saved immediately');
        }
        return true;
      } else {
        console.error('Failed to save filesystem:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error during filesystem save:', error);
      return false;
    }
  }, [filesystem, mode, createFilesystemHash, enableLogs]);

  /**
   * Cancels any pending auto-save
   */
  const cancelPendingSave = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Schedules an auto-save with intelligent timing
   */
  const scheduleAutoSave = useCallback(() => {
    // Cancel any existing timeout
    cancelPendingSave();

    // Check if filesystem has actually changed
    const currentHash = createFilesystemHash(filesystem);
    if (currentHash === lastFilesystemHashRef.current) {
      if (enableLogs && process.env.NODE_ENV === 'development') {
        console.debug('Filesystem unchanged, skipping save');
      }
      return;
    }

    // Calculate timeout based on time since last save
    const timeSinceLastSave = Date.now() - lastSaveRef.current;
    let timeout = debounceMs;

    // If it's been a while since last save, use shorter timeout
    if (timeSinceLastSave > maxDebounceMs) {
      timeout = Math.min(debounceMs, 100);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      // Double-check if filesystem still needs saving
      const latestHash = createFilesystemHash(filesystem);
      if (latestHash !== lastFilesystemHashRef.current) {
        saveImmediately();
      }
    }, timeout) as unknown as number;

    if (enableLogs && process.env.NODE_ENV === 'development') {
      console.debug(`Auto-save scheduled in ${timeout}ms`);
    }
  }, [filesystem, debounceMs, maxDebounceMs, enableLogs, createFilesystemHash, saveImmediately, cancelPendingSave]);

  /**
   * Checks if an auto-save is currently scheduled
   */
  const isAutoSaveScheduled = useCallback(() => {
    return timeoutRef.current !== null;
  }, []);

  // Auto-save effect
  useEffect(() => {
    scheduleAutoSave();

    return () => {
      cancelPendingSave();
    };
  }, [filesystem, mode, scheduleAutoSave, cancelPendingSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPendingSave();
    };
  }, [cancelPendingSave]);

  return {
    saveImmediately,
    scheduleAutoSave,
    cancelPendingSave,
    isAutoSaveScheduled,
  };
}
