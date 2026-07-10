import React, { useEffect } from 'react';
import { BookOpen, Users, ShieldCheck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-textDark tracking-tight mb-4">
          Empowering Students to Share Knowledge
        </h1>
        <p className="text-lg text-textSec max-w-2xl mx-auto leading-relaxed">
          RevoShelf was built by students, for students. We believe that accessing academic resources should be affordable, sustainable, and safe.
        </p>
      </div>

      {/* About Us */}
      <section id="about" className="mb-20">
        <h2 className="text-2xl font-bold text-textDark mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          About Us
        </h2>
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-borderCustom shadow-sm">
          <div className="prose prose-slate max-w-none text-textSec leading-relaxed">
            <p className="mb-4">
              Every semester, students face the burden of buying expensive new textbooks, only to use them for a few months and let them collect dust. Simultaneously, other students on the exact same campus are looking for those very books.
            </p>
            <p className="mb-4">
              <strong>RevoShelf</strong> was created to bridge this gap. We provide a hyper-local, peer-to-peer platform where students can buy and sell books directly with their college peers. No shipping fees, no middlemen, and no predatory pricing.
            </p>
            <p>
              By facilitating a circular economy within campuses, we're helping students save money, reduce waste, and foster a stronger sense of community.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mb-12">
        <h2 className="text-2xl font-bold text-textDark mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-borderCustom shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">1</span>
            </div>
            <h3 className="font-bold text-textDark mb-2">Find Your Book</h3>
            <p className="text-sm text-textSec">
              Search by title, author, or filter by your exact college and semester to find exactly what you need.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-borderCustom shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">2</span>
            </div>
            <h3 className="font-bold text-textDark mb-2">Connect Securely</h3>
            <p className="text-sm text-textSec">
              Use our built-in secure messaging to chat with the seller and negotiate or arrange a meetup time.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-borderCustom shadow-sm flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">3</span>
            </div>
            <h3 className="font-bold text-textDark mb-2">Meet & Exchange</h3>
            <p className="text-sm text-textSec">
              Meet on campus (like the library or cafeteria), verify the book, and complete the exchange safely.
            </p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-primary text-white rounded-2xl p-8 md:p-12 text-center mt-16">
        <Heart className="w-10 h-10 mx-auto mb-4 text-white/90" />
        <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
        <p className="text-primary-light max-w-2xl mx-auto">
          We envision a future where every student has equal access to the resources they need to succeed, without financial stress. Join us in making education more accessible for everyone.
        </p>
      </section>
    </div>
  );
};
