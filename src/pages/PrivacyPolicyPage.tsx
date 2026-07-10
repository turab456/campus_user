import React, { useEffect, useState } from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('information-collection');

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const sections = ['information-collection', 'how-we-use', 'information-sharing', 'data-security', 'your-rights'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 150) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'information-collection', label: '1. Information Collection' },
    { id: 'how-we-use', label: '2. How We Use Information' },
    { id: 'information-sharing', label: '3. Information Sharing' },
    { id: 'data-security', label: '4. Data Security' },
    { id: 'your-rights', label: '5. Your Rights' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row gap-12">
        
        {/* Sticky Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs font-bold text-textSec uppercase tracking-wider mb-4">Contents</h3>
            <nav className="flex flex-col gap-2 border-l-2 border-borderCustom pl-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`text-sm text-left transition-colors ${activeSection === item.id ? 'text-primary font-bold' : 'text-textSec hover:text-textDark'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl">
          <div className="mb-12 border-b border-borderCustom pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-textSec">Last Updated: July 2026</p>
          </div>

          <div className="prose prose-slate max-w-none text-textSec leading-relaxed space-y-10">
            
            <section id="information-collection" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-textDark mb-4">1. Information Collection</h2>
              <p className="mb-4">
                We collect information you provide directly to us when you create an account, update your profile, list an item, or communicate with other users. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Account Information:</strong> University email address, name, and profile picture.</li>
                <li><strong>Transaction Data:</strong> Details about items you list, chat logs, and campus meetup locations.</li>
                <li><strong>Device Information:</strong> We automatically collect standard diagnostic data (browser type, IP address) to ensure platform security.</li>
              </ul>
            </section>

            <section id="how-we-use" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-textDark mb-4">2. How We Use Information</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>To provide, maintain, and improve RevoShelf.</li>
                <li>To verify your student status and maintain a safe community.</li>
                <li>To facilitate communication between buyers and sellers.</li>
                <li>To send you technical notices, updates, and security alerts.</li>
              </ul>
            </section>

            <section id="information-sharing" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-textDark mb-4">3. Information Sharing</h2>
              <p className="mb-4">
                <strong>We do not sell your personal data.</strong> Your information is only shared in the following contexts:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>With other users:</strong> Your public profile (name, avatar, university) is visible to other verified students to facilitate trust.</li>
                <li><strong>For legal reasons:</strong> If requested by university authorities or law enforcement to investigate fraudulent or illegal activity.</li>
              </ul>
            </section>

            <section id="data-security" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-textDark mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures, including HTTPS encryption and secure database architecture, to protect your personal information. However, no internet transmission is entirely secure, and you use the platform at your own risk.
              </p>
            </section>

            <section id="your-rights" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-textDark mb-4">5. Your Rights</h2>
              <p className="mb-4">
                You have the right to access, correct, or delete your personal data at any time. You can delete your account directly from the Settings page, which will permanently remove your listings and personal identifiers from our active databases.
              </p>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};
