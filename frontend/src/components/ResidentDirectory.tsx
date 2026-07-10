import React, { useState } from 'react';
import { Table, Trash2, Edit } from 'lucide-react';

interface Resident {
  id: string;
  name: string;
  phone: string;
  email: string;
  block: string;
  flat: string;
  flatType: string;
  status: 'Active' | 'Inactive';
}

interface ResidentsViewProps {
  residents: Resident[];
  onDeleteResident: (id: string) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
}

export default function ResidentsView({
  residents,
  onDeleteResident,
  onOpenAddModal,
  searchQuery
}: ResidentsViewProps) {
  const [blockFilter, setBlockFilter] = useState('All');

  // Filter residents list dynamically
  const filteredResidents = residents.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.phone.includes(searchQuery) ||
      res.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBlock = blockFilter === 'All' || res.block === blockFilter;

    return matchesSearch && matchesBlock;
  });

  // Assign initials & background colors to avatars as shown in the layout spec
  const getAvatarStyle = (name: string, index: number) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const colors = [
      'bg-primary-fixed-dim text-primary',
      'bg-secondary-fixed text-secondary',
      'bg-tertiary-fixed text-tertiary',
      'bg-inverse-primary text-primary',
    ];
    const colorClass = colors[index % colors.length];

    return { initials, colorClass };
  };

  return (
    <div className="px-10 py-10 max-w-[1536px] mx-auto w-full space-y-10 overflow-y-auto animate-fade-in">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="font-sans font-bold text-[32px] text-slate-900 tracking-tight">Resident Directory</h2>
          <p className="text-slate-500 text-[15px] mt-2 font-medium">
            Manage and monitor all {1244 + residents.length} active society members.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="relative">
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 h-11 text-xs font-bold text-slate-600 outline-none focus:border-slate-300 cursor-pointer shadow-none transition-all"
            >
              <option value="All">All Blocks</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-slate-950 text-white h-11 px-5 rounded-xl text-xs shadow-none hover:bg-slate-800 transition-all cursor-pointer font-bold active:scale-95 uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Resident
          </button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-250/50 h-[56px]">
                <th className="px-8 py-3.5 font-bold text-[10px] text-slate-450 uppercase tracking-widest">
                  Resident Name
                </th>
                <th className="px-8 py-3.5 font-bold text-[10px] text-slate-450 uppercase tracking-widest">
                  Contact Information
                </th>
                <th className="px-8 py-3.5 font-bold text-[10px] text-slate-450 uppercase tracking-widest">
                  Block & Flat
                </th>
                <th className="px-8 py-3.5 font-bold text-[10px] text-slate-450 uppercase tracking-widest">
                  Flat Type
                </th>
                <th className="px-8 py-3.5 font-bold text-[10px] text-slate-450 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-3.5 font-bold text-[10px] text-slate-450 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length > 0 ? (
                filteredResidents.map((res, index) => {
                  const { initials, colorClass } = getAvatarStyle(res.name, index);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group h-[76px]">
                      <td className="px-8 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs shrink-0 shadow-none`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-slate-800">{res.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {res.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-3.5 text-[14px] text-slate-600">
                        <p className="font-semibold">{res.phone}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{res.email}</p>
                      </td>
                      <td className="px-8 py-3.5 text-[14px] text-slate-700 font-bold">
                        {res.block} — {res.flat}
                      </td>
                      <td className="px-8 py-3.5">
                        <span className="bg-slate-100 border border-slate-200/40 px-2.5 py-1 rounded text-[11px] font-bold text-slate-600">
                          {res.flatType}
                        </span>
                      </td>
                      <td className="px-8 py-3.5">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                            res.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80'
                              : 'bg-red-50 text-red-700 border border-red-100/80'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="px-8 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            title="Edit details"
                            className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                            onClick={() => alert(`Edit operation details for ${res.name} (ID: ${res.id})`)}
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            title="Delete resident"
                            onClick={() => onDeleteResident(res.id)}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[24px]">search_off</span>
                      </div>
                      <p className="text-slate-800 font-bold text-sm">No residents found</p>
                      <p className="text-slate-450 text-xs mt-1.5 leading-relaxed">We couldn't find any residents matching your search query "{searchQuery}". Try revising your keywords or selecting another block.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-200/85 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-500 font-medium">
            Showing 1-{filteredResidents.length} of {filteredResidents.length} residents
          </p>
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-950 text-white font-bold text-xs">
              1
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-xs">
              2
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-xs">
              3
            </button>
            <span className="text-slate-400 text-xs font-bold px-1 select-none">...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-xs">
              48
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
