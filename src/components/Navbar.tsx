import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Home, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { session, profile, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy-900 text-white">
              <Home className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold font-display text-navy-900 tracking-tight">
              Home<span className="text-navy-500">Scout</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/listings?listingType=sale" className="px-4 py-2 text-sm font-semibold text-navy-800 hover:text-navy-500 hover:bg-navy-50 rounded-lg transition-colors">
              Buy
            </Link>
            <Link to="/listings?listingType=rent" className="px-4 py-2 text-sm font-semibold text-navy-800 hover:text-navy-500 hover:bg-navy-50 rounded-lg transition-colors">
              Rent
            </Link>
            <Link to="/sell" className="px-4 py-2 text-sm font-semibold text-navy-800 hover:text-navy-500 hover:bg-navy-50 rounded-lg transition-colors">
              Sell
            </Link>
            {session && (
              <Link to="/favorites" className="px-4 py-2 text-sm font-semibold text-navy-800 hover:text-navy-500 hover:bg-navy-50 rounded-lg transition-colors flex items-center gap-1.5">
                <Heart className="w-4 h-4" /> Favorites
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-900 text-white text-sm font-semibold">
                    {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-navy-800 max-w-[120px] truncate">
                    {profile?.full_name || profile?.email}
                  </span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-scale-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-navy-900 truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-800 hover:bg-navy-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-800 hover:bg-navy-50 transition-colors">
                        <Heart className="w-4 h-4" /> My Favorites
                      </Link>
                      <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="px-4 py-2 text-sm font-semibold text-navy-800 hover:text-navy-500 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="px-5 py-2 text-sm font-semibold bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-navy-900"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link to="/listings?listingType=sale" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-50 rounded-lg transition-colors">
              Buy
            </Link>
            <Link to="/listings?listingType=rent" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-50 rounded-lg transition-colors">
              Rent
            </Link>
            <Link to="/sell" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-50 rounded-lg transition-colors">
              Sell
            </Link>
            {session && (
              <Link to="/favorites" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-50 rounded-lg transition-colors">
                Favorites
              </Link>
            )}
            <div className="pt-2 mt-2 border-t border-slate-100">
              {session ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-50 rounded-lg transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2 py-2">
                  <Link to="/signin" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-navy-800 border border-slate-300 rounded-lg">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-navy-900 text-white rounded-lg">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
