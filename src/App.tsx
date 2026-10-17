// src/App.tsx

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useCompanyStore } from './stores/companyStore';

import { SearchModal } from './components/common/SearchModal';

import {
  UserProfile,
  World,
  SingleSourceLink,
} from './types';

import type { ProcurementRequest } from './modules/procurement/domain';

// ============================================================
// AUTHENTICATION
// ============================================================

import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';

// ============================================================
// COMMON COMPONENTS
// ============================================================

import { Header } from './components/common/Header';
import Sidebar from './components/Sidebar';
import { SupabaseModal } from './components/common/SupabaseModal';
import { SingleSourcePanel } from './components/common/SingleSourcePanel';
import { DecisionModal } from './components/common/DecisionModal';
import { AIProjectEngineer } from './components/ai/AIProjectEngineer';
import { DrawingUploadModal } from './components/projects/DrawingUploadModal';

// ============================================================
// PAGE IMPORTS
// ============================================================

import Dashboard from './pages/Workspace/Dashboard';
import EngineeringWorkspace from './pages/Workspace/EngineeringWorkspace';
import EngineeringToolkit from './pages/Workspace/EngineeringToolkit';

import { ProjectsDashboard } from './components/projects/ProjectsDashboard';
import { ProjectDetail } from './pages/Projects/ProjectDetail';

import EngineeringIntelligence from './pages/Knowledge/EngineeringIntelligence';
import EngineeringMarketplace from './pages/Marketplace/EngineeringMarketplace';
import AIDashboard from './pages/AI/AIDashboard';
import CompanyDashboard from './pages/Company/CompanyDashboard';

// ============================================================
// PROCUREMENT
// ============================================================

import { ProcurementPage } from './modules/procurement/pages/ProcurementPage';
import { SupplierProcurementPage } from './modules/procurement/pages/SupplierProcurementPage';
import { SupplierProcurementDetail } from './modules/procurement/pages/SupplierProcurementDetail';

// ============================================================
// RECORDS
// ============================================================

import { RecordsPage } from './modules/records/pages/RecordsPage';
import { useRecordStore } from './modules/records/store/recordStore';
import { RecordService } from './modules/records/services/RecordService';

// ============================================================
// WORK ITEMS
// ============================================================

import { WorkItemList } from './modules/work-items/components/WorkItemList';

// ============================================================
// STORES
// ============================================================

import {
  useUIStore,
  useProjectStore,
  useDecisionStore,
  useDrawingStore,
  useNoteStore,
  useKnowledgeStore,
  useMarketplaceStore,
  useCalculationStore,
} from './stores';

// ============================================================
// OFFLINE UTILITIES
// ============================================================

import { isOnline } from './lib/localDB';

// ============================================================
// RECORD SERVICE
// Created once for the application lifecycle.
// ============================================================

const recordService = new RecordService();

// ============================================================
// NAVIGATION CONTEXT
// ============================================================

interface CompanyNavigationContext {
  workspaceId?: string;
  projectId?: string;
  ownerType?: 'company' | 'workspace' | 'project';
  ownerId?: string;
}

// ============================================================
// APP
// ============================================================

export default function App() {
  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const {
    user: authUser,
    loading: authLoading,
    initialized: authInitialized,
    profile,
    signOut,
  } = useAuth();

  // ==========================================================
  // UI STORE
  // ==========================================================

  const {
    theme,
    toggleTheme,
    activeWorld,
    setActiveWorld,
    sidebarCollapsed,
    toggleSidebar,
    decisionModalOpen,
    setDecisionModalOpen,
    aiChatOpen,
    setAiChatOpen,
    supabaseModalOpen,
    setSupabaseModalOpen,
    uploadModalOpen,
    setUploadModalOpen,
    tracePanelOpen,
    setTracePanelOpen,
    traceRootAsset,
    setTraceRootAsset,
    traceLinks,
    setTraceLinks,
  } = useUIStore();

  // ==========================================================
  // COMPANY STORE
  // ==========================================================

  const {
    activeCompanyId,
    workspaces,
    loadAll: loadCompanyAll,
  } = useCompanyStore();

  // ==========================================================
  // NAVIGATION CONTEXT
  // ==========================================================

  const [navigationContext, setNavigationContext] =
    useState<CompanyNavigationContext>({});

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [searchModalOpen, setSearchModalOpen] =
    useState(false);

  // ==========================================================
  // PROJECT STORE
  // ==========================================================

  const {
    projects,
    selectedProject,
    setSelectedProject,
    loadProjectsByWorkspace,
    saveProject,
    deleteProject,
  } = useProjectStore();

  // ==========================================================
  // RECORD STORE
  // ==========================================================

  const {
    records,
    load: loadRecords,
  } = useRecordStore();

  // ==========================================================
  // DECISION STORE
  // ==========================================================

  const {
    decisions,
    loadDecisions,
    saveDecision,
    approveDecision,
    getDecisionsByProject,
  } = useDecisionStore();

  // ==========================================================
  // DRAWING STORE
  // ==========================================================

  const {
    drawings,
    loadDrawings,
    saveDrawing,
    getDrawingsByProject,
  } = useDrawingStore();

  // ==========================================================
  // NOTE STORE
  // ==========================================================

  const {
    notes,
    loadNotes,
    saveNote,
  } = useNoteStore();

  // ==========================================================
  // KNOWLEDGE STORE
  // ==========================================================

  const {
    lessons,
    loadLessons,
    saveLesson,
  } = useKnowledgeStore();

  // ==========================================================
  // MARKETPLACE STORE
  // ==========================================================

  const {
    listings,
    loadListings,
    saveListing,
  } = useMarketplaceStore();

  // ==========================================================
  // CALCULATION STORE
  // ==========================================================

  const {
    calculations,
    loadCalculations,
    saveCalculation,
  } = useCalculationStore();

  // ==========================================================
  // CURRENT USER ID
  // ==========================================================

  const currentUserId = authUser?.id ?? '';

  // ==========================================================
  // CURRENT WORKSPACE
  //
  // IMPORTANT:
  // We do NOT invent ws-001 anymore.
  //
  // The workspace must come from the authenticated company's
  // workspace collection.
  // ==========================================================

  const currentWorkspace = useMemo(() => {
    if (!activeCompanyId || !workspaces?.length) {
      return null;
    }

    /*
     * Some versions of the Workspace type may not expose
     * companyId yet, therefore we safely inspect it here.
     *
     * Priority:
     * 1. Workspace belonging to active company
     * 2. Workspace already scoped by companyStore
     * 3. No workspace
     */

    const companyWorkspace = workspaces.find(
      (workspace: any) =>
        workspace.companyId === activeCompanyId
    );

    if (companyWorkspace) {
      return {
        id: companyWorkspace.id,
        name:
          companyWorkspace.name ||
          'Workspace',
      };
    }

    /*
     * If companyStore already returns only the active company's
     * workspaces, use the first one.
     */
    const firstWorkspace = workspaces[0];

    if (firstWorkspace) {
      return {
        id: firstWorkspace.id,
        name:
          firstWorkspace.name ||
          'Workspace',
      };
    }

    return null;
  }, [
    activeCompanyId,
    workspaces,
  ]);

  // ==========================================================
  // VISIBLE PROJECTS
  //
  // SECURITY / ISOLATION BOUNDARY FOR THE UI
  //
  // Even if the repository/store temporarily contains projects
  // from another workspace, App will NEVER expose them to the
  // current project UI.
  // ==========================================================

  const visibleProjects = useMemo(() => {
    if (
      !authUser ||
      !profile ||
      profile.role === 'pending' ||
      !activeCompanyId ||
      !currentWorkspace?.id
    ) {
      return [];
    }

    // ✅ NO EMERGENCY FALLBACK - Must match BOTH company AND workspace
    return projects.filter(
      (project) =>
        project.companyId === activeCompanyId &&
        project.workspaceId === currentWorkspace.id
    );
  }, [
    projects,
    activeCompanyId,
    currentWorkspace?.id,
    authUser,
    profile,
  ]);


  // ==========================================================
  // VALID SELECTED PROJECT
  //
  // Prevent a project from another workspace/company from
  // remaining open after switching account/company/workspace.
  // ==========================================================

  const visibleSelectedProject = useMemo(() => {
    if (!selectedProject) {
      return null;
    }

    const stillVisible =
      visibleProjects.some(
        (project) =>
          project.id === selectedProject.id
      );

    return stillVisible
      ? selectedProject
      : null;
  }, [
    selectedProject,
    visibleProjects,
  ]);

  // ==========================================================
  // WORKSPACE SUB-TABS
  // ==========================================================

  const [
    workspaceSubTab,
    setWorkspaceSubTab,
  ] = useState<
    | 'dashboard'
    | 'notes'
    | 'toolkit'
    | 'workitems'
  >('dashboard');

  // ==========================================================
  // DECISION EDITING
  // ==========================================================

  const [
    editingDecision,
    setEditingDecision,
  ] = useState<any>(undefined);

  // ==========================================================
  // SUPPLIER PROCUREMENT STATE
  // ==========================================================

  const [selectedSupplierRequest, setSelectedSupplierRequest] = useState<ProcurementRequest | null>(null);

  // ==========================================================
  // APPLICATION USER
  // ==========================================================

  const applicationUser: UserProfile =
    useMemo(() => {
      return {
        id:
          authUser?.id ??
          '',

        name:
          profile?.name ||
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          authUser?.email?.split('@')[0] ||
          'EngineerOS User',

        email:
          profile?.email ||
          authUser?.email ||
          '',

        role:
          profile?.role ||
          'pending',

        company:
          profile?.company ||
          '',

        department:
          profile?.department,

        avatar:
          profile?.avatar ||
          authUser?.user_metadata?.avatar_url ||
          '',
      };
    }, [
      authUser,
      profile,
    ]);

  // ==========================================================
  // THEME SYNC
  // ==========================================================

  useEffect(() => {
    const root =
      document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // ==========================================================
  // INITIAL DATA LOAD
  //
  // Protected data is loaded only after authentication.
  // ==========================================================

  useEffect(() => {
    if (
      !authInitialized ||
      !authUser
    ) {
      return;
    }

    if (
      !profile ||
      profile.role === 'pending'
    ) {
      return;
    }

    let cancelled = false;

    const loadInitialData =
      async () => {
        try {
          const results = await Promise.allSettled([
            loadCompanyAll(),
            loadDecisions(),
            loadDrawings(),
            loadNotes(),
            loadCalculations(),
            loadLessons(),
            loadListings(),
            loadRecords(),
          ]);

          console.log(
            '🔍 EngineerOS initialization results:',
            results
          );

          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(
                `❌ Initialization task ${index} failed:`,
                result.reason
              );
            }
          });

          if (cancelled) {
            return;
          }

          console.log(
            'EngineerOS application data initialized.'
          );
        } catch (error) {
          if (!cancelled) {
            console.error(
              'EngineerOS initial data loading error:',
              error
            );
          }
        }
      };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [
    authInitialized,
    authUser?.id,
    profile?.role,
    loadCompanyAll,
    loadDecisions,
    loadDrawings,
    loadNotes,
    loadCalculations,
    loadLessons,
    loadListings,
    loadRecords,
  ]);

  // ==========================================================
  // LOAD PROJECTS BY WORKSPACE
  //
  // THIS IS THE ONLY AUTOMATIC PROJECT LOAD.
  //
  // There is deliberately NO loadProjects().
  // There is deliberately NO automatic company-wide project load.
  // ==========================================================

  useEffect(() => {
    if (
      !authUser ||
      !profile ||
      profile.role === 'pending' ||
      !activeCompanyId ||
      !currentWorkspace?.id
    ) {
      setSelectedProject(null);
      // ✅ Clear project state when context disappears
      useProjectStore.setState({
        projects: [],
        selectedProject: null,
        loading: false,
        error: null,
      });
      return;
    }

    console.log('📂 Loading projects for workspace:', currentWorkspace.id);
    loadProjectsByWorkspace(currentWorkspace.id);
    setSelectedProject(null);
  }, [
    authUser?.id,
    profile?.role,
    activeCompanyId,
    currentWorkspace?.id,
    loadProjectsByWorkspace,
    setSelectedProject,
  ]);

  // ==========================================================
  // CLEAR PROJECT WHEN WORKSPACE/COMPANY CONTEXT CHANGES
  // ==========================================================

  useEffect(() => {
    if (
      !visibleSelectedProject &&
      selectedProject
    ) {
      setSelectedProject(null);
    }
  }, [
    visibleSelectedProject,
    selectedProject,
    setSelectedProject,
  ]);

  // ==========================================================
  // RECORDS ONLINE / OFFLINE REFRESH
  // ==========================================================

  useEffect(() => {
    if (
      !authUser ||
      !profile ||
      profile.role === 'pending'
    ) {
      return;
    }

    const handleOnline =
      async () => {
        console.log(
          'Online detected - refreshing records...'
        );

        try {
          await loadRecords();

          console.log(
            'Records refreshed successfully.'
          );
        } catch (error) {
          console.error(
            'Failed to refresh records:',
            error
          );
        }
      };

    const handleOffline =
      () => {
        console.log(
          'EngineerOS offline mode.'
        );
      };

    window.addEventListener(
      'online',
      handleOnline
    );

    window.addEventListener(
      'offline',
      handleOffline
    );

    if (isOnline()) {
      console.log(
        'EngineerOS online.'
      );
    } else {
      console.log(
        'EngineerOS starting in offline mode.'
      );
    }

    return () => {
      window.removeEventListener(
        'online',
        handleOnline
      );

      window.removeEventListener(
        'offline',
        handleOffline
      );
    };
  }, [
    authUser?.id,
    profile?.role,
    loadRecords,
  ]);

  // ==========================================================
  // WORLD CHANGE
  // ==========================================================

  const handleWorldChange =
    (world: World) => {
      setActiveWorld(world);

      if (world !== 'projects') {
        setSelectedProject(null);
      }

      if (world !== 'records') {
        setNavigationContext({});
      }
    };

  // ==========================================================
  // SAFE PROJECT SELECTION
  //
  // NEVER allow another workspace/company project to become
  // the selected project.
  // ==========================================================

  const handleSelectProject = (
    project: any
  ) => {
    if (!project) {
      return;
    }

    const isAllowed =
      visibleProjects.some(
        (item) =>
          item.id === project.id
      );

    if (!isAllowed) {
      console.warn(
        'Blocked project selection outside current workspace:',
        project.id
      );

      setSelectedProject(null);
      return;
    }

    setSelectedProject(project);
    setActiveWorld('projects');
  };

  // ==========================================================
  // TRACE
  // ==========================================================

  const handleOpenTrace = (
    root: {
      id: string;
      type: string;
      title: string;
      subtitle?: string;
    },
    links?: SingleSourceLink[]
  ) => {
    setTraceRootAsset(root);

    if (
      links &&
      links.length > 0
    ) {
      setTraceLinks(links);
    }

    setTracePanelOpen(true);
  };

  // ==========================================================
  // DECISION HANDLERS
  // ==========================================================

  const handleSaveDecision =
    (item: any) => {
      saveDecision(item);

      setDecisionModalOpen(false);
      setEditingDecision(undefined);
    };

  const handleApproveDecision =
    (decisionId: string) => {
      approveDecision(decisionId);
    };

  // ==========================================================
  // OTHER SAVE HANDLERS
  // ==========================================================

  const handleSaveNote =
    (note: any) => {
      saveNote(note);
    };

  const handleSaveCalculation =
    (calc: any) => {
      saveCalculation(calc);
    };

  const handleSaveLesson =
    (lesson: any) => {
      saveLesson(lesson);
    };

  const handleSaveListing =
    (listing: any) => {
      saveListing(listing);
    };

  const handleSaveDrawing =
    (drawing: any) => {
      saveDrawing(drawing);
    };

  const handleUploadDrawing =
    () => {
      if (!visibleSelectedProject) {
        console.warn(
          'Cannot upload drawing without a valid project.'
        );
        return;
      }

      setUploadModalOpen(true);
    };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNavigate = (
    world: World,
    context?: CompanyNavigationContext
  ) => {
    console.log(
      'EngineerOS navigation:',
      world,
      context
    );

    if (
      context?.projectId
    ) {
      const project =
        visibleProjects.find(
          (item) =>
            item.id ===
            context.projectId
        );

      if (!project) {
        console.warn(
          'Blocked navigation to project outside current workspace:',
          context.projectId
        );

        return;
      }

      setSelectedProject(project);
    }

    if (context) {
      setNavigationContext(context);
    }

    setActiveWorld(world);
  };

  // ==========================================================
  // NAVIGATE TO RECORDS
  // ==========================================================

  const handleNavigateToRecords =
    (
      context: CompanyNavigationContext
    ) => {
      console.log(
        'EngineerOS navigating to records:',
        context
      );

      if (
        context.projectId
      ) {
        const project =
          visibleProjects.find(
            (item) =>
              item.id ===
              context.projectId
          );

        if (!project) {
          console.warn(
            'Blocked records navigation for project outside workspace:',
            context.projectId
          );

          return;
        }
      }

      setNavigationContext(context);
      setActiveWorld('records');
    };

  // ==========================================================
  // DELETE PROJECT
  // ==========================================================

  const handleDeleteProject =
    async (
      projectId: string
    ): Promise<boolean> => {
      const project =
        visibleProjects.find(
          (item) =>
            item.id === projectId
        );

      if (!project) {
        console.warn(
          'Blocked deletion of project outside current workspace:',
          projectId
        );

        return false;
      }

      console.log(
        `Starting project deletion: ${projectId}`
      );

      try {
        // --------------------------------------------
        // 1. Delete V2 records
        // --------------------------------------------

        await recordService.deleteByProject(
          projectId
        );

        console.log(
          `Records deleted for project: ${projectId}`
        );

        // --------------------------------------------
        // 2. Delete project + child/local data
        // --------------------------------------------

        const success =
          await deleteProject(
            projectId
          );

        if (!success) {
          console.error(
            `Project deletion failed: ${projectId}`
          );

          return false;
        }

        console.log(
          `Project deleted successfully: ${projectId}`
        );

        return true;
      } catch (error) {
        console.error(
          'Failed to delete project and related records:',
          error
        );

        return false;
      }
    };

  // ==========================================================
  // AUTHENTICATION GATE
  // ==========================================================

  if (
    !authInitialized ||
    authLoading
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Initializing EngineerOS...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  if (!authUser) {
    return <LoginPage />;
  }

  // ==========================================================
  // PROFILE NOT AVAILABLE
  // ==========================================================

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
          </div>

          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Account Setup Pending
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your EngineerOS account has been authenticated,
            but your engineering profile has not yet been
            provisioned.
          </p>

          <button
            onClick={() => {
              void signOut();
            }}
            className="mt-6 rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Sign Out
          </button>

        </div>
      </div>
    );
  }

  // ==========================================================
  // PENDING APPROVAL
  // ==========================================================

  if (
    profile.role === 'pending'
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
          </div>

          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Account Pending Approval
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your EngineerOS account has been created successfully.
            An administrator needs to approve your account before
            you can access engineering projects and protected
            resources.
          </p>

          <div className="mt-5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-left">

            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Account
            </p>

            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              {profile.email ||
                authUser.email}
            </p>

            <p className="mt-3 text-xs font-medium text-amber-800 dark:text-amber-300">
              Status
            </p>

            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              Pending administrator approval
            </p>

          </div>

          <button
            onClick={() => {
              void signOut();
            }}
            className="mt-6 rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Sign Out
          </button>

        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN APPLICATION
  // ==========================================================

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        activeWorld={
          activeWorld
        }

        onSelectWorld={(
          world: string
        ) => {
          handleWorldChange(
            world as World
          );
        }}

        collapsed={
          sidebarCollapsed
        }

        onToggleCollapse={
          toggleSidebar
        }

        user={{
          name:
            applicationUser.name ||
            'EngineerOS User',

          role:
            applicationUser.role ||
            'Engineer',

          avatar:
            applicationUser.avatar,
        }}
      />

      {/* ========================================================
          MAIN APPLICATION
      ======================================================== */}

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <Header
          currentWorld={
            activeWorld
          }

          onSelectWorld={(
            world
          ) => {
            handleWorldChange(
              world
            );
          }}

          user={
            applicationUser
          }

          onOpenAIChat={() => {
            setAiChatOpen(true);
          }}

          onOpenSearch={() => {
            setSearchModalOpen(true);
          }}

          onOpenSupabase={() => {
            setSupabaseModalOpen(true);
          }}
        />

        {/* ======================================================
            PAGE CONTENT
        ====================================================== */}

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* ====================================================
              WORKSPACE
          ==================================================== */}

          {activeWorld ===
            'workspace' && (
              <div className="space-y-6">

                {/* Workspace Tabs */}

                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold flex-wrap">

                  <button
                    onClick={() =>
                      setWorkspaceSubTab(
                        'dashboard'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab ===
                      'dashboard'
                      ? 'bg-emerald-700 text-white font-bold shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Engineer Dashboard
                  </button>

                  <button
                    onClick={() =>
                      setWorkspaceSubTab(
                        'notes'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab ===
                      'notes'
                      ? 'bg-emerald-700 text-white font-bold shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Engineering Notes & Field Notes (
                    {notes.length}
                    )
                  </button>

                  <button
                    onClick={() =>
                      setWorkspaceSubTab(
                        'toolkit'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab ===
                      'toolkit'
                      ? 'bg-emerald-700 text-white font-bold shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Calculators & Takeoff Toolkit
                  </button>

                  <button
                    onClick={() =>
                      setWorkspaceSubTab(
                        'workitems'
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab ===
                      'workitems'
                      ? 'bg-emerald-700 text-white font-bold shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    Work Items
                  </button>

                </div>

                {/* =================================================
                  DASHBOARD
              ================================================= */}

                {workspaceSubTab ===
                  'dashboard' && (
                    <Dashboard
                      user={
                        applicationUser
                      }

                      projects={
                        visibleProjects
                      }

                      decisions={
                        decisions
                      }

                      notes={
                        notes
                      }

                      timeline={[]}

                      onSelectWorld={
                        handleWorldChange
                      }

                      onOpenDecisionModal={() => {
                        setEditingDecision(
                          undefined
                        );

                        setDecisionModalOpen(
                          true
                        );
                      }}

                      onOpenAIChat={() => {
                        setAiChatOpen(
                          true
                        );
                      }}

                      onSelectProject={
                        handleSelectProject
                      }
                    />
                  )}

                {/* =================================================
                  NOTES
              ================================================= */}

                {workspaceSubTab ===
                  'notes' && (
                    <EngineeringWorkspace
                      notes={
                        notes
                      }

                      onSaveNote={
                        handleSaveNote
                      }

                      onOpenTrace={
                        handleOpenTrace
                      }
                    />
                  )}

                {/* =================================================
                  TOOLKIT
              ================================================= */}

                {workspaceSubTab ===
                  'toolkit' && (
                    <EngineeringToolkit
                      calculations={
                        calculations
                      }

                      onSaveCalculation={
                        handleSaveCalculation
                      }
                    />
                  )}

                {/* =================================================
                  WORK ITEMS
              ================================================= */}

                {workspaceSubTab ===
                  'workitems' && (
                    <div className="space-y-6">

                      <div className="flex justify-between items-center">
                        <div>

                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Work Items
                          </h2>

                          <p className="text-slate-500 dark:text-slate-400">
                            Track engineering work - inspections,
                            pours, surveys, and more
                          </p>

                        </div>
                      </div>

                      {currentWorkspace?.id ? (
                        <WorkItemList
                          workspaceId={
                            currentWorkspace.id
                          }

                          onAddRecord={() => {
                            setNavigationContext({
                              workspaceId:
                                currentWorkspace.id,

                              ownerType:
                                'workspace',

                              ownerId:
                                currentWorkspace.id,
                            });

                            setActiveWorld(
                              'records'
                            );
                          }}
                        />
                      ) : (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500">
                          No active workspace is available.
                        </div>
                      )}

                    </div>
                  )}

              </div>
            )}

          {/* ====================================================
              PROJECTS
          ==================================================== */}

          {activeWorld ===
            'projects' && (
              <>
                {visibleSelectedProject ? (
                  <ProjectDetail
                    project={
                      visibleSelectedProject
                    }

                    decisions={
                      getDecisionsByProject(
                        visibleSelectedProject.id
                      )
                    }

                    drawings={
                      getDrawingsByProject(
                        visibleSelectedProject.id
                      )
                    }

                    onBack={() => {
                      setSelectedProject(
                        null
                      );
                    }}

                    onOpenDecisionModal={() => {
                      setEditingDecision(
                        undefined
                      );

                      setDecisionModalOpen(
                        true
                      );
                    }}

                    onOpenTrace={
                      handleOpenTrace
                    }

                    onSaveProject={
                      saveProject
                    }

                    onApproveDecision={
                      handleApproveDecision
                    }

                    onUploadDrawing={
                      handleUploadDrawing
                    }

                    onNavigateToRecords={() => {
                      handleNavigateToRecords({
                        projectId:
                          visibleSelectedProject.id,

                        workspaceId:
                          visibleSelectedProject.workspaceId ||
                          currentWorkspace?.id,

                        ownerType:
                          'project',

                        ownerId:
                          visibleSelectedProject.id,
                      });
                    }}
                  />
                ) : (
                  <ProjectsDashboard
                    projects={visibleProjects}
                    workspaceId={currentWorkspace?.id || ''}
                    userId={authUser?.id || ''}
                    onSelectProject={handleSelectProject}
                    onSaveProject={saveProject}
                    onDeleteProject={handleDeleteProject}
                  />
                )}
              </>
            )}

          {/* ====================================================
              KNOWLEDGE
          ==================================================== */}

          {activeWorld ===
            'knowledge' && (
              <EngineeringIntelligence
                lessons={
                  lessons
                }

                onSaveLesson={
                  handleSaveLesson
                }

                onOpenAIChat={() => {
                  setAiChatOpen(
                    true
                  );
                }}
              />
            )}

          {/* ====================================================
              MARKETPLACE
          ==================================================== */}

          {activeWorld ===
            'marketplace' && (
              <EngineeringMarketplace />
            )}

          {/* ====================================================
              AI
          ==================================================== */}

          {activeWorld ===
            'ai' && (
              <AIDashboard
                onNavigateToWorld={(
                  world
                ) => {
                  setActiveWorld(
                    world as World
                  );
                }}

                onSelectRecord={(
                  recordId
                ) => {
                  setNavigationContext({
                    workspaceId:
                      currentWorkspace?.id,

                    ownerType:
                      'project',

                    ownerId:
                      recordId,
                  });

                  setActiveWorld(
                    'records'
                  );
                }}

                onSelectProject={(
                  projectId
                ) => {
                  const project =
                    visibleProjects.find(
                      (p) =>
                        p.id ===
                        projectId
                    );

                  if (!project) {
                    console.warn(
                      'AI attempted to open project outside current workspace:',
                      projectId
                    );

                    return;
                  }

                  setSelectedProject(
                    project
                  );

                  setActiveWorld(
                    'projects'
                  );
                }}

                onSelectDecision={(
                  decisionId
                ) => {
                  console.log(
                    'AI opening decision:',
                    decisionId
                  );

                  setActiveWorld(
                    'projects'
                  );
                }}

                onSelectDrawing={(
                  drawingId
                ) => {
                  console.log(
                    'AI opening drawing:',
                    drawingId
                  );

                  setActiveWorld(
                    'projects'
                  );
                }}
              />
            )}

          {/* ====================================================
              COMPANY
          ==================================================== */}

          {activeWorld ===
            'company' && (
              <CompanyDashboard

                onNavigate={(
                  world,
                  context
                ) => {
                  console.log(
                    'Company navigation requested:',
                    world,
                    context
                  );

                  /*
                   * IMPORTANT:
                   * Do NOT load projects by company here.
                   *
                   * The project loader is controlled by the
                   * workspace effect above.
                   */

                  if (
                    context?.projectId
                  ) {
                    const project =
                      visibleProjects.find(
                        (item) =>
                          item.id ===
                          context.projectId
                      );

                    if (!project) {
                      console.warn(
                        'Blocked company navigation to project outside current workspace:',
                        context.projectId
                      );

                      return;
                    }

                    setSelectedProject(
                      project
                    );
                  } else {
                    setSelectedProject(
                      null
                    );
                  }

                  if (context) {
                    setNavigationContext(
                      context
                    );
                  }

                  setActiveWorld(
                    world as World
                  );
                }}

                onOpenProject={(
                  project
                ) => {
                  handleSelectProject(
                    project
                  );
                }}
              />
            )}

          {/* ====================================================
              RECORDS
          ==================================================== */}

          {activeWorld ===
            'records' && (
              <RecordsPage
                workspaceId={
                  navigationContext.workspaceId ||
                  currentWorkspace?.id
                }

                projectId={
                  navigationContext.projectId ||
                  visibleSelectedProject?.id ||
                  ''
                }

                ownerType={
                  navigationContext.ownerType ||
                  'project'
                }

                ownerId={
                  navigationContext.ownerId
                }

                currentUserId={
                  currentUserId
                }
              />
            )}

          {/* ====================================================
              PROCUREMENT
          ==================================================== */}

          {activeWorld === 'procurement' && (
            <ProcurementPage
              projectId={visibleSelectedProject?.id || undefined}
            />
          )}

          {activeWorld === 'supplier_procurement' && (
            <div className="max-w-7xl mx-auto">
              {selectedSupplierRequest ? (
                <SupplierProcurementDetail
                  request={selectedSupplierRequest}
                  workspaceId={currentWorkspace?.id || ''}
                  userId={currentUserId}
                  userCompanyId={activeCompanyId || ''}
                  onBack={() => setSelectedSupplierRequest(null)}
                />
              ) : (
                <SupplierProcurementPage
                  supplierCompanyId={activeCompanyId || ''}
                  workspaceId={currentWorkspace?.id || ''}
                  onOpenRequest={(request) => {
                    setSelectedSupplierRequest(request);
                  }}
                />
              )}
            </div>
          )}

        </main>
      </div>

      {/* ==========================================================
          AI CHAT
      ========================================================== */}

      {aiChatOpen && (
        <AIProjectEngineer
          isOpen={
            aiChatOpen
          }

          onClose={() =>
            setAiChatOpen(false)
          }
        />
      )}

      {/* ==========================================================
          SEARCH MODAL
      ========================================================== */}

      <SearchModal
        isOpen={
          searchModalOpen
        }

        onClose={() =>
          setSearchModalOpen(false)
        }

        onSelectResult={(
          result
        ) => {

          if (
            result.type ===
            'project'
          ) {
            handleSelectProject(
              result
            );
          }

          else if (
            result.type ===
            'record'
          ) {
            setActiveWorld(
              'records'
            );
          }

          else if (
            result.type ===
            'decision' ||
            result.type ===
            'drawing'
          ) {
            setActiveWorld(
              'projects'
            );
          }
        }}
      />

      {/* ==========================================================
          TRACE PANEL
      ========================================================== */}

      <SingleSourcePanel
        isOpen={
          tracePanelOpen
        }

        onClose={() =>
          setTracePanelOpen(false)
        }

        rootAsset={
          traceRootAsset
        }

        linkedAssets={
          traceLinks
        }
      />

      {/* ==========================================================
          DECISION MODAL
      ========================================================== */}

      <DecisionModal
        isOpen={
          decisionModalOpen
        }

        onClose={() => {
          setDecisionModalOpen(
            false
          );

          setEditingDecision(
            undefined
          );
        }}

        onSave={
          handleSaveDecision
        }

        editingItem={
          editingDecision
        }

        projects={
          visibleProjects
        }

        currentProject={
          visibleSelectedProject
        }
      />

      {/* ==========================================================
          DRAWING UPLOAD
      ========================================================== */}

      <DrawingUploadModal
        isOpen={
          uploadModalOpen
        }

        onClose={() =>
          setUploadModalOpen(false)
        }

        onSave={
          handleSaveDrawing
        }

        projectId={
          visibleSelectedProject?.id ||
          ''
        }

        workspaceId={
          visibleSelectedProject?.workspaceId ||
          currentWorkspace?.id ||
          ''
        }
      />

      {/* ==========================================================
          SUPABASE MODAL
      ========================================================== */}

      <SupabaseModal
        isOpen={
          supabaseModalOpen
        }

        onClose={() =>
          setSupabaseModalOpen(false)
        }
      />

    </div>
  );
}