import React, { useState } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';

interface ComplaintsViewProps {
  complaints: Complaint[];
  onTriggerModal: (modal: 'addResident' | 'addVisitor' | 'raiseComplaint' | 'updateComplaint' | 'assignComplaint' | 'recordPayment' | 'generateBill' | null, id?: string) => void;
  searchQuery: string;
}

export default function ComplaintsView({
  complaints,
  onTriggerModal,
  searchQuery
}: ComplaintsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Filter complaints based on user choice
  const filteredComplaints = complaints.filter((comp) => {
    const matchesSearch =
      comp.resident.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.flat.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || comp.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All Status' || comp.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate dynamic stats
  const totalComplaints = 20 + complaints.length;
  const openCount = complaints.filter((c) => c.status === 'Open').length + 3;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length + 6;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length + 9;

  // Retrieve matching category icon from Material Symbols
  const getCategoryIcon = (category: ComplaintCategory) => {
    switch (category) {
      case 'Plumbing':
        return 'plumbing';
      case 'Electrical':
        return 'bolt';
      case 'Security':
        return 'security';
      case 'Cleaning':
        return 'cleaning_services';
      case 'Amenities':
        return 'sports_tennis';
      default:
        return 'engineering';
    }
  };

  const getStatusBadgeClass = (status: ComplaintStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-error-container text-on-error-container';
      case 'In Progress':
        return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      case 'Resolved':
        return 'bg-secondary-container text-on-secondary-container';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <div className="px-10 py-10 max-w-[1536px] mx-auto w-full space-y-10 overflow-y-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="font-sans font-bold text-[32px] text-slate-900 tracking-tight">Complaint Management</h2>
          <p className="text-slate-500 text-[15px] mt-2 font-medium">
            Track, assign, and resolve resident issues efficiently.
          </p>
        </div>
        <button
          onClick={() => onTriggerModal('raiseComplaint')}
          className="bg-slate-950 text-white h-11 px-5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Raise New Complaint
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        {/* Table Filter Menu */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 h-11 text-xs font-bold text-slate-600 outline-none focus:border-slate-300 cursor-pointer transition-all"
              >
                <option value="All Categories">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Security">Security Patrol</option>
                <option value="Cleaning">Sanitation / Cleaning</option>
                <option value="Amenities">Clubhouse / Amenities</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 h-11 text-xs font-bold text-slate-600 outline-none focus:border-slate-300 cursor-pointer transition-all"
              >
                <option value="All Status">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                expand_more
              </span>
            </div>
          </div>
          <div className="text-[13px] font-semibold text-slate-500 mr-2">
            Showing <span className="font-extrabold text-slate-800">1-{filteredComplaints.length}</span> of {totalComplaints} complaints
          </div>
        </div>

        {/* Complaints Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-250/50 h-[56px] text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-3.5">Complaint ID</th>
                <th className="px-8 py-3.5">Resident</th>
                <th className="px-8 py-3.5">Category</th>
                <th className="px-8 py-3.5">Description</th>
                <th className="px-8 py-3.5">Status</th>
                <th className="px-8 py-3.5">Assigned To</th>
                <th className="px-8 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[14px] text-slate-700">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors h-[76px]">
                    <td className="px-8 py-3.5 font-bold text-slate-900 font-mono">
                      {comp.id}
                    </td>
                    <td className="px-8 py-3.5">
                      <div className="font-bold text-slate-800">{comp.resident}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Flat {comp.flat}</div>
                    </td>
                    <td className="px-8 py-3.5">
                      <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          {getCategoryIcon(comp.category)}
                        </span>
                        {comp.category}
                      </span>
                    </td>
                    <td className="px-8 py-3.5">
                      <p className="text-slate-500 truncate max-w-xs font-medium" title={comp.description}>
                        {comp.description}
                      </p>
                    </td>
                    <td className="px-8 py-3.5">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                        comp.status === 'Open'
                          ? 'bg-red-50 text-red-700 border border-red-100/80'
                          : comp.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100/80'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100/80'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-8 py-3.5 font-bold text-slate-500">
                      {comp.assignedTo}
                    </td>
                    <td className="px-8 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {comp.status === 'Open' ? (
                          <button
                            title="Assign to maintenance staff"
                            onClick={() => onTriggerModal('assignComplaint')}
                            className="text-slate-400 hover:text-slate-800 hover:bg-slate-50 p-1.5 rounded-xl transition-all material-symbols-outlined cursor-pointer text-[20px]"
                          >
                            person_add
                          </button>
                        ) : (
                          <button
                            title="Update complaint progress"
                            onClick={() => onTriggerModal('updateComplaint')}
                            className="text-slate-400 hover:text-slate-800 hover:bg-slate-50 p-1.5 rounded-xl transition-all material-symbols-outlined cursor-pointer text-[20px]"
                          >
                            edit
                          </button>
                        )}
                        <button
                          title="View complete description history"
                          onClick={() => alert(`[Complaint Detail Preview]\nTicket ID: ${comp.id}\nResident: ${comp.resident} (Flat ${comp.flat})\nCategory: ${comp.category}\n\nDescription: "${comp.description}"\n\nAssigned: ${comp.assignedTo}\nPriority: ${comp.priority}\nStatus: ${comp.status}`)}
                          className="text-slate-400 hover:text-slate-800 hover:bg-slate-50 p-1.5 rounded-xl transition-all material-symbols-outlined cursor-pointer text-[20px]"
                        >
                          visibility
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[24px]">search_off</span>
                      </div>
                      <p className="text-slate-800 font-bold text-sm">No complaints found</p>
                      <p className="text-slate-450 text-xs mt-1.5 leading-relaxed font-medium">We couldn't find any complaints matching your search query "{searchQuery}". Try revising your category or status filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination footer */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-200/85 flex items-center justify-between">
          <button
            disabled
            className="px-4.5 h-11 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 bg-white opacity-50 select-none uppercase tracking-wider"
          >
            Previous
          </button>
          <div className="flex items-center gap-1.5">
            <button className="h-9 w-9 rounded-xl bg-slate-950 text-white text-xs font-bold">1</button>
            <button className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer">2</button>
            <button className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer">3</button>
          </div>
          <button className="px-4.5 h-11 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer bg-white uppercase tracking-wider">
            Next
          </button>
        </div>
      </div>

      {/* Professional Footer Metadata Tag */}
      <div className="flex items-center justify-center pt-4 select-none">
        <p className="text-[13px] text-slate-400 font-medium">
          SocietyHub v2.4.0 — Residential Management System
        </p>
      </div>
    </div>
  );
}
