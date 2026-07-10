import React, { useEffect } from 'react';

export const TermsConditionsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        <div className="mb-12 border-b border-borderCustom pb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-textSec">Effective Date: July 10, 2026</p>
        </div>

        <div className="bg-white border border-borderCustom rounded-2xl p-6 md:p-10 shadow-sm prose prose-slate max-w-none text-textSec leading-relaxed">
          
          <h3 className="text-xl font-bold text-textDark mb-3 mt-0">1. Acceptance of Terms</h3>
          <p className="mb-8">
            By registering for and using RevoShelf, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you are prohibited from using the platform.
          </p>

          <h3 className="text-xl font-bold text-textDark mb-3">2. User Eligibility</h3>
          <p className="mb-8">
            RevoShelf is restricted to currently enrolled college or university students. You must register using a valid university-issued email address. You agree to provide accurate, current, and complete information during registration.
          </p>

          <h3 className="text-xl font-bold text-textDark mb-3">3. Marketplace Role</h3>
          <p className="mb-8">
            RevoShelf is a venue for students to list, discover, and arrange the exchange of academic materials. <strong>We are not a party to any transaction.</strong> We do not transfer legal ownership of items from seller to buyer. All transactions are agreed upon solely between the users.
          </p>

          <h3 className="text-xl font-bold text-textDark mb-3">4. User Conduct & Prohibited Items</h3>
          <p className="mb-4">Users agree NOT to use the platform to:</p>
          <ul className="list-disc pl-5 space-y-2 mb-8">
            <li>Violate any local, state, or university regulations.</li>
            <li>List illegal items, weapons, drugs, or stolen property.</li>
            <li>Harass, defraud, or threaten other users.</li>
            <li>Scrape data or attempt to bypass security measures.</li>
          </ul>

          <h3 className="text-xl font-bold text-textDark mb-3">5. Disclaimer of Warranties</h3>
          <p className="mb-8">
            The platform is provided "AS IS" without warranties of any kind. We do not guarantee the accuracy of listings, the quality of items, or the safety of user interactions. You assume full responsibility for your interactions with other users.
          </p>

          <h3 className="text-xl font-bold text-textDark mb-3">6. Account Termination</h3>
          <p className="mb-0">
            We reserve the right to suspend or terminate your account at our sole discretion, without notice, if we believe you have violated these Terms & Conditions or compromised the safety of the community.
          </p>

        </div>
      </div>
    </div>
  );
};
