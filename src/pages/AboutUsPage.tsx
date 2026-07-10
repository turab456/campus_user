import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Laptop, 
  MessageSquare, 
  AlertTriangle, 
  Package, 
  CheckCircle,
  Users,
  ShieldCheck,
  Wallet,
  Zap,
  Globe,
  Mail,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const actions = [
    { icon: BookOpen, title: "Buy Used Books", desc: "Find textbooks required for your specific courses at a fraction of the bookstore cost." },
    { icon: Laptop, title: "Sell Electronics", desc: "Pass on your calculators, lab equipment, and devices to students who need them." },
    { icon: MessageSquare, title: "Chat Securely", desc: "Communicate with peers using our built-in messaging without sharing your phone number." },
    { icon: AlertTriangle, title: "Report Fraud", desc: "Keep the campus safe by instantly flagging suspicious listings or users." },
    { icon: Package, title: "Find Essentials", desc: "Discover dorm supplies, clickers, and other necessities right on your campus." },
    { icon: CheckCircle, title: "Mark Listings Sold", desc: "Easily manage your inventory and take down listings once you've made a sale." }
  ];

  const principles = [
    { icon: Users, title: "Student First", desc: "Every feature and policy is designed to solve actual problems faced by college students." },
    { icon: ShieldCheck, title: "Safe Transactions", desc: "We rely on university email verification and in-person campus meetups to ensure security." },
    { icon: Wallet, title: "Affordable Access", desc: "By removing shipping fees and middlemen, we help students keep more money in their pockets." },
    { icon: Zap, title: "Simple Experience", desc: "No complex bidding or hidden fees. Just straightforward peer-to-peer exchange." },
    { icon: Globe, title: "Community Driven", desc: "We succeed only when the campus community actively participates and supports each other." }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-24">
        
        {/* Section 1: Title and Intro */}
        <section className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-textDark tracking-tight">
            About RevoShelf
          </h1>
          <p className="text-lg text-textSec leading-relaxed max-w-[70ch]">
            Every semester students buy books, calculators and other essentials. At the same time, many seniors have these items sitting unused. RevoShelf helps students connect so these items can be bought and sold within the student community.
          </p>
        </section>

        {/* Section 2: Why RevoShelf Exists */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-textDark">Why RevoShelf Exists</h2>
          <div className="bg-white rounded-2xl border border-borderCustom p-8 shadow-sm">
            <p className="text-textSec leading-relaxed text-base max-w-[70ch]">
              Students struggle to find affordable books and essentials every semester while many perfectly usable items remain unused. RevoShelf was created to connect students so these items can find a new owner instead of collecting dust.
            </p>
          </div>
        </section>

        {/* Section 3: What You Can Do */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-textDark">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-borderCustom p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                  <Icon className="w-5 h-5 text-textDark mb-4" />
                  <h3 className="font-bold text-textDark mb-1">{action.title}</h3>
                  <p className="text-sm text-textSec leading-relaxed">{action.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Our Principles */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-textDark">Our Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {principles.map((principle, i) => {
              const Icon = principle.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-borderCustom p-6 flex gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="w-5 h-5 text-textDark" />
                  </div>
                  <div>
                    <h3 className="font-bold text-textDark mb-1">{principle.title}</h3>
                    <p className="text-sm text-textSec leading-relaxed">{principle.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Our Vision */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-textDark">Our Vision</h2>
          <div className="bg-white rounded-2xl border border-borderCustom p-8 shadow-sm">
            <p className="text-textSec leading-relaxed text-base max-w-[70ch]">
              We aim to establish a reliable, self-sustaining marketplace within every university. By providing a secure platform dedicated exclusively to students, we want to ensure that obtaining academic materials is never a barrier to education.
            </p>
          </div>
        </section>

        {/* Section 6: Need Help? */}
        <section className="pt-8 border-t border-borderCustom">
          <div className="bg-white rounded-2xl border border-borderCustom p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-textDark mb-1">Need Help?</h3>
              <div className="flex items-center gap-2 text-textSec">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@revoshelf.com</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link 
                to="/help-center" 
                className="inline-flex items-center justify-center gap-2 bg-[#FAF8F5] border border-borderCustom hover:bg-white text-textDark font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Link>
              <Link 
                to="/contact-us" 
                className="inline-flex items-center justify-center gap-2 bg-textDark hover:bg-black text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
