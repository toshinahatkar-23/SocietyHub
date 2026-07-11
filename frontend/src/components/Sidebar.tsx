import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText, 
  Wrench, 
  Megaphone, 
  User, 
  Settings, 
  LogOut, 
  ArrowLeftRight,
  Shield,
  ShieldAlert,
  ClipboardList,
  Building,
  UserPlus
} from 'lucide-react';

const iconMap = {
  dashboard: LayoutDashboard,
  residents: Users,
  visitors: UserCheck,
  complaints: ClipboardList,
  maintenance: Wrench,
  notices: Megaphone,
  profile: User,
  settings: Settings,
  'visitor-log': FileText,
  'gate-entry': ArrowLeftRight,
  'gate-exit': ArrowLeftRight,
  emergency: ShieldAlert,
  requests: UserPlus,
};

interface SidebarProps {
  portal: 'admin' | 'resident' | 'security';
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
}

export default function Sidebar({ portal, activeTab, setActiveTab, onLogout }: SidebarProps) {
  // Define menu items based on portal
  const menuItems = React.useMemo(() => {
    switch (portal) {
      case 'resident':
        return [
          { name: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { name: 'maintenance', label: 'Maintenance Bills', icon: 'visitor-log' },
          { name: 'complaints', label: 'Helpdesk & Complaints', icon: 'complaints' },
          { name: 'visitors', label: 'Guest Pre-Clearance', icon: 'visitors' },
          { name: 'notices', label: 'Official Notices', icon: 'notices' },
          { name: 'profile', label: 'Profile & Settings', icon: 'profile' }
        ];
      case 'security':
        return [
          { name: 'dashboard', label: 'Security Overview', icon: 'dashboard' },
          { name: 'visitor-log', label: 'Visitor Register', icon: 'visitor-log' },
          { name: 'gate-entry', label: 'Gate Entry Clearance', icon: 'gate-entry' },
          { name: 'gate-exit', label: 'Gate Exit Clearance', icon: 'gate-exit' },
          { name: 'emergency', label: 'Crisis & Emergencies', icon: 'emergency' },
          { name: 'profile', label: 'Profile & Settings', icon: 'profile' }
        ];
      case 'admin':
      default:
        return [
          { name: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { name: 'residents', label: 'Residents Directory', icon: 'residents' },
          { name: 'requests', label: 'Registration Requests', icon: 'requests' },
          { name: 'visitors', label: 'Visitors Register', icon: 'visitors' },
          { name: 'complaints', label: 'Complaints & Tickets', icon: 'complaints' },
          { name: 'maintenance', label: 'Maintenance Billing', icon: 'maintenance' },
          { name: 'notices', label: 'Official Notices', icon: 'notices' },
          { name: 'profile', label: 'Profile & Settings', icon: 'profile' },
        ];
    }
  }, [portal]);

  // Styling based on portal
  const config = React.useMemo(() => {
    switch (portal) {
      case 'resident':
        return {
          bg: 'bg-[#0F766E]',
          accentText: 'text-[#14B8A6]',
          activeItemBg: 'bg-white/10 text-[#14B8A6] font-bold border-l-4 border-[#14B8A6]',
          hoverItemBg: 'hover:bg-white/5 hover:text-white',
          subtitle: 'Resident Portal',
          badgeColor: 'bg-[#14B8A6]/20 text-[#14B8A6]'
        };
      case 'security':
        return {
          bg: 'bg-[#0F172A]',
          accentText: 'text-[#06B6D4]',
          activeItemBg: 'bg-white/10 text-[#06B6D4] font-bold border-l-4 border-[#06B6D4]',
          hoverItemBg: 'hover:bg-white/5 hover:text-white',
          subtitle: 'Security Portal',
          badgeColor: 'bg-[#06B6D4]/20 text-[#06B6D4]'
        };
      case 'admin':
      default:
        return {
          bg: 'bg-[#123B66]',
          accentText: 'text-[#2563EB]',
          activeItemBg: 'bg-white/10 text-white font-bold border-l-4 border-[#2563EB]',
          hoverItemBg: 'hover:bg-white/5 hover:text-white',
          subtitle: 'Admin Portal',
          badgeColor: 'bg-[#2563EB]/20 text-white'
        };
    }
  }, [portal]);

  return (
    <aside className={`w-[290px] h-screen sticky top-0 left-0 ${config.bg} text-slate-100 flex flex-col py-8 z-50 shrink-0 hidden lg:flex border-r border-black/10 shadow-xl`}>
      {/* Brand Header */}
      <div className="px-7 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-sans text-[22px] font-extrabold text-white tracking-tight leading-none">SocietyHub</h1>
            <p className="text-[11px] text-slate-300 font-medium tracking-wider uppercase mt-1">
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.name;
          const IconComponent = iconMap[item.icon as keyof typeof iconMap] || LayoutDashboard;
          return (
            <button
              id={`nav-item-${item.name}`}
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3.5 px-4 h-[46px] cursor-pointer rounded-xl transition-all duration-150 text-left ${
                isActive
                  ? config.activeItemBg
                  : `text-slate-300 ${config.hoverItemBg} font-medium`
              }`}
            >
              <IconComponent className={`w-[20px] h-[20px] shrink-0 ${isActive ? '' : 'text-slate-400'}`} />
              <span className="text-[14px] truncate tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer details & actions */}
      <div className="mt-auto px-4 pt-4 border-t border-white/10 space-y-1.5">
        {/* Logout Button */}
        <button
          id="nav-logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 h-[46px] cursor-pointer rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold transition-colors text-left"
        >
          <LogOut className="w-[20px] h-[20px] shrink-0 text-red-400" />
          <span className="text-[14px] tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
}
