import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Property } from '@/types';

export default function FavoritesPage() {
  const { session } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    (async () => {
      const { data: favs } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', session.user.id);
      if (!favs || favs.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      const ids = favs.map(f => f.property_id);
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });
      setProperties((props as Property[]) || []);
      setLoading(false);
    })();
  }, [session]);

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Sign in to view favorites</h1>
        <p className="text-slate-500 mb-6">Save properties you love and find them all here.</p>
        <Link to="/signin" className="inline-block px-6 py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display">My Favorites</h1>
          <p className="text-slate-500 mt-1">{loading ? 'Loading...' : `${properties.length} saved ${properties.length === 1 ? 'home' : 'homes'}`}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-navy-900 mb-1">No favorites yet</h3>
            <p className="text-slate-500 mb-4">Tap the heart icon on any property to save it here.</p>
            <Link to="/listings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-800">
              <MapPin className="w-4 h-4" /> Browse listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
