import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { User } from '../types';

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: CommentItem[];
  currentUser: User;
  onAddComment: (text: string) => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  isOpen,
  onClose,
  comments,
  currentUser,
  onAddComment
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddComment(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl border border-neutral-800 max-w-md w-full p-5 shadow-2xl space-y-4 text-white max-h-[82vh] flex flex-col z-10 animate-in slide-in-from-bottom-8 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white">
              Comments & Client Inquiries ({comments.length})
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none min-h-[180px] max-h-[380px]">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="bg-[#121212] p-3.5 rounded-2xl border border-neutral-800/90 flex items-start gap-3 text-xs">
                <img 
                  src={c.authorAvatar} 
                  alt={c.authorName} 
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-white text-xs truncate">{c.authorName}</span>
                    <span className="text-[10px] text-neutral-500 shrink-0">{c.timestamp}</span>
                  </div>
                  <p className="text-neutral-300 font-medium text-xs mt-1 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-neutral-500 text-xs font-semibold space-y-1">
              <MessageCircle className="w-8 h-8 mx-auto opacity-40 mb-2" />
              <p>No comments or questions yet.</p>
              <p className="text-[11px] text-neutral-600">Ask the creator about their stack, rates, or project scope!</p>
            </div>
          )}
        </div>

        {/* Add Comment Input */}
        <form onSubmit={handleSubmit} className="pt-2 border-t border-neutral-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about this project or leave feedback..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-[#121212] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 rounded-xl font-bold transition cursor-pointer shrink-0"
            title="Post Comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
