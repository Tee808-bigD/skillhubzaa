import apiClient from './client';
import { ChatRoom, ChatMessage, PaginatedResponse } from './types';

/**
 * Fetch all chat rooms for the authenticated user (GET /api/rooms/)
 */
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await apiClient.get<PaginatedResponse<ChatRoom> | ChatRoom[]>('rooms/');
  if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get or create a private direct room between the current user and another user
 */
export const getOrCreateDirectRoom = async (participantIdOrUsername: string): Promise<ChatRoom> => {
  const payload = participantIdOrUsername.startsWith('usr_') || !isNaN(Number(participantIdOrUsername))
    ? { participant_id: participantIdOrUsername }
    : { participant_username: participantIdOrUsername.replace(/^@/, '') };

  const response = await apiClient.post<ChatRoom>('rooms/direct/', payload);
  return response.data;
};

/**
 * Fetch historical messages for a room (GET /api/rooms/{id}/messages/ or /api/messages/?room_id={id})
 */
export const getRoomMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get<ChatMessage[]>(`rooms/${roomId}/messages/`);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    // Fallback to query param filtering
    const response = await apiClient.get<ChatMessage[]>(`messages/?room_id=${roomId}`);
    return Array.isArray(response.data) ? response.data : [];
  }
};

/**
 * HTTP fallback to send a message to a room if WebSocket is disconnected (POST /api/messages/)
 */
export const sendChatMessage = async (roomId: string, content: string): Promise<ChatMessage> => {
  const response = await apiClient.post<ChatMessage>('messages/', {
    room_id: roomId,
    content,
    text: content,
  });
  return response.data;
};
