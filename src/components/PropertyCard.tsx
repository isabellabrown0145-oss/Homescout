import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Bed, Bath, Maximize, Heart, MapPin,
  BadgeCheck, ChevronRight, Home
} from 'lucide-react';
import type { Property } from '@/types';
import { formatPrice, formatNumber } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=900'
];

function getFallbackImage(id: string | number) {
  const hash = String(id)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}

export default function PropertyCard({ property }: { property: Property }) {
  const { session } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const fallbackImage = getFallbackImage(property.id);

  const primaryImage = Array.isArray(property.images)
    ? property.images.find(
        (url) => typeof url === 'string' && url.trim() !== ''
      ) || fallbackImage
    : fallbackImage;

  const [imageUrl, setImageUrl] = useState(primaryImage);

  const isLand = property.property_type === 'land';

  useEffect(() => {
    setImageUrl(primaryImage);
    setImageFailed(false);
  }, [property.id, primaryImage]);

  useEffect(() => {
    if (!session || !property.id) return;

    supabase
      .from('favorites')
      .select('id')
      .eq('property_id', property.id)
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [session, property.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) return;

    setLoading(true);

    if (saved) {
      await supabase
        .from('favorites')
        .delete()
        .eq('property_id', property.id)
        .eq('user_id', session.user.id);

      setSaved(false);
    } else {
      await supabase.from('favorites').insert({
        property_id: property.id,
        user_id: session.user.id
      });

      setSaved(true);
    }

    setLoading(false);
  };

  const handleImageError = () => {
    if (imageUrl !== fallbackImage) {
      setImageUrl(fallbackImage);
    } else {
      setImageFailed(true);
    }
  };

  return (
    <Link
      to={`/property/${property.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-navy-200 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

        {imageFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-500">
            <Home className="w-12 h-12 mb-2" />
            <span className="text-xs font-medium">
              Property photo unavailable
            </span>
          </div>
        ) : (
          <>
            <img
              src={imageUrl}
              alt={property.title}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {imageUrl === fallbackImage && (
              <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-[10px] rounded-md">
                Illustrative image
              </span>
            )}
          </>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md ${
            property.listing_type === 'sale'
              ? 'bg-navy-900/90 text-white'
              : 'bg-emerald-600/90 text-white'
          }`}>
            {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
          </span>

          {property.featured && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-400/90 text-amber-950 backdrop-blur-md flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {session && (
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 transition-all disabled:opacity-50"
            aria-label="Save property"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                saved
                  ? 'fill-red-500 text-red-500'
                  : 'text-navy-800'
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xl font-extrabold text-navy-900 font-display mb-1">
          {formatPrice(property.price, property.listing_type)}
        </p>

        <h3 className="text-sm font-semibold text-navy-800 line-clamp-1 mb-1">
          {property.title}
        </h3>

        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {property.address}, {property.city}, {property.state} {property.zip_code}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100 mb-3">
          {isLand ? (
            <span className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-navy-600" />
              {formatNumber(property.sqft)} sqft
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-navy-600" />
                {property.bedrooms} bd
              </span>

              <span className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-navy-600" />
                {property.bathrooms} ba
              </span>

              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-navy-600" />
                {formatNumber(property.sqft)} sqft
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-auto pt-2 text-xs font-semibold text-navy-600 group-hover:text-navy-800 transition-colors">
          View Details
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
