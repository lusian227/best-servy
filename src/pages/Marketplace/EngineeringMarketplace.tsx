// src/pages/Marketplace/EngineeringMarketplace.tsx

import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Mail, Phone, Briefcase, X, ExternalLink } from 'lucide-react';
import { MarketplaceListing } from '../../types';

interface EngineeringMarketplaceProps {
  listings?: MarketplaceListing[];
  onSaveListing?: (listing: any) => void;
}

const EngineeringMarketplace: React.FC<EngineeringMarketplaceProps> = ({
  listings: propListings = [],
  onSaveListing
}) => {
  // ============================================================
  // STATE
  // ============================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // ============================================================
  // INTERNAL LISTINGS (fallback)
  // ============================================================

  const internalListings: MarketplaceListing[] = [
    {
      id: '1',
      title: 'Excavator 15 Ton',
      category: 'Equipment Rentals',
      provider: 'Machinery Co.',
      priceRate: '$450/day',
      rating: 4.8,
      location: 'Nairobi',
      verified: true,
      reviewsCount: 38,
      availability: 'Available Now',
      description: '2024 Model CAT 336 with GPS 3D grade control.',
      contactEmail: 'rentals@machinery.co',
      contactPhone: '+254 700 123 456',
      specs: { Capacity: '2.4 m³', Engine: 'CAT C9.3B' },
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=500'
    },
    {
      id: '2',
      title: 'Cement - Grade 42.5',
      category: 'Material Supply',
      provider: 'Cement Supply Ltd',
      priceRate: '$12/bag',
      rating: 4.5,
      location: 'Mombasa',
      verified: true,
      reviewsCount: 124,
      availability: 'In Stock',
      description: 'High-strength Portland cement for structural applications.',
      contactEmail: 'orders@cementsupply.com',
      contactPhone: '+254 720 456 789',
      specs: { Strength: '42.5 MPa', Type: 'Portland' },
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=500'
    },
    {
      id: '3',
      title: 'Skilled Electrician',
      category: 'Skilled Worker',
      provider: 'John M.',
      priceRate: '$35/day',
      rating: 4.9,
      location: 'Kisumu',
      verified: false,
      reviewsCount: 19,
      availability: 'Available Next Week',
      description: 'Licensed electrician with 8 years of industrial experience.',
      contactEmail: 'john.m@electrician.co',
      contactPhone: '+254 710 789 012',
      specs: { Certifications: 'Licensed', Experience: '8 years' },
      image: ''
    },
  ];

  // ============================================================
  // GET UNIQUE CATEGORIES
  // ============================================================

  const allListings = propListings.length > 0 ? propListings : internalListings;
  const categories = ['all', ...new Set(allListings.map(l => l.category))];

  // ============================================================
  // FILTER LISTINGS
  // ============================================================

  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
      const matchesSearch =
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [allListings, searchTerm, categoryFilter]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleContact = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setIsContactModalOpen(true);
  };

  const handlePostListing = () => {
    setIsPostModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Engineering Marketplace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Find equipment, materials, and skilled workers
          </p>
        </div>
        <button
          onClick={handlePostListing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
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
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 transition text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Showing {filteredListings.length} of {allListings.length} listings
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No listings found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition hover:shadow-lg"
            >
              {/* Image */}
              {listing.image && (
                <div className="h-32 -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-xl">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{listing.title}</h3>
                  <p className="text-sm text-gray-400">{listing.provider}</p>
                </div>
                {listing.verified && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                    ✓ Verified
                  </span>
                )}
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {listing.category}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={14} />{listing.location}</span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  {listing.rating} ({listing.reviewsCount})
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-emerald-500">{listing.priceRate}</span>
                <button
                  onClick={() => handleContact(listing)}
                  className="text-sm text-emerald-500 hover:text-emerald-400 transition flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  Contact
                </button>
              </div>
              {listing.availability && (
                <div className="mt-2 text-xs text-slate-400">📅 {listing.availability}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact Provider</h3>
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  setSelectedListing(null);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">{selectedListing.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedListing.provider}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Information</p>
                {selectedListing.contactEmail && (
                  <a
                    href={`mailto:${selectedListing.contactEmail}`}
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {selectedListing.contactEmail}
                  </a>
                )}
                {selectedListing.contactPhone && (
                  <a
                    href={`tel:${selectedListing.contactPhone}`}
                    className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedListing.contactPhone}
                  </a>
                )}
              </div>
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  setSelectedListing(null);
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Listing Modal (placeholder) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Post New Listing</h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This feature is coming soon. Please check back later.
            </p>
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineeringMarketplace;