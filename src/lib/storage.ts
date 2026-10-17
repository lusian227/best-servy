// src/lib/storage.ts

import { generateUUID } from '../utils/uuid';

import {
  DecisionItem,
  LessonItem,
  NoteItem,
  CalculationHistory,
  ProjectItem,
  MarketplaceListing,
  SiteDiaryEntry,
  DrawingItem,
} from '../types';
import {
  sampleDecisions,
  sampleLessons,
  sampleNotes,
  sampleCalculations,
  sampleProjects,
  sampleListings,
  sampleSiteDiaries,
  sampleDrawings,
} from '../data/mockData';

const KEYS = {
  DECISIONS: 'engineeros_decisions_v6',
  LESSONS: 'engineeros_lessons_v6',
  NOTES: 'engineeros_notes_v6',
  CALCS: 'engineeros_calcs_v6',
  PROJECTS: 'engineeros_projects_v6',
  LISTINGS: 'engineeros_listings_v6',
  DIARIES: 'engineeros_diaries_v6',
  DRAWINGS: 'engineeros_drawings_v6',
  COMPANIES: 'engineeros_companies_v1',
  COMPANY_MEMBERS: 'engineeros_company_members_v1',
  COMPANY_WORKSPACES: 'engineeros_company_workspaces_v1',
  COMPANY_ACTIVITY: 'engineeros_company_activity_v1',
};

// ============================================================
// DECISIONS
// ============================================================
export const loadDecisions = (): DecisionItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.DECISIONS);
    if (!raw) {
      localStorage.setItem(KEYS.DECISIONS, JSON.stringify(sampleDecisions));
      return sampleDecisions;
    }
    return JSON.parse(raw);
  } catch {
    return sampleDecisions;
  }
};

export const saveDecision = (decision: DecisionItem): DecisionItem[] => {
  const current = loadDecisions();
  const existsIndex = current.findIndex((d) => d.id === decision.id);
  let updated: DecisionItem[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = decision;
  } else {
    updated = [decision, ...current];
  }
  localStorage.setItem(KEYS.DECISIONS, JSON.stringify(updated));
  return updated;
};

// ============================================================
// LESSONS
// ============================================================
export const loadLessons = (): LessonItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.LESSONS);
    if (!raw) {
      localStorage.setItem(KEYS.LESSONS, JSON.stringify(sampleLessons));
      return sampleLessons;
    }
    return JSON.parse(raw);
  } catch {
    return sampleLessons;
  }
};

export const saveLesson = (lesson: LessonItem): LessonItem[] => {
  const current = loadLessons();
  const updated = [lesson, ...current];
  localStorage.setItem(KEYS.LESSONS, JSON.stringify(updated));
  return updated;
};

// ============================================================
// NOTES
// ============================================================
export const loadNotes = (): NoteItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    if (!raw) {
      localStorage.setItem(KEYS.NOTES, JSON.stringify(sampleNotes));
      return sampleNotes;
    }
    return JSON.parse(raw);
  } catch {
    return sampleNotes;
  }
};

export const saveNote = (note: NoteItem): NoteItem[] => {
  const current = loadNotes();
  const idx = current.findIndex((n) => n.id === note.id);
  let updated: NoteItem[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = note;
  } else {
    updated = [note, ...current];
  }
  localStorage.setItem(KEYS.NOTES, JSON.stringify(updated));
  return updated;
};

// ============================================================
// CALCULATIONS
// ============================================================
export const loadCalculations = (): CalculationHistory[] => {
  try {
    const raw = localStorage.getItem(KEYS.CALCS);
    if (!raw) {
      localStorage.setItem(KEYS.CALCS, JSON.stringify(sampleCalculations));
      return sampleCalculations;
    }
    return JSON.parse(raw);
  } catch {
    return sampleCalculations;
  }
};

export const saveCalculation = (calc: CalculationHistory): CalculationHistory[] => {
  const current = loadCalculations();
  const updated = [calc, ...current];
  localStorage.setItem(KEYS.CALCS, JSON.stringify(updated));
  return updated;
};

// ============================================================
// PROJECTS
// ============================================================
export const loadProjects = (): ProjectItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(sampleProjects));
      return sampleProjects;
    }
    return JSON.parse(raw);
  } catch {
    return sampleProjects;
  }
};

export const saveProject = (project: ProjectItem): ProjectItem[] => {
  const current = loadProjects();
  const idx = current.findIndex((p) => p.id === project.id);
  let updated: ProjectItem[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = project;
  } else {
    updated = [project, ...current];
  }
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(updated));
  return updated;
};

// ============================================================
// ✅ PROJECTS WITH CONTEXT FILTERING (ADDED)
// ============================================================

export const loadProjectsByWorkspace = (workspaceId: string): ProjectItem[] => {
  const allProjects = loadProjects();
  return allProjects.filter((p) => p.workspaceId === workspaceId);
};

export const loadProjectsByCompany = (companyId: string): ProjectItem[] => {
  const allProjects = loadProjects();
  return allProjects.filter((p) => p.companyId === companyId);
};

export const loadProjectsByUser = (userId: string): ProjectItem[] => {
  const allProjects = loadProjects();
  return allProjects.filter((p) => p.createdBy === userId);
};

// ============================================================
// LISTINGS
// ============================================================
export const loadListings = (): MarketplaceListing[] => {
  try {
    const raw = localStorage.getItem(KEYS.LISTINGS);
    if (!raw) {
      localStorage.setItem(KEYS.LISTINGS, JSON.stringify(sampleListings));
      return sampleListings;
    }
    return JSON.parse(raw);
  } catch {
    return sampleListings;
  }
};

export const saveListing = (listing: MarketplaceListing): MarketplaceListing[] => {
  const current = loadListings();
  const updated = [listing, ...current];
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(updated));
  return updated;
};

// ============================================================
// DIARIES
// ============================================================
export const loadDiaries = (): SiteDiaryEntry[] => {
  try {
    const raw = localStorage.getItem(KEYS.DIARIES);
    if (!raw) {
      localStorage.setItem(KEYS.DIARIES, JSON.stringify(sampleSiteDiaries));
      return sampleSiteDiaries;
    }
    return JSON.parse(raw);
  } catch {
    return sampleSiteDiaries;
  }
};

export const saveDiary = (diary: SiteDiaryEntry): SiteDiaryEntry[] => {
  const current = loadDiaries();
  const updated = [diary, ...current];
  localStorage.setItem(KEYS.DIARIES, JSON.stringify(updated));
  return updated;
};

// ============================================================
// DRAWINGS
// ============================================================
export const loadDrawings = (): DrawingItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.DRAWINGS);
    if (!raw) {
      localStorage.setItem(KEYS.DRAWINGS, JSON.stringify(sampleDrawings));
      return sampleDrawings;
    }
    return JSON.parse(raw);
  } catch {
    return sampleDrawings;
  }
};

export const saveDrawing = (drawing: DrawingItem): DrawingItem[] => {
  const current = loadDrawings();
  const existsIndex = current.findIndex((d) => d.id === drawing.id);
  let updated: DrawingItem[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = drawing;
  } else {
    updated = [drawing, ...current];
  }
  localStorage.setItem(KEYS.DRAWINGS, JSON.stringify(updated));
  return updated;
};

// ============================================================
// ALIASES (for compatibility with existing code)
// ============================================================
export const getProjects = loadProjects;
export const getDecisions = loadDecisions;
export const getNotes = loadNotes;
export const getCalculations = loadCalculations;
export const getLessons = loadLessons;
export const getListings = loadListings;
export const getDrawings = loadDrawings;

// ============================================================
// PROJECT DELETION
// ============================================================
export const deleteProjectCascade = (projectId: string): ProjectItem[] => {
  console.log(`Deleting project cascade: ${projectId}`);

  const projects = loadProjects();

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    console.warn(`Project not found: ${projectId}`);
    return projects;
  }

  console.log(`Project found: ${project.name} (${project.code})`);

  const remainingProjects = projects.filter(
    (p) => p.id !== projectId
  );

  const drawings = loadDrawings();
  const remainingDrawings = drawings.filter(
    (drawing) => drawing.projectId !== projectId
  );
  localStorage.setItem(
    KEYS.DRAWINGS,
    JSON.stringify(remainingDrawings)
  );
  console.log(
    `Removed ${drawings.length - remainingDrawings.length} drawings`
  );

  const decisions = loadDecisions();
  const remainingDecisions = decisions.filter(
    (decision) => decision.projectId !== projectId
  );
  localStorage.setItem(
    KEYS.DECISIONS,
    JSON.stringify(remainingDecisions)
  );
  console.log(
    `Removed ${decisions.length - remainingDecisions.length} decisions`
  );

  const notes = loadNotes();
  const remainingNotes = notes.filter(
    (note) => note.projectId !== projectId
  );
  localStorage.setItem(
    KEYS.NOTES,
    JSON.stringify(remainingNotes)
  );
  console.log(
    `Removed ${notes.length - remainingNotes.length} notes`
  );

  console.log(
    `Records for project ${projectId} were not deleted.`
  );
  console.log(
    `Work items for project ${projectId} were not deleted.`
  );

  localStorage.setItem(
    KEYS.PROJECTS,
    JSON.stringify(remainingProjects)
  );

  console.log(
    `Project permanently deleted: ${projectId}`
  );
  console.log(
    `Remaining projects: ${remainingProjects.length}`
  );

  return remainingProjects;
};

// ============================================================
// COMPANY STORAGE
// ============================================================

import type {
  Company,
  CompanyMember,
  CompanyWorkspace,
  CompanyActivity,
} from '../types/company';

// --- Companies ---

export const loadCompanies = (): Company[] => {
  try {
    const raw = localStorage.getItem(KEYS.COMPANIES);
    if (!raw) {
      const defaultCompany: Company = {
        id: 'company-001',
        name: 'Vance & Partners Infrastructure Ltd',
        ownerId: 'user-001',
        industry: 'Engineering & Infrastructure',
        size: 'medium',
        website: 'https://vancepartners.com',
        description: 'Structural engineering, geotechnical engineering, and infrastructure design.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(KEYS.COMPANIES, JSON.stringify([defaultCompany]));
      return [defaultCompany];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveCompany = (company: Company): Company[] => {
  const current = loadCompanies();
  const idx = current.findIndex((c) => c.id === company.id);
  let updated: Company[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...company, updatedAt: new Date().toISOString() };
  } else {
    updated = [company, ...current];
  }
  localStorage.setItem(KEYS.COMPANIES, JSON.stringify(updated));
  return updated;
};

// --- Company Members ---

export const loadCompanyMembers = (companyId: string): CompanyMember[] => {
  try {
    const raw = localStorage.getItem(KEYS.COMPANY_MEMBERS);
    if (!raw) {
      const defaultMembers: CompanyMember[] = [
        {
          id: 'member-001',
          companyId: companyId,
          userId: 'user-001',
          name: 'Martin Vance',
          email: 'm.vance@engineeros.com',
          role: 'admin',
          title: 'Chief Structural Engineer',
          department: 'Structural Engineering',
          joinedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(KEYS.COMPANY_MEMBERS, JSON.stringify(defaultMembers));
      return defaultMembers;
    }
    const all = JSON.parse(raw);
    return all.filter((m: CompanyMember) => m.companyId === companyId);
  } catch {
    return [];
  }
};

export const saveCompanyMember = (member: CompanyMember): CompanyMember[] => {
  const current = JSON.parse(localStorage.getItem(KEYS.COMPANY_MEMBERS) || '[]');
  const idx = current.findIndex((m: CompanyMember) => m.id === member.id);
  let updated: CompanyMember[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = member;
  } else {
    updated = [member, ...current];
  }
  localStorage.setItem(KEYS.COMPANY_MEMBERS, JSON.stringify(updated));
  return updated.filter((m: CompanyMember) => m.companyId === member.companyId);
};

export const deleteCompanyMember = (memberId: string): void => {
  const current = JSON.parse(localStorage.getItem(KEYS.COMPANY_MEMBERS) || '[]');
  const updated = current.filter((m: CompanyMember) => m.id !== memberId);
  localStorage.setItem(KEYS.COMPANY_MEMBERS, JSON.stringify(updated));
};

// --- Company Workspaces ---

export const loadCompanyWorkspaces = (companyId: string): CompanyWorkspace[] => {
  try {
    const raw = localStorage.getItem(KEYS.COMPANY_WORKSPACES);
    if (!raw) {
      const defaultWorkspaces: CompanyWorkspace[] = [
        {
          id: generateUUID(),
          companyId: companyId,
          name: 'Main Engineering',
          description: 'Primary engineering workspace',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(KEYS.COMPANY_WORKSPACES, JSON.stringify(defaultWorkspaces));
      return defaultWorkspaces;
    }
    const all = JSON.parse(raw);
    return all.filter((w: CompanyWorkspace) => w.companyId === companyId);
  } catch {
    return [];
  }
};

// --- Company Activity ---

export const loadCompanyActivity = (companyId: string): CompanyActivity[] => {
  try {
    const raw = localStorage.getItem(KEYS.COMPANY_ACTIVITY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    return all
      .filter((a: CompanyActivity) => a.companyId === companyId)
      .sort((a: CompanyActivity, b: CompanyActivity) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  } catch {
    return [];
  }
};

export const addCompanyActivity = (activity: Omit<CompanyActivity, 'id'>): CompanyActivity[] => {
  const current = JSON.parse(localStorage.getItem(KEYS.COMPANY_ACTIVITY) || '[]');
  const newActivity: CompanyActivity = {
    ...activity,
    id: `act-${Date.now()}`,
  };
  const updated = [newActivity, ...current];
  localStorage.setItem(KEYS.COMPANY_ACTIVITY, JSON.stringify(updated));
  return updated.filter((a: CompanyActivity) => a.companyId === activity.companyId);
};