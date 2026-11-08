import { SlidersHorizontal, X } from 'lucide-react';
import type { PropertyFilters } from '@/types';

interface FilterPanelProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  resultCount: number;
}

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'loft', label: 'Loft' },
  { value: 'land', label: 'Land' },
];

const SQFT_PRESETS = [
  { value: 0, label: 'Any' },
  { value: 500, label: '500+' },
  { value: 1000, label: '1,000+' },
  { value: 1500, label: '1,500+' },
  { value: 2500, label: '2,500+' },
];

export default function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
  const update = (patch: Partial<PropertyFilters>) => onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.propertyType ||
    filters.minPrice ||
    filters.maxPrice ||
    (filters.bedrooms !== undefined && filters.bedrooms > 0) ||
    (filters.bathrooms !== undefined && filters.bathrooms > 0) ||
    (filters.minSqft !== undefined && filters.minSqft > 0) ||
    filters.maxSqft ||
    (filters.sort && filters.sort !== 'newest');

  const clearFilters = () => {
    onChange({
      listingType: filters.listingType,
      query: filters.query,
      sort: 'newest',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Price Range */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Price Range</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full pl-6 pr-2 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
              />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full pl-6 pr-2 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Property Type</label>
          <select
            value={filters.propertyType || ''}
            onChange={(e) => update({ propertyType: e.target.value as PropertyFilters['propertyType'] })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
          >
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Bedrooms</label>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => update({ bedrooms: n })}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${(filters.bedrooms || 0) === n ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'}`}
              >
                {n === 0 ? 'Any' : `${n}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Bathrooms</label>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => update({ bathrooms: n })}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${(filters.bathrooms || 0) === n ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'}`}
              >
                {n === 0 ? 'Any' : `${n}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Square Feet */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Min Size (sq ft)</label>
          <div className="flex flex-wrap gap-1.5">
            {SQFT_PRESETS.map(s => (
              <button
                key={s.value}
                onClick={() => update({ minSqft: s.value })}
                className={`flex-1 min-w-[60px] py-2 text-xs font-semibold rounded-lg transition-all ${(filters.minSqft || 0) === s.value ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Min sqft"
                value={filters.minSqft || ''}
                onChange={(e) => update({ minSqft: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Max sqft"
                value={filters.maxSqft || ''}
                onChange={(e) => update({ maxSqft: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Sort By</label>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => update({ sort: e.target.value as PropertyFilters['sort'] })}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Lowest Price</option>
            <option value="price_desc">Highest Price</option>
          </select>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-sm font-semibold text-navy-900">{resultCount} {resultCount === 1 ? 'property' : 'properties'} found</p>
      </div>
    </div>
  );
}
