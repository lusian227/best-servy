// src/services/AIActionService.ts

import { SearchResult, AIAction, AIActionTarget } from '../types/ai';

export class AIActionService {
    // ============================================================
    // GENERATE ACTIONS FROM SEARCH RESULTS
    // ============================================================

    generateActions(results: SearchResult[], query: string): AIAction[] {
        const actions: AIAction[] = [];
        let priority = 100;

        // 1. PROJECT ACTIONS
        const projects = results.filter(r => r.type === 'project');
        projects.slice(0, 3).forEach((p) => {
            actions.push({
                id: `action-project-${p.id}`,
                type: 'open',
                label: `Open Project: ${p.title}`,
                description: `Navigate to project ${p.title}`,
                priority: priority--,
                targets: [{
                    entityType: 'project',
                    entityId: p.id,
                    label: p.title,
                    metadata: { project: p },
                }],
            });
        });

        // 2. DRAWING ACTIONS
        const drawings = results.filter(r => r.type === 'drawing');
        drawings.slice(0, 3).forEach((d) => {
            actions.push({
                id: `action-drawing-${d.id}`,
                type: 'open',
                label: `Open Drawing: ${d.title}`,
                description: `View drawing ${d.title}`,
                priority: priority--,
                targets: [{
                    entityType: 'drawing',
                    entityId: d.id,
                    label: d.title,
                    metadata: { drawing: d },
                }],
            });
        });

        // 3. RECORD ACTIONS
        const records = results.filter(r => r.type === 'record');
        records.slice(0, 3).forEach((r) => {
            actions.push({
                id: `action-record-${r.id}`,
                type: 'open',
                label: `View Record: ${r.title}`,
                description: `Open record ${r.title}`,
                priority: priority--,
                targets: [{
                    entityType: 'record',
                    entityId: r.id,
                    label: r.title,
                    metadata: { record: r },
                }],
            });
        });

        // 4. DECISION ACTIONS
        const decisions = results.filter(r => r.type === 'decision');
        decisions.slice(0, 3).forEach((d) => {
            actions.push({
                id: `action-decision-${d.id}`,
                type: 'open',
                label: `View Decision: ${d.title}`,
                description: `Open decision ${d.title}`,
                priority: priority--,
                targets: [{
                    entityType: 'decision',
                    entityId: d.id,
                    label: d.title,
                    metadata: { decision: d },
                }],
            });
        });

        // 5. NOTE ACTIONS
        const notes = results.filter(r => r.type === 'note');
        notes.slice(0, 2).forEach((n) => {
            actions.push({
                id: `action-note-${n.id}`,
                type: 'open',
                label: `View Note: ${n.title}`,
                description: `Open note ${n.title}`,
                priority: priority--,
                targets: [{
                    entityType: 'note',
                    entityId: n.id,
                    label: n.title,
                    metadata: { note: n },
                }],
            });
        });

        // 6. FILTER ACTIONS
        const types = new Set(results.map(r => r.type));
        if (types.size > 1) {
            types.forEach((type) => {
                const count = results.filter(r => r.type === type).length;
                if (count > 0) {
                    actions.push({
                        id: `action-filter-${type}`,
                        type: 'filter',
                        label: `Show only ${type}s (${count})`,
                        description: `Filter results to show only ${type}s`,
                        priority: 50,
                        targets: [],
                        payload: { filterType: type },
                    });
                }
            });
        }

        // 7. SHOW ALL ACTION
        if (results.length > 5) {
            actions.push({
                id: 'action-show-all',
                type: 'view',
                label: `Show all ${results.length} results`,
                description: 'Display all results',
                priority: 40,
                targets: [],
                payload: { showAll: true },
            });
        }

        // 8. COMPARE ACTIONS (if multiple drawings or decisions)
        const multipleDrawings = results.filter(r => r.type === 'drawing');
        if (multipleDrawings.length >= 2) {
            actions.push({
                id: 'action-compare-drawings',
                type: 'compare',
                label: `Compare ${multipleDrawings.length} drawings`,
                description: 'Compare selected drawings',
                priority: 30,
                targets: multipleDrawings.slice(0, 3).map(d => ({
                    entityType: 'drawing',
                    entityId: d.id,
                    label: d.title,
                })),
            });
        }

        // Sort by priority
        actions.sort((a, b) => b.priority - a.priority);
        return actions;
    }

    // ============================================================
    // VALIDATE ACTION
    // ============================================================

    validateAction(action: AIAction): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!action.id) errors.push('Action missing id');
        if (!action.type) errors.push('Action missing type');
        if (!action.label) errors.push('Action missing label');

        if (['open', 'navigate', 'compare'].includes(action.type)) {
            if (!action.targets || action.targets.length === 0) {
                errors.push(`Action type '${action.type}' requires targets`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    // ============================================================
    // EXECUTE ACTION (Pure Intent — No UI Logic)
    // ============================================================

    executeAction(action: AIAction): {
        executed: boolean;
        intent: string;
        targets: AIActionTarget[];
        type: string;
    } {
        const validation = this.validateAction(action);
        if (!validation.valid) {
            console.warn('Invalid action:', validation.errors);
            return {
                executed: false,
                intent: 'invalid',
                targets: [],
                type: action.type,
            };
        }

        // This returns the intent — UI layer handles actual navigation
        return {
            executed: true,
            intent: action.type,
            targets: action.targets,
            type: action.type,
        };
    }
}