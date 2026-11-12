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
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function HomeScoutLogo() {
  const letters = 'HomeScout'.split('');

  const scatter = [
    ['-35px', '-25px', '-35deg'],
    ['-20px', '30px', '25deg'],
    ['-10px', '-38px', '-20deg'],
    ['25px', '28px', '30deg'],
    ['38px', '-25px', '-35deg'],
    ['-30px', '35px', '25deg'],
    ['30px', '30px', '35deg'],
    ['20px', '-35px', '-25deg'],
    ['40px', '15px', '30deg'],
  ];

  return (
    <>
      <style>{`
        @keyframes hs-letter-assemble {
          0% {
            opacity: 0;
            transform:
              translate3d(var(--scatter-x), var(--scatter-y), 0)
              rotate(var(--scatter-rotate))
              scale(.3);
            filter: blur(8px);
          }

          65% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(-4deg) scale(1.12);
            filter: blur(0);
          }

          82% {
            transform: translate3d(0, 0, 0) rotate(2deg) scale(.96);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0) scale(1);
            filter: blur(0);
          }
        }

        .hs-letter {
          display: inline-block;
          opacity: 0;
          animation: hs-letter-assemble 1.15s cubic-bezier(.2,.8,.2,1) both;
          animation-delay: calc(var(--letter-index) * 55ms);
          transform-origin: center;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .hs-letter {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <Link
        to="/"
        className="group flex items-center gap-3 shrink-0"
        aria-label="HomeScout home"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-blue-500 blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />

          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-700 to-slate-950 flex items-center justify-center shadow-xl shadow-blue-900/40 group-hover:-translate-y-1 transition-transform duration-300">
            <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
              <path d="M7 22L24 8L41 22" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 20V39H36V20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 39V28H28V39" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="35" cy="12" r="4" fill="#60A5FA" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col">
          <span
            aria-label="HomeScout"
            className="text-[25px] sm:text-[29px] font-black tracking-[-1.5px] leading-none text-slate-950 whitespace-nowrap"
          >
            {letters.map((letter, index) => {
              const [x, y, rotate] = scatter[index];

              return (
                <span
                  key={index}
                  aria-hidden="true"
                  className={`hs-letter ${
                    index >= 4 ? 'text-blue-600' : ''
                  }`}
                  style={{
                    '--letter-index': index,
                    '--scatter-x': x,
                    '--scatter-y': y,
                    '--scatter-rotate': rotate,
                  } as React.CSSProperties}
                >
                  {letter}
                </span>
              );
            })}
          </span>

          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] font-bold text-slate-400 uppercase mt-1">
            Find Your Place
          </span>
        </div>
      </Link>
    </>
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
    'relative px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-700 rounded-xl hover:bg-white/70 transition-all duration-300';

  const mobileLink =
    'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-700 hover:bg-white/70 hover:text-blue-700 transition-all duration-300';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/50 bg-white/55 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/50 via-white/10 to-transparent" />

      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[76px]">

          <HomeScoutLogo />

          <div className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl bg-white/25 border border-white/40 shadow-inner shadow-white/40">

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

          <div className="hidden md:flex items-center gap-3">

            {session ? (
              <div className="relative">

                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 pl-3 rounded-2xl border border-white/60 bg-white/45 hover:bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-slate-900 text-white flex items-center justify-center font-bold shadow-md">
                    {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                  </div>

                  <div className="text-left max-w-[120px]">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {profile?.full_name || 'My Account'}
                    </p>
                    <p className="text-[11px] text-slate-400">Account</p>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
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

                    <div className="absolute right-0 mt-3 w-64 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] py-2 z-20 animate-scale-in">

                      <div className="px-5 py-4 border-b border-white/60">
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
                          className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/favorites"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        My Favorites
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50/80 transition-colors w-full"
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
                  className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-white/55 border border-white/70 text-slate-800 backdrop-blur-xl shadow-sm hover:bg-white/80 transition-all"
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

      {mobileOpen && (
        <div className="md:hidden relative border-t border-white/50 bg-white/65 backdrop-blur-2xl shadow-[0_20px_40px_rgba(15,23,42,0.10)] animate-fade-in">

          <div className="px-4 py-5 space-y-2">

            <div className="px-3 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Explore HomeScout
              </p>
            </div>

            <Link to="/listings?listingType=sale" onClick={closeMenus} className={mobileLink}>
              <Home className="w-5 h-5" />
              Buy a Property
            </Link>

            <Link to="/listings?listingType=rent" onClick={closeMenus} className={mobileLink}>
              <Home className="w-5 h-5" />
              Rent a Property
            </Link>

            <Link to="/sell" onClick={closeMenus} className={mobileLink}>
              <ArrowUpRight className="w-5 h-5" />
              Sell a Property
            </Link>

            {session && (
              <Link to="/favorites" onClick={closeMenus} className={mobileLink}>
                <Heart className="w-5 h-5" />
                Favorites
              </Link>
            )}

            <Link to="/contact" onClick={closeMenus} className={mobileLink}>
              <Home className="w-5 h-5" />
              Contact Support
            </Link>

            <div className="border-t border-white/60 pt-4 mt-4">

              {session ? (
                <>
                  <div className="px-4 py-3 mb-2 bg-white/50 border border-white/60 rounded-2xl backdrop-blur-xl">
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
                      className={mobileLink}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50/80 w-full transition-colors"
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
                    className="text-center py-3 rounded-2xl border border-white/70 bg-white/50 text-sm font-bold text-slate-700 backdrop-blur-xl"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/signup"
                    onClick={closeMenus}
                    className="text-center py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
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
