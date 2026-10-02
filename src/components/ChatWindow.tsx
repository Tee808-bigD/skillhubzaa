import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { ChatMessage, ChatRoom, UserSummary } from '../api/types';
import { getRoomMessages, sendChatMessage } from '../api/chat';
import { getAccessToken } from '../api/client';
import { 
  Send, 
  Smile, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Circle, 
  AlertCircle, 
  User as UserIcon,
  Sparkles,
  ArrowDown
} from 'lucide-react';

interface ChatWindowProps {
  room: ChatRoom | { id: string; name?: string; participants?: UserSummary[] };
  currentUser: {
    id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  onClose?: () => void;
  onOpenProfile?: (user: any) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  currentUser,
  onClose,
  onOpenProfile
}) => {
  const [inputText, setInputText] = useState('');
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const token = getAccessToken();

  // Load message history from DRF HTTP endpoint
  useEffect(() => {
    if (!room?.id) return;
    let isMounted = true;
    setLoadingHistory(true);

    getRoomMessages(room.id)
      .then((msgs) => {
        if (isMounted) {
          setHistoryMessages(msgs);
        }
      })
      .catch((err) => console.warn('Could not fetch message history:', err))
      .finally(() => {
        if (isMounted) setLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [room?.id]);

  // Connect to Django Channels WebSocket via custom hook
  const {
    messages,
    sendMessage,
    sendTyping,
    connectionStatus,
    isTyping,
    typingUser,
    reconnect
  } = useWebSocket(room?.id, token, {
    initialMessages: historyMessages
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !room?.id) return;

    if (connectionStatus === 'connected') {
      sendMessage(text);
    } else {
      // Fallback to HTTP API if WebSocket is connecting/disconnected
      try {
        await sendChatMessage(room.id, text);
      } catch (err) {
        console.error('Failed to send message via HTTP fallback:', err);
      }
    }

    sendTyping(false);
    setInputText('');
  };

  const otherParticipant = room.participants?.find(
    (p: any) => p.username !== (currentUser.username || currentUser.name)
  );

  const roomTitle = room.name || otherParticipant?.full_name || otherParticipant?.username || `Chat Room #${room.id}`;

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Window Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherParticipant?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={roomTitle}
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
            {connectionStatus === 'connected' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{roomTitle}</span>
              {otherParticipant?.is_creator && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                  Creator
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-[11px]">
              {connectionStatus === 'connected' && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Django Channels WebSocket Active
                </span>
              )}
              {connectionStatus === 'connecting' && (
                <span className="text-amber-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Connecting ws/chat/{room.id}/...
                </span>
              )}
              {connectionStatus === 'disconnected' && (
                <button
                  onClick={reconnect}
                  className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <WifiOff className="w-3 h-3 text-slate-500" />
                  <span>Disconnected (Click to reconnect)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            connectionStatus === 'connected'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : connectionStatus === 'connecting'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />
            {connectionStatus === 'connected' ? 'Live WS' : connectionStatus}
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {loadingHistory && messages.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-500 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading message history...</span>
          </div>
        )}

        {messages.length === 0 && !loadingHistory && (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-slate-300">No messages in this room yet.</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Say hello! Messages are broadcast in real-time across Django Channels WebSockets.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const senderUsername = typeof msg.sender === 'object' ? msg.sender.username : msg.sender;
          const currentUsername = currentUser.username || currentUser.name || '';
          const isMe = senderUsername?.toLowerCase() === currentUsername.toLowerCase();
          const senderAvatar = typeof msg.sender === 'object' ? (msg.sender as any).avatar : undefined;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              {!isMe && (
                <img
                  src={senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={senderUsername}
                  className="w-7 h-7 rounded-full object-cover border border-slate-800 shrink-0"
                />
              )}

              <div className={`max-w-[78%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                isMe
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-br-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
              }`}>
                {!isMe && (
                  <p className="text-[10px] font-bold text-emerald-400 mb-0.5">
                    {senderUsername}
                  </p>
                )}
                <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content || msg.text}</p>
                <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200/80' : 'text-slate-500'}`}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic animate-pulse py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{typingUser || 'Participant'} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message ${roomTitle}...`}
          className="flex-1 bg-slate-950 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
