import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Edit2, Trash2, Home, X, Check, Star, MessageCircle } from 'lucide-react';
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
  title: '', description: '', price: '', listing_type: 'sale', property_type: 'house',
  address: '', city: '', state: '', zip_code: '', bedrooms: '3', bathrooms: '2',
  sqft: '1500', images: '', agent_name: '', agent_phone: '', agent_email: '', featured: false,
};

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

  useEffect(() => {
    if (authLoading) return;
    if (!session) { navigate('/signin'); return; }
    if (profile && !isAdmin) { navigate('/'); return; }
  }, [authLoading, session, profile, isAdmin, navigate]);

  const fetchProperties = async () => {
    setLoading(true);
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    setProperties((data as Property[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProperties();
  }, [isAdmin]);

  // Fetch unread message count for the badge
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await supabase
        .from('conversations')
        .select('admin_unread_count')
        .eq('status', 'open');
      if (data) {
        setMsgUnreadCount(data.reduce((sum, c) => sum + (c.admin_unread_count || 0), 0));
      }
    })();

    const channel = supabase
      .channel('admin-unread-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          supabase
            .from('conversations')
            .select('admin_unread_count')
            .eq('status', 'open')
            .then(({ data }) => {
              if (data) {
                setMsgUnreadCount(data.reduce((sum, c) => sum + (c.admin_unread_count || 0), 0));
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (authLoading || (session && !profile)) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>;
  }

  if (!isAdmin) return null;

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Property) => {
    setForm({
      title: p.title, description: p.description, price: String(p.price),
      listing_type: p.listing_type, property_type: p.property_type,
      address: p.address, city: p.city, state: p.state, zip_code: p.zip_code,
      bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms), sqft: String(p.sqft),
      images: p.images.join('\n'), agent_name: p.agent_name, agent_phone: p.agent_phone,
      agent_email: p.agent_email, featured: p.featured,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    await supabase.from('properties').delete().eq('id', id);
    fetchProperties();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const images = form.images.split('\n').map(s => s.trim()).filter(Boolean);
    if (images.length === 0) {
      setError('At least one image URL is required');
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
    if (editingId) {
      const { error } = await supabase.from('properties').update(payload).eq('id', editingId);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('properties').insert(payload);
      if (error) setError(error.message);
    }
    setSaving(false);
    if (!error) {
      setShowForm(false);
      fetchProperties();
    }
  };

  const toggleFeatured = async (p: Property) => {
    await supabase.from('properties').update({ featured: !p.featured }).eq('id', p.id);
    fetchProperties();
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display flex items-center gap-2">
                <LayoutDashboard className="w-7 h-7" /> Admin Dashboard
              </h1>
              <p className="text-slate-500 mt-1">Manage listings and customer messages</p>
            </div>
            {activeTab === 'listings' && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Listing
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'listings' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'messages' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}
            >
              <MessageCircle className="w-4 h-4" /> Messages
              {msgUnreadCount > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                  activeTab === 'messages' ? 'bg-white text-navy-900' : 'bg-red-500 text-white'
                }`}>
                  {msgUnreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'messages' ? (
          <AdminInbox />
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-navy-900 mb-1">No listings yet</h3>
            <p className="text-slate-500 mb-4">Create your first property listing.</p>
            <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors">
              <Plus className="w-4 h-4" /> Add Listing
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Property</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Location</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Type</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600">Featured</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <Link to={`/property/${p.id}`} className="font-semibold text-navy-900 hover:text-navy-600 truncate block max-w-[200px]">
                              {p.title}
                            </Link>
                            <p className="text-xs text-slate-500">{p.bedrooms} bd | {p.bathrooms} ba | {p.sqft} sqft</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{p.city}, {p.state}</td>
                      <td className="px-4 py-3 font-semibold text-navy-900">{formatPrice(p.price, p.listing_type)}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${p.listing_type === 'sale' ? 'bg-navy-100 text-navy-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleFeatured(p)} className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${p.featured ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-slate-100 text-navy-700 hover:bg-navy-200 inline-flex items-center justify-center transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center justify-center transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl my-0 sm:my-8 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white sm:rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-navy-900">{editingId ? 'Edit Listing' : 'New Listing'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              <Field label="Title" required>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Modern Family Home in Quiet Neighborhood" />
              </Field>

              <Field label="Description" required>
                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls + ' resize-none'} placeholder="Beautiful property with open floor plan..." />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Price ($)" required>
                  <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="450000" />
                </Field>
                <Field label="Listing Type" required>
                  <select value={form.listing_type} onChange={e => setForm({ ...form, listing_type: e.target.value as ListingType })} className={inputCls}>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Property Type" required>
                  <select value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value as PropertyType })} className={inputCls}>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                    <option value="loft">Loft</option>
                    <option value="land">Land</option>
                  </select>
                </Field>
                <Field label="Square Feet" required>
                  <input type="number" required value={form.sqft} onChange={e => setForm({ ...form, sqft: e.target.value })} className={inputCls} placeholder="1500" />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Bedrooms" required>
                  <input type="number" required value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Bathrooms" required>
                  <input type="number" step="0.5" required value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Featured">
                  <label className="flex items-center gap-2 py-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-5 h-5 rounded text-navy-600 focus:ring-navy-400" />
                    <span className="text-sm text-navy-700">Show on homepage</span>
                  </label>
                </Field>
              </div>

              <Field label="Street Address" required>
                <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inputCls} placeholder="123 Main Street" />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="City" required>
                  <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputCls} />
                </Field>
                <Field label="State" required>
                  <input required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inputCls} placeholder="CA" />
                </Field>
                <Field label="ZIP" required>
                  <input required value={form.zip_code} onChange={e => setForm({ ...form, zip_code: e.target.value })} className={inputCls} placeholder="90210" />
                </Field>
              </div>

              <Field label="Image URLs (one per line)" required>
                <textarea required value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} rows={3} className={inputCls + ' resize-none'} placeholder="https://images.pexels.com/..." />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Agent Name" required>
                  <input required value={form.agent_name} onChange={e => setForm({ ...form, agent_name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Agent Phone" required>
                  <input required value={form.agent_phone} onChange={e => setForm({ ...form, agent_phone: e.target.value })} className={inputCls} placeholder="(555) 123-4567" />
                </Field>
                <Field label="Agent Email" required>
                  <input type="email" required value={form.agent_email} onChange={e => setForm({ ...form, agent_email: e.target.value })} className={inputCls} />
                </Field>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-300 text-navy-800 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  <Check className="w-4 h-4" /> {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
