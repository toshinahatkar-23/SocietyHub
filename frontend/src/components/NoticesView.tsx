import React, { useState } from 'react';
import { Notice, NoticeType } from '../types';

interface NoticesViewProps {
  notices: Notice[];
  onToggleBookmark: (id: string) => void;
  onAddNotice: (notice: Omit<Notice, 'id' | 'isBookmarked'>) => void;
  searchQuery: string;
}

export default function NoticesView({
  notices,
  onToggleBookmark,
  onAddNotice,
  searchQuery
}: NoticesViewProps) {
  const [activeType, setActiveType] = useState<NoticeType | 'All'>('All');
  const [tickerDismissed, setTickerDismissed] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeType, setNewNoticeType] = useState<NoticeType>('General');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter notices based on searches and active tabs
  const filteredNotices = notices.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = activeType === 'All' || note.type === activeType;

    return matchesSearch && matchesType;
  });

  const getTypeBadgeClass = (type: NoticeType) => {
    switch (type) {
      case 'Emergency':
        return 'bg-error-container text-on-error-container border border-error/10';
      case 'Maintenance':
        return 'bg-primary-fixed text-primary border border-primary/20';
      case 'Event':
        return 'bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary/20';
      default:
        return 'bg-surface-container-high text-on-surface border border-outline-variant';
    }
  };

  const handleShare = (title: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/notice?share=${encodeURIComponent(title)}`);
    alert(`Public announcement link copied to clipboard!\n"${title}"`);
  };

  const handleCreateNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;

    onAddNotice({
      title: newNoticeTitle,
      content: newNoticeContent,
      type: newNoticeType,
      postedAt: 'Just now',
      author: 'Admin Office',
      attachments: undefined
    });

    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeType('General');
    setShowCreateForm(false);
  };

  return (
    <div className="px-10 py-10 max-w-[1536px] mx-auto w-full space-y-10 overflow-y-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="font-sans font-bold text-[32px] text-slate-900 tracking-tight">Society Notice Board</h2>
          <p className="text-slate-500 text-[15px] mt-2 font-medium">
            Stay updated with the latest official announcements.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-slate-950 text-white h-11 px-5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          {showCreateForm ? 'Close Editor' : 'Create Announcement'}
        </button>
      </div>

      {/* Inline Create notice drawer */}
      {showCreateForm && (
        <form onSubmit={handleCreateNoticeSubmit} className="bg-white border border-slate-200 p-8 rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-6 animate-in zoom-in-95 duration-200">
          <h3 className="font-sans font-bold text-[18px] text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
            Write Notice Broadcast
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Notice Title</label>
              <input
                type="text"
                required
                value={newNoticeTitle}
                onChange={(e) => setNewNoticeTitle(e.target.value)}
                placeholder="e.g., Pest Control Schedule - Block B"
                className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-semibold outline-none focus:border-slate-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Target Type</label>
              <div className="relative">
                <select
                  value={newNoticeType}
                  onChange={(e) => setNewNoticeType(e.target.value as NoticeType)}
                  className="appearance-none w-full h-11 bg-white border border-slate-200 rounded-xl pl-4 pr-10 text-xs font-bold text-slate-600 outline-none focus:border-slate-300 cursor-pointer transition-all"
                >
                  <option value="General">General</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Event">Community Event</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Detailed Message Content</label>
            <textarea
              required
              rows={4}
              value={newNoticeContent}
              onChange={(e) => setNewNoticeContent(e.target.value)}
              placeholder="Provide clear descriptions, timings, locations, and any guidelines..."
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-semibold outline-none focus:border-slate-300 transition-all"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="h-11 px-5 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-5 bg-slate-950 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer uppercase tracking-wider"
            >
              Publish Notice
            </button>
          </div>
        </form>
      )}

      {/* Category Horizontal Filter menu */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {['All', 'Emergency', 'Event', 'Maintenance', 'General'].map((cat) => {
          const isSelected = activeType === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveType(cat as NoticeType | 'All')}
              className={`h-10 px-5 rounded-xl font-bold text-xs cursor-pointer transition-all uppercase tracking-wider border ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-550 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat === 'All' ? 'All Notices' : cat}
            </button>
          );
        })}
      </div>

      {/* Notice Board Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((note) => (
            <div
              key={note.id}
              className={`bg-white border border-slate-200/80 p-8 rounded-[16px] flex flex-col justify-between min-h-[270px] transition-all duration-300 hover:shadow-sm relative overflow-hidden ${
                note.type === 'Emergency' ? 'border-l-4 border-l-red-500' : ''
              }`}
            >
              <div>
                {/* Header elements */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    note.type === 'Emergency'
                      ? 'bg-red-50 text-red-700 border border-red-100/80'
                      : note.type === 'Maintenance'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100/80'
                      : note.type === 'Event'
                      ? 'bg-purple-50 text-purple-700 border border-purple-100/80'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {note.type}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    {note.postedAt}
                  </span>
                </div>

                {/* Main Content headings */}
                <h3 className="font-sans font-bold text-base text-slate-900 mb-2.5 tracking-tight hover:text-slate-750 transition-colors">
                  {note.title}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed font-semibold">
                  {note.content}
                </p>
              </div>

              {/* Bottom footer widget of card */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-[9px] uppercase">
                    {note.author.substring(0, 1)}
                  </div>
                  <span className="text-[12px] font-bold text-slate-750">By: {note.author}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {note.attachments && note.attachments.length > 0 && (
                    <button
                      onClick={() => alert(`Downloading attachment: "${note.attachments?.[0]}"`)}
                      className="flex items-center gap-0.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] text-slate-600 font-extrabold transition-colors cursor-pointer mr-2 border border-slate-200"
                      title="Download attached documents"
                    >
                      <span className="material-symbols-outlined text-[12px] font-bold">attachment</span>
                      PDF
                    </button>
                  )}
                  {/* Share button */}
                  <button
                    onClick={() => handleShare(note.title)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                    title="Share notice"
                  >
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                  {/* Bookmark button */}
                  <button
                    onClick={() => onToggleBookmark(note.id)}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      note.isBookmarked ? 'text-amber-500 font-bold hover:bg-amber-50/50' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                    title={note.isBookmarked ? 'Unpin Notice' : 'Pin Announcement'}
                  >
                    <span 
                      className="material-symbols-outlined text-[20px]" 
                      style={{ fontVariationSettings: note.isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      bookmark
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-[16px] border border-slate-200/80">
            <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <p className="text-sm font-bold text-slate-800">No active notifications found</p>
            <p className="text-xs text-slate-450 mt-1.5 leading-relaxed max-w-sm font-medium">We couldn't find any announcements matching your chosen filters. Try resetting the filter tabs or write a new notice.</p>
          </div>
        )}
      </div>
    </div>
  );
}
