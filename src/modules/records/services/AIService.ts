// src/services/AIService.ts

import { getProjects, getDecisions, getDrawings, getNotes } from '../../../lib/storage';
import { RecordService } from './RecordService';

// ============================================================
// TYPES
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
}

export interface AIContext {
    companyId: string;
    workspaceId: string;
    projectId?: string;
    userId: string;
}

export interface AIResponse {
    answer: string;
    sources: SearchResult[];
    suggestions?: string[];
}

// ============================================================
// AI SERVICE
// ============================================================

export class AIService {
    private recordService = new RecordService();

    // ============================================================
    // STAGE 1: RETRIEVAL
    // ============================================================

    async search(query: string, context: AIContext): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        const lowerQuery = query.toLowerCase().trim();

        if (!lowerQuery) return [];

        // 1. Search Projects
        const projects = getProjects();
        const matchingProjects = projects.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.code.toLowerCase().includes(lowerQuery) ||
            p.location?.toLowerCase().includes(lowerQuery)
        );

        // Filter by context
        const filteredProjects = matchingProjects.filter(p =>
            p.companyId === context.companyId &&
            (context.projectId ? p.id === context.projectId : true)
        );

        results.push(...filteredProjects.map(p => ({
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
        })));

        // 2. Search Decisions
        const decisions = getDecisions();
        const matchingDecisions = decisions.filter(d =>
            d.title?.toLowerCase().includes(lowerQuery) ||
            d.reason?.toLowerCase().includes(lowerQuery)
        );

        const filteredDecisions = matchingDecisions.filter(d =>
            d.companyId === context.companyId &&
            (context.projectId ? d.projectId === context.projectId : true)
        );

        results.push(...filteredDecisions.map(d => ({
            id: d.id,
            type: 'decision' as const,
            title: d.title || `Decision #${d.decisionNumber}`,
            subtitle: `${d.status || 'Draft'} • ${d.projectName || 'No project'}`,
            companyId: d.companyId,
            projectId: d.projectId,
            status: d.status,
            date: d.date,
            relevance: 90,
            source: { entityId: d.id, entityType: 'decision' },
        })));

        // 3. Search Drawings
        const drawings = getDrawings();
        const matchingDrawings = drawings.filter(d =>
            d.title?.toLowerCase().includes(lowerQuery) ||
            d.drawingNumber?.toLowerCase().includes(lowerQuery)
        );

        const filteredDrawings = matchingDrawings.filter(d =>
            (context.projectId ? d.projectId === context.projectId : true)
        );

        results.push(...filteredDrawings.map(d => ({
            id: d.id,
            type: 'drawing' as const,
            title: d.title || d.drawingNumber,
            subtitle: `${d.drawingNumber || 'No number'} • ${d.discipline || 'General'}`,
            projectId: d.projectId,
            status: d.status,
            date: d.createdAt,
            relevance: 95,
            source: { entityId: d.id, entityType: 'drawing' },
        })));

        // 4. Search Records (Supabase)
        try {
            const records = await this.recordService.getRecords({
                workspaceId: context.workspaceId,
                projectId: context.projectId,
                searchTerm: query,
            });

            results.push(...records.map(r => ({
                id: r.id,
                type: 'record' as const,
                title: r.title || r.recordNumber,
                subtitle: `${r.recordNumber || 'No number'} • ${r.category || 'Uncategorized'}`,
                workspaceId: r.workspaceId ?? undefined,
                projectId: r.projectId ?? undefined,
                status: r.status,
                date: r.createdAt?.toISOString(),
                relevance: 85,
                source: { entityId: r.id, entityType: 'record' },
            })));
        } catch (error) {
            console.error('Failed to search records:', error);
        }

        // 5. Search Notes
        const notes = getNotes();
        const matchingNotes = notes.filter(n =>
            n.title?.toLowerCase().includes(lowerQuery) ||
            n.content?.toLowerCase().includes(lowerQuery)
        );

        results.push(...matchingNotes.map(n => ({
            id: n.id,
            type: 'note' as const,
            title: n.title || 'Untitled Note',
            subtitle: n.category || 'General',
            date: n.date,
            relevance: 80,
            source: { entityId: n.id, entityType: 'note' },
        })));

        // Sort by relevance and limit
        results.sort((a, b) => b.relevance - a.relevance);
        return results.slice(0, 20);
    }

    // ============================================================
    // STAGE 2: CONTEXT & AUTHORIZATION
    // ============================================================

    private buildAuthorizedContext(results: SearchResult[], context: AIContext): string {
        const lines: string[] = [];

        lines.push(`Company: ${context.companyId}`);
        lines.push(`Workspace: ${context.workspaceId}`);
        if (context.projectId) lines.push(`Project: ${context.projectId}`);
        lines.push(`User: ${context.userId}`);
        lines.push(`Results found: ${results.length}`);
        lines.push('');

        if (results.length === 0) {
            lines.push('No results found for the given query.');
            return lines.join('\n');
        }

        lines.push('AUTHORIZED RESULTS:');
        results.slice(0, 10).forEach((r, i) => {
            lines.push(`${i + 1}. [${r.type.toUpperCase()}] ${r.title}`);
            if (r.subtitle) lines.push(`   ${r.subtitle}`);
            if (r.status) lines.push(`   Status: ${r.status}`);
            if (r.date) lines.push(`   Date: ${new Date(r.date).toLocaleDateString()}`);
            lines.push(`   Source: ${r.source.entityType} (${r.source.entityId})`);
            lines.push('');
        });

        if (results.length > 10) {
            lines.push(`... and ${results.length - 10} more results.`);
        }

        return lines.join('\n');
    }

    // ============================================================
    // STAGE 3: INTELLIGENCE
    // ============================================================

    async reason(
        query: string,
        results: SearchResult[],
        context: AIContext
    ): Promise<AIResponse> {
        // 1. Build the authorized context
        const authorizedContext = this.buildAuthorizedContext(results, context);

        // 2. Build the prompt
        const prompt = `
You are an AI Engineering Assistant for EngineerOS.

USER QUERY: "${query}"

${authorizedContext}

TASK:
Based on the authorized results above, provide a clear, structured answer.
- Be specific and reference the actual results
- If results exist, summarize them
- If no results, suggest alternative search terms
- Keep your response professional and concise
- Include source references where possible

ANSWER:
`;

        // 3. For now, return structured response (no external API call)
        // The API call will be added when backend is ready
        const answer = this.generateStructuredResponse(query, results);

        // 4. Extract suggestions
        const suggestions = this.extractSuggestions(results);

        return {
            answer,
            sources: results.slice(0, 5),
            suggestions,
        };
    }

    // ============================================================
    // HELPER: Generate Structured Response
    // ============================================================

    private generateStructuredResponse(query: string, results: SearchResult[]): string {
        if (results.length === 0) {
            return `I couldn't find any results for "${query}". Try:
• Checking your spelling
• Using different keywords
• Broadening your search
• Selecting a project context first`;
        }

        const types = new Set(results.map(r => r.type));
        const typeSummary = Array.from(types).map(t =>
            `${t}s: ${results.filter(r => r.type === t).length}`
        ).join(', ');

        let response = `I found ${results.length} results for "${query}":\n\n`;
        response += `📊 Summary: ${typeSummary}\n\n`;

        results.slice(0, 5).forEach((r, i) => {
            response += `${i + 1}. **${r.title}**\n`;
            if (r.subtitle) response += `   ${r.subtitle}\n`;
            if (r.status) response += `   Status: ${r.status}\n`;
            if (r.date) response += `   Date: ${new Date(r.date).toLocaleDateString()}\n`;
            response += `   Type: ${r.type}\n\n`;
        });

        if (results.length > 5) {
            response += `And ${results.length - 5} more results. Would you like to see them?`;
        }

        return response;
    }

    // ============================================================
    // HELPER: Extract Suggestions
    // ============================================================

    private extractSuggestions(results: SearchResult[]): string[] {
        const suggestions: string[] = [];

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

        return suggestions;
    }
}