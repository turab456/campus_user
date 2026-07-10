import React, { useEffect } from 'react';
import { ShieldCheck, Heart, AlertOctagon, Scale, FileWarning } from 'lucide-react';

export const CommunityGuidelinesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const guidelines = [
    {
      icon: Heart,
      title: "Be Respectful",
      desc: "Treat every student with respect. Harassment, hate speech, bullying, or aggressive behavior toward other users will result in an immediate and permanent ban.",
      color: "text-rose-500 bg-rose-50 border-rose-100"
    },
    {
      icon: Scale,
      title: "Honest Listings",
      desc: "Accurately describe the condition of your books. Highlight any highlighting, missing pages, or water damage. Honesty builds your reputation on campus.",
      color: "text-blue-500 bg-blue-50 border-blue-100"
    },
    {
      icon: AlertOctagon,
      title: "No Prohibited Items",
      desc: "RevoShelf is strictly for academic and student-life resources. Do not list weapons, illegal substances, stolen property, or services.",
      color: "text-orange-500 bg-orange-50 border-orange-100"
    },
    {
      icon: ShieldCheck,
      title: "Follow Through",
      desc: "If you agree on a price and meetup time, honor your commitment. Flaking repeatedly ruins the experience for everyone and can result in account suspension.",
      color: "text-green-500 bg-green-50 border-green-100"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="bg-[#FAF8F5] border-b border-borderCustom mb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">
            Community Guidelines
          </h1>
          <p className="text-textSec text-lg max-w-2xl mx-auto">
            We rely on everyone to keep RevoShelf a safe, trustworthy, and welcoming environment for all students.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {guidelines.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-borderCustom p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 ${g.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-textDark mb-3">{g.title}</h3>
                <p className="text-textSec leading-relaxed">
                  {g.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-borderCustom rounded-2xl p-8 text-center max-w-3xl mx-auto shadow-sm">
          <FileWarning className="w-10 h-10 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-textDark mb-2">Enforcement</h3>
          <p className="text-textSec mb-6">
            We take these guidelines seriously. Violations may result in warnings, temporary suspensions, or permanent bans. We reserve the right to report severe violations to university administration or law enforcement.
          </p>
        </div>
      </div>
    </div>
  );
};
