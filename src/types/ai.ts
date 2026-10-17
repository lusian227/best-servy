// src/types/ai.ts

// ============================================================
// SEARCH RESULT
// ============================================================

export interface SearchResult {
    id: string;
    type: 'project' | 'drawing' | 'decision' | 'record' | 'note' | 'knowledge';
    title: string;
    subtitle?: string;
    companyId?: string;
    workspaceId?: string;
    projectId?: string;
    status?: string;
    date?: string;
    relevance: number;
    source: {
        entityId: string;
        entityType: string;
    };
    metadata?: Record<string, any>;
}

// ============================================================
// AI CONTEXT
// ============================================================

export interface AIContext {
    companyId: string;
    workspaceId: string;
    projectId?: string;
    userId: string;
}

// ============================================================
// AI ACTION
// ============================================================

export type AIActionType =
    | 'open'
    | 'navigate'
    | 'filter'
    | 'search'
    | 'compare'
    | 'inspect'
    | 'show'
    | 'trace'
    | 'summarize'
    | 'view';

export interface AIActionTarget {
    entityType: string;
    entityId: string;
    label?: string;
    metadata?: Record<string, any>;
}

export interface AIAction {
    id: string;
    type: AIActionType;
    label: string;
    description?: string;
    priority: number;
    targets: AIActionTarget[];
    payload?: Record<string, any>;
}

// ============================================================
// AI RESPONSE
// ============================================================

export interface AIResponse {
    answer: string;
    sources: SearchResult[];
    actions: AIAction[];
    suggestions: string[];
    metadata?: {
        totalResults: number;
        query: string;
        context: AIContext;
        responseTime: number;
    };
}

// ============================================================
// AI NAVIGATION CONTEXT
// ============================================================

export interface AINavigationContext {
    navigateToProject: (projectId: string) => void;
    navigateToDrawing: (drawingId: string) => void;
    navigateToRecord: (recordId: string) => void;
    navigateToDecision: (decisionId: string) => void;
    navigateToNote: (noteId: string) => void;
    navigateToKnowledge: (knowledgeId: string) => void;
    setFilter: (type: string | null) => void;
    showAll: () => void;
    runSearch: (query: string) => void;
}