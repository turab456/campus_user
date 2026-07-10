import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, MessageSquare, Handshake, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      id: 1,
      title: "Create an Account",
      description: "Sign up using your university email address. We verify every user to keep our campus community safe and trusted.",
      icon: UserPlus,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      id: 2,
      title: "Find Your Book",
      description: "Search for the textbooks you need. Filter by condition, price, or exact course code to find the perfect match on your campus.",
      icon: Search,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      id: 3,
      title: "Connect & Chat",
      description: "Use our secure, built-in messaging to chat with the seller. Ask questions, negotiate, and agree on a meetup time.",
      icon: MessageSquare,
      color: "bg-green-50 text-green-600 border-green-100"
    },
    {
      id: 4,
      title: "Meet Safely",
      description: "Meet on campus (like the library or student union) to exchange the book and complete the payment directly.",
      icon: Handshake,
      color: "bg-orange-50 text-orange-600 border-orange-100"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">
          How RevoShelf Works
        </h1>
        <p className="text-base md:text-lg text-textSec max-w-2xl mx-auto">
          A simple, safe, and student-focused way to buy and sell textbooks on your campus.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative bg-white rounded-2xl border border-borderCustom p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl border flex items-center justify-center ${step.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Step {step.id}</span>
                      <h2 className="text-xl font-bold text-textDark">{step.title}</h2>
                    </div>
                    <p className="text-textSec leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                {/* Connecting Line for desktop */}
                {index !== steps.length - 1 && (
                  <div className="hidden md:block absolute left-14 top-[5.5rem] bottom-[-1.5rem] w-px bg-borderCustom -ml-px z-0"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 text-center">
        <div className="bg-white rounded-2xl border border-borderCustom p-8 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-textDark mb-2">Ready to get started?</h2>
          <p className="text-textSec mb-6">Join thousands of students saving money on textbooks today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
              Create Account
            </Link>
            <Link to="/home" className="w-full sm:w-auto bg-background hover:bg-[#F0EEEB] border border-borderCustom text-textDark font-semibold py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
              Browse Books <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
