import React, { useState } from 'react';
import { ChatConversation, ChatMessage, User } from '../types';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Image, 
  Smile, 
  CheckCheck,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface MessagesViewProps {
  conversations: ChatConversation[];
  currentUser: User;
  onSendMessage: (conversationId: string, text: string) => void;
  activeChatParticipantName?: string;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  currentUser,
  onSendMessage,
  activeChatParticipantName
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string>(() => {
    if (activeChatParticipantName) {
      const found = conversations.find(c => c.participantName.toLowerCase() === activeChatParticipantName.toLowerCase());
      if (found) return found.id;
    }
    return conversations[0]?.id || '';
  });

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConversation = conversations.find(c => c.id === selectedChatId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    onSendMessage(activeConversation.id, messageInput);
    setMessageInput('');
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participantHandle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] min-h-[580px] bg-[#1a1a1a] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
      
      {/* Left Conversations Sidebar (4 cols) */}
      <div className="md:col-span-4 border-r border-neutral-800 flex flex-col bg-[#141414]">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-white text-lg">Direct Messages</h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search chat or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-neutral-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/50">
          {filteredConversations.map((chat) => {
            const isSelected = chat.id === activeConversation?.id;

            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full p-4 flex items-center gap-3 transition-all text-left ${
                  isSelected ? 'bg-neutral-800/80 border-l-4 border-emerald-500' : 'hover:bg-neutral-800/30'
                }`}
              >
                <div className="relative">
                  <img
                    src={chat.participantAvatar}
                    alt={chat.participantName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  {chat.online && (
                    <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-[#141414] rounded-full absolute bottom-0 right-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white truncate">{chat.participantName}</h4>
                    <span className="text-[10px] text-neutral-400 font-semibold">{chat.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-neutral-400 truncate mt-0.5 font-medium">
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                    {chat.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Right Chat Panel (8 cols) */}
      {activeConversation ? (
        <div className="md:col-span-8 flex flex-col bg-[#1e1e1e] h-full">
          
          {/* Active Chat Header */}
          <div className="p-4 bg-[#141414] border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeConversation.participantAvatar}
                  alt={activeConversation.participantName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                {activeConversation.online && (
                  <span className="w-3 h-3 bg-emerald-500 border-2 border-[#141414] rounded-full absolute bottom-0 right-0" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>{activeConversation.participantName}</span>
                  <span className="text-xs text-neutral-400 font-medium">{activeConversation.participantHandle}</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-400">
                  {activeConversation.online ? 'Online now' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <button onClick={() => alert(`Calling ${activeConversation.participantName}...`)} className="p-2 hover:bg-neutral-800 rounded-xl hover:text-white">
                <Phone className="w-4 h-4" />
              </button>
              <button onClick={() => alert(`Video calling ${activeConversation.participantName}...`)} className="p-2 hover:bg-neutral-800 rounded-xl hover:text-white">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-neutral-800 rounded-xl hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!msg.isMe && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                )}

                <div className={`space-y-1 ${msg.isMe ? 'items-end text-right' : ''}`}>
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-md ${
                    msg.isMe
                      ? 'bg-emerald-500 text-slate-950 font-semibold rounded-tr-none'
                      : 'bg-[#282828] text-white border border-neutral-700/80 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  <div className={`flex items-center gap-1 text-[10px] text-neutral-400 font-semibold px-1 ${
                    msg.isMe ? 'justify-end' : ''
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-4 bg-[#141414] border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <button type="button" className="p-2 text-neutral-400 hover:text-white rounded-xl">
                <Smile className="w-5 h-5" />
              </button>
              <button type="button" className="p-2 text-neutral-400 hover:text-white rounded-xl">
                <Image className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={`Message ${activeConversation.participantName}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-[#1e1e1e] border border-neutral-800 text-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-2xl transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      ) : (
        <div className="md:col-span-8 flex flex-col items-center justify-center p-8 text-neutral-500 space-y-3">
          <Send className="w-12 h-12 text-neutral-700" />
          <p className="text-xs font-bold">Select a conversation to start chatting</p>
        </div>
      )}

    </div>
  );
};
