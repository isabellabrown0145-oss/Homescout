import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Home,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function HomeScoutLogo() {
  return (
    <Link to="/" className="group flex items-center gap-3 shrink-0">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-blue-500 blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />

        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-700 to-navy-950 flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:-translate-y-1 transition-transform duration-300">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-7 h-7"
          >
            <path
              d="M7 22L24 8L41 22"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 20V39H36V20"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 39V28H28V39"
              stroke="#93C5FD"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="35" cy="12" r="4" fill="#60A5FA" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight text-navy-950 leading-none">
          Home<span className="text-blue-600">Scout</span>
        </span>
        <span className="text-[9px] tracking-[0.25em] font-bold text-slate-400 uppercase mt-1">
          Find Your Place
        </span>
      </div>
    </Link>
  );
}

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

  const closeMenus = () => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const navClass =
    'relative px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-700 rounded-xl hover:bg-blue-50/80 transition-all duration-200';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm shadow-slate-900/[0.02]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[76px]">

          {/* Logo */}
          <HomeScoutLogo />

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">

            <Link to="/listings?listingType=sale" className={navClass}>
              Buy
            </Link>

            <Link to="/listings?listingType=rent" className={navClass}>
              Rent
            </Link>

            <Link to="/sell" className={navClass}>
              Sell
            </Link>

            {session && (
              <Link to="/favorites" className={navClass}>
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorites
                </span>
              </Link>
            )}

          </div>

          {/* Desktop account section */}
          <div className="hidden md:flex items-center gap-3">

            {session ? (
              <div className="relative">

                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 pl-3 rounded-2xl hover:bg-slate-100 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-navy-900 text-white flex items-center justify-center font-bold shadow-md">
                    {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                  </div>

                  <div className="text-left max-w-[120px]">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {profile?.full_name || 'My Account'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Account
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />

                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 py-2 z-20 animate-scale-in">

                      <div className="px-5 py-4 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">
                          {profile?.full_name || 'Welcome'}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {profile?.email}
                        </p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeMenus}
                          className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/favorites"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        My Favorites
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>

                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </>
            )}

          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 text-slate-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

        </div>
      </nav>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl animate-fade-in">

          <div className="px-4 py-5 space-y-2">

            <div className="px-3 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Explore HomeScout
              </p>
            </div>

            <Link
              to="/listings?listingType=sale"
              onClick={closeMenus}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Buy a Property
            </Link>

            <Link
              to="/listings?listingType=rent"
              onClick={closeMenus}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Rent a Property
            </Link>

            <Link
              to="/sell"
              onClick={closeMenus}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
              Sell a Property
            </Link>

            {session && (
              <Link
                to="/favorites"
                onClick={closeMenus}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Heart className="w-5 h-5" />
                Favorites
              </Link>
            )}

            <Link
              to="/contact"
              onClick={closeMenus}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Contact Support
            </Link>

            <div className="border-t border-slate-100 pt-4 mt-4">

              {session ? (
                <>

                  <div className="px-4 py-3 mb-2 bg-slate-50 rounded-xl">
                    <p className="font-bold text-slate-800 text-sm">
                      {profile?.full_name || 'My Account'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {profile?.email}
                    </p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>

                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">

                  <Link
                    to="/signin"
                    onClick={closeMenus}
                    className="text-center py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/signup"
                    onClick={closeMenus}
                    className="text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                  >
                    Get Started
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
