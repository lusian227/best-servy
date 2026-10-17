// src/components/ai/DigitalTwin.tsx

import React, { useState } from 'react';
import { DigitalTwinNode, SingleSourceLink } from '../../types';
import { sampleDigitalTwinNodes, sampleLinkedAssets } from '../../data/mockData';
import { Layers, Activity, AlertTriangle, CheckCircle, ShieldCheck, Search, Filter, Eye } from 'lucide-react';

interface DigitalTwinProps {
  onSelectNode: (node: DigitalTwinNode, links: SingleSourceLink[]) => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ onSelectNode }) => {
  const [nodes, setNodes] = useState<DigitalTwinNode[]>(sampleDigitalTwinNodes);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [SelectedNodeId, setSelectedNodeId] = useState<string>(sampleDigitalTwinNodes[0].id);

  const filteredNodes = nodes.filter((n) => {
    if (filterType !== 'All' && n.type !== filterType) return false;
    if (filterStatus !== 'All' && n.status !== filterStatus) return false;
    return true;
  });

  const SelectedNode = nodes.find((n) => n.id === SelectedNodeId) || nodes[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Digital Twin Workspace & Structural Mesh Engine</span>
          </div>
          <h2 className="text-xl font-bold">Interactive Building Element Twin</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time stress, deflection, sensor telemetries & Single Source asset connections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-900/80 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold">
            5 Active Telemetry Nodes
          </span>
        </div>
      </div>

      {/* Main Grid: Visual Twin Canvas + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Twin Canvas */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between min-h-[480px]">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Element Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white p-1.5 rounded-lg text-xs"
              >
                <option value="All">All Types</option>
                <option value="Column">Columns</option>
                <option value="Beam">Beams</option>
                <option value="Foundation">Foundations</option>
                <option value="Slab">Slabs / Core Walls</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white p-1.5 rounded-lg text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Normal">Normal</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Interactive Structural Wireframe Viewport */}
          <div className="relative my-4 flex-1 bg-slate-900/80 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              LIVE TELEMETRY STREAM
            </div>

            {/* Building Grid Elevation Mock Representation */}
            <div className="w-full max-w-lg space-y-4 py-8">
              {/* Level 2 Transfer Beam */}
              <div className="border-t-4 border-slate-700 pt-3 relative">
                <span className="absolute -top-3 left-0 bg-slate-800 px-2 text-[10px] text-slate-400 font-mono">
                  LEVEL 2 TRANSFERS
                </span>

                <div className="grid grid-cols-3 gap-4 my-2">
                  {nodes
                    .filter((n) => (n?.floor ?? 'Unknown') === '2' || n.type === 'Beam')
                    .map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-xl border font-mono text-left transition-all relative ${SelectedNodeId === node.id ? 'ring-2 ring-emerald-500 scale-105 shadow-lg' : ''
                          } ${node.status === 'Warning'
                            ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                            : 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                          }`}
                      >
                        <div className="text-[10px] opacity-80">{node.type}</div>
                        <div className="font-bold text-xs truncate">{node.elementName}</div>
                        <div className="text-[10px] mt-1 font-sans">Ratio: {node?.stressRatio ?? 0}</div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Level 1 Columns */}
              <div className="border-t-4 border-slate-700 pt-3 relative">
                <span className="absolute -top-3 left-0 bg-slate-800 px-2 text-[10px] text-slate-400 font-mono">
                  LEVEL 1 VERTICAL ELEMENTS
                </span>

                <div className="grid grid-cols-2 gap-4 my-2">
                  {nodes
                    .filter((n) => (n?.floor ?? 'Unknown') === '1' && n.type === 'Column')
                    .map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-xl border font-mono text-left transition-all relative ${SelectedNodeId === node.id ? 'ring-2 ring-emerald-500 scale-105 shadow-lg' : ''
                          } ${node.status === 'Warning'
                            ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                      >
                        <div className="text-[10px] opacity-80">{node.type}</div>
                        <div className="font-bold text-xs truncate">{node.elementName}</div>
                        <div className="text-[10px] mt-1 font-sans">Stress: {((node?.stressRatio ?? 0) * 100).toFixed(0)}%</div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Substructure Foundation */}
              <div className="border-t-8 border-emerald-900/60 pt-3 relative">
                <span className="absolute -top-3 left-0 bg-slate-800 px-2 text-[10px] text-emerald-400 font-mono">
                  SUBSTRUCTURE FOUNDATION PILES
                </span>

                <div className="grid grid-cols-1 gap-4 my-2">
                  {nodes
                    .filter((n) => n.type === 'Foundation')
                    .map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-xl border font-mono text-left transition-all ${SelectedNodeId === node.id ? 'ring-2 ring-emerald-500 scale-105 shadow-lg' : ''
                          } bg-emerald-950/40 border-emerald-600 text-emerald-200`}
                      >
                        <div className="text-[10px] opacity-80">{node.type}</div>
                        <div className="font-bold text-xs truncate">{node.elementName}</div>
                        <div className="text-[10px] mt-1 font-sans">{node?.properties?.sensorReading ?? 'N/A'}</div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Click any node element to view sensor details & linked Single Source truth assets.</span>
            <span className="text-emerald-400 font-mono font-bold">Model FPS: 60 (WebGL Mesh)</span>
          </div>
        </div>

        {/* Selected Node Inspector Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                  Node Inspector
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {SelectedNode.elementName}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${SelectedNode.status === 'Warning'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  }`}
              >
                {SelectedNode.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Element Category</span>
                <span className="font-bold text-slate-900 dark:text-white">{SelectedNode.type}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Location Floor</span>
                <span className="font-bold text-slate-900 dark:text-white">{SelectedNode.floor || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Concrete Grade</span>
                <span className="font-bold text-slate-900 dark:text-white">{SelectedNode.concreteGrade || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Capacity Ratio</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {SelectedNode?.stressRatio ?? 0} ({((SelectedNode?.stressRatio ?? 0) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Sensor Telemetry Detail */}
            <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Sensor Telemetry
                </span>
                <span>Last Tested: {SelectedNode.lastTestedDate || 'N/A'}</span>
              </div>
              <p className="font-mono text-slate-200 text-xs bg-slate-950 p-2 rounded border border-slate-800">
                {SelectedNode?.properties?.sensorReading || 'Ultrasonic Velocity: 4.2 km/s (Sound Concrete)'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Calculated Deflection:</span>
                <span className="text-white font-bold">{SelectedNode.deflectionMm || 0} mm</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onSelectNode(SelectedNode, sampleLinkedAssets)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <Eye className="w-4 h-4" />
              Trace Single Source Connected Assets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};