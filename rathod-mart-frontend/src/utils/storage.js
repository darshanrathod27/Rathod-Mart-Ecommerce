// src/utils/storage.js
// Safe storage utility that handles Safari Private Browsing and iOS restrictions
// Falls back gracefully: localStorage -> sessionStorage -> memory

// In-memory fallback storage
const memoryStorage = {
    _data: {},
    getItem(key) {
        return this._data[key] ?? null;
    },
    setItem(key, value) {
        this._data[key] = String(value);
    },
    removeItem(key) {
        delete this._data[key];
    },
    clear() {
        this._data = {};
    },
};

// Test if storage is available (Safari Private Browsing blocks localStorage)
const isStorageAvailable = (storage) => {
    try {
        const testKey = '__storage_test__';
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
};

// Determine which storage to use
const getAvailableStorage = () => {
    if (typeof window === 'undefined') {
        return memoryStorage;
    }

    // Try localStorage first
    if (isStorageAvailable(window.localStorage)) {
        return window.localStorage;
    }

    // Fall back to sessionStorage
    if (isStorageAvailable(window.sessionStorage)) {
        console.warn('[Storage] localStorage unavailable, using sessionStorage');
        return window.sessionStorage;
    }

    // Fall back to memory storage (Safari Private Browsing, etc.)
    console.warn('[Storage] Browser storage unavailable, using in-memory storage');
    return memoryStorage;
};

// Cache the storage reference
let _storage = null;
const getStorage = () => {
    if (!_storage) {
        _storage = getAvailableStorage();
    }
    return _storage;
};

/**
 * Safe storage API that works in Safari Private Browsing and iOS
 */
const safeStorage = {
    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @returns {string|null} - Stored value or null
     */
    getItem(key) {
        try {
            return getStorage().getItem(key);
        } catch (e) {
            console.warn(`[Storage] Failed to get "${key}":`, e);
            return memoryStorage.getItem(key);
        }
    },

    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     */
    setItem(key, value) {
        try {
            getStorage().setItem(key, value);
        } catch (e) {
            console.warn(`[Storage] Failed to set "${key}":`, e);
            memoryStorage.setItem(key, value);
        }
    },

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     */
    removeItem(key) {
        try {
            getStorage().removeItem(key);
        } catch (e) {
            console.warn(`[Storage] Failed to remove "${key}":`, e);
            memoryStorage.removeItem(key);
        }
    },

    /**
     * Get and parse JSON from storage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found or parse fails
     * @returns {*} - Parsed value or default
     */
    getJSON(key, defaultValue = null) {
        try {
            const item = this.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn(`[Storage] Failed to parse JSON for "${key}":`, e);
            return defaultValue;
        }
    },

    /**
     * Stringify and store JSON in storage
     * @param {string} key - Storage key
     * @param {*} value - Value to stringify and store
     */
    setJSON(key, value) {
        try {
            this.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`[Storage] Failed to stringify JSON for "${key}":`, e);
        }
    },

    /**
     * Check if storage is persistent (localStorage) or temporary (sessionStorage/memory)
     * @returns {boolean} - True if using localStorage
     */
    isPersistent() {
        return getStorage() === window?.localStorage;
    },
};

export default safeStorage;
