import React from 'react';
import { TabName } from '../types';

interface DashboardViewProps {
  onTriggerModal: (modal: 'addResident' | 'addVisitor' | 'raiseComplaint' | 'updateComplaint' | 'assignComplaint' | 'recordPayment' | 'generateBill' | null) => void;
  setActiveTab: (tab: TabName) => void;
  residentCount: number;
  visitorCount: number;
  openComplaintCount: number;
  totalCollection: string;
}

export default function DashboardOverview({
  onTriggerModal,
  setActiveTab,
  residentCount,
  visitorCount,
  openComplaintCount,
  totalCollection
}: DashboardViewProps) {
  // Mock activity log history that matches designs
  const [activities, setActivities] = React.useState([
    { id: 1, type: 'resident', text: 'Resident added: John Doe', detail: 'Apt 402-B • 10 mins ago', icon: 'person_add', color: 'bg-emerald-50 border border-emerald-100 text-emerald-600' },
    { id: 2, type: 'payment', text: 'Payment recorded for Flat 302', detail: 'Maintenance Fee • 2 hours ago', icon: 'payments', color: 'bg-blue-50 border border-blue-100 text-blue-600' },
    { id: 3, type: 'notice', text: 'New Notice: Annual General Meeting', detail: 'Public Broadcast • 5 hours ago', icon: 'campaign', color: 'bg-purple-50 border border-purple-100 text-purple-600' },
    { id: 4, type: 'maintenance', text: 'Maintenance Ticket #882 Resolved', detail: 'Elevator Shaft 2 • Yesterday', icon: 'build', color: 'bg-slate-100 border border-slate-200 text-slate-600' }
  ]);

  const clearLogs = () => {
    setActivities([]);
  };

  return (
    <div className="px-10 py-10 max-w-[1536px] mx-auto w-full space-y-10 overflow-y-auto animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="font-sans font-bold text-[32px] text-slate-900 tracking-tight" id="dashboard-title">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 text-[15px] mt-2 font-medium">
            Good morning, Administrator. Here is a high-level summary of your residential community index.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <button
            onClick={() => setActiveTab('notices')}
            className="flex items-center gap-2 h-11 px-5 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-none uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            Post Notice
          </button>
          <button
            onClick={() => onTriggerModal('generateBill')}
            className="flex items-center gap-2 h-11 px-5 bg-slate-950 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-none uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Generate Bill
          </button>
        </div>
      </div>

      {/* Bento Grid - Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Residents Card */}
        <div 
          onClick={() => setActiveTab('residents')}
          className="bg-white p-8 rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-slate-300 hover:shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between h-[175px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Total Residents</span>
            <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">{residentCount}</div>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-bold text-xs">
              <span className="material-symbols-outlined text-[14px] font-bold">trending_up</span>
              <span>+4% this month</span>
            </div>
          </div>
        </div>

        {/* Visitors Today Card */}
        <div 
          onClick={() => setActiveTab('visitors')}
          className="bg-white p-8 rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-slate-300 hover:shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between h-[175px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Visitors Today</span>
            <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">{visitorCount}</div>
            <div className="flex items-center gap-2 mt-2 text-slate-500 font-bold text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Check-ins active</span>
            </div>
          </div>
        </div>

        {/* Open Complaints Card */}
        <div 
          onClick={() => setActiveTab('complaints')}
          className="bg-white p-8 rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-slate-300 hover:shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between h-[175px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Open Complaints</span>
            <div className="w-10 h-10 bg-red-50 rounded-xl border border-red-100/30 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">report_problem</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">
              {openComplaintCount < 10 ? `0${openComplaintCount}` : openComplaintCount}
            </div>
            <div className="flex items-center gap-1 mt-2 text-red-600 font-bold text-xs">
              <span>High priority: 2 cases</span>
            </div>
          </div>
        </div>

        {/* Total Collection Card */}
        <div 
          onClick={() => setActiveTab('maintenance')}
          className="bg-white p-8 rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:border-slate-300 hover:shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between h-[175px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Total Collection</span>
            <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">{totalCollection}</div>
            <div className="flex items-center gap-1.5 mt-2 text-emerald-600 font-bold text-xs">
              <span className="material-symbols-outlined text-[14px] font-bold">check_circle</span>
              <span>85% Collected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Body: Trends & Timeline Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white p-8 rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col h-full min-h-[480px] justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-sans font-bold text-[18px] text-slate-900 tracking-tight">
                    Monthly Collection Trends
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Comparison of ledger payments received</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl py-2 px-4.5 outline-none focus:border-slate-300 transition-all cursor-pointer">
                  <option>Last 6 Months</option>
                  <option>Current Year</option>
                </select>
              </div>

              {/* Simulated interactive chart bars */}
              <div className="flex items-end justify-between gap-4 px-2 pb-6 h-56 border-b border-slate-100">
                <div className="flex-1 bg-slate-50 rounded-t-lg relative group h-[40%] hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="absolute inset-x-0 bottom-0 bg-slate-200 group-hover:bg-primary/35 rounded-t-lg h-full transition-all"></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$18.1K</div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold tracking-wider">JAN</span>
                </div>
                <div className="flex-1 bg-slate-50 rounded-t-lg relative group h-[60%] hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="absolute inset-x-0 bottom-0 bg-slate-200 group-hover:bg-primary/35 rounded-t-lg h-full transition-all"></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$27.2K</div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold tracking-wider">FEB</span>
                </div>
                <div className="flex-1 bg-slate-50 rounded-t-lg relative group h-[55%] hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="absolute inset-x-0 bottom-0 bg-slate-200 group-hover:bg-primary/35 rounded-t-lg h-full transition-all"></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$24.8K</div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold tracking-wider">MAR</span>
                </div>
                <div className="flex-1 bg-slate-50 rounded-t-lg relative group h-[75%] hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="absolute inset-x-0 bottom-0 bg-slate-200 group-hover:bg-primary/35 rounded-t-lg h-full transition-all"></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$33.9K</div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold tracking-wider">APR</span>
                </div>
                <div className="flex-1 bg-slate-50 rounded-t-lg relative group h-[85%] hover:bg-slate-100 transition-all cursor-pointer">
                  <div className="absolute inset-x-0 bottom-0 bg-slate-300 group-hover:bg-primary/50 rounded-t-lg h-full transition-all"></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$38.5K</div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold tracking-wider">MAY</span>
                </div>
                <div className="flex-1 bg-slate-100 rounded-t-lg relative group h-[95%] hover:bg-slate-200 transition-all cursor-pointer">
                  <div className="absolute inset-x-0 bottom-0 bg-primary/85 rounded-t-lg h-full transition-all"></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$45.2K</div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-primary font-bold tracking-wider">JUN</span>
                </div>
              </div>
            </div>

            {/* Trend Averages Footer */}
            <div className="pt-6 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg. Receipt</p>
                <p className="text-[20px] font-bold text-slate-800 mt-1.5">$346</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Outstanding</p>
                <p className="text-[20px] font-bold text-red-600 mt-1.5">$1,200</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Compliance Rate</p>
                <p className="text-[20px] font-bold text-emerald-600 mt-1.5">98%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline Widget */}
        <div className="flex flex-col">
          <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col h-full min-h-[480px] justify-between overflow-hidden">
            <div>
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-[18px] text-slate-900 tracking-tight">Recent Activity</h3>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Real-time action logs</p>
                </div>
                <button 
                  onClick={() => setActiveTab('residents')}
                  className="text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[300px] overflow-y-auto">
                {activities.length > 0 ? (
                  activities.map((item, index) => (
                    <div key={item.id} className="flex gap-4 relative">
                      {/* Vertical line */}
                      {index < activities.length - 1 && (
                        <div className="absolute left-[13px] top-6 bottom-[-24px] w-[1px] bg-slate-100"></div>
                      )}
                      <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center shrink-0 z-10 shadow-none`}>
                        <span className="material-symbols-outlined text-[13px] font-bold">
                          {item.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] text-slate-850 font-bold leading-snug">{item.text}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-semibold">{item.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-[200px]">
                    <span className="material-symbols-outlined text-[36px] text-slate-200 mb-2">history</span>
                    <p className="text-xs text-slate-400 font-bold">Activity history cleared.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
              <button
                onClick={clearLogs}
                disabled={activities.length === 0}
                className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-none uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Log History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
