import {
  DecisionItem,
  LessonItem,
  NoteItem,
  CalculationHistory,
  ProjectItem,
  MarketplaceListing,
  SiteDiaryEntry,
  DrawingItem,  // ✅ Correct type name
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
// DRAWINGS (NEW)
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