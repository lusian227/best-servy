// src/hooks/useAISearch.ts

import { useState, useCallback } from 'react';
import { AIService, SearchResult, AIContext, AIResponse } from '../services/AIService';

const aiService = new AIService();

export function useAISearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (searchQuery: string, context: AIContext) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setAiResponse(null);
            return;
        }

        setLoading(true);
        setError(null);
        setQuery(searchQuery);

        try {
            // Stage 1: Retrieval
            const searchResults = await aiService.search(searchQuery, context);
            setResults(searchResults);

            // Stage 2 & 3: Context + Intelligence
            const response = await aiService.reason(searchQuery, searchResults, context);
            setAiResponse(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setQuery('');
        setResults([]);
        setAiResponse(null);
        setError(null);
    }, []);

    return {
        query,
        results,
        loading,
        aiResponse,
        error,
        search,
        clear,
    };
}