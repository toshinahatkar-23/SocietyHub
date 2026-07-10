import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Visitor, VisitorPurpose } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileView from './ProfileView';
import { X, LogOut, UserCheck, Shield, Radio, Laptop, AlertOctagon, PhoneCall } from 'lucide-react';

interface SecurityPortalProps {
  currentUser: any;
  onLogout: () => void;
  visitors: Visitor[];
  onAddVisitor: (visitor: any) => void;
  onUpdateVisitor: (id: string, updatedFields: Partial<Visitor>) => void;
  onUpdateProfile: (updatedFields: any) => void;
}

interface EmergencyAlert {
  id: string;
  category: 'Fire' | 'Medical' | 'Intruder' | 'Water Spill' | 'Elevator Stuck' | 'Other';
  location: string;
  severity: 'Critical' | 'High' | 'Medium';
  description: string;
  reportedAt: string;
  status: 'Active' | 'Investigating' | 'Resolved';
}

export default function SecurityPortal({
  currentUser,
  onLogout,
  visitors,
  onAddVisitor,
  onUpdateVisitor,
  onUpdateProfile
}: SecurityPortalProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Route helper
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.includes('/visitors')) return 'visitor-log';
    if (path.includes('/gate-entry')) return 'gate-entry';
    if (path.includes('/gate-exit')) return 'gate-exit';
    if (path.includes('/emergency')) return 'emergency';
    if (path.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  // Shared mock notifications and alerts
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([
    {
      id: 'ALT-401',
      category: 'Fire',
      location: 'Block B - 3rd floor electrical shaft',
      severity: 'Critical',
      description: 'Minor sparks seen in the primary power box. Fire extinguishers placed on standby.',
      reportedAt: '12 mins ago',
      status: 'Investigating'
    },
    {
      id: 'ALT-398',
      category: 'Water Spill',
      location: 'Clubhouse Entrance Area',
      severity: 'Medium',
      description: 'Main sprinkler pipeline leaking water in the walkway, creating a slippery floor surface.',
      reportedAt: '1 hour ago',
      status: 'Active'
    },
    {
      id: 'ALT-392',
      category: 'Elevator Stuck',
      location: 'Block C - Elevator No. 1',
      severity: 'High',
      description: 'Elevator paused briefly between 5th and 6th floor. Technical repair contractor notified.',
      reportedAt: 'Yesterday',
      status: 'Resolved'
    }
  ]);

  // Visitor state helpers
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<VisitorPurpose | 'All'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Gate entry form state
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visPurpose, setVisPurpose] = useState<VisitorPurpose>('Guest');
  const [visFlat, setVisFlat] = useState('');
  const [visTag, setVisTag] = useState('');
  const [idVerified, setIdVerified] = useState(false);

  // Gate exit lookup input
  const [exitSearchPhone, setExitSearchPhone] = useState('');

  // Emergency Alert Form state
  const [emgCategory, setEmgCategory] = useState<'Fire' | 'Medical' | 'Intruder' | 'Water Spill' | 'Elevator Stuck' | 'Other'>('Fire');
  const [emgLocation, setEmgLocation] = useState('');
  const [emgSeverity, setEmgSeverity] = useState<'Critical' | 'High' | 'Medium'>('High');
  const [emgDesc, setEmgDesc] = useState('');
  const [showEmgModal, setShowEmgModal] = useState(false);

  // Handover state
  const [handoverName, setHandoverName] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverCheck, setHandoverCheck] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Statistics calculation
  const totalVisitorsToday = visitors.length;
  const currentlyInsideCount = visitors.filter(v => v.exitTime === null).length;
  const pendingExitCount = visitors.filter(v => v.exitTime === null && v.purpose !== 'Guest').length;
  
  // Requirement: emergency banner only shown when there is an active emergency (status === 'Active')
  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const activeAlertCount = activeAlerts.length;

  // Handlers
  const handleAddVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName || !visPhone || !visFlat) {
      alert('Please fill out all mandatory fields for gate entry.');
      return;
    }
    if (!idVerified) {
      alert('You must verify the visitor ID document prior to authorization.');
      return;
    }

    const now = new Date();
    const entryTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onAddVisitor({
      name: visName,
      phone: visPhone,
      purpose: visPurpose,
      flat: visFlat,
      entryTime: entryTimeStr,
      exitTime: null,
      isVerified: true,
      tagline: visTag || 'ID Verified Gate Entry'
    });

    setVisName('');
    setVisPhone('');
    setVisPurpose('Guest');
    setVisFlat('');
    setVisTag('');
    setIdVerified(false);
    triggerToast(`Gate cleared! Visitor "${visName}" is permitted inside.`);
    navigate('/security/visitors');
  };

  const handleMarkExit = (id: string, name: string) => {
    const now = new Date();
    const exitTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onUpdateVisitor(id, { exitTime: exitTimeStr, tagline: 'Exit Marked at Gate' });
    triggerToast(`Exit recorded! "${name}" cleared from premises.`);
  };

  const handleRaiseEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emgLocation || !emgDesc) {
      alert('Please fill out emergency location and detailed description.');
      return;
    }

    const newAlert: EmergencyAlert = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      category: emgCategory,
      location: emgLocation,
      severity: emgSeverity,
      description: emgDesc,
      reportedAt: 'Just now',
      status: 'Active'
    };

    setAlerts([newAlert, ...alerts]);
    setEmgLocation('');
    setEmgDesc('');
    setShowEmgModal(false);
    triggerToast('CRITICAL EMERGENCY BROADCAST DISPATCHED TO ADMIN PORTALS!');
  };

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverName || !handoverCheck) {
      alert('Please verify handover checklists and provide incoming supervisor name.');
      return;
    }

    setShowHandoverModal(false);
    setHandoverName('');
    setHandoverNotes('');
    setHandoverCheck(false);
    triggerToast('Shift handover successfully submitted and logged in facility records.');
  };

  // Nav menu
  const menuItems = [
    { name: 'dashboard', label: 'Security Overview', icon: 'dashboard', path: '/security/dashboard' },
    { name: 'visitor-log', label: 'Visitor Register', icon: 'receipt_long', path: '/security/visitors' },
    { name: 'gate-entry', label: 'Gate Entry Clearance', icon: 'login', path: '/security/gate-entry' },
    { name: 'gate-exit', label: 'Gate Exit Clearance', icon: 'logout', path: '/security/gate-exit' },
    { name: 'emergency', label: 'Crisis & Emergencies', icon: 'campaign', path: '/security/emergency' },
    { name: 'profile', label: 'Officer Station Profile', icon: 'shield_person', path: '/security/profile' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row relative font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Alert Success notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined font-bold text-emerald-400 text-[20px]">check_circle</span>
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <Sidebar
        portal="security"
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'dashboard') navigate('/security/dashboard');
          else if (tab === 'visitor-log') navigate('/security/visitors');
          else navigate(`/security/${tab}`);
        }}
        onLogout={onLogout}
        userName={currentUser.name || 'Officer Rajesh Kumar'}
        userRole="Security Staff"
      />

      {/* MOBILE DRAWER SCREEN */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#0B132B]/40 backdrop-blur-sm z-50 flex" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-[290px] bg-[#0B132B] text-slate-100 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950 font-black text-sm">
                  SH
                </div>
                <div>
                  <h1 className="font-sans font-bold text-white text-base">SocietyHub</h1>
                  <p className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">Security Staff</p>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {[
                { name: 'dashboard', label: 'Security Dashboard' },
                { name: 'visitor-log', label: 'Visitor Register' },
                { name: 'gate-entry', label: 'Gate Entry Clearance' },
                { name: 'gate-exit', label: 'Gate Exit Clearance' },
                { name: 'emergency', label: 'Crisis & Emergencies' },
                { name: 'profile', label: 'Officer Station Profile' }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === 'dashboard') navigate('/security/dashboard');
                    else if (item.name === 'visitor-log') navigate('/security/visitors');
                    else navigate(`/security/${item.name}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-semibold ${
                    activeTab === item.name ? 'bg-white/10 text-sky-400 border-l-4 border-sky-400' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="text-[14px]">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="border-t border-white/10 pt-4 space-y-1">
              <button 
                onClick={onLogout} 
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 font-bold text-left"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span className="text-[14px]">Logout Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* COMPACT ENTERPRISE HEADER */}
        <Header
          portal="security"
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userName={currentUser.name || 'Officer Rajesh Kumar'}
          userRole="Security Staff"
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* WORKSPACE PORT */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 max-w-[1300px] mx-auto w-full space-y-6">
          
          {/* ==================== 1. SECURITY DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in" id="dashboard-view">
              
              {/* MICROSOFT DEFENDER STYLE STATUS BANNER */}
              {activeAlertCount > 0 ? (
                /* RED WARNING ALERT - Displays ONLY if active emergencies exist */
                <div className="bg-red-50/80 border border-red-200 text-red-900 p-5 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-600 font-bold text-2xl shrink-0 mt-0.5">report_problem</span>
                    <div>
                      <h3 className="text-sm font-extrabold text-red-800 tracking-tight">Active emergency alerts logged ({activeAlertCount})</h3>
                      <p className="text-xs text-red-600 font-semibold mt-1 leading-normal">
                        At least one safety emergency is marked Active or requires immediate on-site verification. Inspect the emergency logs immediately.
                      </p>
                      
                      {/* Interactive inline quick summary inside the alert box */}
                      <div className="mt-3 space-y-1.5">
                        {activeAlerts.map(a => (
                          <div key={a.id} className="text-[11px] font-bold text-red-900/90 flex items-center gap-2 bg-white/50 border border-red-100 px-2 py-1 rounded max-w-xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                            <span>{a.id}: {a.category} • Location: {a.location}</span>
                            <button 
                              onClick={() => {
                                setAlerts(alerts.map(item => item.id === a.id ? { ...item, status: 'Resolved' } : item));
                                triggerToast(`Dispatched: Emergency ${a.id} marked Resolved!`);
                              }}
                              className="ml-auto text-[9px] font-extrabold text-red-700 hover:underline cursor-pointer bg-red-100 hover:bg-red-200 px-1.5 py-0.5 rounded"
                            >
                              Acknowledge Resolved
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/security/emergency')} 
                    className="h-8.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs transition-all cursor-pointer shadow-xs uppercase tracking-wide shrink-0 self-start md:self-center"
                  >
                    View Alert Center
                  </button>
                </div>
              ) : (
                /* GREEN SECURE STATE - Displays if ZERO active alerts are present */
                <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-900 p-5 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 font-bold text-2xl shrink-0">verified_user</span>
                    <div>
                      <h3 className="text-sm font-extrabold text-emerald-800 tracking-tight">Post status: Secure & Healthy</h3>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                        No active safety emergencies logged across residential blocks. Surveillance is normal, and all check-in logs are consistent.
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-100/60 border border-emerald-200/50 px-2.5 py-1 rounded">
                    SECURITY STATUS: MAXIMUM SAFE
                  </div>
                </div>
              )}

              {/* OVERVIEW METRIC TILES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Metric 1 */}
                <div className="bg-white border border-slate-200/80 p-4.5 rounded-lg flex items-center justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logged Arrivals</span>
                    <h4 className="text-2xl font-black font-mono text-slate-800 tracking-tight">{totalVisitorsToday}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold block">Total passes today</span>
                  </div>
                  <div className="w-10 h-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-[20px]">transfer_within_a_station</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white border border-slate-200/80 p-4.5 rounded-lg flex items-center justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Personnel Inside</span>
                    <h4 className="text-2xl font-black font-mono text-slate-800 tracking-tight">{currentlyInsideCount}</h4>
                    <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                      On-site currently
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-100/40 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-[20px]">person_pin</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white border border-slate-200/80 p-4.5 rounded-lg flex items-center justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Awaiting Checkouts</span>
                    <h4 className={`text-2xl font-black font-mono tracking-tight ${pendingExitCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {pendingExitCount}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold block">Delivery & worker count</span>
                  </div>
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${pendingExitCount > 0 ? 'bg-amber-50 border border-amber-100/40 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                </div>
              </div>

              {/* DUAL WORKSPACE LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Security Controls Center - Improved Quick Actions */}
                <div className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-4 lg:col-span-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans font-extrabold text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      Security Operations Panel
                    </h3>
                    
                    <div className="space-y-2 mt-4">
                      {/* Action 1 */}
                      <button
                        onClick={() => navigate('/security/gate-entry')}
                        className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-sky-50 flex items-center justify-center text-sky-700 group-hover:bg-sky-500 group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold text-slate-800">Check-In Visitor</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Clear gate entrance ID passes</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-slate-500 transition-all">chevron_right</span>
                      </button>

                      {/* Action 2 */}
                      <button
                        onClick={() => navigate('/security/gate-exit')}
                        className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold text-slate-800">Clear Outgoing Guest</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Log physical exit logs</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-slate-500 transition-all">chevron_right</span>
                      </button>

                      {/* Action 3 */}
                      <button
                        onClick={() => setShowEmgModal(true)}
                        className="w-full flex items-center justify-between p-3 border border-red-50 hover:bg-red-50/40 rounded-lg text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[18px]">emergency_home</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold text-red-700">Dispatch Emergency Alarm</p>
                            <p className="text-[10px] text-red-500/80 font-semibold mt-0.5">Broadcast active emergency</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-red-300 group-hover:text-red-500 transition-all">chevron_right</span>
                      </button>

                      {/* Action 4 */}
                      <button
                        onClick={() => setShowHandoverModal(true)}
                        className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold text-slate-800">Shift Handover Register</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Submit duty handoff parameters</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-slate-500 transition-all">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-bold font-mono tracking-wide uppercase">SECURITY DESK REGISTER // ACTIVE STATION 1</span>
                  </div>
                </div>

                {/* Shift Details & Equipment Check */}
                <div className="bg-white border border-slate-200/80 rounded-lg p-5 lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="font-sans font-extrabold text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        Active Security Shift Details
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200/60 text-emerald-800 text-[9px] font-bold uppercase rounded font-mono">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs font-semibold text-slate-500">
                      <div className="space-y-3.5">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Duty Security Officer</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">Officer Rajesh Kumar</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Station Desk: Main Lobby Gate 1 Post</p>
                        </div>
                        
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Verified Equipment Checklist</p>
                          <p className="text-[11px] text-slate-700 font-bold font-mono">Walkie-Talkie & Flashlight: Functional (Checked)</p>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Active Shift Hours</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">08:00 AM - 08:00 PM (12hr Day Shift)</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Relief Officer: Officer Amit Sharma</p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Emergency Escalation Desk</p>
                          <p className="text-[11px] text-slate-700 font-bold">Chief Supervisor Sarah Jenkins (Ext 99)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg text-center mt-5">
                    <p className="text-[11px] text-slate-500 font-bold flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-red-500">call</span>
                      Incident Emergency Intercom Hotline: <code className="bg-white px-2 py-0.5 rounded text-red-600 border border-slate-200 font-mono text-[11px] font-black">#911</code>
                    </p>
                  </div>
                </div>

              </div>

              {/* On-site active visitors table */}
              <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/60 border-b border-slate-200/80 flex justify-between items-center">
                  <h3 className="font-extrabold text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">person_search</span>
                    Live Visitor Logs (On Premises)
                  </h3>
                  <button onClick={() => navigate('/security/visitors')} className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer">
                    View Complete Registers
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/20 border-b border-slate-200/60 h-10">
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visitor name</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entry Time</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Handoff action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[12px] font-semibold text-slate-700">
                      {visitors.filter(v => v.exitTime === null).length > 0 ? (
                        visitors.filter(v => v.exitTime === null).slice(0, 5).map((vis) => (
                          <tr key={vis.id} className="hover:bg-slate-50/40 transition-colors h-13">
                            <td className="px-5 font-bold text-slate-900 flex items-center gap-2 h-13">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center">
                                {vis.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {vis.name}
                            </td>
                            <td className="px-5 text-slate-400 font-mono font-medium">{vis.phone}</td>
                            <td className="px-5">
                              <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200/40 px-1.5 py-0.5 rounded font-mono text-[11px]">
                                APT {vis.flat}
                              </span>
                            </td>
                            <td className="px-5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                                vis.purpose === 'Delivery' ? 'bg-blue-50 text-blue-700 border-blue-100/60' :
                                vis.purpose === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100/60' :
                                vis.purpose === 'Service' ? 'bg-purple-50 text-purple-700 border-purple-100/60' : 'bg-slate-50 text-slate-600 border-slate-200/60'
                              }`}>
                                {vis.purpose}
                              </span>
                            </td>
                            <td className="px-5 text-slate-500 font-mono">{vis.entryTime}</td>
                            <td className="px-5 text-right">
                              <button
                                onClick={() => handleMarkExit(vis.id, vis.name)}
                                className="h-7 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase rounded transition-all cursor-pointer tracking-wider"
                              >
                                Clear Exit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-[11px] font-bold text-slate-400 bg-slate-50/10">
                            Entire society boundary is clear. Zero on-premises visitors registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 2. VISITOR LOG VIEW ==================== */}
          {activeTab === 'visitor-log' && (
            <div className="space-y-6 animate-fade-in" id="visitors-view">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Permanent Visitor Register</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Search and audit historical security logs of verified entries, deliveries, and guest departures.
                  </p>
                </div>
                
                {/* Search & register actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex items-center bg-white border border-slate-200 rounded px-3.5 focus-within:ring-2 focus-within:ring-slate-900/5 focus-within:border-slate-400 transition-all">
                    <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0 select-none">search</span>
                    <input
                      type="text"
                      placeholder="Search name, phone, flat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none text-[11px] font-semibold w-44 py-2 outline-none focus:ring-0 ml-1 text-slate-700"
                    />
                  </div>

                  <button 
                    onClick={() => navigate('/security/gate-entry')} 
                    className="h-8.5 px-4 bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer rounded flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Check-In Pass
                  </button>
                </div>
              </div>

              {/* Purpose Filter Header Tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded max-w-lg overflow-x-auto">
                {['All', 'Guest', 'Delivery', 'Service', 'Maintenance'].map((prp) => {
                  const isActive = purposeFilter === prp;
                  return (
                    <button
                      key={prp}
                      onClick={() => setPurposeFilter(prp as any)}
                      className={`flex-1 h-7.5 px-3 text-[10px] font-bold rounded transition-all cursor-pointer uppercase tracking-wider ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {prp === 'All' ? 'All Logs' : prp}
                    </button>
                  );
                })}
              </div>

              {/* High density complete table */}
              <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200/60 h-10">
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visitor name</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flat target</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-In</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-Out</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Identity Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[12px] font-semibold text-slate-700">
                      {visitors
                        .filter(v => purposeFilter === 'All' || v.purpose === purposeFilter)
                        .filter(v => {
                          const query = searchQuery.toLowerCase();
                          return v.name.toLowerCase().includes(query) || v.phone.includes(query) || v.flat.toLowerCase().includes(query);
                        })
                        .length > 0 ? (
                          visitors
                            .filter(v => purposeFilter === 'All' || v.purpose === purposeFilter)
                            .filter(v => {
                              const query = searchQuery.toLowerCase();
                              return v.name.toLowerCase().includes(query) || v.phone.includes(query) || v.flat.toLowerCase().includes(query);
                            })
                            .map((vis) => (
                              <tr key={vis.id} className="hover:bg-slate-50/30 transition-colors h-13">
                                <td className="px-5 font-bold text-slate-900">{vis.name}</td>
                                <td className="px-5 text-slate-500 font-mono font-medium">{vis.phone}</td>
                                <td className="px-5 font-mono text-[11px] text-slate-700">APT {vis.flat}</td>
                                <td className="px-5">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                                    vis.purpose === 'Delivery' ? 'bg-blue-50 text-blue-700 border-blue-100/60' :
                                    vis.purpose === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100/60' :
                                    vis.purpose === 'Service' ? 'bg-purple-50 text-purple-700 border-purple-100/60' : 'bg-slate-50 text-slate-600 border-slate-200/60'
                                  }`}>
                                    {vis.purpose}
                                  </span>
                                </td>
                                <td className="px-5 text-slate-400 font-mono font-bold">{vis.entryTime}</td>
                                <td className="px-5 font-mono">
                                  {vis.exitTime ? (
                                    <span className="text-slate-400">{vis.exitTime}</span>
                                  ) : (
                                    <span className="text-emerald-600 font-black uppercase text-[9px]">Inside</span>
                                  )}
                                </td>
                                <td className="px-5 text-right font-mono text-xs">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200/50 rounded font-bold text-[9px] uppercase">
                                    {vis.tagline || 'APPROVED_PASS'}
                                  </span>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-[11px] font-bold text-slate-400">
                              No permanent records match your filter parameters.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. GATE ENTRY FORM ==================== */}
          {activeTab === 'gate-entry' && (
            <div className="max-w-xl mx-auto animate-fade-in" id="gate-entry-view">
              <form onSubmit={handleAddVisitorSubmit} className="bg-white border border-slate-200/80 rounded-lg overflow-hidden space-y-5 p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-sky-50 text-sky-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">add_moderator</span>
                  </div>
                  <div>
                    <h2 className="font-sans font-bold text-sm text-slate-900 tracking-tight">Gate Entry Security Clearance Wizard</h2>
                    <p className="text-slate-400 text-[11px] mt-0.5 font-semibold">
                      Perform verification, verify block directory parameters, and authorize physical entry pass.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Row 1 */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Visitor Identity Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra"
                      value={visName}
                      onChange={(e) => setVisName(e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mobile Contact Phone *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 99881 22334"
                        value={visPhone}
                        onChange={(e) => setVisPhone(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Destination Apartment Flat *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A-402 or B-105"
                        value={visFlat}
                        onChange={(e) => setVisFlat(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Purpose of Arrival</label>
                      <select
                        value={visPurpose}
                        onChange={(e) => setVisPurpose(e.target.value as VisitorPurpose)}
                        className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-slate-800"
                      >
                        <option value="Guest">Personal Guest</option>
                        <option value="Delivery">Delivery / Courier</option>
                        <option value="Service">Professional Service</option>
                        <option value="Maintenance">Maintenance Worker</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Security Dispatch Label Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. Swiggy Order, Water Plumber"
                        value={visTag}
                        onChange={(e) => setVisTag(e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* ID verification checklist */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={idVerified}
                        onChange={() => setIdVerified(!idVerified)}
                        className="w-4.5 h-4.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer mt-0.5"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Physical ID Verification Document Checked</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">I verify that the visitor has presented an official credential card matching their identity logs at Gate 1 patrol desk.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate('/security/dashboard')}
                    className="h-10 px-5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded uppercase tracking-wider cursor-pointer"
                  >
                    Approve Entry Pass
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== 4. GATE EXIT CLEARANCE ==================== */}
          {activeTab === 'gate-exit' && (
            <div className="max-w-xl mx-auto space-y-6 animate-fade-in" id="gate-exit-view">
              <div className="bg-white border border-slate-200/80 rounded-lg p-6 space-y-4 shadow-xs">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                  </div>
                  <div>
                    <h2 className="font-sans font-bold text-sm text-slate-900 tracking-tight">Gate Exit Departure Clearance Desk</h2>
                    <p className="text-slate-400 text-[11px] mt-0.5 font-semibold">
                      Perform checkout logs for verified departures. Search on-site workers by their mobile number lookup.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Lookup On-Premises Visitor Mobile Contact</label>
                  <div className="relative h-10 flex items-center bg-slate-50 border border-slate-200 rounded px-3 focus-within:ring-2 focus-within:ring-slate-900/5 focus-within:border-slate-800 transition-all">
                    <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0 select-none">phone</span>
                    <input
                      type="text"
                      placeholder="Type mobile phone digits to filter live logs..."
                      value={exitSearchPhone}
                      onChange={(e) => setExitSearchPhone(e.target.value)}
                      className="bg-transparent border-none text-xs font-semibold w-full ml-1.5 py-1.5 outline-none focus:ring-0 text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Active on-premises checklist */}
              <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  LIVE ON-PREMISES VISITORS (AWAITING DEPARTURE)
                </div>
                
                <div className="divide-y divide-slate-100">
                  {visitors.filter(v => v.exitTime === null).length > 0 ? (
                    visitors
                      .filter(v => v.exitTime === null)
                      .filter(v => !exitSearchPhone || v.phone.includes(exitSearchPhone))
                      .map((vis) => (
                        <div key={vis.id} className="p-5 flex items-center justify-between hover:bg-slate-50/20 transition-colors">
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{vis.name}</h4>
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-bold rounded uppercase">
                                Apt {vis.flat}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold">Phone: {vis.phone} • Purpose: {vis.purpose}</p>
                            <p className="text-[10px] text-slate-400 font-bold">Entered: {vis.entryTime} via Gate 1 Desk</p>
                          </div>
                          
                          <button
                            onClick={() => handleMarkExit(vis.id, vis.name)}
                            className="h-8.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded transition-all cursor-pointer"
                          >
                            Mark Checkout
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="p-10 text-center text-[11px] font-bold text-slate-400">
                      Zero matching personnel awaiting clearances. Entire residential boundary is secure.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 5. EMERGENCY ALERTS ==================== */}
          {activeTab === 'emergency' && (
            <div className="space-y-6 animate-fade-in" id="emergency-view">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Crisis Response Alerts</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Monitor live hazard alarms, dispatch emergency guidelines, or raise immediate local alarms.
                  </p>
                </div>
                <button
                  onClick={() => setShowEmgModal(true)}
                  className="bg-red-600 text-white h-8.5 px-4 rounded font-bold text-xs flex items-center gap-1.5 hover:bg-red-700 transition-all cursor-pointer shadow-xs uppercase tracking-wide"
                >
                  <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                  Raise Emergency Alarm
                </button>
              </div>

              {/* Feed & Timeline of Hazards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {alerts.map((alrt) => {
                  const isCritical = alrt.severity === 'Critical';
                  const isHigh = alrt.severity === 'High';
                  return (
                    <div 
                      key={alrt.id} 
                      className={`bg-white border rounded-lg p-5 flex flex-col justify-between hover:border-slate-350 transition-all ${
                        isCritical ? 'border-l-4 border-l-red-500 border-slate-200/80' : 
                        isHigh ? 'border-l-4 border-l-amber-500 border-slate-200/80' : 'border-slate-200/80'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${alrt.status === 'Resolved' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                            <span className="text-[9px] font-bold font-mono bg-slate-50 border border-slate-200/50 px-2 py-0.2 rounded text-slate-500">
                              #{alrt.id}
                            </span>
                          </div>
                          
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                            alrt.severity === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                            alrt.severity === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {alrt.severity}
                          </span>
                        </div>

                        <h4 className="font-sans font-extrabold text-[13px] text-slate-850">{alrt.category} Hazard: {alrt.location}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1.5">{alrt.description}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>Reported {alrt.reportedAt}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200/40 rounded font-bold text-[9px] uppercase">{alrt.status}</span>
                          {alrt.status !== 'Resolved' && (
                            <button
                              onClick={() => {
                                setAlerts(alerts.map(a => a.id === alrt.id ? { ...a, status: 'Resolved' } : a));
                                triggerToast(`Alert ${alrt.id} marked Resolved!`);
                              }}
                              className="text-[10px] text-emerald-600 hover:text-emerald-800 hover:underline font-bold uppercase tracking-wider pl-2 border-l border-slate-200 cursor-pointer"
                            >
                              Mark Handled
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 6. SECURITY PROFILE ==================== */}
          {activeTab === 'profile' && (
            <ProfileView
              portal="security"
              currentUser={currentUser}
              onUpdateUser={onUpdateProfile}
            />
          )}

        </main>
      </div>

      {/* MODAL DIALOGS */}

      {/* 1. Shift Handover Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handleHandoverSubmit} className="bg-white border border-slate-200 shadow-2xl rounded-lg w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="font-sans font-bold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="material-symbols-outlined text-slate-400">assignment_turned_in</span>
                Shift Handoff Protocol
              </h3>
              <button type="button" onClick={() => setShowHandoverModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer">
                <span className="material-symbols-outlined font-bold text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Incoming Shift Officer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Amit Sharma"
                  value={handoverName}
                  onChange={(e) => setHandoverName(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shift Log Highlights & Hazard Notes</label>
                <textarea
                  rows={3}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="e.g. B3 electrical room sparks spark box checked and standby fire extinguishers placed."
                  className="w-full bg-white border border-slate-200 rounded p-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={handoverCheck}
                    onChange={() => setHandoverCheck(!handoverCheck)}
                    className="w-4.5 h-4.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer mt-0.5"
                  />
                  <div className="text-[11px] leading-snug">
                    <p className="font-bold text-slate-800">Keys and Logs physically handoff cleared</p>
                    <p className="text-slate-400 font-semibold mt-0.5">I certify that all remote gate controller keys, entry logs, physical registry, and radio devices are handed over to the incoming officer.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                className="h-9 px-4 border border-slate-200 text-slate-500 text-xs font-bold rounded hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded cursor-pointer uppercase tracking-wider"
              >
                Submit Handoff
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Raise Emergency Alert Modal */}
      {showEmgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handleRaiseEmergencySubmit} className="bg-white border border-slate-200 shadow-2xl rounded-lg w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h3 className="font-sans font-bold text-xs text-red-700 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="material-symbols-outlined text-red-500 font-bold">notifications_active</span>
                Raise Emergency Dispatch Broadcast
              </h3>
              <button type="button" onClick={() => setShowEmgModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer">
                <span className="material-symbols-outlined font-bold text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Crisis Category</label>
                  <select
                    value={emgCategory}
                    onChange={(e) => setEmgCategory(e.target.value as any)}
                    className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-slate-800"
                  >
                    <option value="Fire">Fire Hazard</option>
                    <option value="Medical">Medical Emergency</option>
                    <option value="Intruder">Intruder/Wandering</option>
                    <option value="Water Spill">Water Pipeline Spill</option>
                    <option value="Elevator Stuck">Elevator Malfunction</option>
                    <option value="Other">Other Safety Hazard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Severity Level</label>
                  <select
                    value={emgSeverity}
                    onChange={(e) => setEmgSeverity(e.target.value as any)}
                    className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-slate-800"
                  >
                    <option value="Critical">Critical (Immediate Evac)</option>
                    <option value="High">High (Urgent Response)</option>
                    <option value="Medium">Medium (Precautionary)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Incident Tower / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block C tower parking pillar #44"
                  value={emgLocation}
                  onChange={(e) => setEmgLocation(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Crisis Incident Context Details</label>
                <textarea
                  required
                  rows={3}
                  value={emgDesc}
                  onChange={(e) => setEmgDesc(e.target.value)}
                  placeholder="Describe details of threats, fire sparks, leaks or trapped persons..."
                  className="w-full bg-white border border-slate-200 rounded p-3 text-xs font-semibold text-slate-850 outline-none focus:border-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEmgModal(false)}
                className="h-9 px-4 border border-slate-200 text-slate-500 text-xs font-bold rounded hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer uppercase tracking-wider"
              >
                Broadcast Alarm
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
