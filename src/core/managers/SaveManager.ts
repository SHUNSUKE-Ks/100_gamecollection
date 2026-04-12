// ============================================
// NanoNovel - Save Manager
// ============================================

// ===== CONFIGURATION =====
// Change this value to increase/decrease save slots
export const SAVE_SLOT_COUNT = 4;

// ===== TYPES =====
export interface SaveData {
    storyID: string;
    flags: Record<string, unknown>;
    inventory: { itemID: string; count: number }[];
    playTime: number; // seconds
    savedAt: string;  // ISO date string
    screenshot?: string; // base64 thumbnail (optional)
    chapterTitle?: string;
}

export interface SaveSlotInfo {
    slot: number;
    isEmpty: boolean;
    data?: SaveData;
}

// ===== CONSTANTS =====
const STORAGE_KEY_PREFIX = 'nanonovel_save_';
const AUTO_SAVE_KEY = 'nanonovel_autosave';

// ===== SAVE MANAGER CLASS =====
class SaveManagerClass {
    private storageAvailable: boolean;

    constructor() {
        this.storageAvailable = this.checkStorageAvailability();
    }

    /**
     * Check if localStorage is available
     */
    private checkStorageAvailability(): boolean {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            console.warn('localStorage is not available. Save/Load disabled.');
            return false;
        }
    }

    /**
     * Get storage key for a slot
     */
    private getSlotKey(slot: number): string {
        return `${STORAGE_KEY_PREFIX}${slot}`;
    }

    /**
     * Save game to a specific slot
     */
    save(slot: number, data: SaveData): boolean {
        if (!this.storageAvailable) return false;
        if (slot < 0 || slot >= SAVE_SLOT_COUNT) {
            console.error(`Invalid save slot: ${slot}. Must be 0-${SAVE_SLOT_COUNT - 1}`);
            return false;
        }

        try {
            const saveData: SaveData = {
                ...data,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(this.getSlotKey(slot), JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save:', error);
            return false;
        }
    }

    /**
     * Load game from a specific slot
     */
    load(slot: number): SaveData | null {
        if (!this.storageAvailable) return null;
        if (slot < 0 || slot >= SAVE_SLOT_COUNT) {
            console.error(`Invalid save slot: ${slot}. Must be 0-${SAVE_SLOT_COUNT - 1}`);
            return null;
        }

        try {
            const raw = localStorage.getItem(this.getSlotKey(slot));
            if (!raw) return null;
            return JSON.parse(raw) as SaveData;
        } catch (error) {
            console.error('Failed to load:', error);
            return null;
        }
    }

    /**
     * Delete save from a specific slot
     */
    delete(slot: number): boolean {
        if (!this.storageAvailable) return false;
        if (slot < 0 || slot >= SAVE_SLOT_COUNT) return false;

        try {
            localStorage.removeItem(this.getSlotKey(slot));
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }

    /**
     * Auto-save (uses a special slot)
     */
    autoSave(data: SaveData): boolean {
        if (!this.storageAvailable) return false;

        try {
            const saveData: SaveData = {
                ...data,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to auto-save:', error);
            return false;
        }
    }

    /**
     * Load auto-save
     */
    loadAutoSave(): SaveData | null {
        if (!this.storageAvailable) return null;

        try {
            const raw = localStorage.getItem(AUTO_SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as SaveData;
        } catch (error) {
            console.error('Failed to load auto-save:', error);
            return null;
        }
    }

    /**
     * Get all save slot info
     */
    listSaves(): SaveSlotInfo[] {
        const slots: SaveSlotInfo[] = [];

        for (let i = 0; i < SAVE_SLOT_COUNT; i++) {
            const data = this.load(i);
            slots.push({
                slot: i,
                isEmpty: data === null,
                data: data || undefined,
            });
        }

        return slots;
    }

    /**
     * Check if any save exists
     */
    hasSaveData(): boolean {
        for (let i = 0; i < SAVE_SLOT_COUNT; i++) {
            if (this.load(i) !== null) return true;
        }
        return this.loadAutoSave() !== null;
    }

    /**
     * Format date for display
     */
    formatDate(isoString: string): string {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoString;
        }
    }

    /**
     * Format play time for display
     */
    formatPlayTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

// Singleton instance
export const SaveManager = new SaveManagerClass();
