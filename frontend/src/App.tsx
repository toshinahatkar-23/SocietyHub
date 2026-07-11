import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { TabName, Resident, Visitor, Complaint, MaintenanceBill, Notice, NoticeType, ComplaintCategory, ComplaintPriority, ComplaintStatus, BillingStatus, RegistrationRequest } from './types';
import {
  INITIAL_BILLS
} from './data';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardView';
import ResidentsView from './components/ResidentDirectory';
import VisitorsView from './components/VisitorsView';
import ComplaintsView from './components/ComplaintsView';
import MaintenanceView from './components/MaintenanceView';
import NoticesView from './components/NoticesView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import ResidentPortal from './components/ResidentPortal';
import SecurityPortal from './components/SecurityPortal';
import RegistrationRequestsView from './components/RegistrationRequestsView';
import { apiService } from './services/api';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication state - restore user from localStorage if present
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('sh_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) { }
    }
    return {
      name: 'Sarah Chen',
      role: 'Society Admin',
      email: 'sarah.chen@societyhub.com',
      phone: '+91-98765-43210',
      department: 'General Administration',
      twoFactor: false,
      alerts: {
        complaints: true,
        ledger: false,
        gate: true
      }
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem('sh_user');
    if (stored) return true;
    const loggedOut = localStorage.getItem('sh_logged_out');
    if (loggedOut === 'true') {
      return false;
    }
    return false; // Default to true for demo view fallback
  });

  // Current tab state
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Reactive Data States (Init with empty arrays for API connected tables)
  const [residents, setResidents] = useState<Resident[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [bills, setBills] = useState<MaintenanceBill[]>(INITIAL_BILLS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all dynamic data from backend API
  const loadAllData = async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    try {
      // 1. Fetch Residents
      const resData = await apiService.getResidents();
      const mappedResidents: Resident[] = resData.map(r => ({
        id: `RES-${r.user_id}`,
        name: r.name,
        phone: r.phone,
        email: r.email,
        block: r.block || 'Block A',
        flat: r.flat_number || '',
        flatType: r.flat_type || '3BHK',
        status: r.status === 'active' ? 'Active' : 'Inactive'
      }));
      setResidents(mappedResidents);

      // 2. Fetch Visitors
      const visData = await apiService.getVisitors();
      const mappedVisitors: Visitor[] = visData.map(v => ({
        id: `vis-${v.visitor_id}`,
        name: v.visitor_name,
        phone: v.mobile_number,
        purpose: v.purpose as any,
        flat: v.flat_number,
        entryTime: v.entry_time,
        exitTime: v.exit_time,
        isVerified: true,
        tagline: v.purpose
      }));
      setVisitors(mappedVisitors);

      // 3. Fetch Complaints
      const compData = await apiService.getComplaints();
      const mappedComplaints: Complaint[] = compData.map(c => ({
        id: `CMP-${c.complaint_id}`,
        resident: c.resident_name,
        flat: c.flat_number,
        category: c.category as any,
        description: c.description,
        status: c.status === 'in_progress' ? 'In Progress' : c.status === 'resolved' ? 'Resolved' : 'Open',
        assignedTo: c.assigned_staff || 'Unassigned',
        priority: 'Medium',
        reportedAt: c.created_at,
        remarks: c.remarks || undefined
      }));
      setComplaints(mappedComplaints);

      // 4. Fetch Notices
      const noticeData = await apiService.getNotices();
      const mappedNotices: Notice[] = noticeData.map(n => ({
        id: `not-${n.notice_id}`,
        type: (n.category === 'Meeting' ? 'Event' : n.category === 'Notice' ? 'General' : n.category) as any,
        title: n.title,
        author: n.posted_by_name,
        postedAt: n.posted_on,
        content: n.description,
        isBookmarked: false
      }));
      setNotices(mappedNotices);

      // 5. Fetch Registration Requests
      const reqData = await apiService.getRegistrationRequests();
      const mappedRequests: RegistrationRequest[] = reqData.map(r => ({
        request_id: r.request_id,
        full_name: r.full_name,
        email: r.email,
        phone: r.phone,
        block: r.block,
        flat_number: r.flat_number,
        flat_type: r.flat_type,
        status: r.status,
        submitted_at: r.submitted_at,
        reviewed_at: r.reviewed_at,
        reviewed_by: r.reviewed_by
      }));
      setRequests(mappedRequests);

    } catch (err: any) {
      console.error('Failed to sync backend data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);


  // Overlay Modals State management
  const [activeModal, setActiveModal] = useState<'addResident' | 'addVisitor' | 'raiseComplaint' | 'updateComplaint' | 'assignComplaint' | 'recordPayment' | 'generateBill' | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Form Inputs Local States for Modals
  // 1. Add Resident Inputs
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resBlock, setResBlock] = useState('Block A');
  const [resFlat, setResFlat] = useState('');
  const [resType, setResType] = useState('3BHK');
  const [resStatus, setResStatus] = useState<'Active' | 'Inactive'>('Active');

  // 2. Add Visitor Inputs
  const [visName, setVisName] = useState('');
  const [visPhone, setVisPhone] = useState('');
  const [visPurpose, setVisPurpose] = useState<'Guest' | 'Maintenance' | 'Delivery' | 'Service'>('Guest');
  const [visFlat, setVisFlat] = useState('');
  const [visTagline, setVisTagline] = useState('');

  // 3. Raise Complaint Inputs
  const [compResidentName, setCompResidentName] = useState('');
  const [compFlat, setCompFlat] = useState('');
  const [compCategory, setCompCategory] = useState<ComplaintCategory>('Plumbing');
  const [compDesc, setCompDesc] = useState('');
  const [compPriority, setCompPriority] = useState<ComplaintPriority>('Medium');

  // 4. Update Complaint Status Inputs
  const [updateCompStatus, setUpdateCompStatus] = useState<ComplaintStatus>('Open');
  const [updateRemarks, setUpdateRemarks] = useState('');

  // 5. Assign Complaint Staff Inputs
  const [assignStaff, setAssignStaff] = useState('Rajesh Kumar');
  const [assignPriority, setAssignPriority] = useState<ComplaintPriority>('Medium');

  // 6. Generate Maintenance Bill Inputs
  const [billFlat, setBillFlat] = useState('A-102');
  const [billResident, setBillResident] = useState('');
  const [billAmount, setBillAmount] = useState('250.00');
  const [billMonth, setBillMonth] = useState('Oct 2023');

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Authorization Callback
  const handleLoginSuccess = (name: string, role: string, userObj?: any) => {
    localStorage.removeItem('sh_logged_out');

    const mappedUser = {
      user_id: userObj?.user_id || 1,
      name: name,
      role: role,
      email: userObj?.email || '',
      phone: userObj?.phone || '',
      block: userObj?.block || '',
      flat_number: userObj?.flat_number || '',
      flat_type: userObj?.flat_type || '',
      department: role === 'Security Guard' ? 'Security Wing' : 'General Administration',
      twoFactor: false,
      alerts: { complaints: true, ledger: false, gate: true }
    };

    setCurrentUser(mappedUser);
    localStorage.setItem('sh_user', JSON.stringify(mappedUser));
    setIsLoggedIn(true);

    if (role === 'Resident') {
      navigate('/resident/dashboard');
    } else if (role === 'Security Guard') {
      navigate('/security/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.setItem('sh_logged_out', 'true');
    localStorage.removeItem('sh_user');
    setIsLoggedIn(false);
    setCurrentUser({
      name: '',
      role: '',
      email: '',
      phone: '',
      department: '',
      twoFactor: false,
      alerts: { complaints: true, ledger: false, gate: true }
    });
    navigate('/');
  };

  const renderLogoutConfirmModal = () => {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="logout-confirm-modal">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-5 animate-scale-in">
          <div className="flex items-center gap-3 text-red-600">
            <span className="material-symbols-outlined text-[24px]">logout</span>
            <h3 className="font-sans font-extrabold text-lg text-slate-900">Logout</h3>
          </div>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Are you sure you want to sign out of SocietyHub?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="h-10 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  // State mutation handlers
  // 1. Resident Registration Request Actions
  const handleApproveRequest = async (id: number) => {
    await apiService.approveRegistrationRequest(id);
    await loadAllData(); // Auto-refresh requests list & residents directory
  };

  const handleRejectRequest = async (id: number) => {
    await apiService.rejectRegistrationRequest(id);
    await loadAllData(); // Auto-refresh requests list & residents directory
  };

  // 2. Residents View Actions
  const handleAddResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resPhone || !resFlat) {
      alert('Please fill in name, contact phone and flat number.');
      return;
    }

    const newResident: Resident = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      name: resName,
      phone: resPhone,
      email: resEmail || `${resName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      block: resBlock,
      flat: resFlat,
      flatType: resType,
      status: resStatus
    };

    setResidents([newResident, ...residents]);
    alert(`Resident "${resName}" successfully registered to directory.`);

    // Reset form & close
    setResName('');
    setResPhone('');
    setResEmail('');
    setResBlock('Block A');
    setResFlat('');
    setResType('3BHK');
    setResStatus('Active');
    setActiveModal(null);
  };

  const handleDeleteResident = (id: string) => {
    if (confirm('Are you sure you want to remove this resident record from SocietyHub?')) {
      setResidents(residents.filter(r => r.id !== id));
    }
  };

  // 2. Visitors View Actions
  const handleAddVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName || !visPhone || !visFlat) {
      alert('Please fill in visitor name, contact phone and target flat.');
      return;
    }

    try {
      setIsLoading(true);
      const targetResident = residents.find(r =>
        r.flat.toLowerCase() === visFlat.toLowerCase() ||
        r.flat.replace('-', '').toLowerCase() === visFlat.replace('-', '').toLowerCase()
      );
      const visiting_user_id = targetResident ? parseInt(targetResident.id.replace('RES-', '')) : 2;

      await apiService.addVisitor({
        visitor_name: visName,
        mobile_number: visPhone.replace(/[^0-9]/g, '').slice(-10),
        purpose: visPurpose,
        visiting_user_id: visiting_user_id,
        logged_by: (currentUser as any).user_id || 3
      });

      await loadAllData();
      alert(`Visitor "${visName}" checked-in at security desk.`);

      // Reset Form
      setVisName('');
      setVisPhone('');
      setVisPurpose('Guest');
      setVisFlat('');
      setVisTagline('');
      setActiveModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to record visitor entry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortalAddVisitor = async (v: any) => {
    try {
      setIsLoading(true);
      const targetResident = residents.find(r =>
        r.flat.toLowerCase() === v.flat.toLowerCase() ||
        r.flat.replace('-', '').toLowerCase() === v.flat.replace('-', '').toLowerCase()
      );
      const visiting_user_id = targetResident ? parseInt(targetResident.id.replace('RES-', '')) : ((currentUser as any).user_id || 2);

      await apiService.addVisitor({
        visitor_name: v.name,
        mobile_number: v.phone.replace(/[^0-9]/g, '').slice(-10),
        purpose: v.purpose,
        visiting_user_id: visiting_user_id,
        logged_by: (currentUser as any).user_id || 3
      });

      await loadAllData();
      alert(`Visitor "${v.name}" checked-in successfully.`);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to check-in visitor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkVisitorExit = (id: string, time: string) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, exitTime: time } : v));
    alert('Visitor checked out successfully. Pass recorded.');
  };

  // 3. Complaints View Actions
  const handleRaiseComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compResidentName || !compFlat || !compDesc) {
      alert('Please fill in resident name, flat location and issue description.');
      return;
    }

    try {
      setIsLoading(true);
      const targetResident = residents.find(r =>
        r.name.toLowerCase().includes(compResidentName.toLowerCase()) ||
        r.flat.toLowerCase() === compFlat.toLowerCase()
      );
      const user_id = targetResident ? parseInt(targetResident.id.replace('RES-', '')) : ((currentUser as any).user_id || 2);

      await apiService.addComplaint({
        user_id: user_id,
        category: compCategory,
        description: compDesc
      });

      await loadAllData();
      alert('Complaint ticket logged successfully.');

      // Reset Form
      setCompResidentName('');
      setCompFlat('');
      setCompCategory('Plumbing');
      setCompDesc('');
      setCompPriority('Medium');
      setActiveModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to log complaint.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortalRaiseComplaint = async (newCompData: any) => {
    try {
      setIsLoading(true);
      await apiService.addComplaint({
        user_id: (currentUser as any).user_id || 2,
        category: newCompData.category,
        description: newCompData.description
      });
      await loadAllData();
      alert('Complaint logged successfully.');
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to log complaint.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAssignModal = (complaintId: string) => {
    setSelectedItemId(complaintId);
    const item = complaints.find(c => c.id === complaintId);
    if (item) {
      setAssignPriority(item.priority);
    }
    setAssignStaff('Rajesh Kumar');
    setActiveModal('assignComplaint');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    setComplaints(complaints.map(c =>
      c.id === selectedItemId
        ? { ...c, assignedTo: assignStaff, priority: assignPriority, status: 'In Progress' }
        : c
    ));

    alert(`Ticket ${selectedItemId} assigned to ${assignStaff}. Status updated to In Progress.`);
    setSelectedItemId(null);
    setActiveModal(null);
  };

  const handleOpenUpdateStatusModal = (complaintId: string) => {
    setSelectedItemId(complaintId);
    const item = complaints.find(c => c.id === complaintId);
    if (item) {
      setUpdateCompStatus(item.status);
    }
    setUpdateRemarks('');
    setActiveModal('updateComplaint');
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    setComplaints(complaints.map(c =>
      c.id === selectedItemId
        ? { ...c, status: updateCompStatus, remarks: updateRemarks || undefined }
        : c
    ));

    alert(`Ticket ${selectedItemId} progress set to "${updateCompStatus}".`);
    setSelectedItemId(null);
    setActiveModal(null);
  };

  // 4. Maintenance Billing View Actions
  const handleOpenRecordPaymentModal = (billId: string) => {
    setSelectedItemId(billId);
    setActiveModal('recordPayment');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    setBills(bills.map(b => b.id === selectedItemId ? { ...b, status: 'Paid' } : b));
    alert('Billing payment received. Generated official receipts.');
    setSelectedItemId(null);
    setActiveModal(null);
  };

  const handleGenerateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billResident || !billFlat) {
      alert('Please fill in resident name and target flat identifier.');
      return;
    }

    const now = new Date();
    const currentMonthStr = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const newBill: MaintenanceBill = {
      id: `bill-${Math.floor(100 + Math.random() * 900)}`,
      flat: billFlat,
      residentName: billResident,
      billingMonth: billMonth || currentMonthStr,
      amount: parseFloat(billAmount) || 250.00,
      dueDate: 'Oct 15, 2023',
      status: 'Unpaid'
    };

    setBills([newBill, ...bills]);
    alert(`Maintenance invoice created successfully for Flat ${billFlat}.`);

    // Reset Form
    setBillResident('');
    setBillFlat('A-102');
    setBillAmount('250.00');
    setBillMonth('Oct 2023');
    setActiveModal(null);
  };

  // 5. Notices Board Actions
  const handleAddNotice = async (newNoticeData: Omit<Notice, 'id' | 'isBookmarked'>) => {
    try {
      setIsLoading(true);
      await apiService.addNotice({
        title: newNoticeData.title,
        description: newNoticeData.content,
        category: newNoticeData.type === 'Event' ? 'Meeting' : newNoticeData.type === 'General' ? 'Notice' : newNoticeData.type,
        posted_by: (currentUser as any).user_id || 1
      });
      await loadAllData();
      alert('Notice announcement published successfully.');
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to post notice.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNoticeBookmark = (id: string) => {
    setNotices(notices.map(n => n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n));
  };

  // Trigger generalized modal overlays
  const handleTriggerModal = (
    modalType: 'addResident' | 'addVisitor' | 'raiseComplaint' | 'updateComplaint' | 'assignComplaint' | 'recordPayment' | 'generateBill' | null,
    itemId: string | null = null
  ) => {
    if (itemId) {
      setSelectedItemId(itemId);
    }
    setActiveModal(modalType);
  };

  // Conditional Rendering of Tab views
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            onTriggerModal={(modal) => handleTriggerModal(modal, null)}
            setActiveTab={setActiveTab}
            residentCount={residents.length}
            visitorCount={visitors.length}
            openComplaintCount={complaints.filter(c => c.status === 'Open').length}
            totalCollection={`$${(45280 + bills.filter(b => b.status === 'Paid').reduce((acc, c) => acc + c.amount, 0)).toLocaleString('en-US')}`}
            pendingRequestsCount={requests.filter(r => r.status === 'Pending').length}
          />
        );
      case 'residents':
        return (
          <ResidentsView
            residents={residents}
            onDeleteResident={handleDeleteResident}
            onOpenAddModal={() => handleTriggerModal('addResident')}
            searchQuery={searchQuery}
          />
        );
      case 'requests':
        return (
          <RegistrationRequestsView
            requests={requests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            searchQuery={searchQuery}
          />
        );
      case 'visitors':
        return (
          <VisitorsView
            visitors={visitors}
            onMarkExit={handleMarkVisitorExit}
            onOpenAddModal={() => handleTriggerModal('addVisitor')}
            searchQuery={searchQuery}
          />
        );
      case 'complaints':
        return (
          <ComplaintsView
            complaints={complaints}
            onTriggerModal={(modal, id) => handleTriggerModal(modal, id || null)}
            searchQuery={searchQuery}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceView
            bills={bills}
            onTriggerModal={(modal, id) => handleTriggerModal(modal, id || null)}
            searchQuery={searchQuery}
          />
        );
      case 'notices':
        return (
          <NoticesView
            notices={notices}
            onToggleBookmark={handleToggleNoticeBookmark}
            onAddNotice={handleAddNotice}
            searchQuery={searchQuery}
          />
        );
      case 'profile':
        return (
          <ProfileView
            portal="admin"
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(prev => ({ ...prev, ...updated }))}
          />
        );
      default:
        return <div className="p-xl text-center font-bold text-error">View translation failed.</div>;
    }
  };

  // If unauthorized, route to Auth Screen
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.role === 'Resident') {
    return (
      <>
        <ResidentPortal
          currentUser={currentUser}
          onLogout={handleLogout}
          residents={residents}
          visitors={visitors}
          onAddVisitor={handlePortalAddVisitor}
          onUpdateVisitor={(id, updatedFields) =>
            setVisitors(visitors.map((item) => (item.id === id ? { ...item, ...updatedFields } : item)))
          }
          complaints={complaints}
          onRaiseComplaint={handlePortalRaiseComplaint}
          onUpdateComplaint={(id, status) =>
            setComplaints(complaints.map((c) => (c.id === id ? { ...c, status } : c)))
          }
          bills={bills}
          onPayBill={(billId) =>
            setBills(bills.map((b) => (b.id === billId ? { ...b, status: 'Paid' } : b)))
          }
          notices={notices}
          onToggleNoticeBookmark={handleToggleNoticeBookmark}
          onUpdateProfile={(updated) =>
            setCurrentUser((prev) => ({ ...prev, ...updated }))
          }
        />
        {showLogoutConfirm && renderLogoutConfirmModal()}
      </>
    );
  }

  if (currentUser.role === 'Security Guard') {
    return (
      <>
        <SecurityPortal
          currentUser={currentUser}
          onLogout={handleLogout}
          visitors={visitors}
          onAddVisitor={handlePortalAddVisitor}
          onUpdateVisitor={(id, updatedFields) =>
            setVisitors(visitors.map((item) => (item.id === id ? { ...item, ...updatedFields } : item)))
          }
          onUpdateProfile={(updated) =>
            setCurrentUser((prev) => ({ ...prev, ...updated }))
          }
        />
        {showLogoutConfirm && renderLogoutConfirmModal()}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row relative">
      {/* Sidebar Navigation */}
      <Sidebar
        portal="admin"
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          setIsMobileMenuOpen(false);
        }}
        onLogout={handleLogout}
        userName={currentUser.name}
        userRole={currentUser.role}
      />

      {/* Mobile Drawer Menu Overlays */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/45 z-50 flex" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-[260px] bg-white h-full p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-3">
              <h1 className="font-sans font-black text-primary text-xl">SocietyHub</h1>
              <button onClick={() => setIsMobileMenuOpen(false)} className="material-symbols-outlined text-on-surface cursor-pointer">
                close
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {[
                { name: 'dashboard' as TabName, label: 'Dashboard', icon: 'dashboard' },
                { name: 'residents' as TabName, label: 'Residents', icon: 'groups' },
                { name: 'visitors' as TabName, label: 'Visitors', icon: 'person_add' },
                { name: 'complaints' as TabName, label: 'Complaints', icon: 'report_problem' },
                { name: 'maintenance' as TabName, label: 'Maintenance', icon: 'build' },
                { name: 'notices' as TabName, label: 'Notices', icon: 'campaign' },
                { name: 'profile' as TabName, label: 'Profile', icon: 'account_circle' },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSearchQuery('');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left font-semibold ${activeTab === item.name ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="border-t border-outline-variant pt-4 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-error hover:bg-error-container/10 font-bold"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Universal Top Nav */}
        <Header
          portal="admin"
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userName={currentUser.name}
          userRole={currentUser.role}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content View Port */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>

        {/* Responsive Mobile Navigation bottom bar (Renders on small viewports) */}
        <div className="lg:hidden h-16 border-t border-outline-variant bg-surface sticky bottom-0 left-0 w-full flex items-center justify-around z-40 px-2 shadow-inner">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center cursor-pointer ${activeTab === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('residents')}
            className={`flex flex-col items-center cursor-pointer ${activeTab === 'residents' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[22px]">groups</span>
            <span className="text-[10px] font-bold">Society</span>
          </button>
          <button
            onClick={() => {
              if (activeTab === 'visitors') handleTriggerModal('addVisitor');
              else if (activeTab === 'complaints') handleTriggerModal('raiseComplaint');
              else handleTriggerModal('generateBill');
            }}
            className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center -translate-y-3 shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex flex-col items-center cursor-pointer ${activeTab === 'notices' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[22px]">campaign</span>
            <span className="text-[10px] font-bold">Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center cursor-pointer ${activeTab === 'profile' ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </div>

      {/* OVERLAY MODAL FORMS DIALOGS CONTAINER */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-outline-variant shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-sans font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">
                  {activeModal === 'addResident' ? 'group_add' :
                    activeModal === 'addVisitor' ? 'person_add' :
                      activeModal === 'raiseComplaint' ? 'report_problem' :
                        activeModal === 'updateComplaint' ? 'published_with_changes' :
                          activeModal === 'assignComplaint' ? 'supervisor_account' :
                            activeModal === 'recordPayment' ? 'check_circle' : 'payments'}
                </span>
                {activeModal === 'addResident' ? 'Add New Resident' :
                  activeModal === 'addVisitor' ? 'Check-in Visitor Pass' :
                    activeModal === 'raiseComplaint' ? 'Raise Complaint Ticket' :
                      activeModal === 'updateComplaint' ? 'Update Complaint Status' :
                        activeModal === 'assignComplaint' ? 'Assign Ticket' :
                          activeModal === 'recordPayment' ? 'Record Ledger Payment' : 'Generate Maintenance Bill'}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedItemId(null);
                }}
                className="p-1 rounded-full hover:bg-surface-container-highest text-on-surface cursor-pointer"
                title="Close modal"
              >
                <span className="material-symbols-outlined font-bold text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content - Scrollable Form */}
            <div className="p-lg overflow-y-auto flex-1 space-y-md">
              {/* 1. Add Resident Modal Form */}
              {activeModal === 'addResident' && (
                <form onSubmit={handleAddResidentSubmit} className="space-y-md">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Full Resident Name</label>
                    <input
                      type="text"
                      required
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      placeholder="e.g., Arjun Kapoor"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={resPhone}
                        onChange={(e) => setResPhone(e.target.value)}
                        placeholder="e.g., +91 98765 43210"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        value={resEmail}
                        onChange={(e) => setResEmail(e.target.value)}
                        placeholder="arjun.k@example.com"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Wing/Block</label>
                      <select
                        value={resBlock}
                        onChange={(e) => setResBlock(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Block A">Block A</option>
                        <option value="Block B">Block B</option>
                        <option value="Block C">Block C</option>
                        <option value="Block D">Block D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Flat No.</label>
                      <input
                        type="text"
                        required
                        value={resFlat}
                        onChange={(e) => setResFlat(e.target.value)}
                        placeholder="402"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Flat Type</label>
                      <select
                        value={resType}
                        onChange={(e) => setResType(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="4BHK">4BHK</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Initial Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={resStatus === 'Active'}
                          onChange={() => setResStatus('Active')}
                          className="text-primary focus:ring-primary cursor-pointer"
                        />
                        Active member
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={resStatus === 'Inactive'}
                          onChange={() => setResStatus('Inactive')}
                          className="text-primary focus:ring-primary cursor-pointer"
                        />
                        Suspended / Inactive
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2.5 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-background cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer uppercase tracking-wider"
                    >
                      Add Resident
                    </button>
                  </div>
                </form>
              )}

              {/* 2. Add Visitor Modal Form */}
              {activeModal === 'addVisitor' && (
                <form onSubmit={handleAddVisitorSubmit} className="space-y-md">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Visitor Name</label>
                    <input
                      type="text"
                      required
                      value={visName}
                      onChange={(e) => setVisName(e.target.value)}
                      placeholder="e.g., John Delivery"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={visPhone}
                        onChange={(e) => setVisPhone(e.target.value)}
                        placeholder="e.g., +91 88877 66554"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Purpose of Entry</label>
                      <select
                        value={visPurpose}
                        onChange={(e) => setVisPurpose(e.target.value as any)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Guest">Guest</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Delivery">Delivery / Food Courier</option>
                        <option value="Service">Professional Service</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Flat Visited (e.g. B-402)</label>
                      <input
                        type="text"
                        required
                        value={visFlat}
                        onChange={(e) => setVisFlat(e.target.value)}
                        placeholder="A-102"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Context Tagline (Optional)</label>
                      <input
                        type="text"
                        value={visTagline}
                        onChange={(e) => setVisTagline(e.target.value)}
                        placeholder="Order #9822, Verified ID, etc."
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2.5 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-background cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer uppercase tracking-wider"
                    >
                      Check-In Pass
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Raise Complaint Modal Form */}
              {activeModal === 'raiseComplaint' && (
                <form onSubmit={handleRaiseComplaintSubmit} className="space-y-md">
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Resident Name</label>
                      <input
                        type="text"
                        required
                        value={compResidentName}
                        onChange={(e) => setCompResidentName(e.target.value)}
                        placeholder="e.g., Meera Patel"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Flat Location (e.g. 402-B)</label>
                      <input
                        type="text"
                        required
                        value={compFlat}
                        onChange={(e) => setCompFlat(e.target.value)}
                        placeholder="402-B"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Issue Category</label>
                      <select
                        value={compCategory}
                        onChange={(e) => setCompCategory(e.target.value as ComplaintCategory)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Security">Security Patrol</option>
                        <option value="Cleaning">Sanitation / Cleaning</option>
                        <option value="Amenities">Clubhouse / Amenities</option>
                        <option value="General Maintenance">General Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Priority</label>
                      <select
                        value={compPriority}
                        onChange={(e) => setCompPriority(e.target.value as ComplaintPriority)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Issue Description</label>
                    <textarea
                      required
                      rows={3}
                      value={compDesc}
                      onChange={(e) => setCompDesc(e.target.value)}
                      placeholder="Provide clear description of the issue..."
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2.5 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-background cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer uppercase tracking-wider"
                    >
                      Log Complaint
                    </button>
                  </div>
                </form>
              )}

              {/* 4. Update Complaint Status Modal Form */}
              {activeModal === 'updateComplaint' && (
                <form onSubmit={handleUpdateStatusSubmit} className="space-y-md">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1.5">Selected Ticket: {selectedItemId}</p>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Set Status Progress</label>
                    <select
                      value={updateCompStatus}
                      onChange={(e) => setUpdateCompStatus(e.target.value as ComplaintStatus)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Internal Progress Remarks (Optional)</label>
                    <textarea
                      rows={3}
                      value={updateRemarks}
                      onChange={(e) => setUpdateRemarks(e.target.value)}
                      placeholder="e.g., Plumber visited site and replaced gasket."
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        setSelectedItemId(null);
                      }}
                      className="px-5 py-2.5 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-background cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer uppercase tracking-wider"
                    >
                      Update Ticket
                    </button>
                  </div>
                </form>
              )}

              {/* 5. Assign Complaint Modal Form */}
              {activeModal === 'assignComplaint' && (
                <form onSubmit={handleAssignSubmit} className="space-y-md">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1.5">Selected Ticket: {selectedItemId}</p>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Select Professional/Staff</label>
                    <select
                      value={assignStaff}
                      onChange={(e) => setAssignStaff(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="Rajesh Kumar (Electrician)">Rajesh Kumar (Electrician)</option>
                      <option value="Sanjay Singh (Plumber)">Sanjay Singh (Plumber)</option>
                      <option value="Amit Sharma (Security Lead)">Amit Sharma (Security Lead)</option>
                      <option value="Kamlesh Verma (Cleaning Lead)">Kamlesh Verma (Cleaning Lead)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Verify Priority</label>
                    <select
                      value={assignPriority}
                      onChange={(e) => setAssignPriority(e.target.value as ComplaintPriority)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        setSelectedItemId(null);
                      }}
                      className="px-5 py-2.5 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-background cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer uppercase tracking-wider"
                    >
                      Dispatch Staff
                    </button>
                  </div>
                </form>
              )}

              {/* 6. Record Payment Confirmation modal */}
              {activeModal === 'recordPayment' && (
                <form onSubmit={handleRecordPaymentSubmit} className="space-y-md">
                  <div className="bg-surface-container-low p-md rounded-xl text-center space-y-2">
                    <span className="material-symbols-outlined text-secondary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      payments
                    </span>
                    <h4 className="font-sans font-bold text-base text-primary">Confirm Receipt of Payment</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                      Are you sure you want to mark outstanding ledger record #{selectedItemId} as Paid? This will issue an official electronic receipt.
                    </p>
                  </div>

                  <div className="flex gap-sm justify-end pt-md border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        setSelectedItemId(null);
                      }}
                      className="px-5 py-2.5 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-background cursor-pointer"
                    >
                      No, Go Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-secondary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer uppercase tracking-wider"
                    >
                      Yes, Mark Paid
                    </button>
                  </div>
                </form>
              )}

              {/* 7. Generate Bill Modal Form */}
              {activeModal === 'generateBill' && (
                <form onSubmit={handleGenerateBillSubmit} className="space-y-md">
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Wing/Flat Identification</label>
                      <input
                        type="text"
                        required
                        value={billFlat}
                        onChange={(e) => setBillFlat(e.target.value)}
                        placeholder="e.g. A-102"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Resident Name</label>
                      <input
                        type="text"
                        required
                        value={billResident}
                        onChange={(e) => setBillResident(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Billing Amount ($)</label>
                      <input
                        type="number"
                        required
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Billing Period</label>
                      <input
                        type="text"
                        required
                        value={billMonth}
                        onChange={(e) => setBillMonth(e.target.value)}
                        placeholder="Oct 2023"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2.5 border border-outline text-on-surface-variant text-xs font-bold rounded-lg hover:bg-background cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer uppercase tracking-wider animate-pulse-slow"
                    >
                      Issue Invoice
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Premium Logout Confirmation Modal */}
      {showLogoutConfirm && renderLogoutConfirmModal()}

      {/* Syncing Overlay */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span className="text-xs font-bold font-sans">Syncing with backend...</span>
        </div>
      )}
    </div>
  );
}
