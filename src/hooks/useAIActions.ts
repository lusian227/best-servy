// src/hooks/useAIActions.ts

import { useState, useCallback } from 'react';
import { AIActionService } from '../services/AIActionService';
import { SearchResult, AIAction } from '../types/ai';

const actionService = new AIActionService();

export function useAIActions() {
  const [actions, setActions] = useState<AIAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const generateActions = useCallback((results: SearchResult[], query: string) => {
    const generated = actionService.generateActions(results, query);
    setActions(generated);
    return generated;
  }, []);

  const executeAction = useCallback((action: AIAction) => {
    setSelectedAction(action);
    const result = actionService.executeAction(action);
    setExecutionResult(result);
    return result;
  }, []);

  const clearActions = useCallback(() => {
    setActions([]);
    setSelectedAction(null);
    setExecutionResult(null);
  }, []);

  const getActionByType = useCallback((type: string) => {
    return actions.filter(a => a.type === type);
  }, [actions]);

  const getActionById = useCallback((id: string) => {
    return actions.find(a => a.id === id);
  }, [actions]);

  return {
    actions,
    selectedAction,
    executionResult,
    generateActions,
    executeAction,
    clearActions,
    getActionByType,
    getActionById,
  };
}
