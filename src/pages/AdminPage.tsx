import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  Edit2,
  Trash2,
  Home,
  X,
  Star,
  MessageCircle,
  ArrowUpRight,
  Building2,
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ExternalLink,
  Sparkles,
  House,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Property, PropertyType, ListingType } from '@/types';
import { formatPrice } from '@/lib/format';
import AdminInbox from '@/components/AdminInbox';

interface FormData {
  title: string;
  description: string;
  price: string;
  listing_type: ListingType;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  images: string;
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  featured: boolean;
}

const emptyForm: FormData = {
  title: '',
  description: '',
  price: '',
  listing_type: 'sale',
  property_type: 'house',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  bedrooms: '3',
  bathrooms: '2',
  sqft: '1500',
  images: '',
  agent_name: '',
  agent_phone: '',
  agent_email: '',
  featured: false,
};

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label className="block text-xs font-bold text-slate-600 tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const { session, profile, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'messages'>('listings');
  const [msgUnreadCount, setMsgUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      navigate('/signin');
      return;
    }

    if (profile && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, session, profile, isAdmin, navigate]);

  const fetchProperties = async () => {
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (!fetchError) {
      setProperties((data as Property[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProperties();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUnread = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('admin_unread_count')
        .eq('status', 'open');

      if (data) {
        setMsgUnreadCount(
          data.reduce(
            (sum, conversation) =>
              sum + (conversation.admin_unread_count || 0),
            0
          )
        );
      }
    };

    fetchUnread();

    const channel = supabase
      .channel('admin-unread-badge')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        fetchUnread
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (authLoading || (session && !profile)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (property: Property) => {
    setForm({
      title: property.title,
      description: property.description,
      price: String(property.price),
      listing_type: property.listing_type,
      property_type: property.property_type,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      sqft: String(property.sqft),
      images: property.images.join('\n'),
      agent_name: property.agent_name,
      agent_phone: property.agent_phone,
      agent_email: property.agent_email,
      featured: property.featured,
    });

    setEditingId(property.id);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    fetchProperties();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const images = form.images
      .split('\n')
      .map((image) => image.trim())
      .filter(Boolean);

    if (images.length === 0) {
      setError('At least one image URL is required.');
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      listing_type: form.listing_type,
      property_type: form.property_type,
      address: form.address,
      city: form.city,
      state: form.state,
      zip_code: form.zip_code,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: Number(form.sqft),
      images,
      agent_name: form.agent_name,
      agent_phone: form.agent_phone,
      agent_email: form.agent_email,
      featured: form.featured,
    };

    let submitError = '';

    if (editingId) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', editingId);

      if (updateError) submitError = updateError.message;
    } else {
      const { error: insertError } = await supabase
        .from('properties')
        .insert(payload);

      if (insertError) submitError = insertError.message;
    }

    setSaving(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    fetchProperties();
  };

  const toggleFeatured = async (property: Property) => {
    const { error: updateError } = await supabase
      .from('properties')
      .update({ featured: !property.featured })
      .eq('id', property.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    fetchProperties();
  };

  const filteredProperties = properties.filter((property) => {
    const search = searchTerm.toLowerCase();

    return (
      property.title.toLowerCase().includes(search) ||
      property.city.toLowerCase().includes(search) ||
      property.state.toLowerCase().includes(search)
    );
  });

  const saleCount = properties.filter(
    (property) => property.listing_type === 'sale'
  ).length;

  const rentCount = properties.filter(
    (property) => property.listing_type === 'rent'
  ).length;

  const featuredCount = properties.filter(
    (property) => property.featured
  ).length;

  return (
    <div className="relative min-h-screen text-slate-900 animate-fade-in">

      {/* Dashboard background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/70 to-white" />
        <div className="absolute -top-40 -right-40 w-[550px] h-[550px] bg-blue-400/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6 lg:gap-8">

          {/* GLASS SIDEBAR */}
          <aside className="lg:sticky lg:top-24 lg:self-start">

            <div className="rounded-[28px] bg-white/55 backdrop-blur-3xl backdrop-saturate-150 border border-white/80 shadow-[0_12px_50px_rgba(15,23,42,0.07)] p-5">

              {/* Brand */}
              <Link to="/" className="flex items-center gap-3 mb-9">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/25">
                  <House className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className="font-extrabold text-xl tracking-tight text-slate-900">
                    HomeScout
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold tracking-[2px] uppercase">
                    Control Center
                  </p>
                </div>
              </Link>

              <p className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-400 mb-3 px-3">
                Workspace
              </p>

              {/* Sidebar navigation */}
              <nav className="space-y-2">

                <button
                  onClick={() => setActiveTab('listings')}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'listings'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </span>
                  <ArrowUpRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'messages'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </span>

                  {msgUnreadCount > 0 && (
                    <span className="min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {msgUnreadCount}
                    </span>
                  )}
                </button>

                <Link
                  to="/"
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-white/80 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Visit Website
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
                </Link>

              </nav>

              <div className="my-7 h-px bg-slate-200/70" />

              {/* Account card */}
              <div className="rounded-2xl bg-white/65 border border-white/90 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                    A
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      Administrator
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {session?.user?.email || 'Admin account'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-[11px] text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  System active
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  HOMESCOUT ADMIN PANEL
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Manage your property marketplace
                </p>
              </div>

            </div>
          </aside>

          {/* MAIN DASHBOARD */}
          <main className="min-w-0">

            {/* Header */}
            <header className="rounded-[28px] bg-white/55 backdrop-blur-3xl border border-white/80 shadow-[0_12px_50px_rgba(15,23,42,0.06)] p-5 sm:p-7 mb-6">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[2px]">
                      Administration
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                    {activeTab === 'listings'
                      ? 'Dashboard'
                      : 'Messages'}
                  </h1>

                  <p className="text-sm text-slate-500 mt-2">
                    {activeTab === 'listings'
                      ? 'Your real estate business, all in one place.'
                      : 'Manage customer conversations and enquiries.'}
                  </p>
                </div>

                {activeTab === 'listings' && (
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-xl shadow-blue-600/20 hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Property
                  </button>
                )}

              </div>

              {/* Mobile glass navigation */}
              <div className="lg:hidden flex gap-2 mt-6 p-1.5 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl">

                <button
                  onClick={() => setActiveTab('listings')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'listings'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'messages'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Messages
                  {msgUnreadCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px]">
                      {msgUnreadCount}
                    </span>
                  )}
                </button>

              </div>
            </header>

            {activeTab === 'messages' ? (

              <div className="rounded-[28px] bg-white/55 backdrop-blur-3xl border border-white/80 shadow-xl p-4 sm:p-6">
                <AdminInbox />
              </div>

            ) : (

              <>

                {/* STATISTICS */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">

                  <div className="rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/90 p-4 sm:p-5 shadow-lg shadow-slate-900/5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
                      Total Properties
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {properties.length}
                    </h3>
                  </div>

                  <div className="rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/90 p-4 sm:p-5 shadow-lg shadow-slate-900/5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                      <Home className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
                      For Sale
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {saleCount}
                    </h3>
                  </div>

                  <div className="rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/90 p-4 sm:p-5 shadow-lg shadow-slate-900/5">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                      <House className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
                      For Rent
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {rentCount}
                    </h3>
                  </div>

                  <div className="rounded-[24px] bg-white/60 backdrop-blur-2xl border border-white/90 p-4 sm:p-5 shadow-lg shadow-slate-900/5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                      <Star className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
              
