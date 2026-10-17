import React, { useState } from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';

interface EngineeringMarketplaceProps {
  listings: any[];
  onSaveListing: (listing: any) => void;
}

const EngineeringMarketplace = () => {
  const [listings] = useState([
    { id: '1', title: 'Excavator 15 Ton', category: 'Equipment', provider: 'Machinery Co.', price: '$450/day', rating: 4.8, location: 'Nairobi' },
    { id: '2', title: 'Cement - Grade 42.5', category: 'Materials', provider: 'Cement Supply Ltd', price: '$12/bag', rating: 4.5, location: 'Mombasa' },
    { id: '3', title: 'Skilled Electrician', category: 'Workers', provider: 'John M.', price: '$35/day', rating: 4.9, location: 'Kisumu' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Engineering Marketplace</h1>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm">
          + Post Listing
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search listings..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-sm">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="text-sm text-gray-400">{listing.provider}</p>
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">{listing.category}</span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={14} />{listing.location}</span>
              <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" />{listing.rating}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-emerald-500">{listing.price}</span>
              <button className="text-sm text-emerald-500 hover:text-emerald-400 transition">Contact</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineeringMarketplace;
