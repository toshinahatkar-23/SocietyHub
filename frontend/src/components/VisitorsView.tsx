import React, { useState } from 'react';
import { Visitor, VisitorPurpose } from '../types';

interface VisitorsViewProps {
  visitors: Visitor[];
  onMarkExit: (id: string, time: string) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
}

export default function VisitorsView({
  visitors,
  onMarkExit,
  onOpenAddModal,
  searchQuery
}: VisitorsViewProps) {
  // Format current date for welcome banner exactly as seen in design mockup
  const getFormattedDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  // Filter visitors log dynamically
  const filteredVisitors = visitors.filter((vis) => {
    const query = searchQuery.toLowerCase();
    return (
      vis.name.toLowerCase().includes(query) ||
      vis.flat.toLowerCase().includes(query) ||
      vis.purpose.toLowerCase().includes(query) ||
      vis.phone.includes(query)
    );
  });

  // Calculate dynamic mini-bento statistics
  const totalTodayCount = 38 + visitors.length;
  const currentlyOnSiteCount = visitors.filter((v) => v.exitTime === null).length;
  const pendingExitsCount = 3;
  const guestsCount = 10 + visitors.filter((v) => v.purpose === 'Guest').length;

  const handleMarkExitClick = (id: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onMarkExit(id, timeStr);
  };

  return (
    <div className="px-10 py-10 max-w-[1536px] mx-auto w-full space-y-10 overflow-y-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="font-sans font-bold text-[32px] text-slate-900 tracking-tight">Visitor Management</h2>
          <p className="text-slate-500 text-[15px] mt-2 font-medium" id="current-date-display">
            {getFormattedDate()}
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="bg-slate-950 text-white h-11 px-5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Visitorpass
        </button>
      </div>

      {/* Mini Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-8 rounded-[16px] flex flex-col justify-between h-[150px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">TOTAL TODAY</span>
          <span className="text-[36px] font-bold text-slate-900 mt-2 leading-none">{totalTodayCount}</span>
        </div>
        <div className="bg-white border border-slate-200/80 border-l-4 border-l-emerald-500 p-8 rounded-[16px] flex flex-col justify-between h-[150px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">CURRENTLY ON-SITE</span>
          <span className="text-[36px] font-bold text-emerald-600 mt-2 leading-none">
            {currentlyOnSiteCount < 10 ? `0${currentlyOnSiteCount}` : currentlyOnSiteCount}
          </span>
        </div>
        <div className="bg-white border border-slate-200/80 p-8 rounded-[16px] flex flex-col justify-between h-[150px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">PENDING EXITS</span>
          <span className="text-[36px] font-bold text-red-500 mt-2 leading-none">0{pendingExitsCount}</span>
        </div>
      </div>

      {/* Main Logs Table */}
      <section className="bg-white border border-slate-200/80 rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900">Today's Activity Log</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">Registry checklist of incoming security shifts</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => alert('Filtering tools unlocked in production tier.')}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 border border-slate-200 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
            </button>
            <button 
              onClick={() => alert('Exporting visitor entry registry...')}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 border border-slate-200 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold border-b border-slate-250/50 h-[56px] uppercase tracking-widest">
                <th className="px-8 py-3.5">Visitor Name</th>
                <th className="px-4 py-3.5">Mobile Number</th>
                <th className="px-4 py-3.5">Purpose</th>
                <th className="px-4 py-3.5">Flat Visiting</th>
                <th className="px-4 py-3.5 text-center">Entry Time</th>
                <th className="px-4 py-3.5 text-center">Exit Time</th>
                <th className="px-8 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[14px] text-slate-700">
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((vis) => {
                  const isCurrentlyOnSite = vis.exitTime === null;
                  
                  // Setup custom badges corresponding to visitor purpose
                  const getPurposeBadgeColor = (p: VisitorPurpose) => {
                    switch (p) {
                      case 'Guest':
                        return 'bg-blue-50 text-blue-700 border border-blue-100/80';
                      case 'Maintenance':
                        return 'bg-amber-50 text-amber-700 border border-amber-100/80';
                      case 'Delivery':
                        return 'bg-emerald-50 text-emerald-700 border border-emerald-100/80';
                      default:
                        return 'bg-purple-50 text-purple-700 border border-purple-100/80';
                    }
                  };

                  return (
                    <tr key={vis.id} className="hover:bg-slate-50/50 transition-colors h-[76px]">
                      <td className="px-8 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Profile icon matching style */}
                          {vis.purpose === 'Delivery' ? (
                            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100/50 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-emerald-600 text-[18px]">local_shipping</span>
                            </div>
                          ) : vis.purpose === 'Maintenance' ? (
                            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-600 shrink-0">
                              <span className="material-symbols-outlined text-[18px]">build</span>
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {vis.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <div className="font-bold text-slate-800">{vis.name}</div>
                            {vis.tagline && (
                              <div className="text-[10px] font-extrabold text-slate-400 mt-0.5 uppercase tracking-wider">{vis.tagline}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 font-bold">
                        {vis.phone}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getPurposeBadgeColor(vis.purpose)}`}>
                          {vis.purpose}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {vis.flat}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-600">
                        {vis.entryTime}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isCurrentlyOnSite ? (
                          <span className="text-emerald-600 font-bold italic animate-pulse">On-Site</span>
                        ) : (
                          <span className="text-slate-500 font-semibold">{vis.exitTime}</span>
                        )}
                      </td>

                      <td className="px-8 py-3.5 text-right">
                        {isCurrentlyOnSite ? (
                          <button
                            onClick={() => handleMarkExitClick(vis.id)}
                            className="h-9 px-4 bg-slate-950 hover:bg-slate-850 text-white rounded-xl font-bold text-xs shadow-none cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                          >
                            MARK EXIT
                          </button>
                        ) : (
                          <button 
                            onClick={() => alert(`Visitor Details:\nName: ${vis.name}\nPurpose: ${vis.purpose}\nPhone: ${vis.phone}\nFlat: ${vis.flat}\nChecked In: ${vis.entryTime}\nChecked Out: ${vis.exitTime}`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">info</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[24px]">search_off</span>
                      </div>
                      <p className="text-slate-800 font-bold text-sm">No visitor passes found</p>
                      <p className="text-slate-450 text-xs mt-1.5 leading-relaxed">We couldn't find any visitor logs matching your search query "{searchQuery}". Try searching for another name, flat, or purpose.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[13px] text-slate-500 font-medium">
          <span>Showing 1-{filteredVisitors.length} of {totalTodayCount} entries</span>
          <div className="flex gap-1.5">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40" disabled>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Asymmetric quick guide and handover cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Guidelines */}
        <div className="col-span-1 md:col-span-2 bg-white border border-slate-200/80 rounded-[16px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div>
            <h4 className="font-sans font-bold text-[18px] text-slate-900 mb-4">Gate Guidelines</h4>
            <ul className="text-[13px] text-slate-500 space-y-3">
              <li className="flex items-start gap-2 font-semibold">
                <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Always verify identity proof for unknown service/delivery personnel.
              </li>
              <li className="flex items-start gap-2 font-semibold">
                <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Call residents using intercom for guest entry confirmation if they are not pre-approved.
              </li>
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => alert('Opening Standard Operating Procedures Manual...')}
              className="h-10 px-5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer uppercase tracking-wider"
            >
              VIEW SOPs
            </button>
            <button 
              onClick={() => alert('Emergency Fire Desk: +91-555-9911\nSecurity Gate Office: +91-555-0101')}
              className="h-10 px-5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
            >
              EMERGENCY CONTACTS
            </button>
          </div>
          {/* Faded giant symbol */}
          <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[110px] text-slate-250/20 select-none pointer-events-none font-bold">
            security
          </span>
        </div>

        {/* Shift handover pass card */}
        <div className="col-span-1 bg-slate-900 text-white rounded-[16px] p-8 flex flex-col justify-between shadow-none relative overflow-hidden min-h-[190px]">
          <div className="flex justify-between items-start">
            <h4 className="font-sans font-bold text-[18px] text-white">Shift Handover</h4>
            <span className="material-symbols-outlined text-white/80 text-[24px]">swap_horiz</span>
          </div>
          <p className="text-[13px] text-white/80 mt-3 leading-relaxed font-medium">
            Close current active session, log outstanding entries, and prepare the digital transition log summary for the next guard supervisor.
          </p>
          <button 
            onClick={() => {
              const confirmHandover = window.confirm('Are you sure you want to initialize supervisor shift handover? This will generate a temporary passcode.');
              if (confirmHandover) alert('Digital Shift Passcode: SH-9921-A\nLog generated. Have a good evening!');
            }}
            className="mt-6 w-full h-11 bg-white hover:bg-white/95 text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider shadow-none"
          >
            START HANDOVER
          </button>
        </div>
      </div>
    </div>
  );
}
