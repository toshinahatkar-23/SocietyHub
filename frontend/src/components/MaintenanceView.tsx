import React, { useState } from 'react';
import { MaintenanceBill, BillingStatus } from '../types';
import { formatINR } from '../utils/format';

interface MaintenanceViewProps {
  bills: MaintenanceBill[];
  onTriggerModal: (modal: 'addResident' | 'addVisitor' | 'raiseComplaint' | 'updateComplaint' | 'assignComplaint' | 'recordPayment' | 'generateBill' | null, id?: string) => void;
  searchQuery: string;
}

export default function MaintenanceView({
  bills,
  onTriggerModal,
  searchQuery
}: MaintenanceViewProps) {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [billingMonthFilter, setBillingMonthFilter] = useState('October 2023');

  // Filter maintenance records dynamically
  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.residentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Statuses' || bill.status === statusFilter;

    // Standard filter
    return matchesSearch && matchesStatus;
  });

  // Dynamic calculations based on state values
  const totalOutstanding = bills
    .filter((b) => b.status !== 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPaid = bills
    .filter((b) => b.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const paymentCompliance = (
    (bills.filter((b) => b.status === 'Paid').length / bills.length) * 100
  ).toFixed(1);

  const getStatusBadge = (status: BillingStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100/80">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
            Overdue
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
            Unpaid
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportLedger = () => {
    if (bills.length === 0) {
      alert('No maintenance records available to export.');
      return;
    }
    const headers = ['Bill ID', 'Flat', 'Resident Name', 'Billing Month', 'Amount', 'Due Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...bills.map(b => [
        `"${b.id}"`,
        `"${b.flat}"`,
        `"${b.residentName.replace(/"/g, '""')}"`,
        `"${b.billingMonth}"`,
        b.amount,
        `"${b.dueDate || ''}"`,
        `"${b.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'society_maintenance_ledger.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-10 py-10 max-w-[1536px] mx-auto w-full space-y-10 overflow-y-auto animate-fade-in">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
            <span>Management</span>
            <span className="material-symbols-outlined text-[12px] font-bold">chevron_right</span>
            <span className="text-slate-900 font-extrabold">Maintenance & Billing</span>
          </nav>
          <h2 className="font-sans font-bold text-[32px] text-slate-900 tracking-tight">Society Maintenance</h2>
          <p className="text-slate-500 text-[15px] mt-2 font-medium">
            Manage and track monthly maintenance dues for all society wings.
          </p>
        </div>
        <div className="flex items-center gap-3.5">
          <button
            onClick={handleExportLedger}
            className="flex items-center gap-2 h-11 px-5 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 cursor-pointer border border-slate-200 shadow-none uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Ledger
          </button>
          <button
            onClick={() => onTriggerModal('generateBill')}
            className="flex items-center gap-2 h-11 px-5 bg-slate-950 text-white text-xs font-bold rounded-xl shadow-none hover:bg-slate-800 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Generate Bill
          </button>
        </div>
      </section>

      {/* Stats Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Collection */}
        <div className="bg-white p-8 rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-xl">
              +12% <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </span>
          </div>
          <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Total Collection (OCT)</p>
          <h3 className="font-sans font-bold text-[32px] tracking-tight mt-2 text-slate-900">{formatINR(totalPaid)}</h3>
        </div>

        {/* Outstanding Amount */}
        <div className="bg-white p-8 rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100">
              <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
            </div>
            <span className="text-slate-500 text-xs font-bold bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-xl">82% Pending</span>
          </div>
          <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Outstanding Amount</p>
          <h3 className="font-sans font-bold text-[32px] tracking-tight mt-2 text-slate-900">{formatINR(totalOutstanding)}</h3>
        </div>
      </section>

      {/* Filters & Ledger Table */}
      <section className="bg-white border border-slate-200/80 rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden flex flex-col">
        {/* Table Filters header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[160px]">
              <select
                value={billingMonthFilter}
                onChange={(e) => setBillingMonthFilter(e.target.value)}
                className="appearance-none w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 h-11 text-xs font-bold text-slate-600 outline-none focus:border-slate-300 transition-all cursor-pointer"
              >
                <option value="October 2023">October 2023</option>
                <option value="September 2023">September 2023</option>
                <option value="August 2023">August 2023</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                calendar_month
              </span>
            </div>

            <div className="relative min-w-[160px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 h-11 text-xs font-bold text-slate-600 outline-none focus:border-slate-300 transition-all cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                filter_list
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto mr-2">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1 select-none">Sorted by Date</p>
            <button 
              onClick={() => alert('Sorting algorithm updated')}
              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 border border-slate-200 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">sort</span>
            </button>
          </div>
        </div>

        {/* Ledger Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-250/50 text-[10px] text-slate-450 font-bold uppercase tracking-widest h-[56px]">
              <tr>
                <th className="px-8 py-3.5">Flat Number</th>
                <th className="px-8 py-3.5">Resident</th>
                <th className="px-8 py-3.5">Billing Month</th>
                <th className="px-8 py-3.5">Amount</th>
                <th className="px-8 py-3.5">Due Date</th>
                <th className="px-8 py-3.5 text-center">Status</th>
                <th className="px-8 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[14px] text-slate-700 font-bold">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors h-[76px]">
                    <td className="px-8 py-3.5 text-slate-900">
                      {bill.flat}
                    </td>
                    <td className="px-8 py-3.5">
                      <div className="font-bold text-slate-800">{bill.residentName}</div>
                    </td>
                    <td className="px-8 py-3.5 text-slate-450 font-semibold">
                      {bill.billingMonth}
                    </td>
                    <td className="px-8 py-3.5 font-bold text-slate-800">
                      {formatINR(bill.amount)}
                    </td>
                    <td className="px-8 py-3.5 text-slate-450 font-semibold">
                      {bill.dueDate}
                    </td>
                    <td className="px-8 py-3.5 text-center">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="px-8 py-3.5 text-right">
                      {bill.status === 'Paid' ? (
                        <button
                          onClick={() => alert(`Showing receipt for ${bill.flat}:\nReceipt Reference ID: RCP-9932\nAmount Paid: ₹${bill.amount}\nStatus: Successful`)}
                          className="text-slate-800 hover:text-slate-950 font-bold text-xs cursor-pointer tracking-wider uppercase mr-2"
                        >
                          View Receipt
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onTriggerModal('recordPayment', bill.id)}
                            className="px-4.5 h-9 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-none uppercase tracking-wider"
                          >
                            Record Payment
                          </button>
                          <button 
                            onClick={() => alert(`Ledger Options:\n1. Send mass push warning to ${bill.residentName}\n2. Attach surcharge penalty penalty\n3. Mark legal audit hold`)}
                            className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </div>
                      )}
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
                      <p className="text-slate-800 font-bold text-sm">No ledger entries found</p>
                      <p className="text-slate-450 text-xs mt-1.5 leading-relaxed font-medium">We couldn't find any billing details matching your search query "{searchQuery}". Try selecting another month or status.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger table pagination footer */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-200/85 flex items-center justify-between text-[13px] text-slate-500 font-semibold">
          <p>Showing 1 to {filteredBills.length} of {bills.length} records</p>
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40" disabled>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-9 h-9 rounded-xl bg-slate-950 text-white font-bold text-xs flex items-center justify-center shadow-none">1</button>
            <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center cursor-pointer text-slate-600">2</button>
            <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center cursor-pointer text-slate-600">3</button>
            <span className="px-1 text-slate-400 font-bold select-none">...</span>
            <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold transition-all flex items-center justify-center cursor-pointer text-slate-600">25</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Automate billing bento footer panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configure billing automation */}
        <div className="bg-slate-950 p-8 rounded-[16px] text-white flex flex-col md:flex-row items-center gap-6 overflow-hidden relative shadow-none min-h-[220px] justify-between">
          <div className="z-10 text-center md:text-left flex-1">
            <h4 className="font-sans font-bold text-lg mb-2">Automate Recurring Bills</h4>
            <p className="text-slate-400 font-medium text-[13px] mb-6 max-w-sm leading-relaxed">
              Schedule monthly maintenance generation for all wings automatically on the 1st of every month at 00:00 UTC.
            </p>
            <button
              onClick={() => {
                const configure = window.confirm('Configure automated monthly maintenance generation? This sends automated reminder notifications to email & SMS lists.');
                if (configure) alert('Automation active! Scheduled cron task verified.');
              }}
              className="h-11 px-6 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer uppercase tracking-wider"
            >
              Configure Automation
            </button>
          </div>
          {/* Decorative glowing backdrops */}
          <div className="w-48 h-48 bg-slate-900 rounded-full blur-3xl absolute -right-10 -bottom-10 pointer-events-none"></div>
          <div className="w-32 h-32 bg-slate-900 rounded-full blur-2xl absolute -left-10 -top-10 pointer-events-none"></div>
          <div className="hidden md:flex shrink-0 z-10 select-none">
            <div className="w-28 h-28 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-white text-[56px] animate-spin-slow">settings_suggest</span>
            </div>
          </div>
        </div>

        {/* Reminders widget */}
        <div className="bg-white p-8 rounded-[16px] border border-slate-200/80 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] min-h-[220px]">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              </div>
              <h4 className="font-sans font-bold text-[18px] text-slate-900">Maintenance Reminders</h4>
            </div>
            <p className="text-slate-500 font-semibold text-[13px] leading-relaxed max-w-md mt-2">
              The last mass notification broadcast was sent on Oct 10th. Currently, 85% of total active residents have viewed and recorded their invoice receipts.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => alert('Sending bulk email billing notifications to overdue flat records...')}
              className="flex items-center gap-1.5 px-4 h-11 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Email Reminders
            </button>
            <button
              onClick={() => alert('Broadcasting bulk automated SMS alerts to 14 unpaid accounts...')}
              className="flex items-center gap-1.5 px-4 h-11 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[16px]">sms</span>
              SMS Alerts
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
