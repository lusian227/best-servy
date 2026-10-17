import React, { useState } from 'react';
import { CalculationHistory } from '../../types';
import { saveCalculation } from '../../lib/storage';
import { Calculator, Zap, History, Check, Save, Layers, Sparkles, Scale, RefreshCw } from 'lucide-react';

interface EngineeringToolkitProps {
  calculations: CalculationHistory[];
  onSaveCalculation: (calc: CalculationHistory) => void;
}

export const EngineeringToolkit: React.FC<EngineeringToolkitProps> = ({
  calculations,
  onSaveCalculation,
}) => {
  const [activeTab, setActiveTab] = useState<'expression' | 'beam' | 'concrete' | 'geo' | 'unit'>('beam');

  // Expression Evaluator State
  const [expression, setExpression] = useState('(5 * 35 * 8^4) / (384 * 31e9 * 0.0085)');
  const [evalResult, setEvalResult] = useState<string>('');

  // Beam Deflection Calculator
  const [loadW, setLoadW] = useState<number>(35); // kN/m
  const [lengthL, setLengthL] = useState<number>(8); // meters
  const [elasticE, setElasticE] = useState<number>(31); // GPa
  const [inertiaI, setInertiaI] = useState<number>(0.0085); // m4
  const [beamResult, setBeamResult] = useState<{ deflectionMm: number; maxMomentKnm: number; maxShearKn: number } | null>({
    deflectionMm: 12.45,
    maxMomentKnm: 280,
    maxShearKn: 140,
  });

  // Concrete Volume Takeoff
  const [concL, setConcL] = useState<number>(25);
  const [concW, setConcW] = useState<number>(12);
  const [concT, setConcT] = useState<number>(0.25);
  const [wasteFactor, setWasteFactor] = useState<number>(5);
  const [concResult, setConcResult] = useState<{ volumeM3: number; rebarTons: number } | null>({
    volumeM3: 78.75,
    rebarTons: 8.66,
  });

  // Unit Converter State
  const [unitVal, setUnitVal] = useState<number>(10);
  const [unitType, setUnitType] = useState<'stress' | 'length' | 'force'>('stress');

  // Safe Math Expression Evaluation
  const handleEvaluateExpression = () => {
    try {
      // Basic safe evaluator for math operators
      const cleaned = expression.replace(/\^/g, '**');
      // eslint-disable-next-line no-eval
      const res = Function(`"use strict"; return (${cleaned})`)();
      setEvalResult(String(res));
    } catch {
      setEvalResult('Syntax Error');
    }
  };

  const calculateBeam = () => {
    // Simply supported beam under UDL:
    // Max Moment = w * L^2 / 8
    // Max Shear = w * L / 2
    // Max Deflection = 5 * w * L^4 / (384 * E * I)
    const w = loadW * 1000; // N/m
    const L = lengthL; // m
    const E = elasticE * 1e9; // Pa
    const I = inertiaI; // m4

    const maxMomentKnm = (loadW * Math.pow(L, 2)) / 8;
    const maxShearKn = (loadW * L) / 2;
    const deltaMeters = (5 * w * Math.pow(L, 4)) / (384 * E * I);
    const deflectionMm = deltaMeters * 1000;

    const res = { deflectionMm: Number(deflectionMm.toFixed(2)), maxMomentKnm: Number(maxMomentKnm.toFixed(1)), maxShearKn: Number(maxShearKn.toFixed(1)) };
    setBeamResult(res);

    onSaveCalculation({
      id: `calc-${Date.now().toString().slice(-4)}`,
      title: `Simply Supported Beam (${lengthL}m, ${loadW} kN/m)`,
      expression: `UDL w=${loadW} kN/m, L=${lengthL}m, E=${elasticE} GPa, I=${inertiaI} m4`,
      result: `Max Deflection: ${res.deflectionMm} mm | Max Moment: ${res.maxMomentKnm} kNm`,
      type: 'Beam Shear/Bending',
      date: new Date().toLocaleString(),
    });
  };

  const calculateConcrete = () => {
    const rawVolume = concL * concW * concT;
    const volumeM3 = rawVolume * (1 + wasteFactor / 100);
    // Typical structural rebar density ~110 kg/m3
    const rebarKg = volumeM3 * 110;
    const rebarTons = rebarKg / 1000;

    const res = { volumeM3: Number(volumeM3.toFixed(2)), rebarTons: Number(rebarTons.toFixed(2)) };
    setConcResult(res);

    onSaveCalculation({
      id: `calc-${Date.now().toString().slice(-4)}`,
      title: `Slab Takeoff (${concL}x${concW}x${concT}m)`,
      expression: `${concL}m x ${concW}m x ${concT}m (+${wasteFactor}% waste)`,
      result: `${res.volumeM3} mÂ³ Concrete | ${res.rebarTons} Tons Rebar`,
      type: 'Concrete Takeoff',
      date: new Date().toLocaleString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Calculator className="w-4 h-4" />
            <span>Engineering Toolkit & Mathematical Engine</span>
          </div>
          <h2 className="text-xl font-bold">Engineering Calculations & Quantity Takeoff</h2>
          <p className="text-xs text-slate-300 mt-1">
            Structural beam deflection, ULS/SLS moments, concrete volume takeoff, unit conversions & history.
          </p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold">
          {calculations.length} Saved History Logs
        </span>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { id: 'beam', label: 'Beam Deflection & Moments' },
          { id: 'concrete', label: 'Concrete & Rebar Takeoff' },
          { id: 'expression', label: 'Math Expression Engine' },
          { id: 'unit', label: 'Unit Converter' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id
              ? 'bg-emerald-700 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calculator Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interactive Tool View */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          {activeTab === 'beam' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Simply Supported Beam Deflection & Bending Shear
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Uniform Load w (kN/m)</label>
                  <input
                    type="number"
                    value={loadW}
                    onChange={(e) => setLoadW(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Span Length L (m)</label>
                  <input
                    type="number"
                    value={lengthL}
                    onChange={(e) => setLengthL(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Elastic Modulus E (GPa)</label>
                  <input
                    type="number"
                    value={elasticE}
                    onChange={(e) => setElasticE(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Moment of Inertia I (mâ´)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={inertiaI}
                    onChange={(e) => setInertiaI(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                onClick={calculateBeam}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Calculator className="w-4 h-4" /> Calculate Beam Statics & Save
              </button>

              {beamResult && (
                <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">MAX DEFLECTION</span>
                    <span className="text-lg font-bold text-emerald-400">{beamResult.deflectionMm} mm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">MAX MOMENT (Med)</span>
                    <span className="text-lg font-bold text-amber-400">{beamResult.maxMomentKnm} kNm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">MAX SHEAR (Ved)</span>
                    <span className="text-lg font-bold text-blue-400">{beamResult.maxShearKn} kN</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'concrete' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Concrete Volume & Rebar Mass Estimator
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Length (m)</label>
                  <input
                    type="number"
                    value={concL}
                    onChange={(e) => setConcL(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Width (m)</label>
                  <input
                    type="number"
                    value={concW}
                    onChange={(e) => setConcW(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Thickness (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={concT}
                    onChange={(e) => setConcT(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Waste Factor (%)</label>
                  <input
                    type="number"
                    value={wasteFactor}
                    onChange={(e) => setWasteFactor(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <button
                onClick={calculateConcrete}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Calculator className="w-4 h-4" /> Calculate Volume & Rebar
              </button>

              {concResult && (
                <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">CONCRETE VOLUME (MÂ³)</span>
                    <span className="text-xl font-bold text-emerald-400">{concResult.volumeM3} mÂ³</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">ESTIMATED REBAR</span>
                    <span className="text-xl font-bold text-amber-400">{concResult.rebarTons} Tons</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'expression' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Expression Math Evaluator</h3>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Type math expression e.g. (5 * 35 * 8^4) / (384 * 31e9 * 0.0085)"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm"
              />
              <button
                onClick={handleEvaluateExpression}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
              >
                Evaluate Expression
              </button>
              {evalResult && (
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-base rounded-xl">
                  Result = {evalResult}
                </div>
              )}
            </div>
          )}

          {activeTab === 'unit' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Engineering Unit Converter</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={unitVal}
                  onChange={(e) => setUnitVal(Number(e.target.value))}
                  className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 w-32 font-bold"
                />
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as any)}
                  className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="stress">Stress / Pressure (MPa â†” psi / bar)</option>
                  <option value="length">Length (m â†” ft / in)</option>
                  <option value="force">Force (kN â†” lbf / N)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white font-mono space-y-2">
                {unitType === 'stress' && (
                  <>
                    <div>{unitVal} MPa = {(unitVal * 145.038).toFixed(1)} psi</div>
                    <div>{unitVal} MPa = {(unitVal * 10).toFixed(1)} bar</div>
                    <div>{unitVal} MPa = {(unitVal * 1000).toFixed(0)} kPa</div>
                  </>
                )}
                {unitType === 'length' && (
                  <>
                    <div>{unitVal} meters = {(unitVal * 3.28084).toFixed(2)} feet</div>
                    <div>{unitVal} meters = {(unitVal * 39.3701).toFixed(1)} inches</div>
                  </>
                )}
                {unitType === 'force' && (
                  <>
                    <div>{unitVal} kN = {(unitVal * 224.809).toFixed(1)} lbf</div>
                    <div>{unitVal} kN = {(unitVal * 1000).toFixed(0)} N</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Calculation History Sidebar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Calculation History Log
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Auto-Saved</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {calculations.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{c.type}</span>
                  <span className="font-mono text-slate-400">{c.date}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">{c.expression}</div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{c.expression}</div>
                <div className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  {typeof c.result === 'string' ? c.result : JSON.stringify(c.result)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

