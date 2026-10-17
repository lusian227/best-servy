import React from 'react';
import { RecordLibrary } from './RecordLibrary';

interface RecordListProps {
  workspaceId: string;
}

export function RecordList({ workspaceId }: RecordListProps) {
  return <RecordLibrary workspaceId={workspaceId} />;
}