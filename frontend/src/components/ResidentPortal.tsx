import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Resident, Visitor, Complaint, MaintenanceBill, Notice, ComplaintCategory, ComplaintPriority, NoticeType } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileView from './ProfileView';
import { X, LogOut, User, Building2, Mail, KeyRound, HelpCircle } from 'lucide-react';
import { formatINR } from '../utils/format';

interface ResidentPortalProps {
  currentUser: any;
  onLogout: () => void;
  residents: Resident[];
  visitors: Visitor[];
  onAddVisitor: (visitor: any) => void;
  onUpdateVisitor: (id: string, updatedFields: Partial<Visitor>) => void;
  complaints: Complaint[];
  onRaiseComplaint: (complaint: Omit<Complaint, 'id' | 'assignedTo' | 'reportedAt'>) => void;
  onUpdateComplaint: (id: string, status: 'Resolved' | 'Open') => void;
  bills: MaintenanceBill[];
  onPayBill: (billId: string) => void;
  notices: Notice[];
  onToggleNoticeBookmark: (id: string) => void;
  onUpdateProfile: (updatedFields: any) => void;
}

export default function ResidentPortal({
  currentUser,
  onLogout,
  residents,
  visitors,
  onAddVisitor,
  onUpdateVisitor,
  complaints,
  onRaiseComplaint,
  onUpdateComplaint,
  bills,
  onPayBill,
  notices,
  onToggleNoticeBookmark,
  onUpdateProfile
}: ResidentPortalProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Route helper
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.includes('/maintenance')) return 'maintenance';
    if (path.includes('/complaints')) return 'complaints';
    if (path.includes('/visitors')) return 'visitors';
    if (path.includes('/notices')) return 'notices';
    if (path.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [noticeTypeFilter, setNoticeTypeFilter] = useState<NoticeType | 'All'>('All');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Raise Complaint state
  const [newCompCategory, setNewCompCategory] = useState<ComplaintCategory>('Plumbing');
  const [newCompPriority, setNewCompPriority] = useState<ComplaintPriority>('Medium');
  const [newCompDesc, setNewCompDesc] = useState('');
  const [showRaiseCompModal, setShowRaiseCompModal] = useState(false);

  // Pre-approve Visitor state
  const [newVisName, setNewVisName] = useState('');
  const [newVisPhone, setNewVisPhone] = useState('');
  const [newVisPurpose, setNewVisPurpose] = useState<'Guest' | 'Delivery' | 'Service' | 'Maintenance'>('Guest');
  const [showPreApproveModal, setShowPreApproveModal] = useState(false);

  // Simulated Payment Modal State
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hardcode resident details for mock context (Arjun Kapoor)
  const myFlat = 'A-402';
  const myName = 'Arjun Kapoor';

  // Filter bills, complaints, visitors for this resident
  const myBills = bills.filter(b => b.flat === myFlat || b.residentName.toLowerCase().includes('arjun'));
  const myComplaints = complaints.filter(c => c.flat === myFlat || c.resident.toLowerCase().includes('arjun'));
  const myVisitors = visitors.filter(v => v.flat === myFlat || v.flat.includes('402'));

  const pendingBills = myBills.filter(b => b.status !== 'Paid');
  const totalPendingAmount = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  // Handlers
  const handleRaiseComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompDesc) {
      alert('Please enter a description for your complaint.');
      return;
    }

    onRaiseComplaint({
      resident: myName,
      flat: myFlat,
      category: newCompCategory,
      description: newCompDesc,
      status: 'Open',
      priority: newCompPriority
    });

    setNewCompDesc('');
    setShowRaiseCompModal(false);
    triggerToast('Complaint logged successfully! Our team will assign it shortly.');
  };

  const handlePreApproveVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisName || !newVisPhone) {
      alert('Please fill out visitor name and phone number.');
      return;
    }

    const now = new Date();
    const entryTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onAddVisitor({
      name: newVisName,
      phone: newVisPhone,
      purpose: newVisPurpose,
      flat: myFlat,
      entryTime: entryTimeStr,
      exitTime: null,
      isVerified: true,
      tagline: 'Pre-Approved Guest'
    });

    setNewVisName('');
    setNewVisPhone('');
    setNewVisPurpose('Guest');
    setShowPreApproveModal(false);
    triggerToast(`Visitor pass for "${newVisName}" created successfully!`);
  };

  const handlePayBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert('Please fill in all credit card details.');
      return;
    }

    if (payingBillId) {
      onPayBill(payingBillId);
      setPayingBillId(null);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      triggerToast('Maintenance bill paid successfully! Receipt has been sent to your email.');
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerToast('Account password updated successfully!');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Profile details updated successfully!');
  };

  // Nav configuration
  const menuItems = [
    { name: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/resident/dashboard' },
    { name: 'maintenance', label: 'Maintenance Bills', icon: 'receipt_long', path: '/resident/maintenance' },
    { name: 'complaints', label: 'Helpdesk & Complaints', icon: 'assignment_late', path: '/resident/complaints' },
    { name: 'visitors', label: 'Guest pre-clearance', icon: 'badge_control', path: '/resident/visitors' },
    { name: 'notices', label: 'Official Notices', icon: 'campaign', path: '/resident/notices' },
    { name: 'profile', label: 'Profile & Settings', icon: 'manage_accounts', path: '/resident/profile' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col lg:flex-row relative font-sans antialiased">
      {/* Toast Alert Success notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-lg shadow-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined font-bold text-emerald-400 text-[20px]">check_circle</span>
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <Sidebar
        portal="resident"
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'dashboard') navigate('/resident/dashboard');
          else navigate(`/resident/${tab}`);
        }}
        onLogout={onLogout}
        userName={currentUser.name || myName}
        userRole="Resident"
      />

      {/* MOBILE DRAWER SCREEN */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#0F766E]/40 backdrop-blur-sm z-50 flex" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-[290px] bg-[#0F766E] text-slate-100 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white font-black text-sm">
                  SH
                </div>
                <div>
                  <h1 className="font-sans font-bold text-white text-base">SocietyHub</h1>
                  <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Resident Portal</p>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-white cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {[
                { name: 'dashboard', label: 'Dashboard' },
                { name: 'maintenance', label: 'Maintenance Bills' },
                { name: 'complaints', label: 'Helpdesk & Complaints' },
                { name: 'visitors', label: 'Guest Pre-Clearance' },
                { name: 'notices', label: 'Official Notices' },
                { name: 'profile', label: 'Profile & Settings' }
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === 'dashboard') navigate('/resident/dashboard');
                    else navigate(`/resident/${item.name}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-semibold ${
                    activeTab === item.name ? 'bg-white/10 text-[#14B8A6] border-l-4 border-[#14B8A6]' : 'text-slate-200 hover:bg-white/5'
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
                <span className="text-[14px]">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* TOP COMPACT HEADER */}
        <Header
          portal="resident"
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userName={currentUser.name || myName}
          userRole="Resident"
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* WORKSPACE PORT */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 max-w-[1200px] mx-auto w-full space-y-8">
          
          {/* ==================== 1. DASHBOARD VIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in" id="dashboard-view">
              {/* Header block with elegant welcome, Notion style */}
              <div className="bg-white border border-slate-200/75 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h2>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                    Hello Arjun. Access secure gate permissions, review billing status, and file maintenance tickets for Apartment <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-bold">{myFlat}</span>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={() => setShowRaiseCompModal(true)} 
                    className="bg-slate-900 text-white h-9 px-4 rounded-md font-bold text-xs flex items-center gap-1.5 hover:bg-slate-850 shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    Raise repair ticket
                  </button>
                  <button 
                    onClick={() => setShowPreApproveModal(true)} 
                    className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 h-9 px-4 rounded-md font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Pre-approve guest
                  </button>
                </div>
              </div>

              {/* Status metric tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dues tile */}
                <div 
                  onClick={() => navigate('/resident/maintenance')} 
                  className="bg-white border border-slate-200/75 p-5 rounded-lg flex items-center justify-between cursor-pointer hover:border-slate-350 transition-all group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding dues</span>
                    <h4 className={`text-2xl font-black font-mono tracking-tight ${totalPendingAmount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatINR(totalPendingAmount)}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 block group-hover:underline">Click to view bills →</span>
                  </div>
                  <div className={`p-2 rounded-md ${totalPendingAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  </div>
                </div>

                {/* Complaints tile */}
                <div 
                  onClick={() => navigate('/resident/complaints')} 
                  className="bg-white border border-slate-200/75 p-5 rounded-lg flex items-center justify-between cursor-pointer hover:border-slate-350 transition-all group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active tickets</span>
                    <h4 className="text-2xl font-bold text-slate-800 tracking-tight">
                      {myComplaints.filter(c => c.status !== 'Resolved').length} <span className="text-xs font-semibold text-slate-400">pending</span>
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 block group-hover:underline">Track resolution staff →</span>
                  </div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                    <span className="material-symbols-outlined text-[20px]">build_circle</span>
                  </div>
                </div>

                {/* Basic location card */}
                <div className="bg-white border border-slate-200/75 p-5 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intercom directory</span>
                    <h4 className="text-2xl font-black font-mono text-slate-800 tracking-tight">Ext #4021</h4>
                    <span className="text-[10px] font-semibold text-slate-500 block">Flat A-402 • Block A</span>
                  </div>
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-md">
                    <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                  </div>
                </div>
              </div>

              {/* Dynamic split panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Announcements section */}
                <div className="bg-white border border-slate-200/75 rounded-lg p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-[13px] text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-500">campaign</span>
                      Latest Announcements
                    </h3>
                    <button onClick={() => navigate('/resident/notices')} className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline">
                      View all board
                    </button>
                  </div>
                  <div className="space-y-3 flex-1">
                    {notices.slice(0, 2).map((note) => (
                      <div key={note.id} className="p-3.5 bg-slate-50/50 border border-slate-200/40 rounded-md flex flex-col gap-1 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className={`px-1.5 py-0.5 font-bold text-[8px] uppercase rounded border ${
                            note.type === 'Emergency' 
                              ? 'bg-red-50 text-red-600 border-red-100' 
                              : 'bg-slate-100 text-slate-600 border-slate-200/60'
                          }`}>
                            {note.type}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono font-semibold">{note.postedAt}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{note.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-0.5 font-medium">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clearances list */}
                <div className="bg-white border border-slate-200/75 rounded-lg p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-[13px] text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-500">verified_user</span>
                      Live Gate Clearances
                    </h3>
                    <button onClick={() => navigate('/resident/visitors')} className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline">
                      See full history
                    </button>
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {myVisitors.filter(v => v.exitTime === null).length > 0 ? (
                      myVisitors.filter(v => v.exitTime === null).slice(0, 2).map((vis) => (
                        <div key={vis.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-md flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{vis.name}</h4>
                              <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-0.2 rounded font-bold uppercase tracking-wider">Gate</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">{vis.purpose} • Entered {vis.entryTime}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button 
                              onClick={() => {
                                onUpdateVisitor(vis.id, { tagline: 'Pre-Approved Entry' });
                                triggerToast(`Verified and cleared entry pass for ${vis.name}`);
                              }}
                              className="px-2.5 h-7 bg-slate-900 text-white text-[9px] font-bold rounded hover:bg-slate-800 transition-all cursor-pointer uppercase tracking-wider"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => {
                                onUpdateVisitor(vis.id, { tagline: 'Entry Rejected', exitTime: 'Rejected' });
                                triggerToast(`Access credentials denied for ${vis.name}`);
                              }}
                              className="px-2.5 h-7 border border-red-200 hover:bg-red-50 text-red-600 text-[9px] font-bold rounded transition-all cursor-pointer uppercase tracking-wider"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center flex flex-col items-center justify-center text-slate-400 border border-slate-100 border-dashed rounded-md bg-slate-50/50">
                        <span className="material-symbols-outlined text-2xl mb-1 text-slate-300">person_off</span>
                        <p className="text-[11px] font-bold text-slate-500">No visitor awaiting gate clearances</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Approved guests pass automatically.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== 2. MAINTENANCE VIEW ==================== */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6 animate-fade-in" id="maintenance-view">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Apartment Invoices Ledger</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Review and download certified billing records, outstanding balances, and authorize payments.
                  </p>
                </div>
                {totalPendingAmount > 0 && (
                  <div className="p-3 bg-red-50 border border-red-100/60 rounded-md flex items-center gap-3 shrink-0">
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Unsettled Balance</p>
                      <p className="text-sm font-extrabold text-red-700 font-mono">{formatINR(totalPendingAmount)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoices list, Notion/Google Workspace hybrid database style */}
              <div className="bg-white border border-slate-200/75 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">Invoice History</h3>
                  <span className="text-[10px] font-bold text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-200/40">Flat A-402</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/30 border-b border-slate-200/60 h-10">
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoicing Month</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference ID</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Due</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due By Date</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Settlement Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[12px] font-semibold text-slate-700">
                      {myBills.length > 0 ? (
                        myBills.map((bill) => (
                          <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors h-14">
                            <td className="px-5 font-bold text-slate-900">{bill.billingMonth}</td>
                            <td className="px-5 text-slate-400 font-mono text-xs">{bill.id.toUpperCase()}</td>
                            <td className="px-5 font-bold text-slate-900 font-mono">{formatINR(bill.amount)}</td>
                            <td className="px-5 text-slate-500 font-mono">{bill.dueDate}</td>
                            <td className="px-5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                bill.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-100 text-slate-600 border-slate-200/80'
                              }`}>
                                {bill.status}
                              </span>
                            </td>
                            <td className="px-5 text-right">
                              {bill.status !== 'Paid' ? (
                                <button
                                  onClick={() => {
                                    setPayingBillId(bill.id);
                                    setCardNumber('');
                                    setCardExpiry('');
                                    setCardCvv('');
                                  }}
                                  className="h-7 px-3 bg-slate-900 hover:bg-slate-850 text-white font-bold text-[10px] uppercase rounded transition-all cursor-pointer"
                                >
                                  Settle Bill
                                </button>
                              ) : (
                                <button
                                  onClick={() => alert(`Official Receipt for ${bill.billingMonth}:\nInvoice ID: ${bill.id}\nAmount Settled: ₹${bill.amount}\nStatus: Certified Paid`)}
                                  className="h-7 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[10px] uppercase rounded transition-all cursor-pointer"
                                >
                                  Receipt
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-[11px] font-bold text-slate-400">
                            No ledger invoice records available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. COMPLAINTS VIEW ==================== */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 animate-fade-in" id="complaints-view">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Helpdesk Complaints</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Log repair requests for household repair tasks and track live technician assignments and resolutions.
                  </p>
                </div>
                <button
                  onClick={() => setShowRaiseCompModal(true)}
                  className="bg-slate-900 text-white h-9 px-4 rounded-md font-bold text-xs flex items-center gap-1.5 hover:bg-slate-850 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Log repair ticket
                </button>
              </div>

              {/* Filter tabs, Google Workspace style */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-md max-w-md">
                {['All', 'Open', 'In Progress', 'Resolved'].map((st) => {
                  const isActive = complaintStatusFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setComplaintStatusFilter(st as any)}
                      className={`flex-1 h-7.5 text-[10px] font-bold rounded transition-all cursor-pointer uppercase tracking-wider ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              {/* Complaints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myComplaints
                  .filter(c => complaintStatusFilter === 'All' || c.status === complaintStatusFilter)
                  .length > 0 ? (
                    myComplaints
                      .filter(c => complaintStatusFilter === 'All' || c.status === complaintStatusFilter)
                      .map((comp) => {
                        const isCritical = comp.priority === 'Critical' || comp.priority === 'High';
                        return (
                          <div 
                            key={comp.id} 
                            className={`bg-white border rounded-lg p-5 flex flex-col justify-between hover:border-slate-350 transition-all ${
                              isCritical ? 'border-l-4 border-l-amber-500 border-slate-200/80' : 'border-slate-200/80'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold text-slate-500 font-mono uppercase bg-slate-50 border border-slate-200/50 px-1.5 py-0.2 rounded">
                                    #{comp.id}
                                  </span>
                                  <span className="text-[10px] font-semibold font-mono text-slate-400">{comp.reportedAt}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border tracking-wider ${
                                  comp.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  comp.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                  {comp.status}
                                </span>
                              </div>

                              <h4 className="text-[13px] font-extrabold text-slate-900 mb-1">{comp.category} repair request</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-5">{comp.description}</p>
                            </div>

                            <div className="border-t border-slate-100 pt-3.5 mt-auto flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">engineering</span>
                                <span className="text-slate-600 font-semibold text-[10px]">Staff: {comp.assignedTo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] uppercase font-extrabold px-1.5 py-0.2 rounded border ${
                                  isCritical ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200/60'
                                }`}>
                                  {comp.priority}
                                </span>
                                {comp.status !== 'Resolved' && (
                                  <button
                                    onClick={() => {
                                      onUpdateComplaint(comp.id, 'Resolved');
                                      triggerToast(`Marked complaint ticket ${comp.id} as Resolved!`);
                                    }}
                                    className="text-[10px] text-slate-800 hover:text-black hover:underline cursor-pointer font-bold uppercase tracking-wider ml-1"
                                  >
                                    Close ticket
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="col-span-full py-12 text-center flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200/70 border-dashed rounded-lg">
                      <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">support_agent</span>
                      <p className="text-xs font-bold text-slate-600">No repair tickets match the active filter</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">Click "Log repair ticket" to record water leakage, short circuits or elevator malfunctions.</p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* ==================== 4. VISITORS VIEW ==================== */}
          {activeTab === 'visitors' && (
            <div className="space-y-6 animate-fade-in" id="visitors-view">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Guest Gate clearances</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Pre-approve friends, couriers, or maintenance contractors, and monitor recent check-in times.
                  </p>
                </div>
                <button
                  onClick={() => setShowPreApproveModal(true)}
                  className="bg-slate-900 text-white h-9 px-4 rounded-md font-bold text-xs flex items-center gap-1.5 hover:bg-slate-850 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Create pre-approval pass
                </button>
              </div>

              {/* Visitors Table */}
              <div className="bg-white border border-slate-200/75 rounded-lg overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-200/80 flex justify-between items-center">
                  <h3 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">Registered visitor passes</h3>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">APT 402</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/30 border-b border-slate-200/60 h-10">
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visitor name</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact number</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arrival time</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exit clearance</th>
                        <th className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Pass reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[12px] font-semibold text-slate-700">
                      {myVisitors.length > 0 ? (
                        myVisitors.map((vis) => (
                          <tr key={vis.id} className="hover:bg-slate-50/50 transition-colors h-14">
                            <td className="px-5 font-bold text-slate-900">{vis.name}</td>
                            <td className="px-5 text-slate-500 font-mono">{vis.phone}</td>
                            <td className="px-5">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/50 rounded text-[9px] font-bold text-slate-600 uppercase">
                                {vis.purpose}
                              </span>
                            </td>
                            <td className="px-5 text-slate-500 font-mono">{vis.entryTime}</td>
                            <td className="px-5 font-mono">
                              {vis.exitTime ? (
                                <span className="text-slate-400">{vis.exitTime}</span>
                              ) : (
                                <span className="text-emerald-600 font-bold uppercase tracking-wider text-[9px]">On-Site</span>
                              )}
                            </td>
                            <td className="px-5 text-right font-mono text-xs text-slate-400">
                              <span className="text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded">
                                {vis.tagline || 'REGULAR PASS'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-[11px] font-bold text-slate-400">
                            No visitor passes registered in database logs.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 5. NOTICE BOARD VIEW ==================== */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-fade-in" id="notices-view">
              <div className="border-b border-slate-200/80 pb-5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Official Notice Board</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Browse system notices, maintenance schedules, guidelines, and upcoming community broadcast announcements.
                </p>
              </div>

              {/* Categorization tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-md max-w-xl overflow-x-auto">
                {['All', 'Emergency', 'Event', 'Maintenance', 'General'].map((ct) => {
                  const isActive = noticeTypeFilter === ct;
                  return (
                    <button
                      key={ct}
                      onClick={() => setNoticeTypeFilter(ct as any)}
                      className={`flex-1 h-7.5 px-3 text-[10px] font-bold rounded transition-all cursor-pointer uppercase tracking-wider ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      {ct}
                    </button>
                  );
                })}
              </div>

              {/* Notices grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {notices
                  .filter(n => noticeTypeFilter === 'All' || n.type === noticeTypeFilter)
                  .length > 0 ? (
                    notices
                      .filter(n => noticeTypeFilter === 'All' || n.type === noticeTypeFilter)
                      .map((note) => {
                        const isEmergency = note.type === 'Emergency';
                        return (
                          <div
                            key={note.id}
                            className={`bg-white border p-5 rounded-lg flex flex-col justify-between min-h-[200px] hover:border-slate-350 transition-all ${
                              isEmergency ? 'border-l-4 border-l-red-500 border-slate-200/80' : 'border-slate-200/80'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                                  note.type === 'Emergency' ? 'bg-red-50 text-red-700 border-red-100' :
                                  note.type === 'Maintenance' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200/70'
                                }`}>
                                  {note.type}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 font-mono">{note.postedAt}</span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">{note.title}</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{note.content}</p>
                            </div>

                            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span className="text-slate-500 font-semibold">By: {note.author}</span>
                              <button
                                onClick={() => {
                                  onToggleNoticeBookmark(note.id);
                                  triggerToast(note.isBookmarked ? 'Notice removed from archive!' : 'Notice bookmarked for offline reference!');
                                }}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center justify-center"
                                title={note.isBookmarked ? 'Unpin Notice' : 'Bookmark Notice'}
                              >
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: note.isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                                  bookmark
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="col-span-full py-12 text-center bg-white border border-slate-200/70 border-dashed rounded-lg text-slate-400">
                      <span className="material-symbols-outlined text-2xl mb-1 text-slate-300">campaign</span>
                      <p className="text-xs font-bold text-slate-500">No active notices found in this board.</p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* ==================== 6. PROFILE VIEW ==================== */}
          {activeTab === 'profile' && (
            <ProfileView
              portal="resident"
              currentUser={currentUser}
              onUpdateUser={onUpdateProfile}
            />
          )}

        </main>
      </div>

      {/* OVERLAY DIALOGS (MODALS) - styled using Notion style lines */}
      
      {/* 1. Raise Complaint Modal Form */}
      {showRaiseCompModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handleRaiseComplaintSubmit} className="bg-white border border-slate-200 shadow-xl rounded-lg w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-[13px] text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">report_problem</span>
                Raise repair ticket
              </h3>
              <button type="button" onClick={() => setShowRaiseCompModal(false)} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined font-bold text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Issue Category</label>
                  <select
                    value={newCompCategory}
                    onChange={(e) => setNewCompCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold outline-none cursor-pointer focus:border-slate-400 transition-all"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Security">Security Patrol</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Amenities">Amenities</option>
                    <option value="General Maintenance">General Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Priority</label>
                  <select
                    value={newCompPriority}
                    onChange={(e) => setNewCompPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold outline-none cursor-pointer focus:border-slate-400 transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  placeholder="Water leaking under bathroom basin pipe, slow drain..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold outline-none focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRaiseCompModal(false)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-850 cursor-pointer uppercase tracking-wider"
              >
                Log Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Pre-approve Visitor Pass Modal */}
      {showPreApproveModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handlePreApproveVisitorSubmit} className="bg-white border border-slate-200 shadow-xl rounded-lg w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-[13px] text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">verified_user</span>
                Pre-approve guest pass
              </h3>
              <button type="button" onClick={() => setShowPreApproveModal(false)} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined font-bold text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  value={newVisName}
                  onChange={(e) => setNewVisName(e.target.value)}
                  placeholder="e.g. Meera Mehta"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold outline-none focus:border-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Mobile Contact No</label>
                  <input
                    type="text"
                    required
                    value={newVisPhone}
                    onChange={(e) => setNewVisPhone(e.target.value)}
                    placeholder="+91 99887 76655"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold outline-none focus:border-slate-400 font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Purpose of Visit</label>
                  <select
                    value={newVisPurpose}
                    onChange={(e) => setNewVisPurpose(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-bold outline-none cursor-pointer focus:border-slate-400 transition-all"
                  >
                    <option value="Guest">Personal Guest</option>
                    <option value="Delivery">Delivery Rider</option>
                    <option value="Service">Professional Service</option>
                    <option value="Maintenance">Maintenance Worker</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPreApproveModal(false)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-850 cursor-pointer uppercase tracking-wider"
              >
                Generate Pass
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Simulated Payment Modal */}
      {payingBillId && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form onSubmit={handlePayBillSubmit} className="bg-white border border-slate-200 shadow-xl rounded-lg w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-[13px] text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-500">payments</span>
                Authorize Ledger Payment
              </h3>
              <button type="button" onClick={() => setPayingBillId(null)} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined font-bold text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 text-left">
              <div className="p-3 bg-slate-50 border border-slate-200/50 rounded text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Invoice ID: #{payingBillId.toUpperCase()}</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  ${(myBills.find(b => b.id === payingBillId)?.amount || 250.00).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  defaultValue={myName}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold outline-none focus:border-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                    setCardNumber(val);
                  }}
                  placeholder="4111 2222 3333 4444"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-bold outline-none font-mono tracking-widest focus:border-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold outline-none text-center focus:border-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">CVV Code</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-semibold outline-none text-center focus:border-slate-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPayingBillId(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-850 cursor-pointer uppercase tracking-wider"
              >
                Authorize
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
