import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Book, ArrowRight, ShieldCheck, RefreshCw, BadgePercent, ChevronDown, Calculator, Laptop, FlaskConical, FileText, Bike, Home, Cpu, PenTool } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { BookCard } from '../components/BookCard';
import { backendApi as api } from '../services/backendApi';
import type { Book as BookType } from '../types';
import { Badge } from '../components/Badge';
import { TrustIndicators } from '../components/TrustIndicators';
import { HeroCollage } from '../components/HeroCollage';
import { ProblemSolver } from '../components/ProblemSolver';

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Book': return <Book className="w-5 h-5" />;
    case 'Calculator': return <Calculator className="w-5 h-5" />;
    case 'Laptop': return <Laptop className="w-5 h-5" />;
    case 'FlaskConical': return <FlaskConical className="w-5 h-5" />;
    case 'FileText': return <FileText className="w-5 h-5" />;
    case 'Bike': return <Bike className="w-5 h-5" />;
    case 'Home': return <Home className="w-5 h-5" />;
    case 'Cpu': return <Cpu className="w-5 h-5" />;
    case 'PenTool': return <PenTool className="w-5 h-5" />;
    default: return <Book className="w-5 h-5" />;
  }
};

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState<BookType[]>([]);
  const [popularBooks, setPopularBooks] = useState<BookType[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const books = await api.getBooks();
        
        let featured = books.filter(b => b.isFeatured);
        let popular = books.filter(b => b.isPopular);
        
        // Fallback to active catalog items if database seeds do not mark featured/popular listings
        if (featured.length === 0) {
          featured = books.slice(0, 4);
        } else {
          featured = featured.slice(0, 4);
        }
        
        if (popular.length === 0) {
          popular = books.slice(4, 8).length > 0 ? books.slice(4, 8) : books.slice(0, 4);
        } else {
          popular = popular.slice(0, 4);
        }

        setFeaturedBooks(featured);
        setPopularBooks(popular);
      } catch (err) {
        console.error('Error loading landing page books', err);
      }
    };
    loadBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const faqs = [
    {
      q: "How does the pickup process work?",
      a: "When you find a book you like, click 'Contact Seller'. You can chat directly through the platform and coordinate a safe public meeting spot on or off campus, or near your area, to inspect the item and complete the exchange."
    },
    {
      q: "Is it restricted to college students only?",
      a: "Yes, it is designed specifically for students! Any student from any college can join. You can connect with peers from your own campus, or trade with students from other colleges and locations near you."
    },
    {
      q: "Are there any listing fees or commissions?",
      a: "No! RevoShelf is completely free for college students. There are no fees to post, and we do not take any commissions from transactions."
    },
    {
      q: "Can I sell things other than books?",
      a: "Absolutely. While textbooks are our primary focus, you can list calculators, cycles, lab coats, hostel mattress/essentials, and other student gear under their respective categories."
    }
  ];

  return (
    <div className="flex flex-col -mt-2">
      {/* Hero Section */}
      <section className="pt-8 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge>Campus-made & Peer-to-Peer</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-textDark tracking-tight leading-tight">Your college bookshelf, passed down.</h1>
          <p className="text-[#4B5563] text-base leading-relaxed max-w-lg">A simple, student-to-student marketplace. No shipping fees, no middlemen. Just meet up at the library or canteen and exchange books directly with peers.</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
            <div className="flex-1 flex items-center relative">
              <Search className="w-5 h-5 text-muted absolute left-3.5" />
              <input
                type="text"
                placeholder="What are you studying? Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-3 pl-11 pr-4 text-sm text-textDark placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-semibold px-6 py-3 rounded-lg shadow-subtle transition-colors"
            >
              Find Books
            </button>
          </form>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 max-w-md">
            <Link to="/search" className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-semibold px-6 py-3 rounded-lg shadow-subtle text-center flex-1 transition-colors">Explore Catalog</Link>
            <Link to="/create-listing" className="bg-white hover:bg-gray-50 text-[#4B5563] font-semibold px-6 py-3 rounded-lg border border-borderCustom shadow-subtle text-center flex-1 transition-colors">List a Book</Link>
          </div>
          <TrustIndicators />
        </div>
        <div className="flex justify-center">
          <HeroCollage />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pt-16 md:pt-20 border-t border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-textDark">Find what you need by subject</h2>
            <p className="text-xs text-muted mt-3 max-w-sm">Discover textbooks, notes, and gear shared by seniors</p>
          </div>
          <Link to="/search" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0">
            <span>View All Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/search?category=${category.id}`}
              className="bg-white border border-borderCustom p-4 rounded-xl flex flex-col items-center justify-center text-center hover:shadow-subtle transition-all duration-150 group"
            >
              <div className="bg-[#FAF8F5] border border-borderCustom w-10 h-10 rounded-lg flex items-center justify-center text-muted group-hover:text-primary group-hover:bg-primary-light transition-all mb-2.5">
                {getCategoryIcon(category.icon)}
              </div>
              <span className="text-xs font-bold text-textDark leading-tight group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Book Section */}
      <section className="pt-16 md:pt-20 border-t border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-textDark">Picked by students this week</h2>
            <p className="text-xs text-muted mt-3 max-w-sm">Hand-picked essentials and listings popular on campus right now</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="pt-16 md:pt-20 border-t border-[#E5E7EB]">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-textDark">How we trade on campus</h2>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            Simple, face-to-face exchanges designed around university life. No shipping fees, no sketchy online forms.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            {
              step: "01",
              title: "Browse & Find",
              desc: "Look up course codes, semesters, or student tags. Filter by your college to find books right down your corridor."
            },
            {
              step: "02",
              title: "Say Hello",
              desc: "Chat directly through our messaging center. Set up a good spot to meet, negotiate, and coordinate an exchange."
            },
            {
              step: "03",
              title: "Meet & Swap",
              desc: "Meet up in public campus spots (like the library or college canteen). Check the book condition, and pay directly via UPI or cash."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-borderCustom p-6 rounded-xl flex flex-col relative z-10 shadow-subtle">
              <span className="text-3xl font-extrabold text-primary-light absolute top-4 right-4">{item.step}</span>
              <h3 className="font-bold text-sm text-textDark mb-2 mt-1">{item.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Books */}
      <section className="pt-16 md:pt-20 border-t border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-textDark">Just listed by fellow students</h2>
            <p className="text-xs text-muted mt-3 max-w-sm">Fresh textbook and notes listings uploaded recently</p>
          </div>
          <Link to="/search" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {popularBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#E5E7EB] pt-16 md:pt-20">
        {[
          {
            icon: <BadgePercent className="w-6 h-6 text-primary" />,
            title: "Save Your Pocket Money",
            desc: "Buy textbooks and tools for up to 70% off bookstore prices, and recover some cash by passing down your old books."
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-primary" />,
            title: "Dorm to Dorm Network",
            desc: "Trade directly with peers from your college or neighboring campus. Verify student profiles and ratings first."
          },
          {
            icon: <RefreshCw className="w-6 h-6 text-primary" />,
            title: "Sustainable Campus Life",
            desc: "Reduce paper waste and promote a circular campus economy by sharing, recycling, and reusing materials."
          }
        ].map((benefit, idx) => (
          <div key={idx} className="border border-borderCustom bg-white p-6 rounded-xl shadow-subtle flex flex-col items-start">
            <div className="bg-[#F5F3EF] border border-[#E5E7EB] p-3 rounded-lg mb-4">{benefit.icon}</div>
            <h3 className="font-bold text-sm text-textDark mb-1">{benefit.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </section>

      {/* Problem Solver Comparison */}
      <ProblemSolver />

      {/* FAQs */}
      <section className="max-w-2xl mx-auto w-full border-t border-[#E5E7EB] pt-16 md:pt-20">
        <h2 className="text-xl md:text-2xl font-bold text-textDark text-center mb-8">Frequently Asked Questions</h2>
        <div className="flex flex-col">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="border-b border-[#E5E7EB] py-4"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between font-semibold text-sm text-textDark hover:text-primary transition-colors text-left focus:outline-none"
                >
                  <span className="font-bold text-sm text-textDark">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="pt-2 text-xs text-[#4B5563] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
