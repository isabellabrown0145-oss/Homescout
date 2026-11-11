import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
TrendingUp,
Shield,
Home as HomeIcon,
MapPin,
ArrowRight,
KeyRound,
Sparkles,
CheckCircle2,
} from 'lucide-react';

import SearchBar from '@/components/SearchBar';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
const { session } = useAuth();
const navigate = useNavigate();

const [stats, setStats] = useState({ total: 0, cities: 0 });

useEffect(() => {
let active = true;

(async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('city');

  if (!error && data && active) {
    const uniqueCities = new Set(
      data.map((property) => property.city).filter(Boolean)
    );

    setStats({
      total: data.length,
      cities: uniqueCities.size,
    });
  }
})();

return () => {
  active = false;
};

}, []);

return (
<div className="relative overflow-hidden bg-transparent text-white">

  {/* CINEMATIC HERO */}
  <section className="relative min-h-[680px] lg:min-h-[740px] flex items-center overflow-hidden">

    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#030817]/90 via-[#07152e]/55 to-transparent" />

    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#030817]/70" />

    <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />

    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none" />

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-20">

      <div className="grid lg:grid-cols-2 gap-8 items-center">

        <div className="max-w-2xl">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-blue-400/10 backdrop-blur-xl text-cyan-200 text-xs sm:text-sm font-semibold mb-7">
            <Sparkles className="w-4 h-4" />
            YOUR NEXT CHAPTER STARTS HERE
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-white leading-[1.08] tracking-tight font-display">
            Find Your Place.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400">
              Discover Your Home.
            </span>
          </h1>

          <p className="text-slate-200 text-base sm:text-lg leading-relaxed mt-6 mb-8 max-w-xl">
            Explore exceptional homes, discover new opportunities,
            and find a place that feels like yours. Your next home
            is closer than you think.
          </p>

          <div className="relative z-20">
            <SearchBar
              listingType={listingType}
              onListingTypeChange={setListingType}
            />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-7 text-slate-200 text-sm">

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Easy property discovery
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Trusted platform
            </div>

          </div>
        </div>

        {/* 3D HOUSE AREA */}
        <div className="relative w-full flex items-center justify-center min-h-[350px] sm:min-h-[450px] lg:min-h-[520px]">

          <div className="absolute w-[300px] h-[300px] sm:w-[430px] sm:h-[430px] rounded-full border border-cyan-300/20 animate-[spin_35s_linear_infinite]" />

          <div className="absolute w-[240px] h-[240px] sm:w-[350px] sm:h-[350px] rounded-full border border-purple-400/20 animate-[spin_25s_linear_infinite_reverse]" />

          <div className="absolute w-[180px] h-[180px] sm:w-[270px] sm:h-[270px] rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 w-full max-w-[550px]">
            <div className="h-[340px] sm:h-[440px] flex items-center justify-center">
              <div className="text-center">
                <HomeIcon className="w-12 h-12 text-cyan-300 mx-auto mb-3" />
                <p className="text-cyan-100 text-sm">
                  HomeScout 3D environment
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 left-0 sm:left-2 z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>

              <div>
                <p className="text-white text-sm font-bold">
                  Find your dream home
                </p>
                <p className="text-blue-200 text-xs">
                  Explore HomeScout
                </p>
              </div>
            </div>
          </div>

          <div className="absolute top-5 right-0 sm:right-2 z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-white text-xs font-semibold">
                Your home awaits
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>

  {/* STATISTICS */}
  <section className="relative bg-slate-950/50 backdrop-blur-xl border-y border-white/10">

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">

        <StatItem
          icon={<HomeIcon className="w-6 h-6" />}
          value={stats.total.toLocaleString()}
          label="Available Listings"
          color="blue"
        />

        <StatItem
          icon={<TrendingUp className="w-6 h-6" />}
          value={stats.cities.toLocaleString()}
          label="Cities Across the US"
          color="green"
        />

        <StatItem
          icon={<Shield className="w-6 h-6" />}
          value="Trusted"
          label="Property Discovery"
          color="amber"
        />

      </div>
    </div>
  </section>

  {/* FEATURED PROPERTIES */}
  <FeaturedSection />

  {/* RENTAL SUPPORT */}
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

    <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/65 backdrop-blur-2xl px-6 py-10 sm:px-10 sm:py-12">

      <div className="absolute -right-20 -top-24 w-80 h-80 bg-blue-500/25 rounded-full blur-[90px]" />

      <div className="absolute -left-20 -bottom-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-[90px]" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">

        <div className="flex items-start gap-5">

          <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-blue-500/20 items-center justify-center text-blue-300">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-cyan-300 mb-3">
              Rental assistance
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-3">
              Looking for a place to rent?
            </h2>

            <p className="text-slate-300 max-w-xl leading-relaxed">
              Can't find the right rental? Contact our support team
              and tell us what you're looking for. We're here to help.
            </p>
          </div>
        </div>

        <Link
          to="/contact"
          className="shrink-0 inline-flex items-center justify-center gap-3 px-7 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-xl hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-blue-500/20"
        >
          Contact Support
          <ArrowRight className="w-5 h-5" />
        </Link>

      </div>
    </div>
  </section>

  {/* RECENTLY ADDED */}
  <RecentSection />

  {/* SIGN UP CTA */}
  {!session && (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-slate-950/70 backdrop-blur-2xl px-6 py-14 sm:px-12 sm:py-16 text-center">

        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-blue-500/25 blur-[100px]" />

        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-cyan-400/20 blur-[100px]" />

        <div className="relative z-10">

          <div className="inline-flex items-center gap-2 text-cyan-200 text-sm font-semibold mb-5">
            <Sparkles className="w-4 h-4" />
            START YOUR JOURNEY
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display mb-4">
            Your Dream Home
            <br className="sm:hidden" /> Starts Here.
          </h2>

          <p className="text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
            Create your free account to save favorite properties
            and stay updated on new listings.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">

            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-xl hover:-translate-y-1 transition-all duration-300"
            >
              Create Free Account
            </button>

            <button
              onClick={() => navigate('/signin')}
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
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

/* STATISTICS */

function StatItem({
icon,
value,
label,
color,
}: {
icon: React.ReactNode;
value: string;
label: string;
color: 'blue' | 'green' | 'amber';
}) {
const colors = {
blue: 'bg-blue-500/15 text-blue-300',
green: 'bg-emerald-500/15 text-emerald-300',
amber: 'bg-amber-500/15 text-amber-300',
};

return (
<div className="flex items-center gap-4">
<div className={"w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${colors[color]}"}>
{icon}
</div>

  <div>
    <p className="text-2xl font-extrabold text-white font-display">
      {value}
    </p>
    <p className="text-sm text-slate-300">{label}</p>
  </div>
</div>

);
}

/* FEATURED PROPERTIES */

function FeaturedSection() {
const [properties, setProperties] = useState<Property[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
let active = true;

(async () => {
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (active) {
    setProperties((data as Property[]) || []);
    setLoading(false);
  }
})();

return () => {
  active = false;
};

}, []);

return (
<section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

  <div className="flex items-center justify-between mb-9">

    <div>
      <span className="text-xs font-bold tracking-widest uppercase text-cyan-300">
        Handpicked for you
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-2">
        Featured Properties
      </h2>

      <p className="text-slate-300 mt-1">
        Explore homes worth discovering.
      </p>
    </div>

    <Link
      to="/listings"
      className="text-sm font-bold text-cyan-300 hover:text-white flex items-center gap-2"
    >
      View all <ArrowRight className="w-4 h-4" />
    </Link>

  </div>

  {loading ? (
    <PropertySkeleton count={6} />
  ) : properties.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  ) : (
    <EmptyState />
  )}

</section>

);
}

/* RECENT PROPERTIES */

function RecentSection() {
const [properties, setProperties] = useState<Property[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
let active = true;

(async () => {
  const { data } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  if (active) {
    setProperties((data as Property[]) || []);
    setLoading(false);
  }
})();

return () => {
  active = false;
};

}, []);

return (
<section className="relative bg-slate-950/40 backdrop-blur-sm border-y border-white/10 py-16 sm:py-20">

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="flex items-center justify-between mb-9">

      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-cyan-300">
          Just arrived
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-2">
          Recently Added
        </h2>

        <p className="text-slate-300 mt-1">
          Discover the latest properties.
        </p>
      </div>

      <Link
        to="/listings"
        className="text-sm font-bold text-cyan-300 hover:text-white flex items-center gap-2"
      >
        View all <ArrowRight className="w-4 h-4" />
      </Link>

    </div>

    {loading ? (
      <PropertySkeleton count={4} />
    ) : properties.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    ) : (
      <EmptyState />
    )}

  </div>
</section>

);
}

/* LOADING SKELETON */

function PropertySkeleton({ count }: { count: number }) {
return (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{Array.from({ length: count }).map((_, index) => (
<div
key={index}
className="bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden animate-pulse"
>
<div className="aspect-[4/3] bg-slate-700/70" />

      <div className="p-4 space-y-3">
        <div className="h-6 bg-slate-700 rounded w-1/3" />
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
      </div>
    </div>
  ))}
</div>

);
}

/* EMPTY STATE */

function EmptyState() {
return (
<div className="text-center py-16 bg-slate-950/60 backdrop-blur-xl rounded-2xl border border-white/10">

  <MapPin className="w-12 h-12 text-cyan-300 mx-auto mb-3" />

  <p className="text-slate-300">
    No properties yet. Check back soon!
  </p>

</div>

);
          }
