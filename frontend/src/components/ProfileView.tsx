import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  KeyRound, 
  Bell, 
  Settings, 
  Lock, 
  HelpCircle, 
  Building,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Clock,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService } from '../services/api';

interface ProfileViewProps {
  portal: 'admin' | 'resident' | 'security';
  currentUser: {
    user_id?: number;
    name: string;
    role: string;
    email: string;
    phone: string;
    department?: string;
    twoFactor?: boolean;
    alerts?: Record<string, boolean>;
    preferences?: {
      language?: string;
      sessionTimeout?: string;
      backupInterval?: string;
    };
    privacy?: {
      locationConsent?: boolean;
      directoryConsent?: boolean;
      cameraConsent?: boolean;
    };
  };
  onUpdateUser: (updatedUser: any) => void;
}

export default function ProfileView({
  portal,
  currentUser,
  onUpdateUser
}: ProfileViewProps) {
  // Active Local Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'support'>('profile');

  // Form State - Personal & Contact Information
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [department, setDepartment] = useState(currentUser.department || 'Operations & Management');

  // Form State - Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactor || false);

  // Form State - Privacy & Permissions
  const [locationConsent, setLocationConsent] = useState(currentUser.privacy?.locationConsent ?? true);
  const [directoryConsent, setDirectoryConsent] = useState(currentUser.privacy?.directoryConsent ?? false);
  const [cameraConsent, setCameraConsent] = useState(currentUser.privacy?.cameraConsent ?? true);

  // Form State - Notification Preferences
  const [alerts, setAlerts] = useState({
    complaints: currentUser.alerts?.complaints ?? true,
    ledger: currentUser.alerts?.ledger ?? false,
    gate: currentUser.alerts?.gate ?? true,
    notices: currentUser.alerts?.notices ?? true,
  });

  // Form State - Account Preferences
  const [language, setLanguage] = useState(currentUser.preferences?.language || 'English');
  const [sessionTimeout, setSessionTimeout] = useState(currentUser.preferences?.sessionTimeout || '30 mins');
  const [backupInterval, setBackupInterval] = useState(currentUser.preferences?.backupInterval || 'Daily');

  // FAQ Accordion States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Save Handlers with Success State Feedbacks
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const triggerFeedback = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.user_id) {
      alert('Error: User context is missing user ID.');
      return;
    }
    try {
      const res = await apiService.updateProfile({
        user_id: currentUser.user_id,
        name,
        email,
        phone
      });
      onUpdateUser({
        name,
        email,
        phone,
        department
      });
      // Synchronize local storage to persist the changed values across refresh
      const stored = localStorage.getItem('sh_user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('sh_user', JSON.stringify({ ...u, name, email, phone }));
      }
      triggerFeedback(res.message || 'Personal and contact information updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.user_id) {
      alert('Error: User context is missing user ID.');
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Error: New Password and Confirm Password do not match!');
      return;
    }
    try {
      const res = await apiService.changePassword({
        user_id: currentUser.user_id,
        current_password: currentPassword,
        new_password: newPassword
      });
      triggerFeedback(res.message || 'Security password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to change password.');
    }
  };

  const handleToggleAlert = (key: keyof typeof alerts) => {
    const updatedAlerts = { ...alerts, [key]: !alerts[key] };
    setAlerts(updatedAlerts);
    onUpdateUser({ alerts: updatedAlerts });
  };

  const handleSavePreferences = () => {
    onUpdateUser({
      preferences: {
        language,
        sessionTimeout,
        backupInterval
      }
    });
    triggerFeedback('Account preferences saved successfully!');
  };

  const handleSavePrivacy = () => {
    onUpdateUser({
      privacy: {
        locationConsent,
        directoryConsent,
        cameraConsent
      }
    });
    triggerFeedback('Privacy & permissions recorded successfully!');
  };

  const handleToggle2FA = () => {
    const updated2FA = !twoFactor;
    setTwoFactor(updated2FA);
    onUpdateUser({ twoFactor: updated2FA });
    triggerFeedback(`Two-Factor Authentication is now ${updated2FA ? 'ENABLED' : 'DISABLED'}.`);
  };

  // Static Details for Resident
  const residentAptDetails = {
    unit: 'Flat A-402',
    occupancy: 'Owner Occupied',
    maintenancePlan: 'Standard Residential Tier-1',
    intercomExt: 'Ext #4021',
    allocatedParking: 'Slot #A-402, Basement 1'
  };

  // Static FAQs
  const faqs = [
    {
      q: 'How do I raise a Maintenance Ticket or Complaint?',
      a: 'Go to the Helpdesk & Complaints tab in your sidebar menu, click "Raise Complaint Ticket", select the appropriate category (Plumbing, Electrical, Sanitation) and priority, then describe the issue. Our technicians will be dispatched promptly.'
    },
    {
      q: 'How do I pre-authorize guests and delivery agents?',
      a: 'Residents can pre-clear visitors from the Guest Pre-Clearance screen. Clicking "Pre-Approve Visitor" generates an authorized gate entry pass which allows the security guards at Gate 1 to check them in seamlessly without unnecessary delays.'
    },
    {
      q: 'Where do I find my current maintenance dues?',
      a: 'Maintenance dues and invoices are hosted under the Maintenance Bills section. You can view payment receipts, pending ledgers, and pay dues online using our simulated sandbox payment gateway.'
    },
    {
      q: 'How do I enable Emergency push alerts?',
      a: 'Under the System Preferences sub-tab of this settings panel, toggle "Official Notices" and "System Alerts". Security-related crisis notifications will instantly sound or flash on your main dashboard workspace.'
    }
  ];

  const portalBadgeLabel = () => {
    switch (portal) {
      case 'resident': return 'Resident Account';
      case 'security': return 'Security Officer Station';
      case 'admin': return 'System Administrator';
    }
  };

  const portalThemeBg = () => {
    switch (portal) {
      case 'resident': return 'bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/20';
      case 'security': return 'bg-[#0F172A]/10 text-[#0F172A] border-[#0F172A]/20';
      case 'admin': return 'bg-[#123B66]/10 text-[#123B66] border-[#123B66]/20';
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <section className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">Account & Settings</h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${portalThemeBg()}`}>
              {portalBadgeLabel()}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            Manage personal credentials, review role clearance, update notifications, configure privacy parameters, and get direct help.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </section>

      {/* 2. Unified Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Side Settings Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile' as const, label: 'Profile & Contact', icon: User, desc: 'Personal details & role' },
            { id: 'security' as const, label: 'Password & Security', icon: Shield, desc: 'Credentials & privacy' },
            { id: 'preferences' as const, label: 'System Preferences', icon: Settings, desc: 'Alerts & configurations' },
            { id: 'support' as const, label: 'Help & Support', icon: HelpCircle, desc: 'FAQ & emergency desk' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border cursor-pointer transition-all duration-150 ${
                  isActive 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider leading-none">{tab.label}</h4>
                  <p className={`text-[10px] mt-1 font-medium ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Tab View Panels */}
        <div className="lg:col-span-3">
          
          {/* ================= PANEL A: PROFILE & CONTACT ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              {/* Profile Card */}
              <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                    <User className="w-5 h-5 text-slate-400" />
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Official identification parameters on the SocietyHub registry.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                      Portal Assignment
                    </label>
                    <input
                      type="text"
                      disabled
                      value={portal === 'admin' ? 'Administrator Account' : portal === 'resident' ? 'Resident Member' : 'Security Guard Staff'}
                      className="w-full h-11 bg-slate-50 border border-slate-200/60 rounded-xl px-4 text-sm font-semibold text-slate-400 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-sans font-bold text-sm text-slate-800 flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Contact Parameters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                        Mobile Telephone
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Role & Administration Clearance */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-5">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-slate-400" />
                    Role & Operations Clearance
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Credentials, duty clearance and infrastructure groups assigned by system admin.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Role</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">{currentUser.role}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security clearance</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">
                      {portal === 'admin' ? 'Level 5 (Super Admin)' : portal === 'security' ? 'Level 3 (Gate Post CSO)' : 'Level 1 (Resident)'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Area</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">
                      {portal === 'admin' ? 'Full Cluster Hub' : portal === 'security' ? 'Sector 1 Gate Lobby' : 'Residential Block A & B'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resident Only: Apartment Details */}
              {portal === 'resident' && (
                <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-5">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-[#0F766E] flex items-center gap-2.5">
                      <Building className="w-5 h-5" />
                      Apartment Details
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Assigned residential asset specifications on the SocietyHub register.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold text-slate-700 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="space-y-3.5 pr-0 md:pr-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Assigned Unit</span>
                        <span className="text-slate-850 font-bold font-mono">{residentAptDetails.unit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Occupancy Status</span>
                        <span className="text-[#0F766E] font-bold bg-[#0F766E]/5 px-2.5 py-0.5 rounded-full text-xs">
                          {residentAptDetails.occupancy}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3.5 pt-3.5 md:pt-0 pl-0 md:pl-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Intercom Extension</span>
                        <span className="font-mono font-bold text-slate-800">{residentAptDetails.intercomExt}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Allocated Parking</span>
                        <span className="text-slate-800 font-mono font-bold">{residentAptDetails.allocatedParking}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= PANEL B: SECURITY & PRIVACY ================= */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in">
              {/* Change Password */}
              <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                      <KeyRound className="w-5 h-5 text-slate-400" />
                      Password Reset
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Change your portal login authentication password credentials.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer select-none"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showPass ? 'Hide passwords' : 'Show passwords'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                      Current Password
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                      New Password
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-slate-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* 2FA Card */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                      <Lock className="w-5 h-5 text-slate-400" />
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Authenticate login sessions with a secondary security token passcode.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={handleToggle2FA}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  By enabling this security policy, you will be required to input a transient six-digit verification code sent to your authenticated mobile or authenticator app upon subsequent login sessions. Keeps the digital registry certified.
                </p>
              </div>

              {/* Privacy & Permissions Panel */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-slate-400" />
                    Privacy & Information Consent
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Govern visibility and accessibility parameters of your tenant record in the cluster.</p>
                </div>

                <div className="space-y-5 divide-y divide-slate-100">
                  <div className="flex items-start justify-between gap-6 pt-1">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Cluster Location Consent</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Allow automatic check-in proximity triggers when passing gate antennas.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={locationConsent}
                        onChange={() => setLocationConsent(!locationConsent)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-6 pt-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Public Directory Visibility</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Let other society members look up your unit intercom extension or contact card.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={directoryConsent}
                        onChange={() => setDirectoryConsent(!directoryConsent)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-6 pt-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Security Camera Logs Access</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Permit CCTV entry/exit visual logs generation for guests visiting your flat.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={cameraConsent}
                        onChange={() => setCameraConsent(!cameraConsent)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSavePrivacy}
                    className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
                  >
                    Save Privacy Consent
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= PANEL C: PREFERENCES ================= */}
          {activeTab === 'preferences' && (
            <div className="space-y-8 animate-fade-in">
              {/* Notification Preferences */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                    <Bell className="w-5 h-5 text-slate-400" />
                    Notification Dispatch Rules
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Define which automated alerts trigger instant mobile SMS or email push alerts.</p>
                </div>

                <div className="space-y-5 divide-y divide-slate-100">
                  <div className="flex items-start justify-between gap-6 pt-1">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Helpdesk Ticket Alerts</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Send real-time updates when a complaint status progresses or a technician is dispatched.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={alerts.complaints}
                        onChange={() => handleToggleAlert('complaints')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-6 pt-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Financial Billing & Receipts Digest</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Email pending maintenance balances, invoice records, and verified transaction receipts.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={alerts.ledger}
                        onChange={() => handleToggleAlert('ledger')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-6 pt-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Gate Entry Clearance Notifications</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Deliver quick push sound alerts when delivery staff or guests pass your block barrier check.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={alerts.gate}
                        onChange={() => handleToggleAlert('gate')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-6 pt-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Official Board Announcements</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Send broadcasts for official society notices, meeting invites, and policy adjustments.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                      <input
                        type="checkbox"
                        checked={alerts.notices}
                        onChange={() => handleToggleAlert('notices')}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-slate-950"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Account General Preferences */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Account Preferences
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Customize regional system configurations, locale metrics, and backup rules.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-450" /> System Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option value="English">English (US/UK)</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                      <option value="Marathi">मराठी (Marathi)</option>
                      <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-450" /> Portal Auto-Logout
                    </label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option value="15 mins">15 mins of Inactivity</option>
                      <option value="30 mins">30 mins of Inactivity</option>
                      <option value="1 hour">1 hour of Inactivity</option>
                      <option value="Never">Never (Persistent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-450" /> Data Backup Interval
                    </label>
                    <select
                      value={backupInterval}
                      onChange={(e) => setBackupInterval(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option value="Daily">Daily Automated</option>
                      <option value="Weekly">Weekly Digest</option>
                      <option value="Monthly">Monthly Snapshot</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={handleSavePreferences}
                    className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= PANEL D: HELP & SUPPORT ================= */}
          {activeTab === 'support' && (
            <div className="space-y-8 animate-fade-in">
              {/* Emergency Hotline & Desk */}
              <div className="bg-[#FEF2F2] border border-red-200/60 p-8 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center border border-red-200 shrink-0">
                    <Shield className="w-5 h-5 text-red-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-base text-red-900">Emergency Operations Hotline</h3>
                    <p className="text-xs text-red-700/80 font-semibold mt-0.5">Immediate security dispatch and crisis intervention service.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold pt-2">
                  <div className="bg-white border border-red-200 p-4 rounded-xl shadow-2xs">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Gate 1 Command Post</p>
                    <p className="text-lg font-black text-red-800 font-mono mt-1">+91 22 6804 9221</p>
                    <p className="text-[10px] text-slate-500 mt-1">Intercom dialer extension: dial #1001</p>
                  </div>
                  <div className="bg-white border border-red-200 p-4 rounded-xl shadow-2xs">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Admin Support Center</p>
                    <p className="text-lg font-black text-slate-800 font-mono mt-1">help@societyhub.com</p>
                    <p className="text-[10px] text-slate-500 mt-1">Operational desk open: 24 Hours / 7 Days</p>
                  </div>
                </div>
              </div>

              {/* Help & Support FAQ Accordion */}
              <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2.5">
                    <HelpCircle className="w-5 h-5 text-slate-400" />
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Quick operational manual & solution references for the society portals.</p>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="border border-slate-200/60 rounded-xl overflow-hidden transition-all duration-150">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 text-left font-bold text-xs text-slate-800 outline-none cursor-pointer select-none"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-white text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-150 animate-fade-in">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
