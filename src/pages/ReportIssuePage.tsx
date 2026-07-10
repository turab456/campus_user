import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Send, FileWarning, ArrowLeft } from 'lucide-react';

export const ReportIssuePage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        <Link to="/help-center" className="inline-flex items-center gap-2 text-sm text-muted hover:text-textDark font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Help Center
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">
            Report an Issue
          </h1>
          <p className="text-textSec text-lg">
            Help us keep RevoShelf safe. Our Trust & Safety team reviews every report.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-borderCustom shadow-sm overflow-hidden">
          {isSubmitted ? (
            <div className="text-center p-12">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-textDark mb-2">Report Submitted</h3>
              <p className="text-textSec mb-8 max-w-sm mx-auto">
                Thank you for helping us maintain a safe community. We will investigate this issue immediately.
              </p>
              <Link to="/home" className="bg-background border border-borderCustom hover:bg-[#F0EEEB] text-textDark font-bold py-2.5 px-6 rounded-xl transition-colors">
                Return to Home
              </Link>
            </div>
          ) : (
            <div className="p-6 md:p-10">
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-8">
                <FileWarning className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  If you are in immediate physical danger on campus, please contact campus security or local emergency services (911) immediately.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textDark">What are you reporting?</label>
                  <select required className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer">
                    <option value="" disabled selected>Select issue type...</option>
                    <option value="user_behavior">Suspicious User or Scam</option>
                    <option value="listing">Fake or Inappropriate Listing</option>
                    <option value="harassment">Harassment or Abuse</option>
                    <option value="technical">Technical Bug</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textDark">Link to Listing or Profile (Optional)</label>
                  <input type="url" className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://campusmarketplace.com/..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textDark">Description</label>
                  <p className="text-xs text-muted mb-2">Please provide as much detail as possible to help us investigate.</p>
                  <textarea required rows={6} className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder="Explain what happened..."></textarea>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full sm:w-auto bg-danger hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
