import React, { useState } from 'react';
import { RegistrationRequest } from '../types';

interface RegistrationRequestsViewProps {
  requests: RegistrationRequest[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  searchQuery: string;
}

export default function RegistrationRequestsView({
  requests,
  onApprove,
  onReject,
  searchQuery
}: RegistrationRequestsViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  
  // Confirmation states
  const [approveConfirmTarget, setApproveConfirmTarget] = useState<RegistrationRequest | null>(null);
  const [rejectConfirmTarget, setRejectConfirmTarget] = useState<RegistrationRequest | null>(null);
  
  // Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Filter requests dynamically
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.phone.includes(searchQuery) ||
      req.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.flat_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApproveConfirm = async () => {
    if (!approveConfirmTarget) return;
    setIsSubmitting(true);
    try {
      await onApprove(approveConfirmTarget.request_id);
      showToastMsg(`Request for "${approveConfirmTarget.full_name}" has been approved.`, 'success');
      // If currently displaying in detail panel, update it
      if (selectedRequest?.request_id === approveConfirmTarget.request_id) {
        setSelectedRequest({ ...selectedRequest, status: 'Approved' });
      }
      setApproveConfirmTarget(null);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to approve request.';
      showToastMsg(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectConfirmTarget) return;
    setIsSubmitting(true);
    try {
      await onReject(rejectConfirmTarget.request_id);
      showToastMsg(`Request for "${rejectConfirmTarget.full_name}" has been rejected.`, 'success');
      // If currently displaying in detail panel, update it
      if (selectedRequest?.request_id === rejectConfirmTarget.request_id) {
        setSelectedRequest({ ...selectedRequest, status: 'Rejected' });
      }
      setRejectConfirmTarget(null);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to reject request.';
      showToastMsg(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/60 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100/60 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100/60 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="px-10 py-10 max-w-[1536px] mx-auto w-full space-y-10 overflow-y-auto animate-fade-in relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3.5 px-6 py-4 rounded-2xl shadow-xl border animate-fade-in-up transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined font-bold text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="font-sans font-bold text-[32px] text-slate-900 tracking-tight">Registration Requests</h2>
          <p className="text-slate-500 text-[15px] mt-2 font-medium">
            Review and approve pending resident requests for portal access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 h-11 text-xs font-bold text-slate-600 outline-none focus:border-slate-300 cursor-pointer shadow-none transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Approved">Approved Only</option>
              <option value="Rejected">Rejected Only</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Request ID</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Mobile Number</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Unit / Flat</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Type</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Submitted Date</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status</th>
                <th className="py-4 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, idx) => (
                  <tr 
                    key={req.request_id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-4.5 px-6 text-xs font-bold text-slate-500">#{req.request_id}</td>
                    <td className="py-4.5 px-6">
                      <div className="text-xs font-bold text-slate-800">{req.full_name}</div>
                    </td>
                    <td className="py-4.5 px-6 text-xs font-semibold text-slate-500">{req.email}</td>
                    <td className="py-4.5 px-6 text-xs font-semibold text-slate-500">{req.phone}</td>
                    <td className="py-4.5 px-6">
                      <div className="text-xs font-bold text-slate-700">{req.block} • {req.flat_number}</div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {req.flat_type}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-xs font-semibold text-slate-400">{req.submitted_at}</td>
                    <td className="py-4.5 px-6">{getStatusBadge(req.status)}</td>
                    <td className="py-4.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      {req.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setApproveConfirmTarget(req)}
                            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectConfirmTarget(req)}
                            className="h-8 px-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 select-none uppercase tracking-wide mr-2">No Action</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center mx-auto text-slate-400">
                        <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
                      </div>
                      <p className="text-slate-800 font-bold text-sm">No registration requests found</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        We couldn't find any requests matching your current status filter or search parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Count Footer */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 select-none">
        <span>Showing {filteredRequests.length} of {requests.length} requests</span>
      </div>

      {/* Sidebar Details Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in bg-slate-900/40 backdrop-blur-xs" onClick={() => setSelectedRequest(null)}>
          <div 
            className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col p-8 space-y-6 overflow-y-auto animate-fade-in-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-900">Request Details</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Request ID: #{selectedRequest.request_id}</span>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label>
                <div className="text-sm font-bold text-slate-800">{selectedRequest.full_name}</div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                <div className="text-sm font-semibold text-slate-600 break-all">{selectedRequest.email}</div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mobile Number</label>
                <div className="text-sm font-semibold text-slate-600">{selectedRequest.phone}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Block / Unit</label>
                  <div className="text-sm font-bold text-slate-700">{selectedRequest.block} • {selectedRequest.flat_number}</div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Unit Type</label>
                  <div className="text-sm font-bold text-slate-700">{selectedRequest.flat_type}</div>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Submitted Date</label>
                <div className="text-sm font-semibold text-slate-500">{selectedRequest.submitted_at}</div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Status</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Identity Verification Document</label>
                <div className="mt-1 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="material-symbols-outlined text-slate-400 text-[24px]">draft</span>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-slate-700 leading-tight">id_proof_document.pdf</div>
                    <div className="text-[9px] text-slate-400 font-semibold leading-relaxed">2.4 MB • Verification Placeholder</div>
                  </div>
                  <span className="text-[9px] bg-slate-200 text-slate-600 font-extrabold uppercase px-1.5 py-0.5 rounded select-none">Optional</span>
                </div>
              </div>
            </div>

            {selectedRequest.status === 'Pending' && (
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setApproveConfirmTarget(selectedRequest)}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Approve Request
                </button>
                <button
                  onClick={() => setRejectConfirmTarget(selectedRequest)}
                  className="flex-1 h-11 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Reject Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approveConfirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h3 className="font-sans font-extrabold text-lg text-slate-900">Approve Application</h3>
            </div>

            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Are you sure you want to approve the resident portal application for this applicant? This will immediately register their details into the system database.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Applicant:</span>
                <span className="text-slate-800 font-bold">{approveConfirmTarget.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Email Address:</span>
                <span className="text-slate-600 font-semibold">{approveConfirmTarget.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Unit / Flat:</span>
                <span className="text-slate-800 font-bold">{approveConfirmTarget.block} • {approveConfirmTarget.flat_number}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setApproveConfirmTarget(null)}
                className="h-10 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApproveConfirm}
                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-80"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectConfirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                <span className="material-symbols-outlined text-[20px]">cancel</span>
              </div>
              <h3 className="font-sans font-extrabold text-lg text-slate-900">Reject Application</h3>
            </div>

            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Are you sure you want to reject the registration request for <strong className="text-slate-800 font-bold">"{rejectConfirmTarget.full_name}"</strong>? Rejected applicants will not be able to log in or register a new request using this email.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setRejectConfirmTarget(null)}
                className="h-10 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleRejectConfirm}
                className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-80"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
