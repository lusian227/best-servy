import React from 'react';
import { ProjectHealthMetrics } from '../../types';

interface ProjectHealthProps {
  health: ProjectHealthMetrics;
}

const ProjectHealth: React.FC<ProjectHealthProps> = ({ health }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const metrics = [
    { label: 'Overall', value: health.overall },
    { label: 'Schedule', value: health.schedule },
    { label: 'Quality', value: health.quality },
    { label: 'Safety', value: health.safety },
    { label: 'Budget', value: health.budget },
    { label: 'Documentation', value: health.documentation },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Project Health</h3>

      {/* Risk Level */}
      <div className="mb-4 p-3 rounded-lg border">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Risk Level</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(health.riskLevel)}`}>
            {health.riskLevel}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">{metric.label}</div>
            <div className={`text-xl font-bold ${getScoreColor(metric.value)}`}>
              {metric.value}%
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="p-2 bg-blue-50 rounded">
          <span className="text-gray-600">RFIs:</span>
          <span className="ml-1 font-medium">{health.openRFIs}</span>
        </div>
        <div className="p-2 bg-purple-50 rounded">
          <span className="text-gray-600">Approvals:</span>
          <span className="ml-1 font-medium">{health.outstandingApprovals}</span>
        </div>
        <div className="p-2 bg-amber-50 rounded">
          <span className="text-gray-600">Weather Days:</span>
          <span className="ml-1 font-medium">{health.weatherImpactsDays}</span>
        </div>
        <div className="p-2 bg-green-50 rounded">
          <span className="text-gray-600">Resources:</span>
          <span className="ml-1 font-medium">{health.resourceUtilization}%</span>
        </div>
      </div>

      {/* AI Recommendations */}
      {health.aiRecommendations && health.aiRecommendations.length > 0 && (
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">AI Recommendations</h4>
          <ul className="text-sm text-indigo-700 space-y-1">
            {health.aiRecommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectHealth;
