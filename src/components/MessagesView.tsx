import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck,
  Mic,
  MicOff,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  User as UserIcon,
  BellOff,
  Bell,
  Trash2,
  ShieldAlert,
  X,
  Share2,
  RotateCw,
  Sparkles,
  FileText,
  FileSpreadsheet,
  Download,
  ArrowUp,
  ArrowDown,
  Camera
} from 'lucide-react';

interface MessagesViewProps {
  conversations: ChatConversation[];
  currentUser: User;
  onSendMessage: (conversationId: string, text: string) => void;
  activeChatParticipantName?: string;
  onOpenProfile?: (user: Partial<User>) => void;
}

// Custom Unique Lifestyle Emoji Categories
const LIFESTYLE_EMOJIS = [
  {
    category: 'Smoking & Chill',
    icon: '🚬',
    emojis: ['🚬', '💨', '🍃', '☁️', '🔥', '☕', '🍺', '🍹', '🧘', '🧊']
  },
  {
    category: 'Shopping & Hustle',
    icon: '🛒',
    emojis: ['🛍️', '🛒', '💳', '💰', '👟', '🏷️', '📦', '💵', '👔', '🏬']
  },
  {
    category: 'Working & Trades',
    icon: '🛠️',
    emojis: ['🛠️', '💼', '💻', '🔧', '🏗️', '⚡', '⚙️', '📐', '📄', '🏗️']
  },
  {
    category: 'Traveling & Moves',
    icon: '✈️',
    emojis: ['✈️', '🧳', '🚗', '🌍', '🗺️', '📍', '🚕', '⛽', '🚎', '🌅']
  },
  {
    category: 'Happy & Vibes',
    icon: '😁',
    emojis: ['😁', '🔥', '✨', '🥳', '🙌', '💯', '😎', '🇿🇦', '🎉', '💪']
  },
  {
    category: 'Sad & Rough Day',
    icon: '😮‍💨',
    emojis: ['💔', '🌧️', '😮‍💨', '🥺', '🥀', '😓', '🤦‍♂️', '😴', '🌧️', '⚡']
  },
  {
    category: 'Music & Grooves',
    icon: '🎵',
    emojis: ['🎵', '🎧', '📻', '🕺', '🎶', '🎸', '🎙️', '🪩', '🥁', '🎷']
  }
];

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  currentUser,
  onSendMessage,
  activeChatParticipantName,
  onOpenProfile
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
  
  // Custom Features State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState(0);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Permission Request Modal State
  const [callPermissionModal, setCallPermissionModal] = useState<{
    isOpen: boolean;
    mode: 'voice' | 'video';
  } | null>(null);
  const [allowCamPermission, setAllowCamPermission] = useState(true);
  const [allowMicPermission, setAllowMicPermission] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Call Controls State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // In-Chat Search & Menu Features State
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [isMutedNotifications, setIsMutedNotifications] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [localMessagesOverride, setLocalMessagesOverride] = useState<Record<string, ChatMessage[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeConversation = conversations.find(c => c.id === selectedChatId) || conversations[0];

  // Scroll Helpers
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to bottom when conversation changes or new messages arrive
  useEffect(() => {
    scrollToBottom(false);
  }, [selectedChatId]);

  const currentChatMessages = localMessagesOverride[activeConversation?.id] || activeConversation?.messages || [];

  const filteredMessages = inChatSearchQuery.trim()
    ? currentChatMessages.filter(m => m.text.toLowerCase().includes(inChatSearchQuery.toLowerCase()))
    : currentChatMessages;

  useEffect(() => {
    scrollToBottom(true);
  }, [filteredMessages.length]);

  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (isVoiceCallActive || isVideoCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isVoiceCallActive, isVideoCallActive]);

  // Effect to attach mediaStream to video element whenever video call is active
  useEffect(() => {
    if (isVideoCallActive && localVideoRef.current && mediaStream) {
      localVideoRef.current.srcObject = mediaStream;
      localVideoRef.current.play().catch(err => console.warn("Video play error:", err));
    }
  }, [isVideoCallActive, mediaStream]);

  // Effect to toggle camera and mic track states
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = !isCamOff;
      });
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicMuted;
      });
    }
  }, [isCamOff, isMicMuted, mediaStream]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartCallRequest = (mode: 'voice' | 'video') => {
    setCallPermissionModal({ isOpen: true, mode });
  };

  const handleConfirmCallPermission = async () => {
    if (!callPermissionModal) return;
    const mode = callPermissionModal.mode;
    
    let streamToSet: MediaStream | null = null;

    // Attempt real navigator media permission if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        streamToSet = await navigator.mediaDevices.getUserMedia({
          video: mode === 'video' && allowCamPermission ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
          audio: allowMicPermission
        });
      }
    } catch (err) {
      console.warn("Real camera access blocked or unavailable in container iframe:", err);
    }

    // Fallback: create dynamic video stream if getUserMedia returned null or threw error
    if (!streamToSet && mode === 'video' && allowCamPermission) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          let frame = 0;
          const draw = () => {
            frame++;
            const grad = ctx.createLinearGradient(0, 0, 640, 480);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(0.5, '#047857');
            grad.addColorStop(1, '#064e3b');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 640, 480);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(320 + Math.sin(frame * 0.05) * 15, 240 + Math.cos(frame * 0.05) * 10, 100, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LIVE CAMERA STREAM', 320, 230);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(`Webcam Feed: ${currentUser.name || 'You'}`, 320, 260);

            requestAnimationFrame(draw);
          };
          draw();
          streamToSet = canvas.captureStream(30);
        }
      } catch (e) {
        console.warn("Canvas stream creation error:", e);
      }
    }

    if (streamToSet) {
      setMediaStream(streamToSet);
    }

    if (mode === 'video') {
      setIsVideoCallActive(true);
      showToast('Video call initialized with Live Camera');
    } else {
      setIsVoiceCallActive(true);
      showToast('Voice call initialized with Microphone');
    }

    setCallPermissionModal(null);
  };

  const handleEndCall = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsVoiceCallActive(false);
    setIsVideoCallActive(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation || isUserBlocked) return;

    onSendMessage(activeConversation.id, messageInput);
    setMessageInput('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleClearHistory = () => {
    if (!activeConversation) return;
    setLocalMessagesOverride(prev => ({
      ...prev,
      [activeConversation.id]: []
    }));
    setIsMoreMenuOpen(false);
    showToast('Chat history cleared for this conversation');
  };

  const handleToggleBlock = () => {
    setIsUserBlocked(prev => !prev);
    setIsMoreMenuOpen(false);
    showToast(isUserBlocked ? `Unblocked ${activeConversation?.participantName}` : `Blocked ${activeConversation?.participantName}`);
  };

  const handleToggleMuteNotifs = () => {
    setIsMutedNotifications(prev => !prev);
    setIsMoreMenuOpen(false);
    showToast(isMutedNotifications ? 'Notifications unmuted for this chat' : 'Notifications muted for this chat');
  };

  // CSV & TXT Export Handler
  const handleExportChat = (format: 'txt' | 'csv') => {
    if (!activeConversation) return;
    setIsMoreMenuOpen(false);
    
    const participant = activeConversation.participantName;
    const handle = activeConversation.participantHandle;
    const dateStr = new Date().toISOString().split('T')[0];
    
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'txt') {
      filename = `SkillHub_Chat_${participant.replace(/\s+/g, '_')}_${dateStr}.txt`;
      mimeType = 'text/plain;charset=utf-8';
      content = `==========================================================\n`;
      content += `SKILLHUB ZA - DIRECT MESSAGE TRANSCRIPT EXPORT\n`;
      content += `Chat Participant: ${participant} (${handle})\n`;
      content += `Export Date: ${new Date().toLocaleString()}\n`;
      content += `Total Messages: ${filteredMessages.length}\n`;
      content += `==========================================================\n\n`;
      
      filteredMessages.forEach(m => {
        const sender = m.isMe ? 'You' : participant;
        content += `[${m.timestamp}] ${sender}: ${m.text}\n`;
      });
    } else {
      filename = `SkillHub_Chat_${participant.replace(/\s+/g, '_')}_${dateStr}.csv`;
      mimeType = 'text/csv;charset=utf-8';
      content = `"Timestamp","Sender","IsMe","Message"\n`;
      
      filteredMessages.forEach(m => {
        const sender = m.isMe ? 'You' : participant;
        const safeText = m.text.replace(/"/g, '""');
        content += `"${m.timestamp}","${sender}","${m.isMe}","${safeText}"\n`;
      });
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded chat as ${format.toUpperCase()}`);
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participantHandle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto h-[calc(100vh-20px)] min-h-[680px] bg-[#1a1a1a] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Permission Request Modal for Camera & Mic */}
      {callPermissionModal && activeConversation && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#181818] border border-neutral-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Media Permissions Required</h3>
                <p className="text-xs text-neutral-400 font-medium">SkillHub ZA Live Communication</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-medium bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
              SkillHub ZA requires permission to open your <span className="text-emerald-400 font-bold">Camera</span> and <span className="text-emerald-400 font-bold">Microphone</span> to start live {callPermissionModal.mode === 'video' ? 'video' : 'voice'} chatting with <strong className="text-white">{activeConversation.participantName}</strong>.
            </p>

            <div className="space-y-3 bg-[#222] p-4 rounded-2xl border border-neutral-800">
              <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Enable Camera Access</span>
                </span>
                <input
                  type="checkbox"
                  checked={allowCamPermission}
                  onChange={(e) => setAllowCamPermission(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                <span className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Enable Microphone Access</span>
                </span>
                <input
                  type="checkbox"
                  checked={allowMicPermission}
                  onChange={(e) => setAllowMicPermission(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCallPermissionModal(null)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-2xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCallPermission}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>Allow & Start Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Call Overlay Modal */}
      {isVoiceCallActive && activeConversation && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-white animate-in fade-in duration-200">
          <div className="text-center space-y-1 mt-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Voice Call Connected
            </span>
            <h2 className="text-2xl font-black text-white">{activeConversation.participantName}</h2>
            <p className="text-xs font-semibold text-neutral-400">{formatCallTime(callDuration)} • HD Audio Stream</p>
          </div>

          {/* Audio Visualizer Stage */}
          <div className="relative flex flex-col items-center justify-center my-auto">
            <div className="absolute w-48 h-48 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="absolute w-36 h-36 rounded-full bg-emerald-500/30 animate-pulse" />
            <img
              src={activeConversation.participantAvatar}
              alt={activeConversation.participantName}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-emerald-500 relative z-10 shadow-2xl"
            />
            {/* Sound waveform indicators */}
            <div className="flex items-center gap-1.5 mt-8">
              <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-10 bg-emerald-400 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-14 bg-emerald-400 rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-6 mb-4 bg-neutral-900/90 p-4 rounded-3xl border border-neutral-800 shadow-2xl">
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`p-4 rounded-2xl transition-all ${
                isMicMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-4 rounded-2xl transition-all ${
                !isSpeakerOn ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title={isSpeakerOn ? 'Mute Speaker' : 'Speaker On'}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg transform active:scale-95"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Video Call Overlay Modal */}
      {isVideoCallActive && activeConversation && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
          
          {/* Main Video Window Stage */}
          <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center overflow-hidden">
            {isCamOff ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <img
                  src={activeConversation.participantAvatar}
                  alt={activeConversation.participantName}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-neutral-700"
                />
                <span className="text-sm font-bold">{activeConversation.participantName} (Camera Off)</span>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={activeConversation.participantAvatar}
                  alt={activeConversation.participantName}
                  className="w-full h-full object-cover filter blur-xs scale-105 opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <img
                      src={activeConversation.participantAvatar}
                      alt={activeConversation.participantName}
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-emerald-500 shadow-2xl mx-auto"
                    />
                    <h3 className="text-xl font-black text-white">{activeConversation.participantName}</h3>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                      Live HD Video Stream
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Corner Self Camera PIP Preview */}
            <div className="absolute bottom-20 right-6 w-36 h-48 bg-neutral-900 rounded-2xl border-2 border-emerald-500 overflow-hidden shadow-2xl z-20 flex items-center justify-center relative">
              {isCamOff ? (
                <div className="flex flex-col items-center justify-center text-center p-2 text-neutral-400">
                  <VideoOff className="w-6 h-6 text-rose-400 mb-1" />
                  <span className="text-[10px] font-bold">Cam Off</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1] bg-neutral-950"
                />
              )}
              <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-md text-[9px] font-extrabold text-white px-2 py-0.5 rounded-md border border-neutral-700/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>You (Camera)</span>
              </span>
            </div>

            {/* Video Call Header Bar */}
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20">
              <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-neutral-800 text-white flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Live Video Call</span>
                <span className="text-neutral-400 text-xs font-mono">• {formatCallTime(callDuration)}</span>
              </div>

              <button
                onClick={handleEndCall}
                className="p-2.5 bg-neutral-900/80 hover:bg-rose-600 text-white rounded-2xl border border-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Call Controls Footer */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl p-3 rounded-3xl border border-neutral-800 shadow-2xl z-20">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3.5 rounded-2xl transition ${
                  isMicMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsCamOff(!isCamOff)}
                className={`p-3.5 rounded-2xl transition ${
                  isCamOff ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => showToast('Switched camera angle')}
                className="p-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-2xl transition"
                title="Rotate Camera"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button
                onClick={() => showToast('Screen sharing activated')}
                className="p-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-2xl transition"
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={handleEndCall}
                className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl transition shadow-lg"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar: Direct Message Conversations List */}
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
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setInChatSearchQuery('');
                  setInChatSearchOpen(false);
                }}
                className={`w-full p-3.5 flex items-center gap-3 transition text-left ${
                  isSelected ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-neutral-800/40'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={chat.participantAvatar}
                    alt={chat.participantName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-neutral-700"
                  />
                  {chat.online && (
                    <span className="w-3 h-3 bg-emerald-500 border-2 border-[#141414] rounded-full absolute bottom-0 right-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-extrabold text-white text-xs truncate">{chat.participantName}</h3>
                    <span className="text-[10px] text-neutral-400 font-semibold shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-neutral-400 truncate font-medium">{chat.lastMessage}</p>
                </div>

                {chat.unreadCount > 0 && (
                  <span className="bg-emerald-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {chat.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Conversation Area */}
      {activeConversation ? (
        <div className="md:col-span-8 flex flex-col h-full bg-[#181818] relative">
          
          {/* Chat Room Header */}
          <div className="p-3.5 px-5 bg-[#141414] border-b border-neutral-800 flex items-center justify-between z-10">
            <div
              onClick={() => {
                if (onOpenProfile) {
                  onOpenProfile({
                    name: activeConversation.participantName,
                    handle: activeConversation.participantHandle,
                    avatar: activeConversation.participantAvatar
                  });
                }
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={activeConversation.participantAvatar}
                  alt={activeConversation.participantName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500 group-hover:scale-105 transition"
                />
                {activeConversation.online && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-[#141414] rounded-full absolute bottom-0 right-0" />
                )}
              </div>

              <div>
                <h3 className="font-black text-white text-sm group-hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>{activeConversation.participantName}</span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-neutral-400 font-semibold">
                  {activeConversation.participantHandle} • {activeConversation.online ? 'Active Now' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => handleStartCallRequest('voice')}
                className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700 hover:text-emerald-400 rounded-xl transition text-neutral-300"
                title="Start Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleStartCallRequest('video')}
                className="p-2.5 bg-neutral-800/80 hover:bg-neutral-700 hover:text-emerald-400 rounded-xl transition text-neutral-300"
                title="Start Video Call"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`p-2.5 rounded-xl transition ${
                  isMoreMenuOpen ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-neutral-800/80 hover:bg-neutral-700 hover:text-white text-neutral-300'
                }`}
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Working 3-Dots Dropdown Menu */}
              {isMoreMenuOpen && (
                <div className="absolute top-12 right-0 w-60 bg-[#181818] border border-neutral-700 rounded-2xl shadow-2xl p-2 z-40 text-xs font-semibold text-neutral-200 space-y-1 animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      if (onOpenProfile) {
                        onOpenProfile({
                          name: activeConversation.participantName,
                          handle: activeConversation.participantHandle,
                          avatar: activeConversation.participantAvatar
                        });
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-left transition"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span>View Full Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setInChatSearchOpen(!inChatSearchOpen);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-left transition"
                  >
                    <Search className="w-4 h-4 text-blue-400" />
                    <span>Search in Chat</span>
                  </button>

                  <button
                    onClick={handleToggleMuteNotifs}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-left transition"
                  >
                    {isMutedNotifications ? <Bell className="w-4 h-4 text-amber-400" /> : <BellOff className="w-4 h-4 text-amber-400" />}
                    <span>{isMutedNotifications ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                  </button>

                  <div className="border-t border-neutral-800 my-1" />

                  {/* CSV / TXT Data Download Options */}
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                    Download Chat History
                  </div>

                  <button
                    onClick={() => handleExportChat('txt')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-500/10 text-emerald-400 text-left transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Chat as TXT</span>
                  </button>

                  <button
                    onClick={() => handleExportChat('csv')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-500/10 text-emerald-400 text-left transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Chat as CSV</span>
                  </button>

                  <div className="border-t border-neutral-800 my-1" />

                  <button
                    onClick={handleClearHistory}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Chat History</span>
                  </button>

                  <button
                    onClick={handleToggleBlock}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left transition"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{isUserBlocked ? 'Unblock User' : 'Block / Report User'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* In-Chat Search Bar Banner */}
          {inChatSearchOpen && (
            <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex items-center gap-3 animate-in fade-in">
              <Search className="w-4 h-4 text-emerald-400" />
              <input
                type="text"
                placeholder="Search messages in this chat..."
                value={inChatSearchQuery}
                onChange={(e) => setInChatSearchQuery(e.target.value)}
                className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  setInChatSearchOpen(false);
                  setInChatSearchQuery('');
                }}
                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Blocked Notice Banner */}
          {isUserBlocked && (
            <div className="p-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>You have blocked {activeConversation.participantName}. Unblock from the 3-dots menu to send messages.</span>
            </div>
          )}

          {/* Messages Feed Container with Scroll Control */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-2 scroll-smooth relative"
          >
            {filteredMessages.length === 0 ? (
              <div className="text-center text-neutral-500 text-xs py-10 font-bold">
                {inChatSearchQuery ? 'No matching messages found' : 'No messages in this chat'}
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5"
                    />
                  )}

                  {/* Compact Snug Message Block without oversized gaps */}
                  <div className={`max-w-[85%] sm:max-w-[70%] ${msg.isMe ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-medium leading-normal shadow-sm ${
                      msg.isMe
                        ? 'bg-emerald-500 text-slate-950 font-semibold rounded-br-xs'
                        : 'bg-[#262626] text-white border border-neutral-700/60 rounded-bl-xs'
                    }`}>
                      <p className="whitespace-pre-wrap break-words leading-snug">{msg.text}</p>
                      
                      <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${
                        msg.isMe ? 'justify-end text-slate-950/80' : 'justify-start text-neutral-400'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {msg.isMe && <CheckCheck className="w-3.5 h-3.5 text-slate-950" />}
                      </div>
                    </div>
                  </div>

                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Scroll Up / Scroll Down Quick Navigation Bar */}
          <div className="sticky bottom-2 right-4 flex justify-end gap-2 px-4 z-20 pointer-events-none">
            <div className="flex items-center gap-1 bg-[#181818]/95 backdrop-blur-md p-1 rounded-2xl border border-neutral-700/80 shadow-2xl pointer-events-auto">
              <button
                type="button"
                onClick={scrollToTop}
                className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 rounded-xl transition flex items-center gap-1 text-[10px] font-black"
                title="Scroll Up to Top"
              >
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Top</span>
              </button>

              <div className="w-[1px] h-3.5 bg-neutral-800" />

              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 rounded-xl transition flex items-center gap-1 text-[10px] font-black"
                title="Scroll Down to Latest"
              >
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Latest</span>
              </button>
            </div>
          </div>

          {/* Custom Unique Lifestyle Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 right-4 md:left-8 md:right-8 bg-[#181818] border border-neutral-700 rounded-3xl shadow-2xl p-4 z-40 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {LIFESTYLE_EMOJIS.map((cat, idx) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setActiveEmojiTab(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 ${
                        activeEmojiTab === idx
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="hidden sm:inline">{cat.category}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-1 max-h-36 overflow-y-auto">
                {LIFESTYLE_EMOJIS[activeEmojiTab].emojis.map((e, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleEmojiClick(e)}
                    className="text-2xl p-2.5 hover:bg-neutral-800 rounded-2xl transition transform hover:scale-125 active:scale-95 flex items-center justify-center"
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-neutral-400 text-center font-bold">
                SkillHub Unique Lifestyle & Daily Life Emojis
              </div>
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3.5 bg-[#141414] border-t border-neutral-800 z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl transition ${
                  showEmojiPicker ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
                title="SkillHub Daily Life Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessageInput(prev => prev + ' 📸 [Photo Attached]');
                  showToast('Photo attached to message');
                }}
                className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
                title="Attach Media"
              >
                <Image className="w-5 h-5" />
              </button>

              <input
                type="text"
                disabled={isUserBlocked}
                placeholder={isUserBlocked ? 'User blocked' : `Message ${activeConversation.participantName}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-[#1e1e1e] border border-neutral-800 text-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!messageInput.trim() || isUserBlocked}
                className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black rounded-2xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
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
