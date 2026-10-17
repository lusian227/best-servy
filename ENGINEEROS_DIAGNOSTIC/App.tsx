// src/App.tsx - WITH WORKING NEW RECORD BUTTON + WORK ITEMS

import React, { useEffect, useState } from 'react';
import {
  UserProfile,
  World,
  SingleSourceLink,
} from './types';
import {
  sampleLinkedAssets,
} from './data/mockData';
import { Header } from './components/common/Header';
import Sidebar from './components/layout/Sidebar';
import { SupabaseModal } from './components/common/SupabaseModal';
import { SingleSourcePanel } from './components/common/SingleSourcePanel';
import { DecisionModal } from './components/common/DecisionModal';
import { AIProjectEngineer } from './components/ai/AIProjectEngineer';
import { DrawingUploadModal } from './components/projects/DrawingUploadModal';

// PAGE IMPORTS
import Dashboard from './pages/Workspace/Dashboard';
import EngineeringWorkspace from './pages/Workspace/EngineeringWorkspace';
import EngineeringToolkit from './pages/Workspace/EngineeringToolkit';
import { ProjectsDashboard } from './components/projects/ProjectsDashboard';
import { ProjectDetail } from './pages/Projects/ProjectDetail';
import EngineeringIntelligence from './pages/Knowledge/EngineeringIntelligence';
import EngineeringMarketplace from './pages/Marketplace/EngineeringMarketplace';
import AIDashboard from './pages/AI/AIDashboard';
import CompanyDashboard from './pages/Company/CompanyDashboard';

// Records Module Import
import { RecordList } from './modules/records/components/RecordList';
import { UploadCenter } from './modules/records/components/UploadCenter';
import { RecordsPage } from './modules/records/pages/RecordsPage';

// 🆕 Work Items Module Import
import { WorkItemList } from './modules/work-items/components/WorkItemList';

// STORE IMPORTS
import {
  useUIStore,
  useProjectStore,
  useRecordStore,
  useDecisionStore,
  useDrawingStore,
  useNoteStore,
  useKnowledgeStore,
  useMarketplaceStore,
  useCalculationStore,
} from './stores';

// Import offline utilities
import { isOnline, onOnline, onOffline } from './lib/localDB';

export default function App() {
  // UI STORE
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

  // PROJECT STORE
  const {
    projects,
    selectedProject,
    setSelectedProject,
    loadProjects,
    saveProject,
  } = useProjectStore();

  // RECORD STORE
  const { records, loadRecords } = useRecordStore();

  // DECISION STORE
  const {
    decisions,
    loadDecisions,
    saveDecision,
    approveDecision,
    getDecisionsByProject,
  } = useDecisionStore();

  // DRAWING STORE
  const {
    drawings,
    loadDrawings,
    saveDrawing,
    getDrawingsByProject,
  } = useDrawingStore();

  // NOTE STORE
  const { notes, loadNotes, saveNote } = useNoteStore();

  // KNOWLEDGE STORE
  const { lessons, loadLessons, saveLesson } = useKnowledgeStore();

  // MARKETPLACE STORE
  const { listings, loadListings, saveListing } = useMarketplaceStore();

  // CALCULATION STORE
  const { calculations, loadCalculations, saveCalculation } = useCalculationStore();

  // 🆕 Upload Center State
  const [showUploadCenter, setShowUploadCenter] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState('proj-001');

  // ✅ FEATURE FLAG - Toggle between legacy and V2 records
  const RECORDS_VERSION = import.meta.env.VITE_FEATURE_RECORDS_V2 === 'true' ? 'v2' : 'legacy';
  const currentUserId = "user-001"; // Replace with auth

  // ACTIVE USER
  const user: UserProfile = {
    id: 'usr-01',
    name: 'Martin Vance',
    email: 'm.vance@engineeros.com',
    role: 'Chief Structural Engineer',
    company: 'Vance & Partners Infrastructure Ltd',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  };

  // ✅ CURRENT WORKSPACE (for V2 Records)
  const currentWorkspace = { id: 'ws-001', name: 'Default Workspace' };


  // 🆕 WORKSPACE SUB-TAB STATE - Added 'workitems'
  const [workspaceSubTab, setWorkspaceSubTab] = React.useState<'dashboard' | 'notes' | 'toolkit' | 'workitems'>('dashboard');
  const [editingDecision, setEditingDecision] = React.useState<any>(undefined);

  // 🆕 Upload Center Handlers
  const handleOpenUploadCenter = (projectId: string = 'proj-001') => {
    setUploadProjectId(projectId);
    setShowUploadCenter(true);
  };

  // SYNC THEME
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // LOAD ALL DATA
  useEffect(() => {
    loadProjects();
    loadDecisions();
    loadDrawings();
    loadNotes();
    loadCalculations();
    loadLessons();
    loadListings();
    loadRecords();
  }, []);

  // ============================================================
  // 🆕 OFFLINE SUPPORT - AUTO-SYNC WHEN ONLINE
  // ============================================================
  useEffect(() => {
    // Handle coming back online - just refresh data
    const handleOnline = async () => {
      console.log('🔄 Online detected - Refreshing data...');
      await loadRecords();
      console.log('✅ Data refreshed!');
    };

    // Handle going offline
    const handleOffline = () => {
      console.log('📴 Offline mode');
    };

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (isOnline()) {
      console.log('🌐 Online - Records loaded from memory');
    } else {
      console.log('📴 Starting in offline mode');
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // HANDLERS
  const handleWorldChange = (world: World) => {
    setActiveWorld(world);
    if (world !== 'projects') setSelectedProject(null);
  };

  const handleOpenTrace = (
    root: { id: string; type: string; title: string; subtitle?: string },
    links?: SingleSourceLink[]
  ) => {
    setTraceRootAsset(root);
    if (links && links.length > 0) {
      setTraceLinks(links);
    }
    setTracePanelOpen(true);
  };

  const handleSaveDecision = (item: any) => {
    saveDecision(item);
    setDecisionModalOpen(false);
    setEditingDecision(undefined);
  };

  const handleApproveDecision = (decisionId: string) => {
    approveDecision(decisionId);
  };

  const handleSaveNote = (note: any) => {
    saveNote(note);
  };

  const handleSaveCalculation = (calc: any) => {
    saveCalculation(calc);
  };

  const handleSaveLesson = (lesson: any) => {
    saveLesson(lesson);
  };

  const handleSaveListing = (listing: any) => {
    saveListing(listing);
  };

  const handleSaveDrawing = (drawing: any) => {
    saveDrawing(drawing);
  };

  const handleUploadDrawing = () => {
    setUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          activeWorld={activeWorld}
          onSelectWorld={handleWorldChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          user={user}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            currentWorld={activeWorld}
            onSelectWorld={(world) => {
              setActiveWorld(world);
              if (world !== 'projects') setSelectedProject(null);
            }}
            user={user}
            onOpenAIChat={() => setAiChatOpen(true)}
            onOpenSearch={() => { }}
            onOpenSupabase={() => setSupabaseModalOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeWorld === 'workspace' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold flex-wrap">
                  <button
                    onClick={() => setWorkspaceSubTab('dashboard')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab === 'dashboard' ? 'bg-emerald-700 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Engineer Dashboard
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('notes')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab === 'notes' ? 'bg-emerald-700 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Engineering Notes & Field Notes ({notes.length})
                  </button>
                  <button
                    onClick={() => setWorkspaceSubTab('toolkit')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab === 'toolkit' ? 'bg-emerald-700 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Calculators & Takeoff Toolkit
                  </button>
                  {/* 🆕 Work Items Tab */}
                  <button
                    onClick={() => setWorkspaceSubTab('workitems')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${workspaceSubTab === 'workitems' ? 'bg-emerald-700 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    🏗️ Work Items
                  </button>
                </div>

                {workspaceSubTab === 'dashboard' && (
                  <Dashboard
                    user={user}
                    projects={projects}
                    decisions={decisions}
                    notes={notes}
                    timeline={[]}
                    onSelectWorld={setActiveWorld}
                    onOpenDecisionModal={() => {
                      setEditingDecision(undefined);
                      setDecisionModalOpen(true);
                    }}
                    onOpenAIChat={() => setAiChatOpen(true)}
                    onSelectProject={(p) => {
                      setSelectedProject(p);
                      setActiveWorld('projects');
                    }}
                  />
                )}

                {workspaceSubTab === 'notes' && (
                  <EngineeringWorkspace
                    notes={notes}
                    onSaveNote={handleSaveNote}
                    onOpenTrace={handleOpenTrace}
                  />
                )}

                {workspaceSubTab === 'toolkit' && (
                  <EngineeringToolkit
                    calculations={calculations}
                    onSaveCalculation={handleSaveCalculation}
                  />
                )}

                {/* 🆕 Work Items Content */}
                {workspaceSubTab === 'workitems' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">🏗️ Work Items</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                          Track engineering work - inspections, pours, surveys, and more
                        </p>
                      </div>
                    </div>
                    <WorkItemList
                      workspaceId="ws-001"
                      onAddRecord={(workItemId) => {
                        setActiveWorld('records');
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {activeWorld === 'projects' && (
              <>
                {selectedProject ? (
                  <ProjectDetail
                    project={selectedProject}
                    decisions={getDecisionsByProject(selectedProject.id)}
                    drawings={getDrawingsByProject(selectedProject.id)}
                    onBack={() => setSelectedProject(null)}
                    onOpenDecisionModal={() => {
                      setEditingDecision(undefined);
                      setDecisionModalOpen(true);
                    }}
                    onOpenTrace={handleOpenTrace}
                    onSaveProject={saveProject}
                    onApproveDecision={handleApproveDecision}
                    onUploadDrawing={handleUploadDrawing}
                  />
                ) : (
                  <ProjectsDashboard
                    projects={projects}
                    onSelectProject={(p) => setSelectedProject(p)}
                    onSaveProject={saveProject}
                  />
                )}
              </>
            )}

            {activeWorld === 'knowledge' && (
              <EngineeringIntelligence
                lessons={lessons}
                onSaveLesson={handleSaveLesson}
                onOpenAIChat={() => setAiChatOpen(true)}
              />
            )}

            {activeWorld === 'marketplace' && (
              <EngineeringMarketplace
                listings={listings}
                onSaveListing={handleSaveListing}
              />
            )}

            {activeWorld === 'ai' && <AIDashboard />}

            {activeWorld === 'company' && <CompanyDashboard user={user} />}

            {activeWorld === 'records' && (
              <div className="space-y-6">
                {RECORDS_VERSION === 'v2' ? (
                  // ✅ V2 Records - New architecture
                  <RecordsPage
                    workspaceId={currentWorkspace?.id || 'ws-001'}
                    projectId={selectedProject?.id}
                    ownerType="project"
                    ownerId={selectedProject?.id}
                    currentUserId={currentUserId}
                  />
                ) : (
                  // ✅ Legacy Records - Current working code
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">📋 Records</h2>
                        <p className="text-slate-500 dark:text-slate-400">Manage engineering records</p>
                      </div>
                      <button
                        onClick={() => handleOpenUploadCenter(selectedProject?.id || 'proj-001')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <span className="text-lg">+</span> New Record
                      </button>
                    </div>
                    <RecordList workspaceId="ws-001" />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {aiChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
            <AIProjectEngineer onClose={() => setAiChatOpen(false)} />
          </div>
        </div>
      )}

      <SingleSourcePanel
        isOpen={tracePanelOpen}
        onClose={() => setTracePanelOpen(false)}
        rootAsset={traceRootAsset}
        linkedAssets={traceLinks}
      />

      <DecisionModal
        isOpen={decisionModalOpen}
        onClose={() => {
          setDecisionModalOpen(false);
          setEditingDecision(undefined);
        }}
        onSave={handleSaveDecision}
        editingItem={editingDecision}
        projects={projects}
        currentProject={selectedProject}
      />

      <DrawingUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSave={handleSaveDrawing}
        projectId={selectedProject?.id || ''}
      />

      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      {/* 🆕 Upload Center Modal */}
      {showUploadCenter && (
        <UploadCenter
          projectId={uploadProjectId}
          onUploadComplete={(recordId) => {
            setShowUploadCenter(false);
            loadRecords();
            console.log('✅ Record created:', recordId);
          }}
          onClose={() => setShowUploadCenter(false)}
        />
      )}
    </div>
  );
}