import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Shield, Home as HomeIcon, MapPin, ArrowRight, KeyRound } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const { session } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, cities: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('properties').select('city');
      if (data) {
        const uniqueCities = new Set(data.map(d => d.city));
        setStats({ total: data.length, cities: uniqueCities.size });
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative min-h-[640px] flex items-center overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/8082328/pexels-photo-8082328.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
            alt="Luxury home"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/80 to-navy-950" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display leading-tight tracking-tight mb-4">
              Find Your Place.<br />Discover Your Home.
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              Browse homes for sale and rent across the United States. Your next home is just a search away.
            </p>
            <SearchBar listingType={listingType} onListingTypeChange={setListingType} />
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-navy-50 text-navy-600">
                <HomeIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-navy-900 font-display">{stats.total} {stats.total === 1 ? 'Listing' : 'Listings'}</p>
                <p className="text-sm text-slate-500">For Sale & Rent</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-navy-900 font-display">{stats.cities} {stats.cities === 1 ? 'City' : 'Cities'}</p>
                <p className="text-sm text-slate-500">Across the US</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-navy-900 font-display">Trusted</p>
                <p className="text-sm text-slate-500">Verified Listings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <FeaturedSection />

      {/* Rental Support Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-navy-950 px-6 py-10 sm:px-10 sm:py-12">
          <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-16 -bottom-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-white/10 items-center justify-center text-blue-300">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-300 mb-3">
                  Rental assistance
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-3">
                  Looking for a place to rent?
                </h2>
                <p className="text-slate-300 max-w-xl leading-relaxed">
                  Can't find the right rental? Contact our support team and tell us what you're looking for. We're here to help.
                </p>
              </div>
            </div>

            <Link
              to="/contact"
              className="shrink-0 inline-flex items-center justify-center gap-3 px-7 py-4 bg-white text-navy-950 font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <RecentSection />

      {/* CTA */}
      {!session && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-navy-900 rounded-3xl px-6 py-12 sm:px-12 sm:py-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <img src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white font-display mb-3">Ready to find your dream home?</h2>
              <p className="text-slate-300 mb-6 max-w-lg mx-auto">Create a free account to save your favorite properties and get updates on new listings.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/signup')} className="px-6 py-3 bg-white text-navy-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                  Get Started
                </button>
                <button onClick={() => navigate('/signin')} className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FeaturedSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      setProperties((data as Property[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">Featured Properties</h2>
          <p className="text-slate-500 mt-1">Handpicked listings you'll love</p>
        </div>
        <Link to="/listings" className="text-sm font-semibold text-navy-600 hover:text-navy-800 flex items-center gap-1">
          View all <Search className="w-4 h-4" />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}

function RecentSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      setProperties((data as Property[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">Recently Added</h2>
            <p className="text-slate-500 mt-1">Fresh on the market</p>
          </div>
          <Link to="/listings" className="text-sm font-semibold text-navy-600 hover:text-navy-800 flex items-center gap-1">
            View all <Search className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500">No properties yet. Check back soon!</p>
    </div>
  );
      }
