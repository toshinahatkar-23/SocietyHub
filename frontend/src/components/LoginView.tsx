import React, { useState } from 'react';
import { apiService } from '../services/api';
import apartmentImage from '../../assets/modern_apartment.png';
import { validateEmail, validateMobile, validatePassword } from '../utils/validation';

interface LoginViewProps {
  onLoginSuccess: (name: string, role: string, userObj?: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('sarah.chen@societyhub.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Screen routing state
  const [activeScreen, setActiveScreen] = useState<'login' | 'forgot-password' | 'register' | 'register-success'>('login');

  // Custom inline notification states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  // Resident registration request states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBlock, setRegBlock] = useState('Block A');
  const [regFlat, setRegFlat] = useState('');
  const [regFlatType, setRegFlatType] = useState('3 BHK');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regConfirmChecked, setRegConfirmChecked] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regMessage, setRegMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const data = await apiService.login(email, password);
      setIsSubmitting(false);

      const user = data.user;
      if (user.role === 'staff') {
        setErrorMessage('Staff Portal is under development. Please log in with a different role.');
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
      setErrorMessage(errMsg);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage('Please enter your email address.');
      setSuccessMessage(null);
      return;
    }
    setForgotSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Simulate sending reset instructions link
    setTimeout(() => {
      setForgotSubmitting(false);
      setSuccessMessage(`A password reset link has been sent to ${forgotEmail}. Please check your inbox.`);
      setForgotEmail('');
    }, 1200);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRegMessage(null);

    // 1. Required fields check
    if (!regName || !regEmail || !regPhone || !regFlat || !regPassword || !regConfirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    // 2. Email format validation
    if (!validateEmail(regEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // 3. Mobile number validation (exactly 10 digits)
    if (!validateMobile(regPhone)) {
      setErrorMessage('Mobile number must contain exactly 10 numeric digits.');
      return;
    }

    // 4. Password validation (strength check)
    const checkStrength = validatePassword(regPassword);
    if (!checkStrength.isValid) {
      setErrorMessage(checkStrength.message);
      return;
    }

    // 5. Password confirmation match check
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // 6. Checkbox check
    if (!regConfirmChecked) {
      setErrorMessage('You must confirm that you are a resident of this society to submit the request.');
      return;
    }

    setRegSubmitting(true);
    try {
      await apiService.registerRequest({
        full_name: regName,
        email: regEmail,
        phone: regPhone,
        block: regBlock,
        flat_number: regFlat,
        flat_type: regFlatType,
        password: regPassword
      });

      setRegSubmitting(false);
      // Clear inputs
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegBlock('Block A');
      setRegFlat('');
      setRegFlatType('3 BHK');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegConfirmChecked(false);
      
      // Navigate to success screen
      setActiveScreen('register-success');
    } catch (err: any) {
      setRegSubmitting(false);
      const errMsg = err.response?.data?.error || err.message || 'Failed to submit registration request. Please try again.';
      setErrorMessage(errMsg);
    }
  };

  const handleUseAccount = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    setActiveScreen('login');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const rolesData = [
    {
      role: "Society Admin",
      email: "sarah.chen@societyhub.com",
      icon: "admin_panel_settings",
      desc: "Full administrative access",
      colorClass: "bg-blue-50 text-blue-700 border-blue-100",
      hoverBorder: "hover:border-blue-300 hover:shadow-blue-50/50",
      recommended: true
    },
    {
      role: "Resident",
      email: "arjun.k@example.com",
      icon: "home",
      desc: "Bills, complaints & notices",
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      hoverBorder: "hover:border-emerald-300 hover:shadow-emerald-50/50",
      recommended: false
    },
    {
      role: "Security Guard",
      email: "vikram.s@societyhub.com",
      icon: "shield",
      desc: "Visitor verification & gate access",
      colorClass: "bg-cyan-50 text-cyan-700 border-cyan-100",
      hoverBorder: "hover:border-cyan-300 hover:shadow-cyan-50/50",
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800 animate-fade-in">
      
      {/* Left Column: Premium SaaS Visual Branding, Hero, and Custom Features (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-5/12 bg-slate-950 relative p-12 flex-col justify-between overflow-hidden border-r border-slate-900 select-none">
        
        {/* Background Image with Dark Blue Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={apartmentImage}
            alt="Modern residential community"
            className="w-full h-full object-cover opacity-55 mix-blend-luminosity"
          />
          {/* Dark blue gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-950/45 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/45 via-transparent to-emerald-950/10"></div>
        </div>

        {/* Brand Logo Header */}
        <div className="relative z-10 flex items-center gap-3.5 pt-6 pl-6">
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md">
            <span className="material-symbols-outlined text-white font-bold text-[24px]">domain</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-black text-white text-xl tracking-tight leading-none">SocietyHub</h1>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                v1.0
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Smart Living Starts Here</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 my-auto space-y-6 max-w-md">
          <h2 className="font-sans font-black text-4xl xl:text-5xl text-white tracking-tight leading-[1.15]">
            Smart Residential <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Community Management
            </span>
          </h2>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              A modern, unified platform designed to streamline visitor screening, maintenance billing, and resident operations for connected communities.
            </p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest border-l-2 border-primary pl-3 py-0.5">
              Trusted by modern residential communities.
            </p>
          </div>
        </div>

        {/* Why SocietyHub Card (replaces statistics & long list) */}
        <div className="relative z-10 bg-white/[0.03] backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[18px]">verified</span>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Why SocietyHub?</h4>
          </div>
          <div className="space-y-3">
            {[
              { label: "Secure Authentication", icon: "lock" },
              { label: "Visitor Management", icon: "person_add" },
              { label: "Maintenance Billing", icon: "payments" },
              { label: "Complaint Tracking", icon: "report_problem" },
              { label: "Real-time Notices", icon: "campaign" }
            ].map((why) => (
              <div key={why.label} className="flex items-center gap-3 text-slate-300 text-xs font-semibold">
                <div className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400 text-[12px]">{why.icon}</span>
                </div>
                <span>{why.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer copyright */}
        <div className="relative z-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-4">
          © 2026 SocietyHub Technologies. Inc.
        </div>
      </div>

      {/* Right Column: Dynamic Authentication Card & Roles Deck */}
      <div className="w-full lg:w-7/12 flex flex-col justify-between p-6 md:p-12 lg:p-16 bg-slate-50 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center my-8 animate-fade-in-up">
          
          {/* Logo header for mobile/tablet view */}
          <div className="lg:hidden flex items-center gap-3.5 mb-8 justify-start">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[24px]">domain</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-extrabold text-primary text-xl leading-none">SocietyHub</h1>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/10 select-none">
                  v1.0
                </span>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-1">Smart Living Starts Here</p>
            </div>
          </div>

          {/* Form Card Container */}
          <div className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
            
            {/* Screen 1: LOGIN FORM */}
            {activeScreen === 'login' && (
              <>
                <div>
                  <h2 className="font-sans font-bold text-3xl text-slate-900 tracking-tight leading-none">Welcome back</h2>
                  <p className="text-slate-500 text-sm mt-2.5">
                    Enter your credentials to access the SocietyHub console.
                  </p>
                </div>

                {/* Custom Inline Notifications */}
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                    <div className="text-xs font-semibold text-red-700 leading-relaxed">{errorMessage}</div>
                  </div>
                )}
                {successMessage && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 shrink-0">check_circle</span>
                    <div className="text-xs font-semibold text-emerald-700 leading-relaxed">{successMessage}</div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
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
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveScreen('forgot-password');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-sm font-bold text-primary hover:underline transition-all hover:scale-[1.02] duration-200 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
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

                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer disabled:opacity-80"
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

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('register');
                        setErrorMessage(null);
                        setRegMessage(null);
                      }}
                      className="w-full h-12 bg-transparent text-primary hover:bg-slate-50 hover:text-primary/90 font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Request Resident Account
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Screen 2: FORGOT PASSWORD FORM */}
            {activeScreen === 'forgot-password' && (
              <>
                <div>
                  <h2 className="font-sans font-bold text-3xl text-slate-900 tracking-tight leading-none">Reset Password</h2>
                  <p className="text-slate-500 text-sm mt-2.5">
                    We'll send you instructions on how to reset your password.
                  </p>
                </div>

                {/* Custom Inline Notifications */}
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                    <div className="text-xs font-semibold text-red-700 leading-relaxed">{errorMessage}</div>
                  </div>
                )}
                {successMessage && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 shrink-0">check_circle</span>
                    <div className="text-xs font-semibold text-emerald-700 leading-relaxed">{successMessage}</div>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                      <span className="material-symbols-outlined text-slate-400 text-[20px] select-none shrink-0">mail</span>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g., resident@societyhub.com"
                        className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full ml-3 py-3.5 outline-none text-slate-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer disabled:opacity-80 pt-1"
                  >
                    {forgotSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Sending instructions...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('login');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-primary transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Screen 3: REQUEST RESIDENT ACCOUNT FORM */}
            {activeScreen === 'register' && (
              <>
                <div>
                  <h2 className="font-sans font-bold text-3xl text-slate-900 tracking-tight leading-none">Request Account</h2>
                  <p className="text-slate-500 text-sm mt-2.5">
                    Submit your details to request access to the resident portal.
                  </p>
                </div>

                {/* Custom Inline Notifications */}
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                    <div className="text-xs font-semibold text-red-700 leading-relaxed">{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">person</span>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="John Doe"
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">mail</span>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Mobile Number
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">phone</span>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="9876543210"
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Society Block
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">domain</span>
                        <select
                          value={regBlock}
                          onChange={(e) => setRegBlock(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700 cursor-pointer"
                        >
                          <option value="Block A">Block A</option>
                          <option value="Block B">Block B</option>
                          <option value="Block C">Block C</option>
                          <option value="Block D">Block D</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Flat Number
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">door_front</span>
                        <input
                          type="text"
                          required
                          value={regFlat}
                          onChange={(e) => setRegFlat(e.target.value)}
                          placeholder="A-302"
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Flat Type
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">tag</span>
                        <select
                          value={regFlatType}
                          onChange={(e) => setRegFlatType(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700 cursor-pointer"
                        >
                          <option value="1 BHK">1 BHK</option>
                          <option value="2 BHK">2 BHK</option>
                          <option value="3 BHK">3 BHK</option>
                          <option value="Villa">Villa</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Upload ID Proof (Optional Placeholder)
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">upload_file</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-2 outline-none text-slate-500 file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Create Password
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">lock</span>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] select-none shrink-0">lock_reset</span>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-transparent border-none focus:ring-0 text-xs font-semibold w-full ml-2 py-3 outline-none text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1.5">
                    <input
                      type="checkbox"
                      id="confirm-resident"
                      checked={regConfirmChecked}
                      onChange={(e) => setRegConfirmChecked(e.target.checked)}
                      className="w-4.5 h-4.5 text-primary bg-white rounded-lg focus:ring-primary cursor-pointer border border-slate-300 transition-colors"
                    />
                    <label htmlFor="confirm-resident" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                      I confirm that I am a resident of this society.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer pt-1 disabled:opacity-80"
                  >
                    {regSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Submitting Request...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>

                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('login');
                        setErrorMessage(null);
                        setRegMessage(null);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-primary transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Back to Login
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Screen 4: REGISTRATION REQUEST SUBMITTED SUCCESS CARD */}
            {activeScreen === 'register-success' && (
              <div className="text-center space-y-6 py-4 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-emerald-500 text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h2 className="font-sans font-bold text-2xl text-slate-900 tracking-tight leading-none">
                    Registration Request Submitted
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto font-medium">
                    Your registration request has been submitted successfully. The Society Administrator will verify your information. You will receive access once your account has been approved.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScreen('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer mx-auto"
                  >
                    <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                    Return to Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Premium Roles Deck Cards Section */}
          <div className="mt-12 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-[1px] bg-slate-200 flex-1"></div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider select-none">Demo Access Portals</span>
              <div className="h-[1px] bg-slate-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rolesData.map((roleObj) => (
                <div
                  key={roleObj.role}
                  className={`bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${roleObj.hoverBorder} relative`}
                >
                  {roleObj.recommended && (
                    <span className="absolute top-[-9px] right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm select-none tracking-wider border border-blue-500/10">
                      Recommended
                    </span>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${roleObj.colorClass} select-none`}>
                        {roleObj.role}
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-[18px] select-none">
                        {roleObj.icon}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-medium">
                      {roleObj.desc}
                    </p>
                    <div className="pt-1">
                      <p className="text-xs font-bold text-slate-700 select-all leading-snug break-all">
                        {roleObj.email}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 select-none">
                        Password: <code className="bg-slate-50 px-1 py-0.5 rounded text-slate-600 font-mono text-[9px]">password123</code>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUseAccount(roleObj.email)}
                    className="w-full mt-4 py-2 bg-slate-50 hover:bg-primary hover:text-white border border-slate-100 hover:border-primary rounded-xl text-[10px] font-bold text-slate-600 transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer hover:shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[12px] font-bold">bolt</span>
                    Use Account
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
