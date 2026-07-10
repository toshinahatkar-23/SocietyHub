import React, { useState } from 'react';
import { apiService } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (name: string, role: string, userObj?: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('admin@societyhub.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Marketing quote slider local state
  const quotes = [
    { text: "SocietyHub transformed our community's communication. Overdue invoices plummeted by 80% in just two months.", author: "Arjun Mehta", role: "Resident Association President, Wing B" },
    { text: "The visitor pre-screening gate protocol is absolute magic. We feel 10x safer, and delivery guys never pile up.", author: "Sarah Jenkins", role: "Chief Security Officer" },
    { text: "I can raise plumbing issues and pay maintenance dues within seconds. Beautifully simple, clean software.", author: "Priya Sharma", role: "Resident of Apt 302" }
  ];
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  const handleNextQuote = () => {
    setActiveQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiService.login(email, password);
      setIsSubmitting(false);

      const user = data.user;
      if (user.role === 'staff') {
        alert('Staff Portal is under development. Please log in with a different role.');
        return;
      }

      // Map roles from backend (admin, resident, guard) to frontend display roles
      let displayRole = '';
      if (user.role === 'admin') displayRole = 'Society Admin';
      else if (user.role === 'resident') displayRole = 'Resident';
      else if (user.role === 'guard') displayRole = 'Security Guard';
      else displayRole = user.role;

      onLoginSuccess(user.name, displayRole, user);
    } catch (err: any) {
      setIsSubmitting(false);
      const errMsg = err.response?.data?.error || err.message || 'Login failed. Please check credentials or API connection.';
      alert(errMsg);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800 animate-fade-in">
      {/* Left Column: Visual branding and testimonials (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
        {/* Glowing atmospheric vector circles */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-primary font-bold text-[24px]">domain</span>
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-white text-xl tracking-tight leading-none">SocietyHub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Community Cloud Console</p>
          </div>
        </div>

        {/* Core Marketing message */}
        <div className="relative z-10 my-auto max-w-lg">
          <h2 className="font-sans font-bold text-3xl xl:text-4xl text-white tracking-tight leading-snug">
            Streamlining residential ecosystem operations globally.
          </h2>
          <p className="text-slate-400 text-[14px] mt-4 leading-relaxed font-medium">
            From automated invoice creation to instant guard-checklists, manage all society residents, visitors, complaints, and billing dues in a single certified administrative interface.
          </p>

          {/* Customer Quote Carousel */}
          <div className="mt-8 bg-white/5 backdrop-blur-md p-6 rounded-[16px] border border-white/10 relative shadow-sm">
            <p className="text-[14px] font-semibold text-white/95 italic leading-relaxed">
              "{quotes[activeQuoteIdx].text}"
            </p>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-white">{quotes[activeQuoteIdx].author}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{quotes[activeQuoteIdx].role}</p>
              </div>
              <button
                onClick={handleNextQuote}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer border border-white/5"
                title="Next slide quote"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
          © 2026 SocietyHub Technologies. Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column: Credential Entry Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          {/* Logo element for mobile view */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-[22px]">domain</span>
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-primary text-xl leading-none">SocietyHub</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Management Console</p>
            </div>
          </div>

          <div>
            <h2 className="font-sans font-bold text-[36px] text-slate-900 tracking-tight leading-none">Welcome back</h2>
            <p className="text-slate-500 text-[16px] mt-3">
              Enter your credentials to access the SocietyHub console.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all">
                <span className="material-symbols-outlined text-slate-400 text-[20px] select-none shrink-0">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., admin@societyhub.com"
                  className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full ml-3 py-3.5 outline-none text-slate-700"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Accounts (Password: password123):\n\n1. Admin: admin@societyhub.com\n2. Resident: resident@societyhub.com\n3. Security Guard: guard@societyhub.com')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Demo Accounts
                </button>
              </div>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all">
                <span className="material-symbols-outlined text-slate-400 text-[20px] select-none shrink-0">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full ml-3 py-3.5 outline-none text-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4.5 h-4.5 text-primary bg-white rounded-lg focus:ring-primary cursor-pointer border border-slate-300 transition-colors"
                />
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Developer guidance card */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-[16px] text-center space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <p className="text-xs text-slate-400 font-semibold">
              Enter any of the following emails (Password: <code className="bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[11px]">password123</code>):
            </p>
            <div className="text-[11px] text-primary font-bold flex flex-wrap justify-center gap-x-2">
              <span className="cursor-pointer underline hover:text-primary/80" onClick={() => setEmail('admin@societyhub.com')}>admin@societyhub.com</span>
              <span className="text-slate-300">•</span>
              <span className="cursor-pointer underline hover:text-primary/80" onClick={() => setEmail('resident@societyhub.com')}>resident@societyhub.com</span>
              <span className="text-slate-300">•</span>
              <span className="cursor-pointer underline hover:text-primary/80" onClick={() => setEmail('guard@societyhub.com')}>guard@societyhub.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
