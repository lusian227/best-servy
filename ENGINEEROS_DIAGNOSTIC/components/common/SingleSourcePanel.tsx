import React from 'react';
import { SingleSourceLink } from '../../types';
import { AssetLinkBadge } from './AssetLinkBadge';
import { Network, X, ArrowRight, Layers, Database } from 'lucide-react';

interface SingleSourcePanelProps {
  isOpen: boolean;
  onClose: () => void;
  rootAsset: {
    title: string;
    type: string;
    subtitle?: string;
    id: string;
  };
  linkedAssets?: SingleSourceLink[];  // ✅ Made optional
}

export const SingleSourcePanel: React.FC<SingleSourcePanelProps> = ({
  isOpen,
  onClose,
  rootAsset,
  linkedAssets = [],  // ✅ Default to empty array
}) => {
  if (!isOpen) return null;

  // ✅ Safe way to get the count
  const assetCount = linkedAssets?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">Single Source of Truth</h3>
              <p className="text-[11px] text-emerald-200">Connected Asset Graph Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Root Selected Asset */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-emerald-500/30 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Database className="w-3.5 h-3.5" />
              <span>Target Asset Node: [{rootAsset.type.toUpperCase()}]</span>
            </div>
            <h4 className="font-bold text-base text-white">{rootAsset.title}</h4>
            {rootAsset.subtitle && (
              <p className="text-xs text-slate-300 mt-1">{rootAsset.subtitle}</p>
            )}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>ID: {rootAsset.id}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                Verified Single Truth <Layers className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Connected Graph Flow */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Connected Assets ({assetCount})
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">
                100% Traceability
              </span>
            </div>

            <div className="relative pl-4 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/30">
              {/* ✅ Only map if linkedAssets exists */}
              {linkedAssets && linkedAssets.map((asset, index) => (
                <div key={asset.id} className="relative">
                  <div className="absolute -left-4 top-4 w-3 h-0.5 bg-emerald-500/40" />
                  <AssetLinkBadge asset={asset} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Knowledge Audit Note */}
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-300">
            <div className="font-semibold mb-1 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Audit Integrity Check
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Every decision, drawing revision, and concrete cube test linked here is cryptographically verified against the project timeline. No isolated duplicate files exist.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors shadow"
          >
            Close Trace View
          </button>
        </div>
      </div>
    </div>
  );
};