import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import CinematicBackground from '@/components/CinematicBackground';

import HomePage from '@/pages/HomePage';
import ListingsPage from '@/pages/ListingsPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import FavoritesPage from '@/pages/FavoritesPage';
import AdminPage from '@/pages/AdminPage';
import SellPage from '@/pages/SellPage';
import Contact from '@/pages/Contact';

export default function App() {
return (
<AuthProvider>
<BrowserRouter>
<div className="relative isolate min-h-screen">
<CinematicBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <Footer />
        <ChatWidget />
      </div>
    </div>
  </BrowserRouter>
</AuthProvider>

);
  }
