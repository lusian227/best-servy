// src/core/contexts/BoundedContexts.ts

export enum BoundedContext {
  IDENTITY = 'identity',
  ENGINEERING = 'engineering',
  QUALITY = 'quality',
  DOCUMENT = 'document',
  COMMERCIAL = 'commercial',
  COLLABORATION = 'collaboration',
}

export interface BoundedContextDefinition {
  name: BoundedContext;
  description: string;
  modules: string[];
  events: string[];
  commands: string[];
  queries: string[];
  dependencies: BoundedContext[];
}

export const BOUNDED_CONTEXTS: Record<BoundedContext, BoundedContextDefinition> = {
  [BoundedContext.IDENTITY]: {
    name: BoundedContext.IDENTITY,
    description: 'User identity, authentication, authorization, and company management',
    modules: ['auth', 'users', 'companies', 'workspaces', 'permissions'],
    events: ['USER_REGISTERED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'COMPANY_CREATED'],
    commands: ['RegisterUser', 'LoginUser', 'CreateCompany', 'InviteUser'],
    queries: ['GetUserProfile', 'GetCompanyMembers', 'GetUserPermissions'],
    dependencies: [],
  },
  [BoundedContext.ENGINEERING]: {
    name: BoundedContext.ENGINEERING,
    description: 'Engineering core: projects, drawings, assets, survey, schedules',
    modules: ['projects', 'drawings', 'assets', 'survey', 'schedules'],
    events: ['PROJECT_CREATED', 'DRAWING_APPROVED', 'DRAWING_PUBLISHED', 'ASSET_CREATED'],
    commands: ['CreateProject', 'ApproveDrawing', 'PublishDrawing', 'CreateAsset'],
    queries: ['GetProjectDashboard', 'GetDrawingDetails', 'GetAssetList'],
    dependencies: [BoundedContext.IDENTITY, BoundedContext.COLLABORATION],
  },
  [BoundedContext.QUALITY]: {
    name: BoundedContext.QUALITY,
    description: 'Quality management: RFI, NCR, submittals, approvals',
    modules: ['rfi', 'ncr', 'submittals', 'approvals'],
    events: ['RFI_CREATED', 'RFI_ANSWERED', 'NCR_RAISED', 'SUBMITTAL_APPROVED'],
    commands: ['CreateRFI', 'AnswerRFI', 'RaiseNCR', 'ApproveSubmittal'],
    queries: ['GetRFIList', 'GetNCRList', 'GetSubmittalStatus'],
    dependencies: [BoundedContext.IDENTITY, BoundedContext.ENGINEERING],
  },
  [BoundedContext.DOCUMENT]: {
    name: BoundedContext.DOCUMENT,
    description: 'Document management: files, metadata, OCR, versions, retention',
    modules: ['files', 'metadata', 'ocr', 'versions', 'retention'],
    events: ['FILE_UPLOADED', 'FILE_VERSIONED', 'FILE_DELETED', 'OCR_COMPLETED'],
    commands: ['UploadFile', 'VersionFile', 'DeleteFile', 'ProcessOCR'],
    queries: ['GetFileList', 'GetFileMetadata', 'GetFileVersions'],
    dependencies: [BoundedContext.IDENTITY, BoundedContext.ENGINEERING],
  },
  [BoundedContext.COMMERCIAL]: {
    name: BoundedContext.COMMERCIAL,
    description: 'Commercial management: contracts, BOQs, payments, variations',
    modules: ['contracts', 'boqs', 'payments', 'variations'],
    events: ['CONTRACT_SIGNED', 'PAYMENT_APPROVED', 'VARIATION_APPROVED'],
    commands: ['SignContract', 'ApprovePayment', 'ApproveVariation'],
    queries: ['GetContractStatus', 'GetPaymentHistory', 'GetVariationList'],
    dependencies: [BoundedContext.IDENTITY, BoundedContext.ENGINEERING],
  },
  [BoundedContext.COLLABORATION]: {
    name: BoundedContext.COLLABORATION,
    description: 'Collaboration: real-time, notifications, comments, chat',
    modules: ['realtime', 'notifications', 'comments', 'chat'],
    events: ['COMMENT_ADDED', 'REACTION_ADDED', 'PRESENCE_UPDATED'],
    commands: ['AddComment', 'AddReaction', 'UpdatePresence'],
    queries: ['GetComments', 'GetNotifications', 'GetPresence'],
    dependencies: [BoundedContext.IDENTITY],
  },
};

export class BoundedContextManager {
  private static instance: BoundedContextManager;
  private activeContexts: Set<BoundedContext> = new Set();

  static getInstance(): BoundedContextManager {
    if (!BoundedContextManager.instance) {
      BoundedContextManager.instance = new BoundedContextManager();
    }
    return BoundedContextManager.instance;
  }

  activate(context: BoundedContext): void {
    this.activeContexts.add(context);
  }

  deactivate(context: BoundedContext): void {
    this.activeContexts.delete(context);
  }

  isActive(context: BoundedContext): boolean {
    return this.activeContexts.has(context);
  }

  getActiveContexts(): BoundedContext[] {
    return Array.from(this.activeContexts);
  }

  getDependencies(context: BoundedContext): BoundedContext[] {
    return BOUNDED_CONTEXTS[context]?.dependencies || [];
  }

  getModules(context: BoundedContext): string[] {
    return BOUNDED_CONTEXTS[context]?.modules || [];
  }
}