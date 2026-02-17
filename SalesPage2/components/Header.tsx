
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            {/* 360 Circle Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-indigo-600 overflow-hidden shadow-inner">
              {/* Professor SVG Illustration */}
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mt-2">
                <circle cx="32" cy="22" r="16" fill="#4F46E5" fillOpacity="0.1"/>
                {/* Face/Head */}
                <path d="M32 44C40.8366 44 48 40.4183 48 36V24C48 19.5817 40.8366 16 32 16C23.1634 16 16 19.5817 16 24V36C16 40.4183 23.1634 44 32 44Z" fill="#FDE68A"/>
                {/* Hair/Cap */}
                <path d="M16 24C16 20 20 16 32 16C44 16 48 20 48 24V28H16V24Z" fill="#1E293B"/>
                {/* Glasses */}
                <path d="M22 28H28M36 28H42M28 28C28 29.6569 26.6569 31 25 31C23.3431 31 22 29.6569 22 28M42 28C42 29.6569 40.6569 31 39 31C37.3431 31 36 29.6569 36 28" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Suit/Tie area */}
                <path d="M16 44C16 48 20 56 32 56C44 56 48 48 48 44" fill="#4F46E5"/>
                <path d="M32 44V56M32 44L28 48M32 44L36 48" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            {/* 360 Badge */}
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded border border-white">360°</div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-800 tracking-tighter leading-none">TUTOR <span className="text-indigo-600 italic">360</span> IA</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premium Language Learning</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all hover:translate-y-[-1px]">Learning Path</a>
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all hover:translate-y-[-1px]">Professor Lounge</a>
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all hover:translate-y-[-1px]">Community</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-bold text-slate-400 hover:text-slate-600 px-4">Log In</button>
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-black transition-all shadow-md hover:shadow-lg active:scale-95">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
