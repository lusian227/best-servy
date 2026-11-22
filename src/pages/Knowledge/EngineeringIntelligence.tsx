// src/pages/Knowledge/EngineeringIntelligence.tsx

import ReactMarkdown from 'react-markdown';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import type {
  RecordCategory,
  OwnerType,
  Discipline,
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
  Plus,
  X,
  Save,
  Send,
  Edit,
  Camera,
  Video,
  ImagePlus,
  FileUp,
  Trash2,
  Paperclip,
  Square,
} from 'lucide-react';

// Import Records Service for knowledge uploads
import { RecordService } from '../../modules/records/services/RecordService';
import { supabase } from '../../lib/supabase';
// ✅ ADD: Import company store for workspace
import { useCompanyStore } from '../../stores/companyStore';
// ✅ ADD: Import DocumentViewer
import { DocumentViewer } from '../../components/common/DocumentViewer';

import { useAuth } from '../../contexts/AuthContext';

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
  const { user, profile, loading: authLoading } = useAuth();

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

  // Read-only viewer for written Knowledge records
  const [isKnowledgePreviewOpen, setIsKnowledgePreviewOpen] = useState(false);
  const [previewKnowledgeRecord, setPreviewKnowledgeRecord] = useState<any>(null);

  // Knowledge writing editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [knowledgeTitle, setKnowledgeTitle] = useState('');
  const [knowledgeDescription, setKnowledgeDescription] = useState('');
  const [knowledgeContent, setKnowledgeContent] = useState('');
  const [knowledgeDiscipline, setKnowledgeDiscipline] = useState<Discipline>('civil');
  const [knowledgeSaving, setKnowledgeSaving] = useState(false);
  const [knowledgeSaveMessage, setKnowledgeSaveMessage] = useState('');
  const [knowledgeSaveError, setKnowledgeSaveError] = useState('');

  // Tab state for the editor
  const [editorTab, setEditorTab] = useState<'write' | 'preview' | 'attachments'>('write');

  // Knowledge attachments: photos, videos and documents
  type KnowledgeAttachment = {
    id: string;
    file?: File;
    name: string;
    type: 'image' | 'video' | 'document';
    previewUrl?: string;
    url?: string;
    storagePath?: string;
  };

  const [knowledgeAttachments, setKnowledgeAttachments] = useState<KnowledgeAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);

  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Add selected photos, videos and documents to the knowledge editor
  const addKnowledgeFiles = (
    files: FileList | File[],
    type: 'image' | 'video' | 'document'
  ) => {
    const newAttachments: KnowledgeAttachment[] = Array.from(files).map(
      (file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        type,
        previewUrl: type === 'document' ? undefined : URL.createObjectURL(file),
      })
    );

    setKnowledgeAttachments((previous) => [
      ...previous,
      ...newAttachments,
    ]);
  };

  // Remove an attachment before saving the knowledge record
  const removeKnowledgeAttachment = (id: string) => {
    setKnowledgeAttachments((previous) => {
      const attachment = previous.find((item) => item.id === id);

      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }

      return previous.filter((item) => item.id !== id);
    });
  };

  // Start video recording using the device camera
  const startVideoRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }

      if (!window.MediaRecorder) {
        throw new Error('Video recording is not supported by this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setCameraStream(stream);
      setCameraMode('video');

      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || 'video/webm',
        });

        const videoFile = new globalThis.File(
          [videoBlob],
          `knowledge-video-${Date.now()}.webm`,
          { type: videoBlob.type }
        );

        addKnowledgeFiles([videoFile], 'video');

        stream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
        setCameraMode(null);
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Camera recording error:', error);
      setKnowledgeSaveError(
        error instanceof Error ? error.message : 'Unable to access the camera.'
      );
    }
  };

  // Stop the current video recording
  const stopVideoRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Open a live camera preview for taking a photo
  const startPhotoCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      setCameraStream(stream);
      setCameraMode('photo');
    } catch (error) {
      console.error('Photo camera error:', error);
      setKnowledgeSaveError(
        error instanceof Error ? error.message : 'Unable to open camera.'
      );
    }
  };

  // Capture a photo from the live camera preview
  const capturePhoto = () => {
    const video = cameraVideoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setKnowledgeSaveError('Camera is not ready. Please wait a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      setKnowledgeSaveError('Unable to capture the photo.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setKnowledgeSaveError('Unable to create the photo.');
        return;
      }

      const photoFile = new globalThis.File(
        [blob],
        `knowledge-photo-${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      );

      addKnowledgeFiles([photoFile], 'image');

      cameraStream?.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraMode(null);
    }, 'image/jpeg', 0.92);
  };

  // Close the live camera without capturing
  const closeCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraMode(null);
  };

  // Connect the camera stream to the video element safely
  useEffect(() => {
    if (cameraStream && cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = cameraStream;

      void cameraVideoRef.current.play().catch((error) => {
        console.error('Camera preview error:', error);
      });
    }
  }, [cameraStream, cameraMode]);

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

      // Do not load records without a real workspace
      if (!realWorkspaceId) {
        setKnowledgeRecords([]);
        setCategoryCounts({
          Standards: 0,
          Formulas: 0,
          Procedures: 0,
          Materials: 0,
        });
        return;
      }

      const recordService = new RecordService();

      const records = await recordService.getRecords({
        workspaceId: realWorkspaceId,
        projectId: undefined,
        ownerType: 'knowledge' as OwnerType,
      });

      console.log('Loaded knowledge records:', records.length);
      setKnowledgeRecords(records);

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
      console.log('Knowledge category counts:', counts);

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
  // PREVIEW HANDLER
  // ============================================================

  const handlePreview = (doc: any) => {
    if (doc.metadata?.content) {
      // Open written Knowledge in read-only preview
      setPreviewKnowledgeRecord(doc);
      setIsKnowledgePreviewOpen(true);
    } else {
      // Keep uploaded documents in the existing file viewer
      setSelectedRecord(doc);
      setIsViewerOpen(true);
    }
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
      // Guard: cannot upload without a real workspace
      if (!realWorkspaceId) {
        setUploadStatus('error');
        setUploadError('No workspace found. Please sign in to a workspace first.');
        setUploadMessage('❌ Upload failed: no active workspace.');
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Guard: must be signed in
      if (!user?.id) {
        setUploadStatus('error');
        setUploadError('You must be signed in to upload.');
        setUploadMessage('❌ Upload failed: not signed in.');
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const userId = user.id;
      const workspaceId = realWorkspaceId;
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
        createdBy: userId,
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
        userId,
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
  // SAVE OR PUBLISH WRITTEN KNOWLEDGE
  // ============================================================

  const handleSaveKnowledge = async (status: 'draft' | 'submitted') => {
    // Validate required fields
    if (!knowledgeTitle.trim()) {
      setKnowledgeSaveError('Please enter a knowledge title.');
      return;
    }

    if (!knowledgeContent.trim()) {
      setKnowledgeSaveError('Please enter the knowledge content.');
      return;
    }

    // Require a real workspace
    if (!realWorkspaceId) {
      setKnowledgeSaveError('No active workspace found.');
      return;
    }

    // Require an authenticated user
    if (!user?.id) {
      setKnowledgeSaveError('You must be signed in to save knowledge.');
      return;
    }

    try {
      setKnowledgeSaving(true);
      setKnowledgeSaveError('');
      setKnowledgeSaveMessage('');

      const recordService = new RecordService();
      const now = new Date().toISOString();

      // 1. Upload attachments first (if any)
      const uploadedAttachments: any[] = [];

      for (const attachment of knowledgeAttachments) {
        // Keep previously saved attachments without uploading them again
        if (!attachment.file) {
          if (attachment.url) {
            uploadedAttachments.push({
              id: attachment.id,
              name: attachment.name,
              type: attachment.type,
              url: attachment.url,
              storagePath: attachment.storagePath,
            });
          }
          continue;
        }

        // Upload newly added attachments
        const fileExt = attachment.name.split('.').pop();
        const storagePath =
          `knowledge/attachments/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase
          .storage
          .from('records')
          .upload(storagePath, attachment.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Failed to upload ${attachment.name}: ${uploadError.message}`
          );
        }

        const { data: urlData } = supabase
          .storage
          .from('records')
          .getPublicUrl(storagePath);

        uploadedAttachments.push({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          url: urlData?.publicUrl || '',
          storagePath,
        });
      }

      // 2. Prepare metadata including attachments
      const metadata: Record<string, unknown> = {
        ...(editingRecord?.metadata || {}),
        source: 'knowledge',
        knowledgeType: activeTab.toLowerCase(),
        knowledgeTab: activeTab,
        content: knowledgeContent,
        contentFormat: 'markdown',
        lastEditedAt: now,
        attachments: uploadedAttachments, // 👈 Save the new attachments here
      };

      if (status === 'submitted') {
        metadata.submittedAt = now;
      }

      if (editingRecord?.id) {
        // Update an existing knowledge record
        const updatedRecord = await recordService.updateRecord(
          editingRecord.id,
          {
            title: knowledgeTitle.trim(),
            description: knowledgeDescription.trim() || null,
            category: TAB_TO_CATEGORY[activeTab],
            discipline: knowledgeDiscipline,
            status,
            metadata,
            updatedBy: user.id,
          }
        );

        if (!updatedRecord) {
          throw new Error('Knowledge record could not be updated.');
        }

      } else {
        // Create a new knowledge record
        const newRecord = await recordService.createRecord({
          workspaceId: realWorkspaceId,
          projectId: undefined,
          ownerType: 'knowledge',
          ownerId: activeCompanyId || null,
          title: knowledgeTitle.trim(),
          description: knowledgeDescription.trim() || null,
          category: TAB_TO_CATEGORY[activeTab],
          discipline: knowledgeDiscipline,
          createdBy: user.id,
          updatedBy: user.id,
          metadata,
        });

        if (status === 'submitted') {
          const submittedRecord = await recordService.updateRecord(
            newRecord.id,
            {
              status: 'submitted',
              metadata,
              updatedBy: user.id,
            }
          );

          if (!submittedRecord) {
            throw new Error(
              'Knowledge was saved as a draft but could not be submitted.'
            );
          }
        }
      }

      await loadKnowledgeRecords();

      // Clear attachments after successful save
      setKnowledgeAttachments([]);

      setKnowledgeSaveMessage(
        status === 'draft'
          ? 'Knowledge saved successfully as a draft.'
          : 'Knowledge submitted successfully for review.'
      );

      console.log('Knowledge saved successfully:', {
        title: knowledgeTitle.trim(),
        status,
      });

    } catch (error) {
      console.error('Failed to save knowledge:', error);

      setKnowledgeSaveError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while saving knowledge.'
      );

    } finally {
      setKnowledgeSaving(false);
    }
  };

  // ============================================================
  // KNOWLEDGE EDITOR CONTROLS
  // ============================================================

  const handleNewKnowledge = () => {
    setEditingRecord(null);
    setKnowledgeTitle('');
    setKnowledgeDescription('');
    setKnowledgeContent('');
    setKnowledgeDiscipline('civil');
    setKnowledgeSaveMessage('');
    setKnowledgeSaveError('');
    setKnowledgeAttachments([]); // Clear old attachments
    setEditorTab('write'); // Reset tab
    setIsEditorOpen(true);
  };

  const handleEditKnowledge = (record: any) => {
    setEditingRecord(record);
    setKnowledgeTitle(record.title || '');
    setKnowledgeDescription(record.description || '');
    setKnowledgeContent(record.metadata?.content || '');
    setKnowledgeDiscipline(record.discipline || 'civil');

    // Restore attachments already saved with this Knowledge record
    const savedAttachments = Array.isArray(record.metadata?.attachments)
      ? record.metadata.attachments
      : [];

    setKnowledgeAttachments(
      savedAttachments.map((attachment: any) => ({
        id: attachment.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: attachment.name,
        type: attachment.type,
        url: attachment.url,
        storagePath: attachment.storagePath,
        previewUrl:
          attachment.type === 'image' || attachment.type === 'video'
            ? attachment.url
            : undefined,
      }))
    );

    const recordCategory = record.category?.toLowerCase();
    const matchingTab = CATEGORY_TO_TAB[recordCategory];
    if (matchingTab) {
      setActiveTab(matchingTab);
    }

    setKnowledgeSaveMessage('');
    setKnowledgeSaveError('');
    setEditorTab('write'); // Reset tab
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingRecord(null);
    setKnowledgeSaveMessage('');
    setKnowledgeSaveError('');
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

        <div className="flex items-center gap-2 flex-wrap">

          <button
            type="button"
            onClick={handleNewKnowledge}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition font-medium shadow-sm"
          >
            <Plus size={16} />
            Write Knowledge
          </button>

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

                  {doc.metadata?.content ? (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePreview(doc)}
                        className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditKnowledge(doc)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-medium flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePreview(doc)}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-1 shrink-0"
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
    READ-ONLY KNOWLEDGE PREVIEW MODAL
====================================================== */}

      {isKnowledgePreviewOpen && previewKnowledgeRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {previewKnowledgeRecord.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {previewKnowledgeRecord.category} · {previewKnowledgeRecord.discipline || 'General'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsKnowledgePreviewOpen(false);
                  setPreviewKnowledgeRecord(null);
                }}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            {previewKnowledgeRecord.description && (
              <div className="px-6 pt-5 text-sm text-slate-600 dark:text-slate-300">
                {previewKnowledgeRecord.description}
              </div>
            )}

            {/* Knowledge content */}
            <div className="flex-1 overflow-y-auto p-6">
              <article className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none break-words">
                <ReactMarkdown>
                  {previewKnowledgeRecord.metadata?.content || ''}
                </ReactMarkdown>
              </article>

              {!previewKnowledgeRecord.metadata?.content && (
                <p className="text-sm text-slate-400">
                  No written content is available for this record.
                </p>
              )}

              {/* Saved Attachments */}
              {previewKnowledgeRecord.metadata?.attachments && previewKnowledgeRecord.metadata.attachments.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Paperclip size={16} className="text-emerald-600" />
                    Attachments ({previewKnowledgeRecord.metadata.attachments.length})
                  </h3>
                  <div className="space-y-3">
                    {previewKnowledgeRecord.metadata.attachments.map((attachment: any) => (
                      <div key={attachment.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        {attachment.type === 'image' && (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                            onClick={() => window.open(attachment.url, '_blank')}
                            title="Click to view full size"
                          />
                        )}
                        {attachment.type === 'video' && (
                          <video
                            src={attachment.url}
                            controls
                            preload="metadata"
                            className="w-32 h-20 object-cover rounded-lg bg-black"
                          />
                        )}
                        {attachment.type === 'document' && (
                          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <FileText size={24} className="text-slate-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {attachment.type}
                          </p>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 rounded-md"
                        >
                          Open
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center gap-3">
              <span className="text-xs text-slate-500">
                Status: {previewKnowledgeRecord.status || 'draft'}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const record = previewKnowledgeRecord;
                    setIsKnowledgePreviewOpen(false);
                    setPreviewKnowledgeRecord(null);
                    handleEditKnowledge(record);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Edit size={15} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsKnowledgePreviewOpen(false);
                    setPreviewKnowledgeRecord(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ======================================================
          DOCUMENT VIEWER MODAL
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

      {/* ======================================================
          WRITING EDITOR MODAL
      ====================================================== */}

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingRecord ? 'Edit Knowledge' : 'Write New Knowledge'}
              </h2>
              <button onClick={handleCloseEditor} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {knowledgeSaveError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                  {knowledgeSaveError}
                </div>
              )}
              {knowledgeSaveMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200">
                  {knowledgeSaveMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  value={knowledgeTitle}
                  onChange={(e) => setKnowledgeTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g., Concrete Slump Test Procedure"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <input
                  type="text"
                  value={knowledgeDescription}
                  onChange={(e) => setKnowledgeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Brief summary of this knowledge item"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as KnowledgeTab)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Standards">Standards</option>
                    <option value="Formulas">Formulas</option>
                    <option value="Procedures">Procedures</option>
                    <option value="Materials">Materials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    Discipline
                  </label>
                  <select
                    value={knowledgeDiscipline}
                    onChange={(e) => setKnowledgeDiscipline(e.target.value as Discipline)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="structural">Structural</option>
                    <option value="architectural">Architectural</option>
                    <option value="mep">MEP</option>
                    <option value="civil">Civil</option>
                    <option value="geotechnical">Geotechnical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* TABS */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditorTab('write')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${editorTab === 'write'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('preview')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${editorTab === 'preview'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('attachments')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${editorTab === 'attachments'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  <Paperclip size={16} />
                  Attachments {knowledgeAttachments.length > 0 && `(${knowledgeAttachments.length})`}
                </button>
              </div>

              {/* TAB CONTENT: WRITE */}
              {editorTab === 'write' && (
                <textarea
                  value={knowledgeContent}
                  onChange={(e) => setKnowledgeContent(e.target.value)}
                  rows={16}
                  className="w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm resize-y"
                  placeholder={"# Engineering Topic\n\nWrite your engineering notes here...\n\n## Example\n- Add procedures\n- Include formulas\n- Explain technical requirements"}
                />
              )}

              {/* TAB CONTENT: PREVIEW */}
              {editorTab === 'preview' && (
                <div className="min-h-[390px] max-h-[520px] overflow-y-auto p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {knowledgeContent.trim() ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                      <ReactMarkdown>{knowledgeContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      Your formatted knowledge preview will appear here.
                    </p>
                  )}
                </div>
              )}

              {/* TAB CONTENT: ATTACHMENTS */}
              {editorTab === 'attachments' && (
                <div className="space-y-4">
                  {/* Hidden file inputs */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) addKnowledgeFiles(e.target.files, 'image');
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) addKnowledgeFiles(e.target.files, 'video');
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) addKnowledgeFiles(e.target.files, 'document');
                      e.target.value = '';
                    }}
                  />

                  {/* Attachment buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={startPhotoCapture}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      <Camera size={22} />
                      <span className="text-sm font-medium">Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                    >
                      <ImagePlus size={22} />
                      <span className="text-sm font-medium">Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={startVideoRecording}
                      disabled={isRecording}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 disabled:opacity-50"
                    >
                      <Video size={22} />
                      <span className="text-sm font-medium">Record Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                    >
                      <Video size={22} />
                      <span className="text-sm font-medium">Upload Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => documentInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                    >
                      <FileUp size={22} />
                      <span className="text-sm font-medium">Upload Document</span>
                    </button>
                  </div>

                  {/* Camera preview (photo and video) */}
                  {cameraMode && (
                    <div className="p-3 rounded-xl border border-slate-300 dark:border-slate-700">
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full max-h-80 rounded-lg bg-black"
                      />

                      {cameraMode === 'photo' ? (
                        <div className="flex gap-3 mt-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                          >
                            <Camera size={18} className="inline mr-2" />
                            Capture Photo
                          </button>

                          <button
                            type="button"
                            onClick={closeCamera}
                            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={stopVideoRecording}
                          disabled={!isRecording}
                          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
                        >
                          <Square size={18} />
                          Stop Recording
                        </button>
                      )}
                    </div>
                  )}

                  {/* Selected attachments */}
                  {knowledgeAttachments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Selected Attachments ({knowledgeAttachments.length})
                      </h4>
                      {knowledgeAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          {attachment.previewUrl && attachment.type === 'image' && (
                            <img
                              src={attachment.previewUrl}
                              alt={attachment.name}
                              className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                              onClick={() => window.open(attachment.previewUrl, '_blank')}
                              title="Click to view full size"
                            />
                          )}
                          {attachment.previewUrl && attachment.type === 'video' && (
                            <video
                              src={attachment.previewUrl}
                              controls
                              preload="metadata"
                              className="w-24 h-16 object-cover rounded-lg bg-black"
                            />
                          )}
                          {attachment.type === 'document' && (
                            <FileText size={28} className="text-emerald-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {attachment.type}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeKnowledgeAttachment(attachment.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                            title="Remove attachment"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={handleCloseEditor}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSaveKnowledge('draft')}
                disabled={knowledgeSaving}
                className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 text-slate-700 dark:text-slate-300 transition"
              >
                {knowledgeSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Draft
              </button>

              <button
                onClick={() => handleSaveKnowledge('submitted')}
                disabled={knowledgeSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 flex items-center gap-2 transition shadow-sm"
              >
                {knowledgeSaving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Publish
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EngineeringIntelligence;