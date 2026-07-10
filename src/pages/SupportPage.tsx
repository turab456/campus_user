import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle, MessageCircle, ShieldAlert, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "Is RevoShelf free to use?",
    answer: "Yes! RevoShelf is completely free for college students. We do not charge listing fees or take any commission from your sales."
  },
  {
    question: "How do I verify my student status?",
    answer: "Currently, you must sign up using a valid .edu or university-issued email address. We send a verification link to ensure you belong to the campus community."
  },
  {
    question: "How do payments work?",
    answer: "RevoShelf does not process payments directly. We connect you with buyers/sellers on your campus. You agree on a payment method (UPI, cash, etc.) and complete the transaction when you meet in person."
  },
  {
    question: "What if a buyer or seller doesn't show up?",
    answer: "We recommend communicating clearly through our secure messaging system before meeting. If someone repeatedly fails to show up, you can report their profile using the 'Report an Issue' feature."
  }
];

export const SupportPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('help');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const hash = location.hash.replace('#', '');
    if (hash && ['help', 'contact', 'safety', 'report'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-borderCustom p-4 sticky top-24 shadow-sm">
          <h3 className="text-xs font-bold text-textSec uppercase tracking-wider mb-4 px-3">Support Hub</h3>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('help')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'help' ? 'bg-primary/10 text-primary' : 'text-textDark hover:bg-background'}`}
            >
              <HelpCircle className="w-4 h-4" />
              Help Center & FAQs
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'safety' ? 'bg-primary/10 text-primary' : 'text-textDark hover:bg-background'}`}
            >
              <ShieldAlert className="w-4 h-4" />
              Safety Tips
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'contact' ? 'bg-primary/10 text-primary' : 'text-textDark hover:bg-background'}`}
            >
              <MessageCircle className="w-4 h-4" />
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${activeTab === 'report' ? 'bg-red-50 text-danger' : 'text-textDark hover:bg-background'}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Report an Issue
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-borderCustom p-6 md:p-10 shadow-sm min-h-[600px]">
        
        {/* Help Center & FAQs */}
        {activeTab === 'help' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderCustom">
              <div className="bg-primary/10 p-2 rounded-lg">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-textDark">Help Center & FAQs</h1>
            </div>
            
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="border border-borderCustom rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-background transition-colors"
                  >
                    <span className="font-semibold text-textDark">{item.question}</span>
                    {openFaq === index ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
                  </button>
                  {openFaq === index && (
                    <div className="p-4 bg-background border-t border-borderCustom text-sm text-textSec leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Tips */}
        {activeTab === 'safety' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderCustom">
              <div className="bg-primary/10 p-2 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-textDark">Safety Tips</h1>
            </div>
            <div className="prose prose-slate max-w-none text-textSec">
              <p className="mb-6 text-sm">Your safety is our top priority. Please adhere to these guidelines when meeting with someone from RevoShelf.</p>
              
              <ul className="space-y-4 list-disc pl-5">
                <li><strong>Meet in Public:</strong> Always arrange to meet in well-lit, public areas on campus, such as the library, cafeteria, or student union.</li>
                <li><strong>Bring a Friend:</strong> If you feel unsure, bring a friend along with you to the exchange.</li>
                <li><strong>Inspect Before You Pay:</strong> Carefully inspect the book to ensure it matches the condition described in the listing before handing over payment.</li>
                <li><strong>Keep Communication On-Platform:</strong> Use our secure messaging system rather than giving out your personal phone number or social media handles.</li>
                <li><strong>Trust Your Instincts:</strong> If a situation feels suspicious or a user is being overly aggressive about meeting immediately in a private location, cancel the transaction and report them.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Contact Us */}
        {activeTab === 'contact' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderCustom">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-textDark">Contact Us</h1>
            </div>
            
            <p className="text-sm text-textSec mb-6">
              Have a question that wasn't answered in the FAQ? Want to provide feedback? We'd love to hear from you.
            </p>

            <form className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-semibold text-textDark mb-1.5">Name</label>
                <input type="text" className="w-full bg-background border border-borderCustom rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-textDark mb-1.5">Email</label>
                <input type="email" className="w-full bg-background border border-borderCustom rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Your college email" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-textDark mb-1.5">Message</label>
                <textarea rows={5} className="w-full bg-background border border-borderCustom rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
                Send Message
              </button>
            </form>
          </div>
        )}

        {/* Report an Issue */}
        {activeTab === 'report' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-8 pb-6 border-b border-borderCustom">
              <div className="bg-red-50 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-danger" />
              </div>
              <h1 className="text-2xl font-bold text-textDark">Report an Issue</h1>
            </div>
            
            <p className="text-sm text-textSec mb-6">
              If you encountered a technical bug, a fraudulent user, or inappropriate content, please let us know immediately so we can take action.
            </p>

            <form className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-semibold text-textDark mb-1.5">Issue Type</label>
                <select className="w-full bg-background border border-borderCustom rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option>Technical Bug</option>
                  <option>Fraudulent Seller/Buyer</option>
                  <option>Inappropriate Content/Listing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-textDark mb-1.5">Description</label>
                <textarea rows={5} className="w-full bg-background border border-borderCustom rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="Please provide specific details..."></textarea>
              </div>
              <button type="button" className="bg-danger hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
                Submit Report
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
