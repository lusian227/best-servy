import React from 'react';
import { ProjectHealthMetrics } from '../../types';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ProjectHealthProps {
  health: ProjectHealthMetrics;
}

export const ProjectHealth: React.FC<ProjectHealthProps> = ({ health }) => {
  // ✅ SAFETY CHECK – prevents crash if health is undefined
  if (!health) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400">No health data available for this project.</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Schedule', value: health.schedule || 0, color: 'text-blue-500' },
    { label: 'Quality', value: health.quality || 0, color: 'text-emerald-500' },
    { label: 'Safety', value: health.safety || 0, color: 'text-teal-500' },
    { label: 'Budget', value: health.budget || 0, color: 'text-amber-500' },
    { label: 'Documentation', value: health.documentation || 0, color: 'text-purple-500' },
  ];

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'High':
      case 'Critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      case 'High':
      case 'Critical': return 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Project Health Score</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Overall project health assessment</p>
          </div>
          <div className="text-center">
            <span className="text-4xl font-extrabold text-emerald-500">{health.overall || 0}%</span>
            <p className="text-xs text-slate-400">Overall</p>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${getRiskColor(health.riskLevel)}`}>
        {getRiskIcon(health.riskLevel)}
        <div>
          <p className="font-semibold text-sm">Risk Level: {health.riskLevel || 'Unknown'}</p>
          <p className="text-xs opacity-75">Based on open RFIs, approvals, and current metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">{metric.label}</p>
            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}%</p>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Open RFIs</p>
          <p className="text-xl font-bold text-blue-500">{health.openRFIs || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding Approvals</p>
          <p className="text-xl font-bold text-amber-500">{health.outstandingApprovals || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Weather Impact Days</p>
          <p className="text-xl font-bold text-slate-500">{health.weatherImpactsDays || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Resource Utilization</p>
          <p className="text-xl font-bold text-emerald-500">{health.resourceUtilization || 0}%</p>
        </div>
      </div>

      {/* AI Recommendations */}
      {health.aiRecommendations && health.aiRecommendations.length > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Activity size={16} />
            AI Recommendations
          </h4>
          <ul className="mt-2 space-y-1">
            {health.aiRecommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <span className="text-emerald-500">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};