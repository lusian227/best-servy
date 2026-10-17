// src/repositories/CompanyRepository.ts

import { supabase } from '../lib/supabase';

import { generateUUID } from '../utils/uuid';

import {
  Company,
  CompanyMember,
  CompanyWorkspace,
  CompanyActivity,
  CompanyMetrics,
} from '../types/company';

import {
  loadCompanies,
  saveCompany,
  loadCompanyMembers,
  saveCompanyMember,
  deleteCompanyMember,
  loadCompanyWorkspaces,
  loadCompanyActivity,
  addCompanyActivity,
  getProjects,
  getDecisions,
} from '../lib/storage';

import { RecordService } from '../modules/records/services/RecordService';

import {
  ProjectItem,
  DecisionItem,
} from '../types';

export class CompanyRepository {
  private recordService = new RecordService();

  // ==========================================================
  // CURRENT USER
  // ==========================================================

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.warn('[CompanyRepository] Supabase auth error:', error.message);
        return null;
      }

      if (!data.user) {
        console.warn('[CompanyRepository] No authenticated Supabase user.');
        return null;
      }

      return data.user.id;
    } catch (error) {
      console.warn('[CompanyRepository] Failed to get current user:', error);
      return null;
    }
  }

  // ==========================================================
  // COMPANIES
  // ==========================================================

  async getCompanies(userId?: string): Promise<Company[]> {
    const supabaseUserId = await this.getCurrentUserId();

    if (supabaseUserId) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', supabaseUserId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(this.mapCompany);
        }
      } catch (error) {
        console.warn('[CompanyRepository] Supabase query failed, falling back to localStorage:', error);
      }
    }

    const effectiveUserId =
      supabaseUserId ||
      userId ||
      localStorage.getItem('engineeros_current_user_id');

    if (!effectiveUserId) {
      console.warn('[CompanyRepository] getCompanies called without authenticated user ID.');
      return [];
    }

    const allCompanies = loadCompanies();
    return allCompanies.filter((company) => company.ownerId === effectiveUserId);
  }

  async getCompany(companyId: string): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();

      if (!error && data) {
        return this.mapCompany(data);
      }
    } catch (error) {
      console.warn('[CompanyRepository] Supabase query failed, falling back to localStorage:', error);
    }

    const companies = loadCompanies();
    return companies.find((company) => company.id === companyId) ?? null;
  }

  async createCompany(
    company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
    userId?: string
  ): Promise<Company> {
    try {
      const supabaseUserId = await this.getCurrentUserId();

      if (supabaseUserId) {
        const { data, error } = await supabase
          .from('companies')
          .insert({
            owner_id: supabaseUserId,
            name: company.name,
            description: company.description || null,
            industry: company.industry || null,
            email: company.email || null,
            phone: company.phone || null,
            address: company.address || null,
            logo_url: company.logo || null,
          })
          .select('*')
          .single();

        if (!error && data) {
          return this.mapCompany(data);
        }
      }
    } catch (error) {
      console.warn('[CompanyRepository] Supabase insert failed, falling back to localStorage:', error);
    }

    const effectiveUserId = userId || localStorage.getItem('engineeros_current_user_id');

    if (!effectiveUserId) {
      throw new Error('Cannot create company without authenticated user ID.');
    }

    const newCompany: Company = {
      ...company,
      ownerId: effectiveUserId,
      id: `company-${generateUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const companies = saveCompany(newCompany);
    const created = companies.find((item) => item.id === newCompany.id);

    if (!created) {
      throw new Error('Company was not persisted correctly.');
    }

    return created;
  }

  updateCompany(company: Company): Company {
    const updated = saveCompany(company);
    return updated.find((item) => item.id === company.id)!;
  }

  async getCompaniesByUser(userId: string): Promise<Company[]> {
    return this.getCompanies(userId);
  }

  // ==========================================================
  // MEMBERS
  // ==========================================================

  getMembers(companyId: string): CompanyMember[] {
    return loadCompanyMembers(companyId);
  }

  addMember(
    companyId: string,
    member: Omit<CompanyMember, 'id' | 'companyId'>
  ): CompanyMember {
    const newMember: CompanyMember = {
      ...member,
      id: `member-${generateUUID()}`,
      companyId,
    };

    saveCompanyMember(newMember);
    return newMember;
  }

  removeMember(memberId: string): void {
    deleteCompanyMember(memberId);
  }

  // ==========================================================
  // WORKSPACES - FIXED: Always ensures workspace exists in DB
  // ==========================================================

  async getWorkspaces(
    companyId: string
  ): Promise<CompanyWorkspace[]> {
    if (!companyId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', {
          ascending: true,
        });

      if (error) {
        console.error(
          '[CompanyRepository] Failed to load workspaces from Supabase:',
          error
        );

        throw error;
      }

      // IMPORTANT:
      // If Supabase successfully responds with no workspaces,
      // return an empty array.
      //
      // Do NOT silently use an old localStorage workspace here.
      if (!data || data.length === 0) {
        console.log(
          '[CompanyRepository] No Supabase workspaces found for company:',
          companyId
        );

        return [];
      }

      console.log(
        '[CompanyRepository] Loaded workspaces from Supabase:',
        data.map((workspace) => workspace.id)
      );

      return data.map(
        this.mapWorkspace
      );
    } catch (error) {
      console.warn(
        '[CompanyRepository] Supabase workspace query failed:',
        error
      );

      // Only fall back to localStorage when Supabase itself
      // actually fails, for example offline mode.
      return loadCompanyWorkspaces(
        companyId
      );
    }
  }

  async createWorkspace(
    workspace: Omit<CompanyWorkspace, 'updatedAt'>
  ): Promise<CompanyWorkspace> {
    if (!workspace.companyId) {
      console.error('[CompanyRepository] Cannot create workspace without a companyId:', workspace);
      throw new Error('companyId is required to create a workspace.');
    }

    const workspaceId = workspace.id || generateUUID();

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        id: workspaceId,
        company_id: workspace.companyId,
        name: workspace.name,
        description: workspace.description || '',
      })
      .select('*')
      .single();

    if (error) {
      console.error('[CompanyRepository] Supabase workspace insert failed:', error);
      throw new Error(`Failed to create workspace in database: ${error.message}`);
    }

    console.log('✅ Workspace created in Supabase:', data.id);

    const mappedWorkspace = this.mapWorkspace(data);
    const allStored = JSON.parse(
      localStorage.getItem('engineeros_company_workspaces_v1') || '[]'
    );
    const updated = [mappedWorkspace, ...allStored.filter((w: any) => w.companyId !== workspace.companyId)];
    localStorage.setItem('engineeros_company_workspaces_v1', JSON.stringify(updated));

    return mappedWorkspace;
  }

  // ✅ NEW: Ensure workspace exists, create if missing
  async ensureWorkspace(companyId: string): Promise<CompanyWorkspace> {
    const workspaces = await this.getWorkspaces(companyId);

    if (workspaces.length > 0) {
      return workspaces[0];
    }

    // ✅ Create workspace in Supabase
    const workspace = await this.createWorkspace({
      id: generateUUID(),
      companyId: companyId,
      name: 'Main Workspace',
      description: 'Default workspace for this company',
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Workspace auto-created for company:', companyId);
    return workspace;
  }

  // ==========================================================
  // ACTIVITY
  // ==========================================================

  getActivity(companyId: string): CompanyActivity[] {
    return loadCompanyActivity(companyId);
  }

  addActivity(
    companyId: string,
    type: CompanyActivity['type'],
    message: string,
    userId: string,
    userName: string,
    metadata?: Record<string, any>
  ): CompanyActivity[] {
    return addCompanyActivity({
      companyId,
      type,
      description: message,
      message,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      metadata,
    });
  }

  // ==========================================================
  // METRICS
  // ==========================================================

  async getMetrics(companyId: string): Promise<CompanyMetrics> {
    const members = this.getMembers(companyId);
    const workspaces = await this.getWorkspaces(companyId);

    const allProjects: ProjectItem[] = getProjects();

    const companyProjects = allProjects.filter(
      (project) => project.companyId === companyId
    );

    const allDecisions: DecisionItem[] = getDecisions();

    const companyDecisions = allDecisions.filter(
      (decision) => decision.companyId === companyId
    );

    let totalRecords = 0;

    if (workspaces.length > 0) {
      try {
        const recordResults = await Promise.all(
          workspaces.map((workspace) =>
            this.recordService.getByWorkspace(workspace.id)
          )
        );

        totalRecords = recordResults.reduce(
          (total, records) => total + records.length,
          0
        );
      } catch (error) {
        console.error('Failed to load records for metrics:', error);
      }
    }

    const activeProjects = companyProjects.filter(
      (project) =>
        project.status !== 'Completed' && project.status !== 'Delayed'
    );

    const completionRate =
      companyProjects.length > 0
        ? Math.round(
          (companyProjects.filter(
            (project) => project.status === 'Completed'
          ).length /
            companyProjects.length) *
          100
        )
        : 0;

    const recentActivity = this.getActivity(companyId).slice(0, 10);

    return {
      totalWorkspaces: workspaces.length,
      totalProjects: companyProjects.length,
      totalMembers: members.length,
      totalRecords,
      totalDecisions: companyDecisions.length,
      activeProjects: activeProjects.length,
      completionRate,
      recentActivity,
    };
  }

  // ==========================================================
  // MAPPERS
  // ==========================================================

  private mapCompany(row: any): Company {
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description || undefined,
      industry: row.industry || undefined,
      size: row.size || undefined,
      logo: row.logo_url || undefined,
      website: row.website || undefined,
      email: row.email || undefined,
      phone: row.phone || undefined,
      address: row.address || undefined,
      foundedAt: row.founded_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapWorkspace(row: any): CompanyWorkspace {
    return {
      id: row.id || row.ID,
      companyId: row.company_id || row.companyId,
      name: row.name,
      description: row.description || row.description || '',
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
    };
  }
}