// src/lib/seedData.ts

import { ProjectItem, DecisionItem, NoteItem, MarketplaceListing } from '../types';

// ============================================================
// SAMPLE PROJECTS - ✅ ALL COMPLETE
// ============================================================
export const seedProjects: ProjectItem[] = [
    {
        id: 'proj-1',
        name: 'River Bridge Construction',
        code: 'PRJ-001',
        client: 'Nairobi County',
        contractor: 'XYZ Construction Ltd',
        consultant: 'Arup Consulting',
        location: 'Kilimani, Nairobi',
        status: 'In Progress',
        progress: 45,
        startDate: '2026-01-15',
        expectedCompletion: '2026-12-20',
        budget: 2500000,
        spent: 1125000,
        leadEngineer: 'usr-01',
        companyId: 'company-001',
        workspaceId: 'ws-001',
        health: {
            overall: 85,
            schedule: 80,
            budget: 75,
            safety: 95,
            quality: 90,
            documentation: 70,
            riskLevel: 'Medium',
            openRFIs: 3,
            outstandingApprovals: 2,
            weatherImpactsDays: 4,
            materialShortageRisk: 'Low',
            resourceUtilization: 85,
            aiRecommendations: [
                'Review concrete mix design for cold weather',
                'Schedule rebar inspection for next week'
            ]
        },
        milestones: [],
        team: [],
        drawings: [],
        decisions: ['dec-1', 'dec-2'],
        rfis: [],
        assets: [],
        reports: [],
        recentDecisionsCount: 3,
        image: '',
        createdBy: 'usr-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'proj-2',
        name: 'Highway Expansion Phase 2',
        code: 'PRJ-002',
        client: 'LUSIAN',
        contractor: 'Highway Builders Ltd',
        consultant: 'Mott MacDonald',
        location: 'Nairobi, Kenya',
        status: 'Design Phase',
        progress: 20,
        startDate: '2026-03-01',
        expectedCompletion: '2027-06-30',
        budget: 5000000,
        spent: 1000000,
        leadEngineer: 'usr-02',
        companyId: 'company-001',
        workspaceId: 'ws-001',
        health: {
            overall: 90,
            schedule: 95,
            budget: 85,
            safety: 100,
            quality: 95,
            documentation: 80,
            riskLevel: 'Low',
            openRFIs: 1,
            outstandingApprovals: 0,
            weatherImpactsDays: 0,
            materialShortageRisk: 'Low',
            resourceUtilization: 90,
            aiRecommendations: [
                'Finalize bridge deck design by end of month'
            ]
        },
        milestones: [],
        team: [],
        drawings: [],
        decisions: [],
        rfis: [],
        assets: [],
        reports: [],
        recentDecisionsCount: 1,
        image: '',
        createdBy: 'usr-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'proj-3',
        name: 'Commercial Building - Kilimani',
        code: 'PRJ-003',
        client: 'ABC Developers',
        contractor: 'Kilimani Construction Ltd',
        consultant: 'Buro Happold',
        location: 'Kilimani, Nairobi',
        status: 'Inspection',
        progress: 85,
        startDate: '2025-08-01',
        expectedCompletion: '2026-09-30',
        budget: 8000000,
        spent: 6800000,
        leadEngineer: 'usr-01',
        companyId: 'company-001',
        workspaceId: 'ws-001',
        health: {
            overall: 92,
            schedule: 88,
            budget: 85,
            safety: 100,
            quality: 95,
            documentation: 90,
            riskLevel: 'Low',
            openRFIs: 1,
            outstandingApprovals: 1,
            weatherImpactsDays: 2,
            materialShortageRisk: 'Low',
            resourceUtilization: 95,
            aiRecommendations: [
                'Final inspection scheduled for next week',
                'Prepare handover documentation'
            ]
        },
        milestones: [],
        team: [],
        drawings: [],
        decisions: [],
        rfis: [],
        assets: [],
        reports: [],
        recentDecisionsCount: 5,
        image: '',
        createdBy: 'usr-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// ... rest of seedData.ts (notes, decisions, listings, seedAllData function remains the same)