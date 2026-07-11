import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Menu, 
  X, 
  AlertTriangle, 
  Info, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface HeaderProps {
  portal: 'admin' | 'resident' | 'security';
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userName: string;
  userRole: string;
  onMobileMenuToggle: () => void;
}

export default function Header({
  portal,
  activeTab,
  searchQuery,
  setSearchQuery,
  userName,
  userRole,
  onMobileMenuToggle
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Dynamic search placeholder depending on current screen context
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Search records & activities...';
      case 'residents':
        return 'Search residents by name, flat, block...';
      case 'visitors':
        return 'Search visitors by name, contact, flat...';
      case 'complaints':
        return 'Search tickets, categories, residents...';
      case 'maintenance':
        return 'Search maintenance invoices, flat...';
      case 'notices':
        return 'Search notice titles & announcements...';
      case 'profile':
        return 'Search settings & preferences...';
      case 'requests':
        return 'Search requests by name, email, flat...';
      default:
        return 'Search records, residents...';
    }
  };

  // Human-readable breadcrumbs mapping
  const getBreadcrumb = () => {
    const portalName = portal.charAt(0).toUpperCase() + portal.slice(1);
    let viewName = 'Overview';
    
    switch (activeTab) {
      case 'dashboard':
        viewName = portal === 'security' ? 'Security Operations' : 'Overview Dashboard';
        break;
      case 'residents':
        viewName = 'Residents Directory';
        break;
      case 'requests':
        viewName = 'Registration Requests';
        break;
      case 'visitors':
        viewName = portal === 'resident' ? 'Guest Pre-Clearance' : 'Visitors Register';
        break;
      case 'complaints':
        viewName = portal === 'resident' ? 'Helpdesk & Complaints' : 'Complaints & Tickets';
        break;
      case 'maintenance':
        viewName = portal === 'resident' ? 'Maintenance Ledger' : 'Maintenance Billing';
        break;
      case 'notices':
        viewName = 'Official Notices';
        break;
      case 'profile':
        viewName = 'Profile & Preferences';
        break;
      case 'visitor-log':
        viewName = 'Visitor Register';
        break;
      case 'gate-entry':
        viewName = 'Gate Entry Clearance';
        break;
      case 'gate-exit':
        viewName = 'Gate Exit Clearance';
        break;
      case 'emergency':
        viewName = 'Crisis & Emergencies';
        break;
    }

    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="hover:text-slate-800 cursor-pointer transition-colors">SocietyHub</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-800 cursor-pointer transition-colors">{portalName}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-bold">{viewName}</span>
      </div>
    );
  };

  const avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhk0-2aUS3X4zRm_-gqtJaMFs2SsdQeN4g6nSW7LmdQAeQFBzxJAKeERyeAAWm1Vk7XUFDTFWnGqMFxDhizhDr-tIWC63wVb8xwTlCfVDG9g82sMEdIjXmRjXya6_MLgvqjN47Z9ckuhcK8fT3W4kNnUADmawzkVaBdLvu6Ltg5-ohxYdk83mYylq_IqSjwKUb59uB-NzPYkVBon0YdSHh6gAMXv51tPbzIchcuhLK8xv9GsR9TMRrrBVElaq7iX-Lem0JqrT5OFsc';

  const mockAlerts = [
    { id: 1, text: 'Emergency: Water line maintenance in 15 mins', time: 'Just now', urgent: true },
    { id: 2, text: 'New ledger bill payment received for Block B', time: '2 hours ago', urgent: false },
    { id: 3, text: 'New helpdesk complaint registered', time: '4 hours ago', urgent: false },
  ];

  // Colors mapping for portals
  const portalStyles = {
    admin: 'text-admin-primary bg-admin-primary/5 border-admin-accent/20',
    resident: 'text-resident-primary bg-resident-primary/5 border-resident-accent/20',
    security: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20'
  };

  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-white border-b border-slate-200/80 flex justify-between items-center px-6 lg:px-8 shrink-0 shadow-sm">
      {/* Left side: Hamburger on mobile, Breadcrumb & Search Bar on Desktop */}
      <div className="flex items-center gap-6 flex-1">
        {/* Mobile Sidebar Hamburger Trigger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-slate-200/50"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs for desktop */}
        <div className="hidden md:block select-none">
          {getBreadcrumb()}
        </div>

        {/* Smart search input */}
        <div className="hidden xl:flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 h-[42px] w-full max-w-sm focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-400 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-semibold w-full ml-2 outline-none placeholder:text-slate-400"
            placeholder={getSearchPlaceholder()}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right side: Actions, Badges & Profile */}
      <div className="flex items-center gap-4">
        {/* Portal status / role badge */}
        <div className="hidden sm:flex flex-col items-end">
          <span className={`text-[11px] font-bold border px-3 py-1 rounded-full uppercase tracking-wider ${portalStyles[portal]}`}>
            {userRole}
          </span>
        </div>

        {/* Actions panel */}
        <div className="flex items-center gap-1.5 relative">
          {/* Notifications Trigger */}
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelp(false);
            }}
            className={`hover:bg-slate-100 rounded-xl p-2 text-slate-500 relative transition-all cursor-pointer border border-transparent ${showNotifications ? 'bg-slate-100 text-slate-900 border-slate-200' : ''}`}
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
          </button>

          {/* Help & info */}
          <button
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
            }}
            className={`hover:bg-slate-100 rounded-xl p-2 text-slate-500 transition-all cursor-pointer border border-transparent ${showHelp ? 'bg-slate-100 text-slate-900 border-slate-200' : ''}`}
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl py-3.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[14px] text-slate-800 font-bold">Recent Alerts</span>
                <span className="text-[10px] font-bold uppercase bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {mockAlerts.map(alert => (
                  <div key={alert.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-2.5">
                    {alert.urgent ? (
                      <ShieldAlert className="w-[18px] h-[18px] text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-[18px] h-[18px] text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-[13px] text-slate-700 font-semibold leading-normal">{alert.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Dialog Dropdown */}
          {showHelp && (
            <div className="absolute right-0 top-12 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl p-4.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <h4 className="text-[14px] text-slate-800 font-bold mb-2">SocietyHub Guide</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                Need assistance? Access SOP templates, register offline visitor passes, track dues, or generate automated recurring invoices on the 1st of every month.
              </p>
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-900 font-bold">
                <span>Support Desk: +91-555-0101</span>
              </div>
            </div>
          )}
        </div>

        {/* Separator line */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Manager User profile widget */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] text-slate-800 font-extrabold leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Authorized Station</p>
          </div>
          {/* Avatar Picture */}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm">
            <img
              className="w-full h-full object-cover select-none"
              src={avatarUrl}
              alt="Profile Headshot"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
