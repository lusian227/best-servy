import React from 'react';
import { SingleSourceLink } from '../../types';
import { FileText, Camera, CheckSquare, ShieldCheck, AlertCircle, Bookmark } from 'lucide-react';

interface AssetLinkBadgeProps {
  asset: SingleSourceLink;
  onSelect?: (asset: SingleSourceLink) => void;
  compact?: boolean;
}

export const AssetLinkBadge: React.FC<AssetLinkBadgeProps> = ({ asset, onSelect, compact = false }) => {
  const getIcon = () => {
    switch (asset.type) {
      case 'drawing':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'photo':
        return <Camera className="w-3.5 h-3.5 text-amber-500" />;
      case 'decision':
        return <Bookmark className="w-3.5 h-3.5 text-emerald-500" />;
      case 'rfi':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      case 'inspection':
      case 'test':
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const getTypeStyle = () => {
    switch (asset.type) {
      case 'decision':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'drawing':
        return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'rfi':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'photo':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(asset)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border transition-colors hover:brightness-95 ${getTypeStyle()}`}
      >
        {getIcon()}
        <span className="truncate max-w-[120px]">{asset.title}</span>
      </button>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(asset)}
      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${getTypeStyle()}`}
    >
      <div className="mt-0.5 shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-xs truncate">{asset.title}</span>
          {asset.status && (
            <span className="text-[10px] px-1.5 py-0.2 font-mono rounded bg-white/60 dark:bg-black/30 border border-current">
              {asset.status}
            </span>
          )}
        </div>
        {asset.subtitle && <p className="text-[11px] opacity-80 truncate">{asset.subtitle}</p>}
        <div className="text-[10px] opacity-60 mt-1 font-mono">{asset.date}</div>
      </div>
    </div>
  );
};
