import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, ChevronRight, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import FilterPanel from '@/components/FilterPanel';
import { supabase } from '@/lib/supabase';
import type { Property, PropertyFilters, ListingType } from '@/types';

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters: PropertyFilters = {
    listingType: (searchParams.get('listingType') as ListingType) || undefined,
    query: searchParams.get('q') || '',
    propertyType: (searchParams.get('propertyType') as PropertyFilters['propertyType']) || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
    minSqft: searchParams.get('minSqft') ? Number(searchParams.get('minSqft')) : undefined,
    maxSqft: searchParams.get('maxSqft') ? Number(searchParams.get('maxSqft')) : undefined,
    sort: (searchParams.get('sort') as PropertyFilters['sort']) || 'newest',
  };

  const updateFilters = useCallback((newFilters: PropertyFilters) => {
    const params: Record<string, string> = {};
    if (newFilters.listingType) params.listingType = newFilters.listingType;
    if (newFilters.query) params.q = newFilters.query;
    if (newFilters.propertyType) params.propertyType = newFilters.propertyType;
    if (newFilters.minPrice) params.minPrice = String(newFilters.minPrice);
    if (newFilters.maxPrice) params.maxPrice = String(newFilters.maxPrice);
    if (newFilters.bedrooms !== undefined && newFilters.bedrooms > 0) params.bedrooms = String(newFilters.bedrooms);
    if (newFilters.bathrooms !== undefined && newFilters.bathrooms > 0) params.bathrooms = String(newFilters.bathrooms);
    if (newFilters.minSqft !== undefined && newFilters.minSqft > 0) params.minSqft = String(newFilters.minSqft);
    if (newFilters.maxSqft) params.maxSqft = String(newFilters.maxSqft);
    if (newFilters.sort) params.sort = newFilters.sort;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      let query = supabase.from('properties').select('*');
      if (filters.listingType) query = query.eq('listing_type', filters.listingType);
      if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
      if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
      if (filters.bedrooms !== undefined && filters.bedrooms > 0) query = query.gte('bedrooms', filters.bedrooms);
      if (filters.bathrooms !== undefined && filters.bathrooms > 0) query = query.gte('bathrooms', filters.bathrooms);
      if (filters.minSqft !== undefined && filters.minSqft > 0) query = query.gte('sqft', filters.minSqft);
      if (filters.maxSqft !== undefined) query = query.lte('sqft', filters.maxSqft);
      if (filters.query) {
        const q = filters.query.trim();
        query = query.or(`city.ilike.%${q}%,state.ilike.%${q}%,zip_code.ilike.%${q}%,address.ilike.%${q}%`);
      }
      switch (filters.sort) {
        case 'price_asc': query = query.order('price', { ascending: true }); break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }
      const { data } = await query.limit(100);
      setProperties((data as Property[]) || []);
      setLoading(false);
    })();
  }, [searchParams]);

  const title = filters.listingType === 'rent' ? 'Homes for Rent' : filters.listingType === 'sale' ? 'Homes for Sale' : 'All Properties';
  const hasActiveFilters =
    filters.propertyType || filters.minPrice || filters.maxPrice ||
    (filters.bedrooms !== undefined && filters.bedrooms > 0) ||
    (filters.bathrooms !== undefined && filters.bathrooms > 0) ||
    (filters.minSqft !== undefined && filters.minSqft > 0) ||
    filters.maxSqft;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Link to="/" className="hover:text-navy-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-navy-800 font-semibold">{title}</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">{title}</h1>
              {filters.query && (
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Results for "{filters.query}"
                </p>
              )}
            </div>
            {!loading && (
              <p className="text-sm font-semibold text-navy-700 shrink-0 hidden sm:block">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-navy-900 flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-[10px] font-bold flex items-center justify-center">
                {(filters.propertyType ? 1 : 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) + (filters.bedrooms ? 1 : 0) + (filters.bathrooms ? 1 : 0) + (filters.minSqft ? 1 : 0) + (filters.maxSqft ? 1 : 0)}
              </span>
            )}
          </button>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => updateFilters({ ...filters, sort: e.target.value as PropertyFilters['sort'] })}
            className="px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-navy-900 outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Lowest Price</option>
            <option value="price_desc">Highest Price</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterPanel filters={filters} onChange={updateFilters} resultCount={properties.length} />
          </aside>

          {/* Mobile filter drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileFiltersOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-5 overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-navy-900">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-500 text-sm font-semibold">Close</button>
                </div>
                <FilterPanel filters={filters} onChange={(f) => { updateFilters(f); setMobileFiltersOpen(false); }} resultCount={properties.length} />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-slate-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-6 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <p className="text-sm text-slate-500 mb-4 lg:hidden">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-navy-900 mb-1">No properties found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your filters or search criteria.</p>
                <button
                  onClick={() => updateFilters({ listingType: filters.listingType, sort: 'newest' })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
                >
                  <Search className="w-4 h-4" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
