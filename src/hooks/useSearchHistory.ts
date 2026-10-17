// src/hooks/useSearchHistory.ts

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'engineeros_search_history';

export interface SearchHistoryItem {
    id: string;
    query: string;
    timestamp: number;
    resultCount: number;
}

export function useSearchHistory() {
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);

    // Load history from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }, []);

    // Save history to localStorage
    const saveHistory = useCallback((items: SearchHistoryItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }, []);

    // Add a search to history
    const addSearch = useCallback((query: string, resultCount: number) => {
        const newItem: SearchHistoryItem = {
            id: `search-${Date.now()}`,
            query,
            timestamp: Date.now(),
            resultCount,
        };

        setHistory(prev => {
            // Remove duplicates (same query within 5 minutes)
            const filtered = prev.filter(item =>
                item.query.toLowerCase() !== query.toLowerCase() ||
                (Date.now() - item.timestamp) > 300000
            );

            const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50
            saveHistory(updated);
            return updated;
        });
    }, [saveHistory]);

    // Clear history
    const clearHistory = useCallback(() => {
        setHistory([]);
        saveHistory([]);
    }, [saveHistory]);

    // Remove a specific search
    const removeSearch = useCallback((id: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item.id !== id);
            saveHistory(updated);
            return updated;
        });
    }, [saveHistory]);

    return {
        history,
        addSearch,
        clearHistory,
        removeSearch,
    };
}