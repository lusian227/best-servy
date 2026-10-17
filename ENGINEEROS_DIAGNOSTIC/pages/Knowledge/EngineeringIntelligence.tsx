import React, { useState } from 'react';
import { Search, Upload, BookOpen } from 'lucide-react';

interface EngineeringIntelligenceProps {
  lessons: any[];
  onSaveLesson: (lesson: any) => void;
  onOpenAIChat: () => void;
}

const EngineeringIntelligence = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Engineering Intelligence</h1>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm flex items-center gap-2">
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search your knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Standards', 'Formulas', 'Procedures', 'Materials'].map((category) => (
          <div
            key={category}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition cursor-pointer text-center"
          >
            <BookOpen className="mx-auto text-emerald-500 mb-2" size={24} />
            <p className="font-medium">{category}</p>
            <p className="text-xs text-gray-400">12 documents</p>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold mb-4">Recently Used</h2>
        <div className="space-y-3">
          {['Eurocode 2: Design of Concrete Structures', 'BS 8110: Structural Use of Concrete', 'Steel Design Manual'].map((doc) => (
            <div key={doc} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
              <BookOpen size={16} className="text-emerald-500" />
              <span className="text-sm">{doc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EngineeringIntelligence;
