import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Search,
  ShieldCheck,
  BookOpen,
  MapPin,
  MessageSquare
} from 'lucide-react';

interface ComparisonCard {
  category: string;
  problem: string;
  solution: string;
  visual: React.ReactNode;
}

export const ProblemSolver: React.FC = () => {
  const cards: ComparisonCard[] = [
    {
      category: "📚 Finding Books",
      problem: "I spent two days asking in WhatsApp groups and still couldn't find the book.",
      solution: "Search thousands of listings instantly with filters by subject, semester, author, and college.",
      visual: (
        <div className="bg-[#F5F3EF] border border-[#E5E7EB] rounded-[10px] p-2.5 w-full max-w-[180px] flex flex-col gap-1.5 transition-transform duration-200 group-hover:translate-x-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-[6px] px-2 py-1 text-[9px] text-muted">
            <Search className="w-3 h-3 text-slate-400" />
            <span>Search Math...</span>
          </div>
          <div className="flex gap-1">
            <span className="bg-primary-light text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-md">Sem 3</span>
            <span className="bg-white border border-[#E5E7EB] text-muted text-[8px] font-bold px-1.5 py-0.5 rounded-md">RVCE</span>
          </div>
        </div>
      )
    },
    {
      category: "👤 Trust",
      problem: "I don't know if the seller is genuine.",
      solution: "Verified student profiles help you buy with confidence.",
      visual: (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 w-full max-w-[180px] flex items-center gap-2 shadow-subtle transition-transform duration-200 group-hover:scale-102">
          <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-textDark truncate">John Doe</span>
              <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            </div>
            <p className="text-[8px] text-muted truncate">RV College</p>
          </div>
        </div>
      )
    },
    {
      category: "📷 Book Condition",
      problem: "I don't know whether the book is new or damaged.",
      solution: "Every listing includes multiple photos, book condition, and edition details.",
      visual: (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-2 w-full max-w-[180px] flex gap-2 shadow-subtle transition-transform duration-200 group-hover:-translate-y-0.5">
          <div className="w-9 h-11 bg-[#FAF8F5] rounded border border-[#E5E7EB] flex items-center justify-center text-slate-400 flex-shrink-0">
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <span className="text-[9px] font-bold text-textDark truncate">Algorithms</span>
            <div className="flex gap-1 mt-0.5">
              <span className="bg-[#E8F5E9] text-[#16A34A] border border-[#C8E6C9] text-[7px] font-bold px-1 py-0.2 rounded">New</span>
              <span className="bg-[#FAF8F5] text-muted border border-[#E5E7EB] text-[7px] font-bold px-1 py-0.2 rounded">5th Ed.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      category: "💬 Communication",
      problem: "Sellers reply after several hours or never respond.",
      solution: "Built-in messaging keeps conversations organized and active.",
      visual: (
        <div className="bg-[#F5F3EF] border border-[#E5E7EB] rounded-xl p-2 w-full max-w-[180px] flex flex-col gap-1.5 transition-transform duration-200 group-hover:translate-y-0.5">
          <div className="bg-white border border-[#E5E7EB] text-[8px] text-textDark p-1.5 rounded-lg rounded-tl-none self-start max-w-[85%] leading-tight shadow-2xs">
            Is the book available?
          </div>
          <div className="bg-primary-light text-primary text-[8px] p-1.5 rounded-lg rounded-tr-none self-end max-w-[85%] leading-tight shadow-2xs">
            Yes, let's meet tomorrow!
          </div>
        </div>
      )
    },
    {
      category: "💰 Price",
      problem: "New books are too expensive every semester.",
      solution: "Buy affordable second-hand books directly from seniors.",
      visual: (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 w-full max-w-[180px] flex items-center justify-between shadow-subtle transition-transform duration-200 group-hover:scale-102">
          <div className="flex flex-col">
            <span className="text-[8px] text-muted font-bold uppercase">Store Price</span>
            <span className="text-[11px] text-muted line-through">₹1,200</span>
          </div>
          <div className="w-[1px] h-6 bg-[#E5E7EB]" />
          <div className="flex flex-col text-right">
            <span className="text-[8px] text-primary font-bold uppercase">Our Price</span>
            <span className="text-sm font-extrabold text-[#16A34A]">₹450</span>
          </div>
        </div>
      )
    },
    {
      category: "📍 Pickup",
      problem: "Shipping costs more than the book itself.",
      solution: "Meet safely on campus or nearby for quick free pickup.",
      visual: (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 w-full max-w-[180px] flex items-center gap-2 shadow-subtle transition-transform duration-200 group-hover:translate-x-1.5">
          <div className="bg-[#F5F3EF] p-1.5 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-primary">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-textDark block truncate">Central Library</span>
            <span className="text-[8px] text-muted block truncate">Canteen Area, 2 PM</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="border-t border-[#E5E7EB] pt-16 md:pt-20">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-textDark">
          Real Problems Students Face Every Semester
        </h2>
        <p className="text-xs text-muted mt-3 leading-relaxed">
          Thousands of students struggle to find affordable books, trustworthy sellers, and quick responses. RevoShelf solves these everyday problems in one place.
        </p>
      </div>

      {/* Vertical Comparison Stack */}
      <div className="flex flex-col gap-5 md:gap-6 max-w-3xl mx-auto">
        {cards.map((card, index) => (
          <div
            key={index}
            className="border border-borderCustom rounded-xl bg-white p-5 hover:shadow-subtle hover:border-slate-300 transition-all duration-200 group"
          >
            {/* Category header */}
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-3">
              {card.category}
            </span>

            {/* Split layout: Problem vs Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Side (Problem) */}
              <div className="flex flex-col gap-2.5 pr-0 md:pr-4 md:border-r border-divider">
                <div className="flex items-center gap-1.5 text-danger">
                  <AlertCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Real Student Problem</span>
                </div>
                <p className="text-xs font-semibold text-textDark leading-relaxed italic">
                  "{card.problem}"
                </p>
              </div>

              {/* Right Side (Solution) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-0 md:pl-2">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#16A34A]">
                    <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-[9px] font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                      How We Solve It
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed group-hover:text-textDark transition-colors">
                    {card.solution}
                  </p>
                </div>
                <div className="flex items-center justify-start sm:justify-end flex-shrink-0 w-full sm:w-auto">
                  {card.visual}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
