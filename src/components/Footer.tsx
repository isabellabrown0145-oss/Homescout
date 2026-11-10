import { Link } from 'react-router-dom';
import { Home, Mail } from 'lucide-react';

export default function Footer() {
return (
<footer className="bg-navy-950 text-slate-300 mt-20">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
<div className="md:col-span-2">
<Link to="/" className="flex items-center gap-2 mb-4">
<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white text-navy-950">
<Home className="w-5 h-5" strokeWidth={2.5} />
</div>
<span className="text-xl font-extrabold font-display text-white tracking-tight">
Home<span className="text-navy-400">Scout</span>
</span>
</Link>
<p className="text-sm text-slate-400 max-w-md leading-relaxed">
Your trusted partner in finding the perfect home across America. Browse thousands of listings for sale and rent.
</p>
</div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Explore</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/listings?listingType=sale" className="hover:text-white transition-colors">Buy a Home</Link></li>
          <li><Link to="/listings?listingType=rent" className="hover:text-white transition-colors">Rent a Home</Link></li>
          <li><Link to="/sell" className="hover:text-white transition-colors">Sell a Home</Link></li>
          <li><Link to="/favorites" className="hover:text-white transition-colors">Saved Homes</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Contact</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <a
              href="mailto:support@homescout.pntr.dev"
              className="hover:text-white transition-colors"
            >
              support@homescout.pntr.dev
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-slate-500">© 2026 HomeScout. All rights reserved.</p>
      <div className="flex gap-4 text-xs text-slate-500">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>

);
                                                                       }
