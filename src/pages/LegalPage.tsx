import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Shield, Users } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    window.scrollTo(0, 0);
    const hash = location.hash.replace('#', '');
    if (hash && ['terms', 'privacy', 'community'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-borderCustom p-4 sticky top-24 shadow-sm">
          <h3 className="text-xs font-bold text-textSec uppercase tracking-wider mb-4 px-3">Legal & Policies</h3>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'terms' ? 'bg-primary/10 text-primary' : 'text-textDark hover:bg-background'}`}
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'privacy' ? 'bg-primary/10 text-primary' : 'text-textDark hover:bg-background'}`}
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'community' ? 'bg-primary/10 text-primary' : 'text-textDark hover:bg-background'}`}
            >
              <Users className="w-4 h-4" />
              Community Guidelines
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-borderCustom p-6 md:p-10 shadow-sm min-h-[600px] prose prose-slate max-w-none">
        
        {/* Terms of Service */}
        {activeTab === 'terms' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderCustom not-prose">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-textDark">Terms of Service</h1>
            </div>
            
            <p className="text-sm text-muted">Last Updated: July 2026</p>
            
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using RevoShelf, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>

            <h3>2. Eligibility</h3>
            <p>
              You must be a verified student with a valid university email address to use this service. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3>3. User Conduct</h3>
            <p>
              You agree to use the platform only for lawful purposes. You must not post fraudulent listings, harass other users, or use the platform to distribute spam or malicious software.
            </p>

            <h3>4. Transactions</h3>
            <p>
              RevoShelf acts solely as a venue to connect buyers and sellers. We are not a party to any transaction and do not guarantee the quality, safety, or legality of items listed. All transactions are made at your own risk.
            </p>

            <h3>5. Termination</h3>
            <p>
              We reserve the right to terminate or suspend your account at any time for violations of these Terms of Service or our Community Guidelines.
            </p>
          </div>
        )}

        {/* Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderCustom not-prose">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-textDark">Privacy Policy</h1>
            </div>
            
            <p className="text-sm text-muted">Last Updated: July 2026</p>
            
            <h3>1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us, such as your name, university email address, profile picture, and the content of your listings and messages.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use your information to operate, maintain, and improve our platform, to process and complete transactions (by connecting you with peers), and to communicate with you about service updates.
            </p>

            <h3>3. Information Sharing</h3>
            <p>
              We do not sell your personal information to third parties. We only share your public profile information (name, avatar, university) with other verified users to facilitate marketplace interactions.
            </p>

            <h3>4. Data Security</h3>
            <p>
              We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>
        )}

        {/* Community Guidelines */}
        {activeTab === 'community' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderCustom not-prose">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-textDark">Community Guidelines</h1>
            </div>
            
            <p className="text-sm text-muted">Last Updated: July 2026</p>
            
            <h3>1. Be Respectful</h3>
            <p>
              Treat all members of the RevoShelf community with respect. Harassment, hate speech, bullying, and discrimination of any kind will not be tolerated.
            </p>

            <h3>2. Honest Listings</h3>
            <p>
              Accurately describe the items you are selling. Do not use misleading photos or hide significant damage. Honesty builds trust within your campus community.
            </p>

            <h3>3. Follow Through</h3>
            <p>
              If you agree to meet a buyer or seller, show up on time at the agreed-upon location. If you need to cancel or reschedule, communicate this as early as possible.
            </p>

            <h3>4. Prohibited Items</h3>
            <p>
              You may only list academic resources (textbooks, calculators, lab coats, etc.). The sale of illegal items, weapons, drugs, or stolen property is strictly prohibited and will result in immediate account termination and potential notification of campus authorities.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
