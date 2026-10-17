import React, { useState } from 'react';
import { MarketplaceListing } from '../../types';
import { saveListing } from '../../lib/storage';
import { ShoppingBag, Search, Plus, Star, ShieldCheck, MapPin, Phone, Mail, CheckCircle, Tag, Filter } from 'lucide-react';

interface EngineeringMarketplaceProps {
  listings: MarketplaceListing[];
  onSaveListing: (listing: MarketplaceListing) => void;
}

export const EngineeringMarketplace: React.FC<EngineeringMarketplaceProps> = ({
  listings,
  onSaveListing,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Listing Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MarketplaceListing['category']>('Equipment Rentals');
  const [provider, setProvider] = useState('HeavyFleet Rentals Ltd');
  const [priceRate, setPriceRate] = useState('$550 / Day');
  const [location, setLocation] = useState('Maritime Industrial District');
  const [description, setDescription] = useState('');

  const filteredListings = listings.filter((l) => {
    if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newListing: MarketplaceListing = {
      id: `mkt-${Date.now().toString().slice(-4)}`,
      title,
      category,
      provider,
      verified: true,
      rating: 4.9,
      reviewsCount: 12,
      location,
      priceRate,
      availability: 'Immediate',
      description,
      contactEmail: 'contact@provider.com',
      contactPhone: '+1 (800) 555-1234',
      specs: { Capacity: 'Standard Industry Grade' },
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=500',
    };
    onSaveListing(newListing);
    setShowNewModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Engineering Marketplace & Procurement Network</span>
          </div>
          <h2 className="text-xl font-bold">Equipment, Materials, Workers & Contractors</h2>
          <p className="text-xs text-slate-300 mt-1">
            Connect directly with verified machine fleets, ready-mix batching plants, skilled trades & property sellers.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Marketplace Listing
        </button>
      </div>

      {/* Categories & Filter */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search excavators, ready-mix C40, rebar steel suppliers, certified riggers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium">
          {[
            'All',
            'Equipment Rentals',
            'Material Supply',
            'Skilled Worker',
            'Semi-Skilled Worker',
            'Contractor',
            'Property Sales/Rentals',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-slate-800 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-white font-mono border border-slate-700">
                  {item.category}
                </span>
                {item.verified && (
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono flex items-center gap-1 shadow">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{item.provider}</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {item.rating} ({item.reviewsCount})
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">RATE / PRICE</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{item.priceRate}</span>
              </div>

              <button className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow">
                Inquire & RFQ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Listing Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Marketplace Listing</h3>
            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Caterpillar 320 Hydraulic Excavator"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Equipment Rentals">Equipment Rentals</option>
                    <option value="Material Supply">Material Supply</option>
                    <option value="Skilled Worker">Skilled Worker</option>
                    <option value="Semi-Skilled Worker">Semi-Skilled Worker</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Property Sales/Rentals">Property Sales/Rentals</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Price Rate</label>
                  <input
                    type="text"
                    value={priceRate}
                    onChange={(e) => setPriceRate(e.target.value)}
                    placeholder="e.g. $650 / Day"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include specs, capacity, location & delivery capabilities..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold">
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
