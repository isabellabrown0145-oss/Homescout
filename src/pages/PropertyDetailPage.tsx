import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, ChevronRight, Heart, Phone, Mail, Share2, Calendar, Home as HomeIcon, Building } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Property } from '@/types';
import { formatPrice, formatNumber, formatRelativeTime } from '@/lib/format';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setProperty(data as Property | null);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (session && id) {
      supabase
        .from('favorites')
        .select('id')
        .eq('property_id', id)
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => setSaved(!!data));
    }
  }, [session, id]);

  const toggleFavorite = async () => {
    if (!session) {
      navigate('/signin');
      return;
    }
    if (saved) {
      await supabase.from('favorites').delete().eq('property_id', id).eq('user_id', session.user.id);
      setSaved(false);
    } else {
      await supabase.from('favorites').insert({ property_id: id, user_id: session.user.id });
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-40 mb-6" />
          <div className="aspect-[16/9] bg-slate-200 rounded-2xl mb-6" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-3">
              <div className="h-8 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-32 bg-slate-200 rounded" />
            </div>
            <div className="h-48 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-900 mb-3">Property not found</h1>
        <p className="text-slate-500 mb-6">This listing may have been removed.</p>
        <Link to="/listings" className="text-sm font-semibold text-navy-600 hover:text-navy-800">Browse all listings</Link>
      </div>
    );
  }

  const images = property.images.length > 0 ? property.images : ['https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden">
            <Link to="/" className="hover:text-navy-600 shrink-0">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link to={`/listings?listingType=${property.listing_type}`} className="hover:text-navy-600 shrink-0">
              {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-navy-800 font-semibold truncate">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gallery */}
        <div className="mb-8">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 mb-2">
            <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${property.listing_type === 'sale' ? 'bg-navy-900/90 text-white' : 'bg-emerald-600/90 text-white'} backdrop-blur-md`}>
                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              {property.featured && (
                <span className="px-4 py-1.5 text-sm font-bold rounded-full bg-amber-400/90 text-amber-950 backdrop-blur-md">
                  Featured
                </span>
              )}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
              {activeImage + 1} / {images.length}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-navy-600 ring-2 ring-navy-200' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display mb-2">{property.title}</h1>
              <p className="text-slate-500 flex items-center gap-1.5 mb-4">
                <MapPin className="w-4 h-4" /> {property.address}, {property.city}, {property.state} {property.zip_code}
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-display">
                {formatPrice(property.price, property.listing_type)}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <Bed className="w-6 h-6 text-navy-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-navy-900">{property.bedrooms}</p>
                <p className="text-xs text-slate-500">Bedrooms</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <Bath className="w-6 h-6 text-navy-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-navy-900">{property.bathrooms}</p>
                <p className="text-xs text-slate-500">Bathrooms</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <Maximize className="w-6 h-6 text-navy-600 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-navy-900">{formatNumber(property.sqft)}</p>
                <p className="text-xs text-slate-500">Sq Ft</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-3">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <DetailRow icon={<HomeIcon className="w-4 h-4" />} label="Type" value={property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)} />
                <DetailRow icon={<Building className="w-4 h-4" />} label="Status" value={property.listing_type === 'sale' ? 'For Sale' : 'For Rent'} />
                <DetailRow label="City" value={property.city} />
                <DetailRow label="State" value={property.state} />
                <DetailRow label="ZIP" value={property.zip_code} />
                <DetailRow icon={<Calendar className="w-4 h-4" />} label="Listed" value={formatRelativeTime(property.created_at)} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-navy-900">Contact Agent</h2>
                <div className="flex gap-1">
                  <button onClick={toggleFavorite} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${saved ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'}`}>
                    <Heart className={`w-5 h-5 ${saved ? 'fill-red-500' : ''}`} />
                  </button>
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="w-9 h-9 rounded-lg bg-slate-100 text-navy-700 hover:bg-slate-200 flex items-center justify-center transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-navy-900 text-white font-semibold text-lg">
                  {property.agent_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{property.agent_name}</p>
                  <p className="text-xs text-slate-500">Listing Agent</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <a href={`tel:${property.agent_phone}`} className="flex items-center gap-2 text-sm text-navy-700 hover:text-navy-900">
                  <Phone className="w-4 h-4 text-navy-500" /> {property.agent_phone}
                </a>
                <a href={`mailto:${property.agent_email}`} className="flex items-center gap-2 text-sm text-navy-700 hover:text-navy-900">
                  <Mail className="w-4 h-4 text-navy-500" /> {property.agent_email}
                </a>
              </div>

              {showContactForm ? (
                contactSent ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-emerald-800">Message sent!</p>
                    <p className="text-xs text-emerald-600 mt-1">The agent will get back to you soon.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); setContactSent(true); }}
                    className="space-y-3"
                  >
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="I'm interested in this property..."
                      required
                      rows={4}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all resize-none"
                    />
                    <button type="submit" className="w-full py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors">
                      Send Message
                    </button>
                    <button type="button" onClick={() => setShowContactForm(false)} className="w-full text-xs text-slate-500 hover:text-slate-700">
                      Cancel
                    </button>
                  </form>
                )
              ) : (
                <button
                  onClick={() => { if (!session) navigate('/signin'); else setShowContactForm(true); }}
                  className="w-full py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
                >
                  {session ? 'Contact Agent' : 'Sign In to Contact'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <span className="text-slate-500 flex items-center gap-1.5">{icon}{label}</span>
      <span className="font-semibold text-navy-900 capitalize">{value}</span>
    </div>
  );
}
