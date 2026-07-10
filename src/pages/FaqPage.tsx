import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircle } from 'lucide-react';

type FAQItem = { q: string; a: string };
type FAQCategory = { title: string; id: string; items: FAQItem[] };

const faqs: FAQCategory[] = [
  {
    title: "Account & Verification",
    id: "account",
    items: [
      { q: "Is RevoShelf free?", a: "Yes, our platform is completely free to use for students. There are no listing fees or transaction commissions." },
      { q: "How do I verify my account?", a: "You must sign up using a valid university-issued email address (.edu). We will send a verification link to confirm your student status." },
      { q: "Can I use a personal email?", a: "To maintain a safe, student-only environment, we currently only accept valid university email addresses for registration." }
    ]
  },
  {
    title: "Buying & Selling",
    id: "listings",
    items: [
      { q: "How do I list a book?", a: "Click the 'Sell' button, upload clear photos of your book, add the title, course code, condition, and your asking price. It takes less than a minute!" },
      { q: "How do I contact a seller?", a: "Click 'Chat with Seller' on any book listing. This will open a secure message thread where you can discuss details and arrange a meetup." },
      { q: "Can I edit my listing?", a: "Yes, go to 'Profile' > 'My Listings' to edit the price, description, or mark the book as sold." }
    ]
  },
  {
    title: "Payments",
    id: "payments",
    items: [
      { q: "How are payments handled?", a: "RevoShelf does not process payments online. You arrange the payment method (Cash, UPI, Venmo, etc.) directly with the other student when you meet." },
      { q: "Do you take a cut of the sale?", a: "No. You keep 100% of the money you make from selling your books." }
    ]
  }
];

export const FaqPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>("account-0");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-textDark tracking-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-textSec text-lg">
          Everything you need to know about RevoShelf.
        </p>
      </div>

      {/* FAQ Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {faqs.map((category) => (
          <div key={category.id} className="mb-10" id={category.id}>
            <h2 className="text-xl font-bold text-textDark mb-4">{category.title}</h2>
            <div className="bg-white rounded-2xl border border-borderCustom overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              {category.items.map((item, index) => {
                const id = `${category.id}-${index}`;
                const isOpen = openItem === id;
                return (
                  <div key={index} className="border-b border-borderCustom last:border-0">
                    <button
                      onClick={() => toggleItem(id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAF8F5] transition-colors focus:outline-none"
                    >
                      <span className="font-semibold text-textDark pr-4">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="p-5 pt-0 text-textSec text-sm leading-relaxed">
                        {item.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
         <div className="inline-flex flex-col items-center justify-center p-8">
           <MessageCircle className="w-8 h-8 text-muted mb-3" />
           <p className="text-textDark font-medium mb-1">Didn't find what you were looking for?</p>
           <Link to="/contact-us" className="text-primary hover:text-primary-hover font-bold transition-colors">
             Contact our support team
           </Link>
         </div>
      </div>
    </div>
  );
};
