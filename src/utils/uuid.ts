// src/utils/uuid.ts

/**
 * Generate a UUID v4
 * Uses crypto.randomUUID() if available, falls back to manual generation
 */
export function generateUUID(): string {
    // Try native crypto.randomUUID first (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for older browsers and devices
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}