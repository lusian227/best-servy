// src/pages/Knowledge/EngineeringIntelligence.tsx

import React, { useMemo, useState, useRef, useEffect } from 'react';
import type {
  RecordCategory,
  OwnerType,
} from '../../modules/records/domain';
import {
  Search,
  Upload,
  BookOpen,
  FileText,
  Calculator,
  ClipboardList,
  Package,
  Sparkles,
  Check,
  Loader2,
  File,
  Eye,
} from 'lucide-react';

// Import Records Service for knowledge uploads
import { RecordService } from '../../modules/records/services/RecordService';
import { supabase } from '../../lib/supabase';
// ✅ ADD: Import company store for workspace
import { useCompanyStore } from '../../stores/companyStore';
// ✅ ADD: Import DocumentViewer
import { DocumentViewer } from '../../components/common/DocumentViewer';

interface EngineeringIntelligenceProps {
  lessons: any[];
  onSaveLesson: (lesson: any) => void;
  onOpenAIChat: () => void;
}

type KnowledgeTab =
  | 'Standards'
  | 'Formulas'
  | 'Procedures'
  | 'Materials';

// ============================================================
// KNOWLEDGE PROJECT ID - USE YOUR REAL PROJECT ID
// ============================================================

// 🔥 REPLACE THIS WITH YOUR ACTUAL PROJECT ID FROM SUPABASE
const KNOWLEDGE_PROJECT_ID = 'knowledge-project-001';

// ============================================================
// CATEGORY MAPPING - ✅ FIXED
// ============================================================

// Map Knowledge tabs to Record categories - Now uses RecordCategory type
const TAB_TO_CATEGORY: Record<KnowledgeTab, RecordCategory> = {
  Standards: 'standard',
  Formulas: 'formula',
  Procedures: 'procedure',
  Materials: 'material',
};

// Reverse mapping (singular - matches SQL)
const CATEGORY_TO_TAB: Record<string, KnowledgeTab> = {
  standard: 'Standards',
  formula: 'Formulas',
  procedure: 'Procedures',
  material: 'Materials',
};

const EngineeringIntelligence = ({
  lessons,
  onSaveLesson,
  onOpenAIChat,
}: EngineeringIntelligenceProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('Standards');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Knowledge records state
  const [knowledgeRecords, setKnowledgeRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<KnowledgeTab, number>>({
    Standards: 0,
    Formulas: 0,
    Procedures: 0,
    Materials: 0,
  });

  // ✅ ADD: Document viewer state
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // ✅ ADD: Get real workspace from company store
  const { workspaces, activeCompanyId } = useCompanyStore();
  const realWorkspaceId = workspaces?.[0]?.id || null;

  console.log('🏢 Knowledge page - activeCompanyId:', activeCompanyId);
  console.log('🏢 Knowledge page - workspaces:', workspaces);
  console.log('🏢 Knowledge page - using workspaceId:', realWorkspaceId);

  // ============================================================
  // LOAD KNOWLEDGE RECORDS FROM SUPABASE
  // ============================================================

  const loadKnowledgeRecords = async () => {
    try {
      setLoading(true);
      const recordService = new RecordService();

      // ✅ FIX: Use REAL workspace ID, remove hard-coded project
      const workspaceId = realWorkspaceId || 'ws-001';

      const records = await recordService.getRecords({
        workspaceId: workspaceId,
        projectId: undefined,  // ✅ No project filter for knowledge
        ownerType: 'knowledge' as OwnerType,
      });

      console.log(`📚 Loaded ${records.length} knowledge records`);
      setKnowledgeRecords(records);

      // Calculate counts per category
      const counts: Record<KnowledgeTab, number> = {
        Standards: 0,
        Formulas: 0,
        Procedures: 0,
        Materials: 0,
      };

      records.forEach((record) => {
        const category = record.category?.toLowerCase();
        if (category && CATEGORY_TO_TAB[category]) {
          counts[CATEGORY_TO_TAB[category]]++;
        }
      });

      setCategoryCounts(counts);
      console.log('📊 Category counts:', counts);

    } catch (error) {
      console.error('Failed to load knowledge records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load records on mount
  useEffect(() => {
    loadKnowledgeRecords();
  }, [realWorkspaceId]); // ✅ Re-load when workspace changes

  // ============================================================
  // CATEGORY CONFIGURATION
  // ============================================================

  const categories = [
    {
      id: 'Standards' as KnowledgeTab,
      label: 'Standards',
      description: 'Codes, standards and regulations',
      icon: FileText,
      count: categoryCounts.Standards,
    },
    {
      id: 'Formulas' as KnowledgeTab,
      label: 'Formulas',
      description: 'Engineering formulas and references',
      icon: Calculator,
      count: categoryCounts.Formulas,
    },
    {
      id: 'Procedures' as KnowledgeTab,
      label: 'Procedures',
      description: 'Engineering methods and procedures',
      icon: ClipboardList,
      count: categoryCounts.Procedures,
    },
    {
      id: 'Materials' as KnowledgeTab,
      label: 'Materials',
      description: 'Material specifications and guidance',
      icon: Package,
      count: categoryCounts.Materials,
    },
  ];

  // ============================================================
  // FILTER DOCUMENTS
  // ============================================================

  const filteredDocuments = useMemo(() => {
    // Get records for the active category
    const category = TAB_TO_CATEGORY[activeTab];
    const docs = knowledgeRecords.filter(
      (record) => record.category?.toLowerCase() === category
    );

    if (!searchQuery.trim()) {
      return docs;
    }

    const query = searchQuery.toLowerCase().trim();
    return docs.filter((doc) =>
      doc.title?.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.recordNumber?.toLowerCase().includes(query)
    );
  }, [activeTab, searchQuery, knowledgeRecords]);

  // ============================================================
  // CATEGORY CLICK
  // ============================================================

  const handleCategoryClick = (category: KnowledgeTab) => {
    setActiveTab(category);
    setSearchQuery('');
    console.log(`Knowledge category selected: ${category}`);
  };

  // ============================================================
  // ✅ ADD: PREVIEW HANDLER
  // ============================================================

  const handlePreview = (doc: any) => {
    setSelectedRecord(doc);
    setIsViewerOpen(true);
  };

  // ============================================================
  // UPLOAD DOCUMENT
  // ============================================================

  const handleUploadClick = () => {
    console.log(`Upload Document clicked - category: ${activeTab}`);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`📄 File selected: ${file.name} (${file.type}, ${file.size} bytes)`);

    // Reset states
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError(null);
    setUploadMessage(`Uploading ${file.name}...`);

    try {
      // ✅ FIX: Use REAL workspace ID
      const workspaceId = realWorkspaceId || 'ws-001';
      console.log('📤 Uploading with workspaceId:', workspaceId);

      // 2. Create Record Service instance
      const recordService = new RecordService();

      // 3. Create record in Supabase
      console.log(`📝 Creating record for: ${file.name}`);
      const record = await recordService.createRecord({
        workspaceId,
        projectId: undefined,
        ownerType: 'knowledge' as OwnerType,
        ownerId: activeCompanyId || `knowledge-${Date.now()}`,  // ✅ Use company ID
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: `Knowledge document uploaded to ${activeTab}`,
        category: TAB_TO_CATEGORY[activeTab],
        discipline: 'other',
        createdBy: 'user-001',
        metadata: {
          source: 'knowledge',
          knowledgeType: activeTab.toLowerCase(),
          knowledgeTab: activeTab,
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        },
      });

      console.log(`✅ Record created: ${record.id}`);
      setUploadProgress(40);

      // 4. Upload the actual file to Supabase Storage
      console.log(`📤 Uploading file to storage: ${file.name}`);

      // Generate a unique storage path
      const fileExt = file.name.split('.').pop();
      const storagePath = `knowledge/${record.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('records')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      console.log(`✅ File uploaded to storage: ${storagePath}`);
      setUploadProgress(70);

      // 5. Get public URL
      const { data: urlData } = supabase
        .storage
        .from('records')
        .getPublicUrl(storagePath);

      const storageUrl = urlData?.publicUrl || '';

      // 6. Update record with file information
      console.log(`📝 Updating record with file info: ${record.id}`);
      const updatedRecord = await recordService.uploadFile(
        record.id,
        file,
        storageUrl,
        'user-001',
        storagePath
      );

      console.log(`✅ Record updated with file: ${updatedRecord?.id}`);
      setUploadProgress(100);
      setUploadStatus('success');
      setUploadMessage(`✅ ${file.name} uploaded successfully!`);

      // 7. Reload knowledge records
      await loadKnowledgeRecords();

      // 8. Reset after 2 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);

      console.log(`🎉 Upload complete: ${file.name} -> ${record.id}`);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Engineering Intelligence
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your engineering knowledge base, standards and technical references.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={onOpenAIChat}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <Sparkles size={16} />
            Ask AI
          </button>

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition shadow-sm ${isUploading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <Check size={16} />
                Uploaded!
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Document
              </>
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileSelected}
          />

        </div>
      </div>

      {/* Upload progress bar */}
      {isUploading && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Upload message */}
      {uploadMessage && (
        <div className={`p-3 rounded-lg text-sm ${uploadStatus === 'error'
          ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          : uploadStatus === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
          {uploadMessage}
        </div>
      )}

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="relative">

        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search your knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 transition text-sm"
        />

      </div>


      {/* ======================================================
          KNOWLEDGE CATEGORY TABS
      ====================================================== */}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">

        {categories.map((category) => {

          const Icon = category.icon;
          const isActive = activeTab === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={`
                inline-flex items-center gap-2
                px-4 py-2.5
                rounded-lg
                text-sm font-medium
                transition
                ${isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <Icon size={16} />
              {category.label}
              <span className="ml-1 text-xs opacity-70">
                ({category.count})
              </span>
            </button>
          );
        })}

      </div>


      {/* ======================================================
          CATEGORY CARDS
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {categories.map((category) => {

          const Icon = category.icon;
          const isActive = activeTab === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={`
                text-left
                bg-white dark:bg-slate-900
                p-4
                rounded-xl
                border
                transition
                ${isActive
                  ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                }
              `}
            >

              <Icon
                className="text-emerald-500 mb-3"
                size={24}
              />

              <p className="font-semibold text-slate-900 dark:text-white">
                {category.label}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {category.description}
              </p>

              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3">
                {category.count} documents
              </p>

            </button>
          );
        })}

      </div>


      {/* ======================================================
          ACTIVE KNOWLEDGE SECTION
      ====================================================== */}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">

        <div className="p-6 border-b border-slate-200 dark:border-slate-800">

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {activeTab}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} in {activeTab}
          </p>

        </div>


        <div className="p-6">

          {loading ? (

            <div className="py-12 text-center">
              <Loader2 className="mx-auto text-emerald-500 animate-spin" size={32} />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading knowledge records...</p>
            </div>

          ) : filteredDocuments.length === 0 ? (

            <div className="py-12 text-center">

              <BookOpen
                className="mx-auto text-slate-400 mb-3"
                size={32}
              />

              <p className="font-medium text-slate-700 dark:text-slate-300">
                No knowledge items found
              </p>

              <p className="text-sm text-slate-400 mt-1">
                {searchQuery ? 'Try a different search term.' : 'Upload a document to get started.'}
              </p>

            </div>

          ) : (

            <div className="space-y-2">

              {filteredDocuments.map((doc) => (

                <div
                  key={doc.id}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-100 dark:border-slate-800"
                >

                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">

                    <File
                      size={17}
                      className="text-emerald-600 dark:text-emerald-400"
                    />

                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {doc.title || doc.recordNumber}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{doc.recordNumber}</span>
                      {doc.fileName && (
                        <>
                          <span>•</span>
                          <span>{doc.fileName}</span>
                        </>
                      )}
                      {doc.fileSize && (
                        <>
                          <span>•</span>
                          <span>{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                        </>
                      )}
                    </div>

                  </div>

                  {/* ✅ REPLACED: "Open" link with "Preview" button */}
                  {doc.storageUrl && (
                    <button
                      onClick={() => handlePreview(doc)}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </div>


      {/* ======================================================
          RECENTLY USED
      ====================================================== */}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">

        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
          Recently Used
        </h2>

        <div className="space-y-2">

          {knowledgeRecords.slice(0, 5).map((doc) => (

            <div
              key={doc.id}
              className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >

              <FileText
                size={16}
                className="text-emerald-500"
              />

              <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                {doc.title || doc.recordNumber}
              </span>

              <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
                {doc.category}
              </span>

            </div>

          ))}

          {knowledgeRecords.length === 0 && (
            <p className="text-sm text-slate-400 py-2">No recent documents</p>
          )}

        </div>

      </div>

      {/* ======================================================
          ✅ ADD: DOCUMENT VIEWER MODAL
      ====================================================== */}

      {isViewerOpen && selectedRecord && (
        <DocumentViewer
          record={selectedRecord}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedRecord(null);
          }}
        />
      )}

    </div>
  );
};

export default EngineeringIntelligence;