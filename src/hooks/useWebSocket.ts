import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, WebSocketPayload } from '../api/types';
import { getAccessToken, refreshAccessToken } from '../api/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  onMessageReceived?: (msg: ChatMessage) => void;
  initialMessages?: ChatMessage[];
}

export const useWebSocket = (
  roomId: string | null | undefined,
  token?: string | null,
  options?: UseWebSocketOptions
) => {
  const [messages, setMessages] = useState<ChatMessage[]>(options?.initialMessages || []);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);
  const reconnectAttemptsRef = useRef<number>(0);
  const didRefreshForAuthRef = useRef<boolean>(false);

  // Sync initial messages if provided
  useEffect(() => {
    if (options?.initialMessages && options.initialMessages.length > 0) {
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const merged = [...prev];
        for (const item of options.initialMessages!) {
          if (!existingIds.has(item.id)) {
            merged.push(item);
            existingIds.add(item.id);
          }
        }
        return merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
    }
  }, [options?.initialMessages]);

  // Determine WebSocket URL.
  // The Django Channels host is derived from the configured API base URL, so
  // remote deployments (ngrok / Render / local :8000) are reached directly.
  const getWebSocketUrl = useCallback((): string => {
    if (!roomId) return '';
    // Prefer the freshest stored token so a refresh that happened after mount
    // is used by the reconnect instead of a stale prop.
    const authToken = getAccessToken() || token || '';
    const tokenQuery = authToken ? `?token=${encodeURIComponent(authToken)}` : '';

    const pageOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000';
    const configuredApi =
      import.meta.env.VITE_API_BASE_URL ||
      (typeof window !== 'undefined' ? localStorage.getItem('skillhub_custom_api_url') : null) ||
      '';

    // Only an absolute API URL tells us where Django lives; a relative /api/
    // means the page itself is served alongside the ASGI app.
    const base = configuredApi.startsWith('http') ? configuredApi : pageOrigin;

    const wsBase = base
      .replace(/^http(s?):\/\//i, (_match: string, secure: string) => (secure ? 'wss://' : 'ws://'))
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');

    return `${wsBase}/ws/chat/${roomId}/${tokenQuery}`;
  }, [roomId, token]);

  const connect = useCallback(() => {
    if (!roomId) {
      setConnectionStatus('disconnected');
      return;
    }

    const wsUrl = getWebSocketUrl();
    if (!wsUrl) return;

    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        didRefreshForAuthRef.current = false;
        setError(null);
      };

      socket.onmessage = (event) => {
        try {
          const data: WebSocketPayload = JSON.parse(event.data);

          if (data.type === 'chat_message') {
            const newMsg: ChatMessage = {
              id: data.id || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              room_id: data.room_id || roomId,
              content: data.content || data.message || '',
              text: data.content || data.message || '',
              sender: data.sender || {
                id: 'unknown',
                username: data.username || 'Member',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              },
              timestamp: data.timestamp || new Date().toISOString(),
              is_read: true,
            };

            // Idempotent insertion: prevent duplicate messages
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) {
                return prev;
              }
              return [...prev, newMsg];
            });

            if (options?.onMessageReceived) {
              options.onMessageReceived(newMsg);
            }
          } else if (data.type === 'typing') {
            const user = data.username;
            if (user) {
              if (data.is_typing) {
                setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
              } else {
                setTypingUsers((prev) => prev.filter((u) => u !== user));
              }
            }
          }
        } catch (parseErr) {
          console.error('Error parsing WebSocket message payload:', parseErr);
        }
      };

      socket.onerror = (err) => {
        console.warn('WebSocket encountered an error:', err);
        setConnectionStatus('error');
        setError('WebSocket error connecting to Django Channels');
      };

      socket.onclose = async (event) => {
        setConnectionStatus('disconnected');
        socketRef.current = null;

        if (!shouldReconnectRef.current) return;

        // 4003 = authenticated but not allowed in this room: do not retry.
        if (event.code === 4003) {
          setError('You do not have access to this conversation.');
          return;
        }

        // 4001 = missing/expired JWT: refresh once, then reconnect.
        if (event.code === 4001) {
          if (didRefreshForAuthRef.current) {
            setError('Your session expired. Please log in again.');
            return;
          }
          didRefreshForAuthRef.current = true;
          const newAccess = await refreshAccessToken();
          if (!newAccess) {
            setError('Your session expired. Please log in again.');
            return;
          }
          connect();
          return;
        }

        // Auto-reconnect with exponential backoff for transient drops.
        const maxDelay = 10000;
        const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), maxDelay);
        reconnectAttemptsRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch (connectionErr: any) {
      setConnectionStatus('error');
      setError(connectionErr.message || 'Failed to establish WebSocket connection');
    }
  }, [roomId, getWebSocketUrl, options]);

  // Connect on mount / roomId change
  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  // Send message through WebSocket
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'chat_message',
          message: content.trim(),
          content: content.trim(),
        })
      );
    } else {
      console.warn('WebSocket is not open. Message queued or fallback needed.');
    }
  }, []);

  // Send typing status through WebSocket
  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'typing',
          is_typing: isTyping,
        })
      );

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          sendTyping(false);
        }, 3000);
      }
    }
  }, []);

  return {
    messages,
    setMessages,
    sendMessage,
    sendTyping,
    connectionStatus,
    typingUsers,
    isTyping: typingUsers.length > 0,
    typingUser: typingUsers[0] || null,
    error,
    reconnect: connect,
  };
};
