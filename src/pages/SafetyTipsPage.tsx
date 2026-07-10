import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Search, AlertTriangle, Users } from 'lucide-react';

export const SafetyTipsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tips = [
    {
      icon: MapPin,
      title: "Meet in Public Areas",
      desc: "Always arrange to meet during daylight hours in populated, well-lit areas on campus. The library lobby, student union, or busy cafeterias are excellent choices.",
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      icon: Users,
      title: "Bring a Friend",
      desc: "If you feel uneasy about a meetup, bring a friend or roommate along with you. It adds an extra layer of security and peace of mind.",
      color: "text-purple-600 bg-purple-50 border-purple-100"
    },
    {
      icon: Search,
      title: "Inspect Before Paying",
      desc: "Carefully check the book's condition, edition, and ISBN to ensure it matches the listing exactly before handing over any money or finalizing a digital transfer.",
      color: "text-green-600 bg-green-50 border-green-100"
    },
    {
      icon: AlertTriangle,
      title: "Keep Communication On-Platform",
      desc: "Use RevoShelf's secure messaging system. Be wary of users who immediately try to move the conversation to WhatsApp, SMS, or personal emails.",
      color: "text-orange-600 bg-orange-50 border-orange-100"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-[#FAF8F5] border-b border-borderCustom">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center bg-primary/10 w-16 h-16 rounded-full mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">
            Trust & Safety Guidelines
          </h1>
          <p className="text-textSec text-lg max-w-2xl mx-auto">
            Your safety is our top priority. Follow these essential guidelines to ensure every transaction is secure and successful.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="bg-white p-8 rounded-2xl border border-borderCustom shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 ${tip.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-textDark mb-3">{tip.title}</h3>
                <p className="text-textSec leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Warning Callout */}
        <div className="mt-12 bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-textDark mb-2">Red Flags to Watch Out For</h3>
            <ul className="list-disc pl-5 text-sm text-textSec space-y-2">
              <li>Sellers asking for payment (especially wire transfers or gift cards) before meeting.</li>
              <li>Users who refuse to meet on campus or in public areas.</li>
              <li>Listings with stock photos that refuse to provide actual photos of the item.</li>
              <li>Deals that seem "too good to be true."</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-4 text-center mt-8">
         <h3 className="font-bold text-textDark mb-2">Encountered a suspicious user?</h3>
         <Link to="/report-issue" className="text-primary hover:text-primary-hover font-medium transition-colors">
           Report them immediately to our trust & safety team
         </Link>
      </div>
    </div>
  );
};
