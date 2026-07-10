import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Book, ShieldAlert, CreditCard, HelpCircle, ArrowRight } from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { icon: Book, title: "Buying & Selling", desc: "Listings, negotiations, and condition guidelines.", link: "/faq#listings" },
    { icon: ShieldAlert, title: "Trust & Safety", desc: "Meeting safely and reporting issues.", link: "/safety-tips" },
    { icon: CreditCard, title: "Payments", desc: "How to handle transactions in person.", link: "/faq#payments" },
    { icon: HelpCircle, title: "My Account", desc: "Profile settings, verification, and notifications.", link: "/faq#account" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Search Hero */}
      <div className="bg-white border-b border-borderCustom">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">
            How can we help you?
          </h1>
          <p className="text-textSec mb-8">Search for articles, guides, and FAQs.</p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="w-5 h-5 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-borderCustom rounded-2xl py-3.5 pl-12 pr-4 text-textDark placeholder-muted focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Categories */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl font-bold text-textDark mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link key={i} to={cat.link} className="bg-white p-6 rounded-2xl border border-borderCustom hover:border-primary/30 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all group">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-textDark mb-1">{cat.title}</h3>
                <p className="text-sm text-textSec leading-relaxed">{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-secondary rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Still need help?</h2>
            <p className="text-slate-300">Our support team is ready to assist you with any questions.</p>
          </div>
          <Link to="/contact-us" className="whitespace-nowrap bg-white text-secondary hover:bg-slate-50 font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2">
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
