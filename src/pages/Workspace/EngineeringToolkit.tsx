import React, { useState } from 'react';

interface EngineeringToolkitProps {
  calculations: any[];
  onSaveCalculation: (calc: any) => void;
}

const EngineeringToolkit = ({ calculations }: EngineeringToolkitProps) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = () => {
    try {
      const evaluated = eval(input);
      setResult(String(evaluated));
    } catch {
      setResult('Error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Engineering Toolkit</h1>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            placeholder="e.g. (12.5 * 6) + 15^2"
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleCalculate}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
          >
            Calculate
          </button>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-gray-500">Result:</p>
            <p className="text-2xl font-bold text-emerald-600">{result}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold mb-4">History</h2>
        {calculations.length === 0 ? (
          <p className="text-gray-400 text-sm">No calculations yet.</p>
        ) : (
          <div className="space-y-2">
            {calculations.map((calc: any) => (
              <div key={calc.id} className="flex items-center gap-4 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-gray-400">{calc.expression}</span>
                <span className="text-emerald-500 font-medium">= {calc.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineeringToolkit;
