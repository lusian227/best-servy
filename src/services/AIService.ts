// src/services/AIService.ts

import {
    SearchResult,
    AIContext,
    AIResponse,
    AIAction,
} from '../types/ai';
import { getProjects, getDecisions, getDrawings, getNotes } from '../lib/storage';
import { RecordService } from '../modules/records/services/RecordService';
import { AIActionService } from './AIActionService';

const recordService = new RecordService();

// ============================================================
// INTENT DETECTION WITH SCOPE
// ============================================================

interface SearchIntent {
    entity: 'project' | 'drawing' | 'decision' | 'record' | 'note' | 'all';
    scope: 'company' | 'workspace' | 'project' | 'global';
    filters: {
        status?: string;
        projectId?: string;
        workspaceId?: string;
        companyId?: string;
        category?: string;
        discipline?: string;
    };
    sort: {
        field: 'date' | 'relevance' | 'name';
        direction: 'asc' | 'desc';
    };
    searchTerm?: string;
    action: 'search' | 'open' | 'compare' | 'filter';
}

class IntentParser {
    parse(query: string, context: AIContext): SearchIntent {
        const lower = query.toLowerCase().trim();
        const intent: SearchIntent = {
            entity: 'all',
            scope: 'company', // Default to company scope
            filters: {},
            sort: { field: 'relevance', direction: 'desc' },
            action: 'search',
        };

        // ============================================================
        // SCOPE DETECTION
        // ============================================================

        if (lower.includes('global') || lower.includes('all') || lower.includes('everything')) {
            intent.scope = 'global';
        } else if (lower.includes('this project') || lower.includes('current project') || lower.includes('project context')) {
            intent.scope = 'project';
        } else if (lower.includes('this workspace') || lower.includes('current workspace')) {
            intent.scope = 'workspace';
        } else if (lower.includes('company wide') || lower.includes('across the company')) {
            intent.scope = 'company';
        }

        // ============================================================
        // STATUS DETECTION
        // ============================================================

        if (lower.includes('pending') || lower.includes('waiting') || lower.includes('in review')) {
            intent.filters.status = 'Pending';
        }
        if (lower.includes('approved') || lower.includes('accepted') || lower.includes('signed')) {
            intent.filters.status = 'Approved';
        }
        if (lower.includes('rejected') || lower.includes('denied') || lower.includes('cancelled')) {
            intent.filters.status = 'Rejected';
        }
        if (lower.includes('implemented') || lower.includes('completed') || lower.includes('done')) {
            intent.filters.status = 'Implemented';
        }
        if (lower.includes('draft') || lower.includes('in progress')) {
            intent.filters.status = 'Draft';
        }

        // ============================================================
        // ENTITY DETECTION
        // ============================================================

        if (lower.includes('drawing') || lower.includes('drawings') || lower.includes('dwg') || lower.includes('sketch')) {
            intent.entity = 'drawing';
        } else if (lower.includes('decision') || lower.includes('decisions')) {
            intent.entity = 'decision';
        } else if (lower.includes('record') || lower.includes('records') || lower.includes('document')) {
            intent.entity = 'record';
        } else if (lower.includes('project') || lower.includes('projects') || lower.includes('workspace')) {
            intent.entity = 'project';
        } else if (lower.includes('note') || lower.includes('notes')) {
            intent.entity = 'note';
        }

        // ============================================================
        // ACTION DETECTION
        // ============================================================

        if (lower.includes('compare') || lower.includes('diff') || lower.includes('versus')) {
            intent.action = 'compare';
        }
        if (lower.includes('open') || lower.includes('show me') || lower.includes('view')) {
            intent.action = 'open';
        }
        if (lower.includes('filter') || lower.includes('only')) {
            intent.action = 'filter';
        }

        // ============================================================
        // SORT DETECTION
        // ============================================================

        if (lower.includes('latest') || lower.includes('newest') || lower.includes('recent')) {
            intent.sort = { field: 'date', direction: 'desc' };
        }
        if (lower.includes('oldest') || lower.includes('earliest')) {
            intent.sort = { field: 'date', direction: 'asc' };
        }
        if (lower.includes('name') || lower.includes('title') || lower.includes('alphabetical')) {
            intent.sort = { field: 'name', direction: 'asc' };
        }

        // ============================================================
        // SEARCH TERM (for fuzzy matching)
        // ============================================================

        let searchTerm = lower;
        const stopWords = ['pending', 'approved', 'rejected', 'implemented', 'draft',
            'drawing', 'decision', 'record', 'project', 'note', 'documents',
            'show', 'me', 'the', 'latest', 'newest', 'oldest', 'recent',
            'open', 'view', 'filter', 'compare', 'only', 'for', 'this',
            'global', 'all', 'everything', 'company', 'workspace'];
        stopWords.forEach(word => {
            searchTerm = searchTerm.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
        });
        intent.searchTerm = searchTerm.trim() || undefined;

        return intent;
    }
}

export class AIService {
    private actionService = new AIActionService();
    private intentParser = new IntentParser();

    // ============================================================
    // STAGE 1: RETRIEVAL WITH INTENT
    // ============================================================

    async search(query: string, context: AIContext): Promise<SearchResult[]> {
        const intent = this.intentParser.parse(query, context);
        console.log('🎯 Intent parsed:', intent);
        console.log('📋 Context:', context);

        let results: SearchResult[] = [];

        switch (intent.entity) {
            case 'decision':
                results = await this.searchDecisions(intent, context);
                break;
            case 'project':
                results = await this.searchProjects(intent, context);
                break;
            case 'drawing':
                results = await this.searchDrawings(intent, context);
                break;
            case 'record':
                results = await this.searchRecords(intent, context);
                break;
            case 'note':
                results = await this.searchNotes(intent, context);
                break;
            case 'all':
            default:
                results = [
                    ...(await this.searchDecisions(intent, context)),
                    ...(await this.searchProjects(intent, context)),
                    ...(await this.searchDrawings(intent, context)),
                    ...(await this.searchRecords(intent, context)),
                    ...(await this.searchNotes(intent, context)),
                ];
                break;
        }

        // Sort results
        if (intent.sort.field === 'date') {
            results.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return intent.sort.direction === 'desc' ? dateB - dateA : dateA - dateB;
            });
        } else if (intent.sort.field === 'name') {
            results.sort((a, b) => intent.sort.direction === 'desc'
                ? b.title.localeCompare(a.title)
                : a.title.localeCompare(b.title)
            );
        }

        console.log(`📊 Found ${results.length} results after filtering`);
        return results.slice(0, 20);
    }

    // ============================================================
    // SEARCH DECISIONS — WITH DEBUG AND SCOPE
    // ============================================================

    private async searchDecisions(intent: SearchIntent, context: AIContext): Promise<SearchResult[]> {
        const decisions = getDecisions();
        console.log('🔍 === AI DECISION DEBUG ===');
        console.log('📋 All decisions:', decisions.length);

        let filtered = decisions;

        // === DEBUG: Show all decisions with status ===
        console.log('📋 Decision statuses:', decisions.map(d => ({
            id: d.id,
            title: d.title,
            status: d.status,
            companyId: d.companyId,
            projectId: d.projectId,
        })));

        // 1. Filter by status
        if (intent.filters.status) {
            const statusFilter = intent.filters.status.toLowerCase();
            filtered = filtered.filter(d =>
                d.status?.toLowerCase() === statusFilter
            );
            console.log(`📊 After status filter (${intent.filters.status}): ${filtered.length}`);
        }

        // 2. Filter by company (based on scope)
        if (intent.scope === 'company' || intent.scope === 'workspace' || intent.scope === 'project') {
            if (context.companyId) {
                filtered = filtered.filter(d => d.companyId === context.companyId);
                console.log(`📊 After company filter (${context.companyId}): ${filtered.length}`);
            }
        }

        // 3. Filter by project (based on scope)
        if (intent.scope === 'project') {
            if (context.projectId) {
                filtered = filtered.filter(d => d.projectId === context.projectId);
                console.log(`📊 After project filter (${context.projectId}): ${filtered.length}`);
            }
        } else if (intent.filters.projectId) {
            // Explicit project filter (user asked for a specific project)
            filtered = filtered.filter(d => d.projectId === intent.filters.projectId);
            console.log(`📊 After explicit project filter: ${filtered.length}`);
        }

        // 4. Search term (fuzzy match)
        if (intent.searchTerm) {
            const term = intent.searchTerm.toLowerCase();
            filtered = filtered.filter(d =>
                d.title?.toLowerCase().includes(term) ||
                d.reason?.toLowerCase().includes(term) ||
                d.projectName?.toLowerCase().includes(term)
            );
            console.log(`📊 After search term filter ("${term}"): ${filtered.length}`);
        }

        // === DEBUG: Show final results ===
        console.log('📊 Final decisions:', filtered.map(d => ({
            id: d.id,
            title: d.title,
            status: d.status,
        })));

        // Calculate relevance score
        return filtered.map(d => {
            let relevance = 90;

            // Boost if status matches
            if (intent.filters.status && d.status?.toLowerCase() === intent.filters.status.toLowerCase()) {
                relevance += 5;
            }

            // Boost if search term matches title
            if (intent.searchTerm && d.title?.toLowerCase().includes(intent.searchTerm.toLowerCase())) {
                relevance += 3;
            }

            return {
                id: d.id,
                type: 'decision' as const,
                title: d.title || `Decision #${d.decisionNumber}`,
                subtitle: `${d.status || 'Draft'} • ${d.projectName || 'No project'}`,
                companyId: d.companyId,
                projectId: d.projectId,
                status: d.status,
                date: d.date,
                relevance: relevance,
                source: { entityId: d.id, entityType: 'decision' },
            };
        });
    }

    // ============================================================
    // SEARCH PROJECTS
    // ============================================================

    private async searchProjects(intent: SearchIntent, context: AIContext): Promise<SearchResult[]> {
        const projects = getProjects();
        let filtered = projects;

        if (intent.scope === 'company' || intent.scope === 'workspace' || intent.scope === 'project') {
            if (context.companyId) {
                filtered = filtered.filter(p => p.companyId === context.companyId);
            }
        }

        if (intent.scope === 'project') {
            if (context.projectId) {
                filtered = filtered.filter(p => p.id === context.projectId);
            }
        } else if (intent.filters.projectId) {
            filtered = filtered.filter(p => p.id === intent.filters.projectId);
        }

        if (intent.filters.status) {
            const statusMap: Record<string, string[]> = {
                'active': ['In Progress', 'Design Phase', 'Inspection'],
                'pending': ['In Progress', 'Design Phase', 'Inspection'],
                'completed': ['Completed'],
                'delayed': ['Delayed'],
                'in progress': ['In Progress'],
            };
            const statuses = statusMap[intent.filters.status.toLowerCase()];
            if (statuses) {
                filtered = filtered.filter(p => statuses.includes(p.status));
            }
        }

        if (intent.searchTerm) {
            const term = intent.searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.code.toLowerCase().includes(term) ||
                p.location?.toLowerCase().includes(term)
            );
        }

        return filtered.map(p => ({
            id: p.id,
            type: 'project' as const,
            title: p.name,
            subtitle: `${p.code} • ${p.location || 'No location'}`,
            companyId: p.companyId,
            workspaceId: p.workspaceId,
            projectId: p.id,
            status: p.status,
            date: p.updatedAt,
            relevance: 100,
            source: { entityId: p.id, entityType: 'project' },
        }));
    }

    // ============================================================
    // SEARCH DRAWINGS
    // ============================================================

    private async searchDrawings(intent: SearchIntent, context: AIContext): Promise<SearchResult[]> {
        const drawings = getDrawings();
        let filtered = drawings;

        if (intent.scope === 'project' && context.projectId) {
            filtered = filtered.filter(d => d.projectId === context.projectId);
        } else if (intent.filters.projectId) {
            filtered = filtered.filter(d => d.projectId === intent.filters.projectId);
        }

        if (intent.searchTerm) {
            const term = intent.searchTerm.toLowerCase();
            filtered = filtered.filter(d =>
                d.title?.toLowerCase().includes(term) ||
                d.drawingNumber?.toLowerCase().includes(term)
            );
        }

        return filtered.map(d => ({
            id: d.id,
            type: 'drawing' as const,
            title: d.title || d.drawingNumber,
            subtitle: `${d.drawingNumber || 'No number'} • ${d.discipline || 'General'}`,
            projectId: d.projectId,
            status: d.status,
            date: d.createdAt,
            relevance: 95,
            source: { entityId: d.id, entityType: 'drawing' },
        }));
    }

    // ============================================================
    // SEARCH RECORDS
    // ============================================================

    private async searchRecords(intent: SearchIntent, context: AIContext): Promise<SearchResult[]> {
        try {
            const records = await recordService.getRecords({
                workspaceId: intent.scope === 'workspace' || intent.scope === 'project'
                    ? context.workspaceId
                    : undefined,
                projectId: intent.scope === 'project' ? context.projectId : undefined,
                searchTerm: intent.searchTerm,
            });

            let filtered = records;

            if (intent.filters.category) {
                filtered = filtered.filter(r => r.category === intent.filters.category);
            }

            if (intent.filters.status) {
                filtered = filtered.filter(r => r.status === intent.filters.status);
            }

            return filtered.map(r => ({
                id: r.id,
                type: 'record' as const,
                title: r.title || r.recordNumber,
                subtitle: `${r.recordNumber || 'No number'} • ${r.category || 'Uncategorized'}`,

                workspaceId: r.workspaceId || undefined,
                projectId: r.projectId ?? undefined,
                status: r.status,
                date: r.createdAt?.toISOString(),
                relevance: 85,
                source: { entityId: r.id, entityType: 'record' },
            }));
        } catch (error) {
            console.error('Failed to search records:', error);
            return [];
        }
    }

    // ============================================================
    // SEARCH NOTES
    // ============================================================

    private async searchNotes(intent: SearchIntent, context: AIContext): Promise<SearchResult[]> {
        const notes = getNotes();
        let filtered = notes;

        if (intent.searchTerm) {
            const term = intent.searchTerm.toLowerCase();
            filtered = filtered.filter(n =>
                n.title?.toLowerCase().includes(term) ||
                n.content?.toLowerCase().includes(term)
            );
        }

        return filtered.map(n => ({
            id: n.id,
            type: 'note' as const,
            title: n.title || 'Untitled Note',
            subtitle: n.category || 'General',
            date: n.date,
            relevance: 80,
            source: { entityId: n.id, entityType: 'note' },
        }));
    }

    // ============================================================
    // STAGE 2: CONTEXT & AUTHORIZATION
    // ============================================================

    private buildAuthorizedContext(results: SearchResult[], context: AIContext): string {
        const lines: string[] = [];
        lines.push('=== ENGINEEROS AUTHORIZED CONTEXT ===');
        lines.push(`Company: ${context.companyId}`);
        lines.push(`Workspace: ${context.workspaceId}`);
        if (context.projectId) lines.push(`Project: ${context.projectId}`);
        lines.push(`User: ${context.userId}`);
        lines.push(`Authorized Results: ${results.length}`);
        lines.push('');

        if (results.length === 0) {
            lines.push('No authorized results found in this context.');
            return lines.join('\n');
        }

        lines.push('=== AUTHORIZED RESULTS ===');
        results.slice(0, 10).forEach((r, i) => {
            lines.push(`${i + 1}. [${r.type.toUpperCase()}] ${r.title}`);
            if (r.subtitle) lines.push(`   ${r.subtitle}`);
            if (r.status) lines.push(`   Status: ${r.status}`);
            if (r.date) lines.push(`   Date: ${new Date(r.date).toLocaleDateString()}`);
            if (r.projectId) lines.push(`   Project: ${r.projectId}`);
            lines.push(`   Source: ${r.source.entityType} (${r.source.entityId})`);
            lines.push('');
        });

        if (results.length > 10) {
            lines.push(`... and ${results.length - 10} more results.`);
        }

        return lines.join('\n');
    }

    // ============================================================
    // STAGE 3: REASONING
    // ============================================================

    async reason(
        query: string,
        results: SearchResult[],
        context: AIContext
    ): Promise<AIResponse> {
        const intent = this.intentParser.parse(query, context);

        // === STAGE 2 IS NOW CONNECTED! ===
        const authorizedContext = this.buildAuthorizedContext(results, context);
        console.log('🔐 Authorized Context:\n', authorizedContext);

        const answer = this.generateStructuredResponse(query, results, intent);
        const actions = this.actionService.generateActions(results, query);
        const suggestions = this.extractSuggestions(results, query, intent);

        return {
            answer,
            sources: results.slice(0, 5),
            actions,
            suggestions,
            metadata: {
                totalResults: results.length,
                query,
                context,
                responseTime: Date.now(),
            },
        };
    }

    // ============================================================
    // HELPER: Generate Structured Response
    // ============================================================

    private generateStructuredResponse(query: string, results: SearchResult[], intent: SearchIntent): string {
        if (results.length === 0) {
            let suggestion = 'Try adjusting your search terms or scope.';
            if (intent.filters.status) {
                suggestion = `No ${intent.filters.status.toLowerCase()} results found in the current scope. Try changing the scope or status filter.`;
            }
            if (intent.scope === 'project') {
                suggestion = `No results found for this project. Try searching across the entire company.`;
            }
            return `I couldn't find any results for "${query}". ${suggestion}`;
        }

        const entity = intent.entity === 'all' ? 'items' : intent.entity + 's';
        const statusFilter = intent.filters.status ? ` (${intent.filters.status})` : '';
        const scopeText = intent.scope === 'project' ? ' in this project' :
            intent.scope === 'workspace' ? ' in this workspace' :
                intent.scope === 'company' ? ' across the company' : '';

        let response = `I found ${results.length} ${entity}${statusFilter}${scopeText}:\n\n`;

        results.slice(0, 5).forEach((r, i) => {
            response += `${i + 1}. **${r.title}**\n`;
            if (r.subtitle) response += `   ${r.subtitle}\n`;
            if (r.status) response += `   Status: ${r.status}\n`;
            if (r.date) response += `   Date: ${new Date(r.date).toLocaleDateString()}\n`;
            response += `   Type: ${r.type}\n\n`;
        });

        if (results.length > 5) {
            response += `And ${results.length - 5} more results.`;
        }

        return response;
    }

    // ============================================================
    // HELPER: Extract Suggestions
    // ============================================================

    private extractSuggestions(results: SearchResult[], query: string, intent: SearchIntent): string[] {
        const suggestions: string[] = [];

        if (intent.filters.status) {
            suggestions.push(`Show all ${intent.entity}${intent.entity !== 'all' ? 's' : ''}`);
        }
        if (intent.scope === 'project') {
            suggestions.push(`Search across the entire company`);
        } else if (intent.scope === 'company') {
            suggestions.push(`Search in this project`);
        }
        if (results.some(r => r.type === 'drawing')) {
            suggestions.push('Show me the latest drawings');
        }
        if (results.some(r => r.type === 'decision')) {
            suggestions.push('What decisions are pending?');
        }
        if (results.some(r => r.type === 'project')) {
            suggestions.push('Show me project health');
        }
        if (results.some(r => r.type === 'record')) {
            suggestions.push('Show me related records');
        }
        if (results.length > 0) {
            suggestions.push('Search for something else');
        }

        return suggestions;
    }
}