// src/stores/companyStore.ts

import { create } from 'zustand';

import {
    Company,
    CompanyMember,
    CompanyWorkspace,
    CompanyActivity,
    CompanyMetrics,
} from '../types/company';

import { CompanyRepository } from '../repositories/CompanyRepository';

const companyRepo = new CompanyRepository();

// ============================================================
// STORE TYPES
// ============================================================

interface CompanyStore {
    companies: Company[];
    activeCompanyId: string | null;
    company: Company | null;
    members: CompanyMember[];
    workspaces: CompanyWorkspace[];
    activity: CompanyActivity[];
    metrics: CompanyMetrics | null;
    loading: boolean;
    error: string | null;

    loadAll: () => Promise<void>;
    loadCompanies: () => Promise<void>;
    loadCompany: (companyId: string) => Promise<void>;
    loadMembers: () => void;
    loadWorkspaces: () => Promise<void>;
    loadActivity: () => void;
    loadMetrics: () => Promise<void>;

    switchCompany: (companyId: string) => Promise<void>;

    createCompany: (
        company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<void>;

    updateCompany: (company: Company) => void;
    addMember: (member: Omit<CompanyMember, 'id' | 'companyId'>) => void;
    removeMember: (memberId: string) => void;
    addActivity: (
        type: CompanyActivity['type'],
        message: string,
        metadata?: Record<string, any>
    ) => void;
}

// ============================================================
// STORE
// ============================================================

export const useCompanyStore = create<CompanyStore>(
    (set, get) => ({

        companies: [],
        activeCompanyId: null,
        company: null,
        members: [],
        workspaces: [],
        activity: [],
        metrics: null,
        loading: false,
        error: null,

        // ======================================================
        // LOAD ALL - WITH AUTO WORKSPACE CREATION
        // ======================================================

        loadAll: async () => {
            set({ loading: true, error: null });

            try {
                const companies = await companyRepo.getCompanies();
                set({ companies });

                let activeCompanyId = localStorage.getItem(
                    'engineeros_active_company_v2'
                );

                if (
                    !activeCompanyId ||
                    !companies.some((c) => c.id === activeCompanyId)
                ) {
                    activeCompanyId = companies.length > 0 ? companies[0].id : null;

                    if (activeCompanyId) {
                        localStorage.setItem(
                            'engineeros_active_company_v2',
                            activeCompanyId
                        );
                    }
                }

                if (!activeCompanyId) {
                    set({
                        activeCompanyId: null,
                        company: null,
                        members: [],
                        workspaces: [],
                        activity: [],
                        metrics: null,
                        loading: false,
                        error: null,
                    });
                    return;
                }

                localStorage.setItem(
                    'engineeros_active_company_v2',
                    activeCompanyId
                );

                const company = await companyRepo.getCompany(activeCompanyId);

                // ✅ Use ensureWorkspace instead of manual check
                const workspace = await companyRepo.ensureWorkspace(activeCompanyId);
                const workspaces = [workspace];

                set({
                    companies,
                    activeCompanyId,
                    company,
                    workspaces,
                    loading: false,
                    error: null,
                });

                console.log('📚 Workspaces loaded:', workspaces);

            } catch (error) {
                console.error('[CompanyStore] loadAll failed:', error);
                set({
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load company data',
                });
            }
        },

        // ======================================================
        // LOAD COMPANIES
        // ======================================================

        loadCompanies: async () => {
            try {
                set({ loading: true, error: null });
                const companies = await companyRepo.getCompanies();
                set({ companies, loading: false, error: null });
            } catch (error) {
                set({
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load companies',
                });
            }
        },

        // ======================================================
        // LOAD COMPANY
        // ======================================================

        loadCompany: async (companyId: string) => {
            try {
                set({ loading: true, error: null });
                const company = await companyRepo.getCompany(companyId);
                set({ company, loading: false, error: null });
            } catch (error) {
                set({
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load company',
                });
            }
        },

        // ======================================================
        // LOAD MEMBERS
        // ======================================================

        loadMembers: () => {
            try {
                const companyId = get().activeCompanyId;
                if (!companyId) return;

                const members = companyRepo.getMembers(companyId);
                set({ members });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load members',
                });
            }
        },

        // ======================================================
        // LOAD WORKSPACES
        // ======================================================

        loadWorkspaces: async () => {
            try {
                const companyId = get().activeCompanyId;

                if (!companyId) {
                    set({ workspaces: [] });
                    return;
                }

                const workspaces = await companyRepo.getWorkspaces(companyId);
                set({ workspaces });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load workspaces',
                });
            }
        },

        // ======================================================
        // LOAD ACTIVITY
        // ======================================================

        loadActivity: () => {
            try {
                const companyId = get().activeCompanyId;
                if (!companyId) return;

                const activity = companyRepo.getActivity(companyId);
                set({ activity });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load activity',
                });
            }
        },

        // ======================================================
        // LOAD METRICS
        // ======================================================

        loadMetrics: async () => {
            try {
                const companyId = get().activeCompanyId;

                if (!companyId) {
                    set({ metrics: null });
                    return;
                }

                const metrics = await companyRepo.getMetrics(companyId);
                set({ metrics });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load metrics',
                });
            }
        },

        // ======================================================
        // SWITCH COMPANY - WITH AUTO WORKSPACE
        // ======================================================

        switchCompany: async (companyId: string) => {
            const exists = get().companies.some((c) => c.id === companyId);

            if (!exists) {
                console.warn(`Company ${companyId} not found`);
                return;
            }

            set({ loading: true, error: null });
            localStorage.setItem('engineeros_active_company_v2', companyId);

            try {
                const company = await companyRepo.getCompany(companyId);

                // ✅ Use ensureWorkspace
                const workspace = await companyRepo.ensureWorkspace(companyId);
                const workspaces = [workspace];

                set({
                    activeCompanyId: companyId,
                    company,
                    workspaces,
                    loading: false,
                    error: null,
                });

                console.log(`✅ Switched to company: ${company?.name} (${companyId})`);
                console.log('📚 Workspaces loaded:', workspaces);

            } catch (error) {
                console.error('[CompanyStore] switchCompany failed:', error);
                set({
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to switch company',
                });
            }
        },

        // ======================================================
        // CREATE COMPANY - WITH AUTO WORKSPACE
        // ======================================================

        createCompany: async (
            company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
        ) => {
            try {
                set({ loading: true, error: null });

                const newCompany = await companyRepo.createCompany(company);

                set((state) => ({
                    companies: [...state.companies, newCompany],
                }));

                // ✅ switchCompany will auto-create workspace
                await get().switchCompany(newCompany.id);

                console.log(`✅ Company created: ${newCompany.name} (${newCompany.id})`);

            } catch (error) {
                set({
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to create company',
                });
            }
        },

        // ======================================================
        // UPDATE COMPANY
        // ======================================================

        updateCompany: (company) => {
            try {
                const updated = companyRepo.updateCompany(company);

                set((state) => ({
                    companies: state.companies.map((c) =>
                        c.id === updated.id ? updated : c
                    ),
                    company: updated,
                    error: null,
                }));
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to update company',
                });
            }
        },

        // ======================================================
        // MEMBERS
        // ======================================================

        addMember: (member) => {
            try {
                const companyId = get().activeCompanyId;

                if (!companyId) {
                    throw new Error('No company loaded');
                }

                const newMember = companyRepo.addMember(companyId, member);

                set((state) => ({
                    members: [...state.members, newMember],
                }));
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to add member',
                });
            }
        },

        removeMember: (memberId) => {
            try {
                companyRepo.removeMember(memberId);

                set((state) => ({
                    members: state.members.filter((m) => m.id !== memberId),
                }));
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to remove member',
                });
            }
        },

        // ======================================================
        // ACTIVITY
        // ======================================================

        addActivity: (type, message, metadata) => {
            try {
                const companyId = get().activeCompanyId;

                if (!companyId) return;

                const member = get().members[0];

                const activity = companyRepo.addActivity(
                    companyId,
                    type,
                    message,
                    member?.userId || 'system',
                    member?.name || 'System',
                    metadata
                );

                set({ activity });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to add activity',
                });
            }
        },
    })
);