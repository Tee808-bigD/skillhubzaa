import React, { useState } from 'react';
import { Share2, X, Copy, Plus, Check, Send } from 'lucide-react';
import { Reel, ChatConversation } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reel: Reel;
  conversations: ChatConversation[];
  onShareToFeed: () => void;
  onShareInChat: (conversation: ChatConversation) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  reel,
  conversations,
  onShareToFeed,
  onShareInChat
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?reel=${reel.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative bg-[#1a1a1a] rounded-3xl border border-neutral-800 max-w-sm w-full p-5 shadow-2xl space-y-4 text-white z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white">
              Share Skills Showcase
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Option */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full flex items-center justify-between p-3 bg-[#121212] hover:bg-neutral-800 rounded-2xl border border-neutral-800 transition cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-extrabold text-xs block text-white">
                {copied ? 'Link Copied to Clipboard!' : 'Copy Showcase Link'}
              </span>
              <span className="text-[10px] text-neutral-400">
                Shareable portfolio link for clients & partners
              </span>
            </div>
          </div>
        </button>

        {/* Repost to Feed Option */}
        <button
          type="button"
          onClick={onShareToFeed}
          className="w-full flex items-center gap-3 p-3 bg-[#121212] hover:bg-neutral-800 rounded-2xl border border-neutral-800 transition cursor-pointer group text-left"
        >
          <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-xs block text-white">
              Repost to Community Feed
            </span>
            <span className="text-[10px] text-neutral-400">
              Broadcast this video showcase to the live community
            </span>
          </div>
        </button>

        {/* Direct Message List */}
        {conversations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <span className="text-[11px] font-extrabold text-neutral-400 block uppercase tracking-wider">
              Send in Direct Message
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-none">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onShareInChat(conv)}
                  className="w-full flex items-center justify-between p-2 hover:bg-[#121212] rounded-xl transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={conv.participantAvatar} 
                      alt="" 
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/30" 
                    />
                    <span className="font-bold text-xs text-white truncate max-w-[170px]">
                      {conv.participantName}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    Send
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
