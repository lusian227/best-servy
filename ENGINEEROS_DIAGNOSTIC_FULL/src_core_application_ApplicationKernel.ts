// src/core/application/ApplicationKernel.ts (updated)
import { Container } from '../di/Container';
import { ServiceRegistry } from '../di/ServiceRegistry';
import { ModuleManager } from '../modules/ModuleManager';
import { EventBus } from '../events/EventBus';
import { EventStore } from '../events/EventStore';
import { OutboxService } from '../events/OutboxService';
import { CommandBus } from '../commands/CommandBus';
import { QueryBus } from '../queries/QueryBus';
import { PolicyEngine } from '../policies/PolicyEngine';
import { WorkflowEngine } from '../workflow/WorkflowEngine';
import { JobQueue } from '../jobs/JobQueue';
import { CacheManager } from '../cache/CacheManager';
import { RealtimeService } from '../realtime/RealtimeService';
import { Logger } from '../observability/Logger';
import { Metrics } from '../observability/Metrics';
import { HealthService } from '../observability/HealthService';
import { FeatureFlagService } from '../../auth/services/FeatureFlagService';
import { SessionManager } from '../../auth/services/SessionManager';
import { SearchService } from '../search/SearchService';
import { DistributedLockService } from '../locking/DistributedLockService';
import { ProjectionEngine } from '../projections/ProjectionEngine';
import { SagaCoordinatorImpl } from '../sagas/SagaCoordinator';
import { BoundedContextManager } from '../contexts/BoundedContexts';
import { DrawingProjectionHandler } from '../projections/handlers/DrawingProjectionHandler';

export class ApplicationKernel {
  private static instance: ApplicationKernel;
  private isBooted = false;
  private config: KernelConfig;
  private container = Container.getInstance();

  // Services
  private logger = Logger.getInstance();
  private metrics = Metrics.getInstance();
  private eventBus = EventBus.getInstance();
  private eventStore = EventStore.getInstance();
  private outboxService: OutboxService;
  private commandBus = CommandBus.getInstance();
  private queryBus = QueryBus.getInstance();
  private policyEngine = PolicyEngine.getInstance();
  private workflowEngine = WorkflowEngine.getInstance();
  private jobQueue = JobQueue.getInstance();
  private cacheManager = CacheManager.getInstance();
  private moduleManager = ModuleManager.getInstance();
  private realtimeService = RealtimeService.getInstance();
  private healthService = HealthService.getInstance();
  private featureFlagService = FeatureFlagService.getInstance();
  private sessionManager = SessionManager.getInstance();
  private searchService = SearchService.getInstance();
  private lockService = DistributedLockService.getInstance();
  private projectionEngine = ProjectionEngine.getInstance();
  private sagaCoordinator = SagaCoordinatorImpl.getInstance();
  private contextManager = BoundedContextManager.getInstance();

  private constructor() {
    this.config = {
      environment: (process.env.NODE_ENV as any) || 'development',
      logLevel: process.env.VITE_LOG_LEVEL || 'info',
      cacheProvider: 'memory',
      enableEventStore: true,
      enableDistributedLocking: true,
      enableSearch: true,
    };
    this.outboxService = new OutboxService(this.eventStore, this.eventBus);
  }

  static getInstance(): ApplicationKernel {
    if (!ApplicationKernel.instance) {
      ApplicationKernel.instance = new ApplicationKernel();
    }
    return ApplicationKernel.instance;
  }

  async boot(): Promise<void> {
    if (this.isBooted) {
      this.logger.warn('ApplicationKernel already booted');
      return;
    }

    this.logger.info('🚀 Booting EngineerOS Application Kernel...');
    const startTime = Date.now();

    try {
      // 1. Initialize core services
      await this.initializeCoreServices();

      // 2. Initialize infrastructure
      await this.initializeInfrastructure();

      // 3. Register projections
      await this.registerProjections();

      // 4. Register modules
      await this.registerModules();

      // 5. Activate bounded contexts
      await this.activateContexts();

      // 6. Start background services
      await this.startBackgroundServices();

      // 7. Run health checks
      await this.runHealthChecks();

      this.isBooted = true;

      const duration = Date.now() - startTime;
      this.logger.info(`✅ EngineerOS booted successfully in ${duration}ms`);
      this.metrics.record('kernel.boot.duration', duration);

      // Emit boot event
      await this.eventBus.emit({
        type: 'KERNEL_BOOTED' as any,
        payload: { duration, environment: this.config.environment },
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.fatal('❌ Failed to boot EngineerOS', error as Error);
      throw error;
    }
  }

  private async initializeCoreServices(): Promise<void> {
    this.logger.info('📦 Initializing core services...');
    ServiceRegistry.initialize();
    await this.cacheManager.initialize();
  }

  private async initializeInfrastructure(): Promise<void> {
    this.logger.info('🔧 Initializing infrastructure...');

    if (this.config.enableEventStore) {
      await this.eventStore.initialize();
      await this.outboxService.initialize();
      this.logger.info('✅ Event Store initialized');
    }

    if (this.config.enableSearch) {
      await this.searchService.initialize();
      this.logger.info('✅ Search Service initialized');
    }

    if (this.config.enableDistributedLocking) {
      await this.lockService.initialize();
      this.logger.info('✅ Distributed Lock Service initialized');
    }

    await this.sessionManager.initialize();
    this.metrics.record('kernel.infrastructure.initialized', 1);
  }

  private async registerProjections(): Promise<void> {
    this.logger.info('📊 Registering projections...');

    // Register projection handlers
    this.projectionEngine.registerHandler(
      'DRAWING_CREATED' as any,
      new DrawingProjectionHandler()
    );
    this.projectionEngine.registerHandler(
      'DRAWING_APPROVED' as any,
      new DrawingProjectionHandler()
    );
    this.projectionEngine.registerHandler(
      'DRAWING_PUBLISHED' as any,
      new DrawingProjectionHandler()
    );
    this.projectionEngine.registerHandler(
      'DRAWING_SUBMITTED_FOR_REVIEW' as any,
      new DrawingProjectionHandler()
    );
    this.projectionEngine.registerHandler(
      'DRAWING_REJECTED' as any,
      new DrawingProjectionHandler()
    );
    this.projectionEngine.registerHandler(
      'DRAWING_ARCHIVED' as any,
      new DrawingProjectionHandler()
    );

    this.logger.info('✅ Projection handlers registered');
  }

  private async registerModules(): Promise<void> {
    this.logger.info('🧩 Registering modules...');

    const modules = [
      'drawings',
      'records',
      'projects',
      'decisions',
      'assets',
      'rfi',
      'submittals',
      'safety',
      'meetings',
      'scheduling',
    ];

    let registeredCount = 0;

    for (const moduleName of modules) {
      try {
        const moduleDef = await import(`../../modules/${moduleName}/index`);
        this.moduleManager.register(moduleDef.default);
        registeredCount++;
        this.logger.debug(`✅ Module registered: ${moduleName}`);
      } catch (error) {
        this.logger.warn(`⚠️ Failed to register module: ${moduleName}`, error);
      }
    }

    await this.moduleManager.activateAll();
    this.metrics.record('kernel.modules.registered', registeredCount);
    this.logger.info(`✅ ${registeredCount} modules registered and activated`);
  }

  private async activateContexts(): Promise<void> {
    this.logger.info('🎯 Activating bounded contexts...');

    // Activate contexts in dependency order
    const contexts = [
      BoundedContext.IDENTITY,
      BoundedContext.COLLABORATION,
      BoundedContext.ENGINEERING,
      BoundedContext.QUALITY,
      BoundedContext.DOCUMENT,
      BoundedContext.COMMERCIAL,
    ];

    for (const context of contexts) {
      this.contextManager.activate(context);
      this.logger.debug(`✅ Activated: ${context}`);
    }

    this.metrics.record('kernel.contexts.activated', contexts.length);
  }

  private async startBackgroundServices(): Promise<void> {
    this.logger.info('⚙️ Starting background services...');

    // Start outbox processor
    this.outboxService.startProcessing();

    // Start projection engine
    this.projectionEngine.startProcessing();

    // Start job queue
    this.jobQueue.startProcessing();

    // Start realtime presence
    this.realtimeService.startPresenceSync();

    // Start health monitoring
    this.healthService.startMonitoring();

    this.metrics.record('kernel.background.services.started', 1);
    this.logger.info('✅ Background services started');
  }

  private async runHealthChecks(): Promise<void> {
    this.logger.info('🏥 Running health checks...');
    const checks = await this.healthService.runAllChecks();
    const unhealthy = checks.filter(c => c.status !== 'healthy');

    if (unhealthy.length > 0) {
      this.logger.warn(
        `⚠️ ${unhealthy.length} health checks failed`,
        { checks: unhealthy }
      );
    } else {
      this.logger.info('✅ All health checks passed');
    }

    this.metrics.record('kernel.health.checks', checks.length);
  }

  // ... rest of methods remain the same
}
