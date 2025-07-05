import type { FileSystemNode } from '~/routes/terminal/types/filesystem';

import type { FilesystemMode } from './defaultFilesystems';
import { getFilesystemByMode } from './defaultFilesystems';

// Re-export FilesystemMode for external use
export type { FilesystemMode };

/**
 * Storage configuration for the terminal emulator persistence system.
 * These constants define the localStorage keys and versioning.
 */
const STORAGE_CONFIG = {
  FILESYSTEM_KEY: 'terminal-emulator-filesystem',
  MODE_KEY: 'terminal-emulator-mode',
  VERSION_KEY: 'terminal-emulator-version',
  CURRENT_VERSION: '1.0.0',
} as const;

/**
 * Interface for the persisted filesystem data structure.
 * This includes the filesystem tree, current mode, and metadata.
 */
interface PersistedFilesystemData {
  filesystem: FileSystemNode;
  mode: FilesystemMode;
  version: string;
  savedAt: string;
  currentPath: string[];
}

/**
 * Result type for persistence operations.
 * Provides success/failure information and optional error details.
 */
interface PersistenceResult {
  success: boolean;
  error?: string;
  data?: PersistedFilesystemData;
}

/**
 * Saves the current filesystem state to localStorage.
 *
 * @param filesystem - The filesystem tree to save
 * @param mode - The current filesystem mode
 * @param currentPath - The current directory path
 * @returns PersistenceResult indicating success or failure
 */
export function saveFilesystemState(filesystem: FileSystemNode, mode: FilesystemMode, currentPath: string[]): PersistenceResult {
  try {
    const data: PersistedFilesystemData = {
      filesystem,
      mode,
      version: STORAGE_CONFIG.CURRENT_VERSION,
      savedAt: new Date().toISOString(),
      currentPath,
    };

    localStorage.setItem(STORAGE_CONFIG.FILESYSTEM_KEY, JSON.stringify(data));

    return { success: true, data };
  } catch (error) {
    console.error('Failed to save filesystem state:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Loads the filesystem state from localStorage.
 *
 * @returns PersistenceResult with the loaded filesystem data or error
 */
export function loadFilesystemState(): PersistenceResult {
  try {
    const stored = localStorage.getItem(STORAGE_CONFIG.FILESYSTEM_KEY);

    if (!stored) {
      return {
        success: false,
        error: 'No saved filesystem state found',
      };
    }

    const data: PersistedFilesystemData = JSON.parse(stored);

    // Validate the data structure
    if (!isValidPersistedData(data)) {
      return {
        success: false,
        error: 'Invalid saved filesystem data format',
      };
    }

    // Check version compatibility
    if (data.version !== STORAGE_CONFIG.CURRENT_VERSION) {
      console.warn(`Version mismatch: saved ${data.version}, current ${STORAGE_CONFIG.CURRENT_VERSION}`);

      // Attempt to migrate data
      const migrationResult = migrateFilesystemData(data);
      if (!migrationResult.success) {
        return migrationResult;
      }

      data.version = STORAGE_CONFIG.CURRENT_VERSION;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to load filesystem state:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse saved data',
    };
  }
}

/**
 * Clears the saved filesystem state from localStorage.
 * This is used when resetting to default filesystem.
 *
 * @returns PersistenceResult indicating success or failure
 */
export function clearFilesystemState(): PersistenceResult {
  try {
    localStorage.removeItem(STORAGE_CONFIG.FILESYSTEM_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear filesystem state:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear saved data',
    };
  }
}

/**
 * Checks if there is a saved filesystem state in localStorage.
 *
 * @returns boolean indicating if saved state exists
 */
export function hasSavedFilesystemState(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_CONFIG.FILESYSTEM_KEY);
    return stored !== null;
  } catch (error) {
    console.error('Failed to check for saved filesystem state:', error);
    return false;
  }
}

/**
 * Saves the current filesystem mode to localStorage.
 * This is used to remember the last used mode across browser sessions.
 *
 * @param mode - The filesystem mode to save
 * @returns boolean indicating success
 */
export function saveCurrentMode(mode: FilesystemMode): boolean {
  try {
    localStorage.setItem(STORAGE_CONFIG.MODE_KEY, mode);
    return true;
  } catch (error) {
    console.error('Failed to save current mode:', error);
    return false;
  }
}

/**
 * Loads the previously saved filesystem mode from localStorage.
 *
 * @returns The saved mode or 'default' if none exists
 */
export function loadCurrentMode(): FilesystemMode {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG.MODE_KEY);
    return (saved === 'portfolio' ? 'portfolio' : 'default') as FilesystemMode;
  } catch (error) {
    console.error('Failed to load current mode:', error);
    return 'default';
  }
}

/**
 * Initializes the filesystem with either saved state or default state.
 * This is the main function used when the terminal starts up.
 *
 * @param preferredMode - The preferred filesystem mode if no saved state exists
 * @returns Object containing filesystem, mode, and current path
 */
export function initializeFilesystem(preferredMode: FilesystemMode = 'default'): {
  filesystem: FileSystemNode;
  mode: FilesystemMode;
  currentPath: string[];
} {
  const loadResult = loadFilesystemState();

  if (loadResult.success && loadResult.data) {
    // Use saved state
    return {
      filesystem: loadResult.data.filesystem,
      mode: loadResult.data.mode,
      currentPath: loadResult.data.currentPath,
    };
  } else {
    // Use default state
    const mode = preferredMode || loadCurrentMode();
    return {
      filesystem: getFilesystemByMode(mode),
      mode,
      currentPath: ['home', 'user'],
    };
  }
}

/**
 * Resets the filesystem to the default state for the specified mode.
 * This clears any saved state and initializes a fresh filesystem.
 *
 * @param mode - The filesystem mode to reset to
 * @returns Object containing the fresh filesystem state
 */
export function resetToDefaultFilesystem(mode: FilesystemMode): {
  filesystem: FileSystemNode;
  mode: FilesystemMode;
  currentPath: string[];
} {
  // Clear saved state
  clearFilesystemState();

  // Save the new mode
  saveCurrentMode(mode);

  // Return fresh filesystem
  return {
    filesystem: getFilesystemByMode(mode),
    mode,
    currentPath: ['home', 'user'],
  };
}

/**
 * Switches to a different filesystem mode.
 * This preserves the current filesystem state before switching.
 *
 * @param newMode - The mode to switch to
 * @param currentFilesystem - The current filesystem state (optional, for backup)
 * @param currentPath - The current directory path (optional, for backup)
 * @returns Object containing the new filesystem state
 */
export function switchFilesystemMode(
  newMode: FilesystemMode,
  currentFilesystem?: FileSystemNode,
  currentPath?: string[],
): {
  filesystem: FileSystemNode;
  mode: FilesystemMode;
  currentPath: string[];
} {
  // Save current state as backup if provided
  if (currentFilesystem && currentPath) {
    const currentMode = loadCurrentMode();
    const backupKey = `${STORAGE_CONFIG.FILESYSTEM_KEY}-backup-${currentMode}`;

    try {
      const backupData = {
        filesystem: currentFilesystem,
        mode: currentMode,
        version: STORAGE_CONFIG.CURRENT_VERSION,
        savedAt: new Date().toISOString(),
        currentPath,
      };

      localStorage.setItem(backupKey, JSON.stringify(backupData));
    } catch (error) {
      console.warn('Failed to create backup of current filesystem:', error);
    }
  }

  // Clear current state
  clearFilesystemState();

  // Save new mode
  saveCurrentMode(newMode);

  // Return new filesystem
  return {
    filesystem: getFilesystemByMode(newMode),
    mode: newMode,
    currentPath: ['home', 'user'],
  };
}

/**
 * Gets storage usage information for the terminal emulator.
 * This helps users understand how much browser storage is being used.
 *
 * @returns Object containing storage statistics
 */
export function getStorageInfo(): {
  totalSize: number;
  filesystemSize: number;
  hasBackups: boolean;
  lastSaved?: string;
} {
  try {
    let totalSize = 0;
    let filesystemSize = 0;
    let hasBackups = false;
    let lastSaved: string | undefined;

    // Check all localStorage keys for terminal emulator data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('terminal-emulator-')) {
        const value = localStorage.getItem(key);
        if (value) {
          const size = value.length;
          totalSize += size;

          if (key === STORAGE_CONFIG.FILESYSTEM_KEY) {
            filesystemSize = size;
            try {
              const data = JSON.parse(value);
              lastSaved = data.savedAt;
            } catch (error) {
              // Ignore parsing errors for metadata
            }
          } else if (key.includes('-backup-')) {
            hasBackups = true;
          }
        }
      }
    }

    return {
      totalSize,
      filesystemSize,
      hasBackups,
      lastSaved,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      totalSize: 0,
      filesystemSize: 0,
      hasBackups: false,
    };
  }
}

/**
 * Validates the structure of persisted filesystem data.
 * This ensures data integrity when loading from localStorage.
 *
 * @param data - The data to validate
 * @returns boolean indicating if the data is valid
 */
function isValidPersistedData(data: any): data is PersistedFilesystemData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.filesystem === 'object' &&
    data.filesystem !== null &&
    typeof data.filesystem.name === 'string' &&
    typeof data.filesystem.type === 'string' &&
    typeof data.mode === 'string' &&
    typeof data.version === 'string' &&
    typeof data.savedAt === 'string' &&
    Array.isArray(data.currentPath) &&
    data.currentPath.every((path: any) => typeof path === 'string')
  );
}

/**
 * Migrates filesystem data from older versions to the current version.
 * This ensures backward compatibility when the data format changes.
 *
 * @param data - The data to migrate
 * @returns PersistenceResult indicating success or failure
 */
function migrateFilesystemData(data: PersistedFilesystemData): PersistenceResult {
  try {
    // Currently no migrations needed since this is version 1.0.0
    // Future migrations would go here

    // Example migration logic:
    // if (data.version === '0.9.0') {
    //   // Migrate from 0.9.0 to 1.0.0
    //   data = migrate_0_9_0_to_1_0_0(data);
    // }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to migrate filesystem data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed',
    };
  }
}

/**
 * Exports filesystem data to a JSON string for backup or transfer.
 * This can be used to share filesystem states between users or devices.
 *
 * @param filesystem - The filesystem to export
 * @param mode - The current mode
 * @param currentPath - The current directory path
 * @returns JSON string representation of the filesystem
 */
export function exportFilesystemData(filesystem: FileSystemNode, mode: FilesystemMode, currentPath: string[]): string {
  const data: PersistedFilesystemData = {
    filesystem,
    mode,
    version: STORAGE_CONFIG.CURRENT_VERSION,
    savedAt: new Date().toISOString(),
    currentPath,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Imports filesystem data from a JSON string.
 * This allows users to restore from exported data.
 *
 * @param jsonData - The JSON string to import
 * @returns PersistenceResult with the imported data or error
 */
export function importFilesystemData(jsonData: string): PersistenceResult {
  try {
    const data = JSON.parse(jsonData);

    if (!isValidPersistedData(data)) {
      return {
        success: false,
        error: 'Invalid filesystem data format',
      };
    }

    // Save the imported data
    localStorage.setItem(STORAGE_CONFIG.FILESYSTEM_KEY, jsonData);

    return { success: true, data };
  } catch (error) {
    console.error('Failed to import filesystem data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON data',
    };
  }
}
