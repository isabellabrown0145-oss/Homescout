import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
  data: { full_name: fullName },
  emailRedirectTo: `${window.location.origin}/signin`,
},
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
  setError('Account created! Please check your email and click the confirmation link to activate your account.');
    }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-900 text-white">
            <Home className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-extrabold font-display text-navy-900">HomeScout</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-scale-in">
          <h1 className="text-2xl font-extrabold text-navy-900 font-display mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-6">Save favorite homes and get listing updates.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-navy-800 mb-1.5 block">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-navy-800 mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-navy-800 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-navy-600 hover:text-navy-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
