// src/repositories/DecisionRepository.ts

import { DecisionItem } from '../types';
import { getDecisions, saveDecision } from '../lib/storage';
import { IRepository } from './IRepository';

export class DecisionRepository implements IRepository<DecisionItem> {
  findAll(): DecisionItem[] {
    return getDecisions();
  }

  findById(id: string): DecisionItem | undefined {
    return getDecisions().find(d => d.id === id);
  }

  save(decision: DecisionItem): DecisionItem[] {
    return saveDecision(decision);
  }

  delete(id: string): DecisionItem[] {
    // Implementation if needed
    return getDecisions();
  }
}
