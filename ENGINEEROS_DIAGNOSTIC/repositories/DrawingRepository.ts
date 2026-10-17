// src/repositories/DrawingRepository.ts

import { DrawingItem } from '../types';
import { getDrawings, saveDrawing } from '../lib/storage';
import { IRepository } from './IRepository';

export class DrawingRepository implements IRepository<DrawingItem> {
  findAll(): DrawingItem[] {
    return getDrawings();
  }

  findById(id: string): DrawingItem | undefined {
    return getDrawings().find(d => d.id === id);
  }

  save(drawing: DrawingItem): DrawingItem[] {
    return saveDrawing(drawing);
  }

  delete(id: string): DrawingItem[] {
    // Implementation if needed
    return getDrawings();
  }
}
