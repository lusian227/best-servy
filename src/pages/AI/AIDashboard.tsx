// src/pages/AI/AIDashboard.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Search,
  FileText,
  FolderKanban,
  Bookmark,
  Ruler,
  MessageSquare,
  Activity,
  ChevronRight,
  Loader2,
  Eye,
  GitCompare,
  Filter,
  X,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useAISearch } from '../../hooks/useAISearch';
import { useAIActions } from '../../hooks/useAIActions';
import { useCompanyStore } from '../../stores/companyStore';
import { useProjectStore } from '../../stores/projectStore';
import { AINavigationContext, AIAction } from '../../types/ai';

interface AIDashboardProps {
  onNavigateToWorld?: (world: string) => void;
  onSelectRecord?: (recordId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onSelectDecision?: (decisionId: string) => void;
  onSelectDrawing?: (drawingId: string) => void;
}

const AIDashboard: React.FC<AIDashboardProps> = ({
  onNavigateToWorld,
  onSelectRecord,
  onSelectProject,
  onSelectDecision,
  onSelectDrawing,
}) => {
  const [input, setInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { query, results, loading, aiResponse, error, search, clear } = useAISearch();
  const { actions, generateActions, executeAction, clearActions } = useAIActions();
  const { activeCompanyId, workspaces } = useCompanyStore();
  const { projects, selectedProject, setSelectedProject } = useProjectStore();

  // ============================================================
  // NAVIGATION CONTEXT — With Actual Navigation!
  // ============================================================

  const navigationContext: AINavigationContext = {
    navigateToProject: (projectId: string) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        if (onNavigateToWorld) onNavigateToWorld('projects');
        console.log(`🔍 Navigated to project: ${projectId}`);
      } else {
        console.warn(`Project not found: ${projectId}`);
        alert(`Project not found: ${projectId}`);
      }
    },

    navigateToDrawing: (drawingId: string) => {
      console.log(`🔍 Navigating to drawing: ${drawingId}`);
      if (onSelectDrawing) {
        onSelectDrawing(drawingId);
        if (onNavigateToWorld) onNavigateToWorld('projects');
      } else {
        alert(`📐 Drawing found! ID: ${drawingId}\n\n(Full navigation will open the Drawing Studio)`);
      }
    },

    navigateToRecord: (recordId: string) => {
      console.log(`🔍 Navigating to record: ${recordId}`);
      if (onSelectRecord) {
        onSelectRecord(recordId);
        if (onNavigateToWorld) onNavigateToWorld('records');
      } else {
        const found = results.find(r => r.id === recordId);
        alert(`📄 Record Found!\n\nTitle: ${found?.title || 'Untitled'}\nType: ${found?.type || 'record'}\nStatus: ${found?.status || 'N/A'}\n\n(Full navigation will open the Record Detail)`);
      }
    },

    navigateToDecision: (decisionId: string) => {
      console.log(`🔍 Navigating to decision: ${decisionId}`);
      if (onSelectDecision) {
        onSelectDecision(decisionId);
        if (onNavigateToWorld) onNavigateToWorld('projects');
      } else {
        const found = results.find(r => r.id === decisionId);
        alert(`📋 Decision Found!\n\nTitle: ${found?.title || 'Untitled'}\nStatus: ${found?.status || 'N/A'}\n\n(Full navigation will open the Decision Log)`);
      }
    },

    navigateToNote: (noteId: string) => {
      console.log(`🔍 Navigating to note: ${noteId}`);
      alert(`📝 Note found! ID: ${noteId}\n\n(Full navigation to Notes coming soon)`);
    },

    navigateToKnowledge: (knowledgeId: string) => {
      console.log(`🔍 Navigating to knowledge: ${knowledgeId}`);
      alert(`📚 Knowledge item found! ID: ${knowledgeId}\n\n(Full navigation to Knowledge coming soon)`);
    },

    setFilter: (type: string | null) => {
      setFilterType(type);
    },

    showAll: () => {
      setFilterType(null);
    },

    runSearch: (query: string) => {
      setInput(query);
      handleSearch(query);
    },
  };

  // ============================================================
  // AI CONTEXT
  // ============================================================

  const context = {
    companyId: activeCompanyId || '',
    workspaceId: workspaces[0]?.id || '',
    projectId: selectedProject?.id,
    userId: 'user-001',
  };

  // ============================================================
  // CHAT MESSAGES
  // ============================================================

  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([
    {
      role: 'ai',
      content: `Good morning! I'm your AI Engineering Assistant.

I can help you with:
• 🔍 Searching across projects, drawings, records, and decisions
• 📊 Getting project health and status updates
• 📐 Finding engineering standards and calculations
• 📝 Answering questions about your projects

Type your question below or use the quick prompts to get started.

${selectedProject ? `📌 Current context: Project "${selectedProject.name}"` : ''}`
    },
  ]);

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiResponse, actions]);

  useEffect(() => {
    if (results.length > 0 && query) {
      const generated = generateActions(results, query);
      console.log(`🎯 Generated ${generated.length} actions`);
    }
  }, [results, query, generateActions]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || loading) return;
    setShowSearch(true);
    setFilterType(null);
    await search(searchQuery, context);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    await handleSearch(userMessage);
  };

  const handleSuggestedSearch = (suggestion: string) => {
    setInput(suggestion);
    setChatMessages(prev => [...prev, { role: 'user', content: suggestion }]);
    handleSearch(suggestion);
  };

  const handleActionClick = (action: AIAction) => {
    setActiveAction(action);
    const result = executeAction(action);

    if (result.executed) {
      switch (action.type) {
        case 'open':
        case 'navigate':
          action.targets.forEach(target => {
            switch (target.entityType) {
              case 'project':
                navigationContext.navigateToProject(target.entityId);
                break;
              case 'drawing':
                navigationContext.navigateToDrawing(target.entityId);
                break;
              case 'record':
                navigationContext.navigateToRecord(target.entityId);
                break;
              case 'decision':
                navigationContext.navigateToDecision(target.entityId);
                break;
              case 'note':
                navigationContext.navigateToNote(target.entityId);
                break;
            }
          });
          break;
        case 'filter':
          if (action.payload?.filterType) {
            navigationContext.setFilter(action.payload.filterType);
          }
          break;
        case 'view':
          if (action.payload?.showAll) {
            navigationContext.showAll();
          }
          break;
        case 'compare':
          console.log('🔍 Compare action:', action.targets);
          break;
        default:
          console.log('🎯 Action executed:', action.type, action.targets);
      }
    }
  };

  const handleClear = () => {
    clear();
    clearActions();
    setShowSearch(false);
    setFilterType(null);
    setActiveAction(null);
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const displayedResults = filterType
    ? results.filter(r => r.type === filterType)
    : results;

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'open':
      case 'navigate': return <Eye size={14} className="text-emerald-500" />;
      case 'filter': return <Filter size={14} className="text-blue-500" />;
      case 'view': return <RefreshCw size={14} className="text-purple-500" />;
      case 'compare': return <GitCompare size={14} className="text-amber-500" />;
      default: return <Zap size={14} className="text-slate-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderKanban size={16} className="text-blue-500" />;
      case 'drawing': return <Ruler size={16} className="text-purple-500" />;
      case 'decision': return <Bookmark size={16} className="text-amber-500" />;
      case 'record': return <FileText size={16} className="text-emerald-500" />;
      case 'note': return <MessageSquare size={16} className="text-pink-500" />;
      default: return <FileText size={16} className="text-slate-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20';
      case 'drawing': return 'border-purple-200 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-950/20';
      case 'decision': return 'border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20';
      case 'record': return 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20';
      case 'note': return 'border-pink-200 dark:border-pink-900/30 bg-pink-50 dark:bg-pink-950/20';
      default: return 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20';
    }
  };

  const quickPrompts = [
    { label: 'Find project drawings', icon: Ruler },
    { label: 'Pending decisions', icon: Bookmark },
    { label: 'Latest uploaded records', icon: FileText },
    { label: 'Project health', icon: Activity },
    { label: 'Active projects', icon: FolderKanban },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Engineering Assistant
              {loading && <Loader2 size={16} className="animate-spin text-emerald-500" />}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Search and reason over your EngineerOS data
              {context.projectId && (
                <span className="ml-2 text-xs text-blue-500">• Project context active</span>
              )}
              {filterType && (
                <span className="ml-2 text-xs text-purple-500">• Filtered by {filterType}</span>
              )}
              {activeAction && (
                <span className="ml-2 text-xs text-amber-500">• Action: {activeAction.label}</span>
              )}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Online
        </span>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto min-h-[400px] max-h-[500px]">
        <div className="space-y-4">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl ${msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                  }`}
              >
                {msg.role === 'ai' && <Bot size={14} className="inline mr-2 text-emerald-500" />}
                <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
              </div>
            </div>
          ))}

          {/* AI Response */}
          {aiResponse && !loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-bl-sm">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">AI Analysis</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-1">
                      {aiResponse.answer}
                    </p>
                    {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {aiResponse.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestedSearch(suggestion)}
                            className="text-xs px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-emerald-500 transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-emerald-500" />
                <span className="text-sm text-slate-500">Analyzing EngineerOS data...</span>
              </div>
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && !loading && showSearch && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Quick Actions ({actions.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {actions.slice(0, 8).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full transition text-xs ${activeAction?.id === action.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {getActionIcon(action.type)}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {!loading && displayedResults.length > 0 && showSearch && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {displayedResults.length} result{displayedResults.length !== 1 ? 's' : ''} found
                  {filterType && <span className="ml-2 text-xs text-slate-400">(filtered by {filterType})</span>}
                </p>
                <button
                  onClick={handleClear}
                  className="text-xs text-slate-500 hover:text-slate-700 transition flex items-center gap-1"
                >
                  <X size={12} />
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {displayedResults.slice(0, 10).map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${getTypeColor(result.type)} transition cursor-pointer hover:shadow-sm`}
                    onClick={() => {
                      const action = actions.find(a =>
                        a.targets.some(t => t.entityId === result.id)
                      );
                      if (action) {
                        handleActionClick(action);
                      }
                    }}
                  >
                    {getTypeIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                        <span className="capitalize">{result.type}</span>
                        {result.subtitle && <span>• {result.subtitle}</span>}
                        {result.status && <span>• {result.status}</span>}
                        {result.date && <span>• {new Date(result.date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                  </div>
                ))}
                {displayedResults.length > 10 && (
                  <p className="text-xs text-slate-400 text-center">
                    + {displayedResults.length - 10} more results
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && results.length === 0 && query && showSearch && !aiResponse && (
            <div className="text-center py-6 text-slate-500">
              <Search size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs">Try a different search term or adjust your filters</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => handleSuggestedSearch(prompt.label)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full hover:border-emerald-500 transition text-xs text-slate-700 dark:text-slate-300"
          >
            <prompt.icon size={12} className="text-emerald-500" />
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the AI Engineering Assistant..."
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default AIDashboard;