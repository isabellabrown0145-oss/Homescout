import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, MessageCircle, ArrowLeft, Send } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Rental assistance');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(`HomeScout Support - ${reason}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nReason: ${reason}\n\nMessage:\n${message}`
    );

    window.location.href =
      `mailto:support@homescout.pntr.dev?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Home className="w-7 h-7 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              HomeScout
            </span>
          </Link>

          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={18} />
            Back home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold uppercase tracking-wider text-sm">
            We're here to help
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Contact HomeScout
          </h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Need help finding a property, interested in renting, or have a question?
            Send our support team a message.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-blue-950 text-white rounded-3xl p-8 md:p-10">
            <div className="bg-blue-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle size={28} />
            </div>

            <h2 className="text-3xl font-bold mb-4">
              Looking for a rental?
            </h2>

            <p className="text-blue-100 leading-7 mb-8">
              Can't find the rental property you're looking for?
              Contact our support team. We'll be happy to assist you
              with your rental enquiry.
            </p>

            <div className="border-t border-blue-800 pt-6">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-300" />
                <div>
                  <p className="text-sm text-blue-200">Email our support team</p>
                  <a
                    href="mailto:support@homescout.pntr.dev"
                    className="font-semibold hover:underline"
                  >
                    support@homescout.pntr.dev
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Send us a message
            </h2>
            <p className="text-gray-500 text-sm mb-7">
              Complete the form and your email app will open with your message ready.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What do you need help with?
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 bg-white"
                >
                  <option>Rental assistance</option>
                  <option>Buying a property</option>
                  <option>Selling a property</option>
                  <option>Technical support</option>
                  <option>General enquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your message
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition"
              >
                Send message
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
      }
