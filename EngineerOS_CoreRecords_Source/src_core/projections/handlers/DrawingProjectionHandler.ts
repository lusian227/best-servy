// src/core/projections/handlers/DrawingProjectionHandler.ts
import { ProjectionHandler } from '../ProjectionEngine';
import { Event, EventType } from '../../events/EventTypes';
import { supabase } from '../../../lib/supabase';
import { Logger } from '../../observability/Logger';

export class DrawingProjectionHandler implements ProjectionHandler {
  private logger = Logger.getInstance();

  canHandle(eventType: EventType): boolean {
    return [
      EventType.DRAWING_APPROVED,
      EventType.DRAWING_PUBLISHED,
      EventType.DRAWING_CREATED,
      EventType.DRAWING_SUBMITTED_FOR_REVIEW,
      EventType.DRAWING_REJECTED,
      EventType.DRAWING_ARCHIVED,
    ].includes(eventType);
  }

  async handle(event: Event): Promise<void> {
    switch (event.type) {
      case EventType.DRAWING_CREATED:
        await this.handleDrawingCreated(event);
        break;
      case EventType.DRAWING_APPROVED:
        await this.handleDrawingApproved(event);
        break;
      case EventType.DRAWING_PUBLISHED:
        await this.handleDrawingPublished(event);
        break;
      case EventType.DRAWING_SUBMITTED_FOR_REVIEW:
        await this.handleDrawingSubmitted(event);
        break;
      case EventType.DRAWING_REJECTED:
        await this.handleDrawingRejected(event);
        break;
      case EventType.DRAWING_ARCHIVED:
        await this.handleDrawingArchived(event);
        break;
    }
  }

  private async handleDrawingCreated(event: Event<{ name: string; projectId: string }>): Promise<void> {
    const { name, projectId } = event.payload;

    await supabase
      .from('drawing_summaries')
      .insert({
        drawing_id: event.id,
        project_id: projectId,
        name,
        status: 'draft',
        version: 1,
        updated_at: new Date().toISOString(),
      });

    // Update project metrics
    await this.updateProjectMetrics(projectId);
  }

  private async handleDrawingApproved(event: Event<{ approvedBy: string; comments?: string }>): Promise<void> {
    const { approvedBy, comments } = event.payload;

    await supabase
      .from('drawing_summaries')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        comments,
        updated_at: new Date().toISOString(),
      })
      .eq('drawing_id', event.id);

    // Update project metrics
    const drawing = await supabase
      .from('drawings')
      .select('project_id')
      .eq('id', event.id)
      .single();

    if (drawing.data) {
      await this.updateProjectMetrics(drawing.data.project_id);
    }
  }

  private async handleDrawingPublished(event: Event<{ publishedBy: string }>): Promise<void> {
    const { publishedBy } = event.payload;

    await supabase
      .from('drawing_summaries')
      .update({
        status: 'published',
        published_by: publishedBy,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('drawing_id', event.id);
  }

  private async handleDrawingSubmitted(event: Event<{ previousStatus: string }>): Promise<void> {
    await supabase
      .from('drawing_summaries')
      .update({
        status: 'in_review',
        updated_at: new Date().toISOString(),
      })
      .eq('drawing_id', event.id);
  }

  private async handleDrawingRejected(event: Event<{ rejectedBy: string; comments?: string }>): Promise<void> {
    const { rejectedBy, comments } = event.payload;

    await supabase
      .from('drawing_summaries')
      .update({
        status: 'rejected',
        rejected_by: rejectedBy,
        rejected_at: new Date().toISOString(),
        comments,
        updated_at: new Date().toISOString(),
      })
      .eq('drawing_id', event.id);
  }

  private async handleDrawingArchived(event: Event<{ previousStatus: string }>): Promise<void> {
    await supabase
      .from('drawing_summaries')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('drawing_id', event.id);
  }

  private async updateProjectMetrics(projectId: string): Promise<void> {
    // Recalculate project metrics
    const drawings = await supabase
      .from('drawings')
      .select('status')
      .eq('project_id', projectId);

    const drawingCount = drawings.data?.length || 0;
    const approved = drawings.data?.filter(d => d.status === 'approved').length || 0;
    const inReview = drawings.data?.filter(d => d.status === 'in_review').length || 0;
    const draft = drawings.data?.filter(d => d.status === 'draft').length || 0;

    // Update project dashboard projection
    await supabase
      .from('project_dashboards')
      .upsert({
        project_id: projectId,
        drawing_count: drawingCount,
        drawing_approved: approved,
        drawing_in_review: inReview,
        drawing_draft: draft,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id',
      });
  }
}
