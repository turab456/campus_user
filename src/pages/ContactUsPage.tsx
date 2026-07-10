import React, { useEffect, useState } from 'react';
import { Mail, Clock, Send, MessageSquare } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row gap-12 lg:gap-20">

        {/* Left Col: Info */}
        <div className="flex-1 lg:pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">
            Get in touch
          </h1>
          <p className="text-textSec text-lg mb-10 max-w-md">
            Our team is here to help. Send us a message and we'll respond as quickly as possible.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-textDark mb-1">Support</h3>
                <p className="text-sm text-textSec mb-1">For help with your account, listings, or general issues.</p>
                <a href="mailto:support@revoshelf.com" className="text-primary hover:underline text-sm font-medium">support@revoshelf.com</a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-textDark mb-1">Business Inquiries</h3>
                <p className="text-sm text-textSec mb-1">For partnerships or campus expansion requests.</p>
                <a href="mailto:hello@campusmarketplace.com" className="text-primary hover:underline text-sm font-medium">hello@campusmarketplace.com</a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-background w-12 h-12 border border-borderCustom rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-muted" />
              </div>
              <div>
                <h3 className="font-bold text-textDark mb-1">Response Time</h3>
                <p className="text-sm text-textSec">We typically reply within 24 hours during business days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Form */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-borderCustom p-6 md:p-8 shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-textDark mb-2">Message Sent!</h3>
                <p className="text-textSec mb-6">Thank you for reaching out. We will get back to you shortly.</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-textDark">First Name</label>
                    <input type="text" required className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Jane" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-textDark">Last Name</label>
                    <input type="text" required className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textDark">University Email</label>
                  <input type="email" required className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="jane@university.edu" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textDark">Topic</label>
                  <select required className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="" disabled selected>Select a topic...</option>
                    <option value="account">Account & Verification</option>
                    <option value="report">Report an Issue</option>
                    <option value="feedback">General Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textDark">Message</label>
                  <textarea required rows={5} className="w-full bg-[#FAF8F5] border border-borderCustom rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-colors mt-2">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
