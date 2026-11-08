import { Link } from 'react-router-dom';
import { Home, TrendingUp, Shield, DollarSign, ArrowRight } from 'lucide-react';

export default function SellPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-navy-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display leading-tight mb-4">
              Sell Your Home with Confidence
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              List your property on HomeScout and reach thousands of buyers and renters across the country.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BenefitCard icon={<DollarSign />} title="Free Listing" desc="Post your property at no cost and reach a nationwide audience." />
          <BenefitCard icon={<TrendingUp />} title="Maximum Exposure" desc="Your listing appears in search results and featured sections." />
          <BenefitCard icon={<Shield />} title="Verified Platform" desc="Trust and safety built into every listing on HomeScout." />
          <BenefitCard icon={<Home />} title="Easy Management" desc="Edit, update, or remove your listing anytime from your dashboard." />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-display text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step number="1" title="Create an Account" desc="Sign up for free and get instant access to listing tools." />
            <Step number="2" title="Add Your Property" desc="Upload photos, set your price, and add property details." />
            <Step number="3" title="Connect with Buyers" desc="Interested buyers contact you directly through the platform." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-navy-900 rounded-3xl px-6 py-12 sm:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-3">Ready to list your home?</h2>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">Join HomeScout today and start reaching buyers and renters.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
            Create Your Listing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-navy-50 text-navy-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-900 text-white text-xl font-extrabold font-display mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
    </div>
  );
}
