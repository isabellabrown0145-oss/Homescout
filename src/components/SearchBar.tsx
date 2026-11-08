import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  listingType: 'sale' | 'rent';
  onListingTypeChange: (type: 'sale' | 'rent') => void;
  initialQuery?: string;
}

export default function SearchBar({ listingType, onListingTypeChange, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('listingType', listingType);
    if (query.trim()) params.set('q', query.trim());
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => onListingTypeChange('sale')}
          className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${listingType === 'sale' ? 'bg-white text-navy-900 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          Buy
        </button>
        <button
          onClick={() => onListingTypeChange('rent')}
          className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${listingType === 'rent' ? 'bg-white text-navy-900 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          Rent
        </button>
      </div>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-2xl shadow-2xl">
        <div className="flex-1 flex items-center gap-2 px-3">
          <MapPin className="w-5 h-5 text-navy-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a city, state, neighborhood, or ZIP code"
            className="flex-1 py-3 text-sm text-navy-900 placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </form>
    </div>
  );
}
