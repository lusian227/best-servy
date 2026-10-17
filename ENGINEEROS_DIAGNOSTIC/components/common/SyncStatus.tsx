// src/components/common/SyncStatus.tsx - DISABLED (no DB queries)

import React from 'react';
import { CheckCircle } from 'lucide-react';

export function SyncStatus() {
  // Component is disabled - always shows "Synced" with no DB queries
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
      <CheckCircle className="h-4 w-4 text-emerald-500" />
      <span className="text-emerald-500 text-xs">Synced</span>
    </div>
  );
}
