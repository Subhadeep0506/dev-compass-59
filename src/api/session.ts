/**
 * Session API Module
 * 
 * This module handles all session-related API calls including:
 * - Creating new chat sessions
 * - Retrieving user sessions
 * - Updating session details
 * - Deleting sessions
 * - Managing session messages
 * - Message feedback and likes
 */

import { apiClient, ApiResponse, handleApiError } from './client';
import {
    CreateSessionRequest,
    UpdateSessionRequest,
    SessionsResponse,
    SessionResponse,
    UpdateSessionResponse,
    DeleteResponse,
    MessagesResponse,
    LikeMessageResponse,
    FeedbackMessageResponse,
    LikeStatus,
} from './types';

// ========================
// Session Management APIs
// ========================

/**
 * Get all sessions for a specific user
 */
export const getUserSessions = async (userId: string): Promise<ApiResponse<SessionsResponse>> => {
    try {
        const response = await apiClient.get<SessionsResponse>('/session/', {
            params: { user_id: userId }
        });

        return {
            data: response.data,
            success: true,
            message: 'Sessions retrieved successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Create a new chat session
 */
export const createSession = async (request: CreateSessionRequest): Promise<ApiResponse<SessionResponse>> => {
    try {
        const response = await apiClient.post<SessionResponse>('/session/', request);

        return {
            data: response.data,
            success: true,
            message: 'Session created successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Update an existing session (e.g., rename title)
 */
export const updateSession = async (
    sessionId: string,
    request: UpdateSessionRequest
): Promise<ApiResponse<UpdateSessionResponse>> => {
    try {
        const response = await apiClient.put<UpdateSessionResponse>(`/session/${sessionId}`, request);

        return {
            data: response.data,
            success: true,
            message: 'Session updated successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Delete a specific session
 */
export const deleteSession = async (sessionId: string): Promise<ApiResponse<DeleteResponse>> => {
    try {
        const response = await apiClient.delete<DeleteResponse>(`/session/${sessionId}`);

        return {
            data: response.data,
            success: true,
            message: 'Session deleted successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Delete all sessions for a user
 */
export const deleteUserSessions = async (userId: string): Promise<ApiResponse<DeleteResponse>> => {
    try {
        const response = await apiClient.delete<DeleteResponse>(`/session/${userId}`);

        return {
            data: response.data,
            success: true,
            message: 'All user sessions deleted successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// ========================
// Session Messages APIs
// ========================

/**
 * Get all messages for a specific session
 */
export const getSessionMessages = async (sessionId: string): Promise<ApiResponse<MessagesResponse>> => {
    try {
        const response = await apiClient.get<MessagesResponse>('/session/messages', {
            params: { session_id: sessionId }
        });

        return {
            data: response.data,
            success: true,
            message: 'Messages retrieved successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Like or dislike a message
 */
export const likeMessage = async (
    messageId: string,
    likeStatus: LikeStatus
): Promise<ApiResponse<LikeMessageResponse>> => {
    try {
        const response = await apiClient.put<LikeMessageResponse>('/session/message/like', null, {
            params: {
                message_id: messageId,
                like: likeStatus
            }
        });

        return {
            data: response.data,
            success: true,
            message: `Message ${likeStatus === 'like' ? 'liked' : 'disliked'} successfully`
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Submit feedback for a message
 */
export const submitMessageFeedback = async (
    messageId: string,
    feedback: string,
    stars: number
): Promise<ApiResponse<FeedbackMessageResponse>> => {
    try {
        // Validate stars rating
        if (stars < 1 || stars > 5) {
            throw new Error('Stars rating must be between 1 and 5');
        }

        const response = await apiClient.put<FeedbackMessageResponse>('/session/message/feedback', null, {
            params: {
                message_id: messageId,
                feedback,
                stars
            }
        });

        return {
            data: response.data,
            success: true,
            message: 'Feedback submitted successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// ========================
// Session Utility Functions
// ========================

/**
 * Generate a unique session title based on the first query
 */
export const generateSessionTitle = (firstQuery: string, maxLength: number = 50): string => {
    if (!firstQuery.trim()) return 'New Chat';

    // Clean up the query and truncate if needed
    const cleaned = firstQuery.trim().replace(/\s+/g, ' ');

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    // Truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.7) {
        return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
};

/**
 * Validate session ID format
 */
export const isValidSessionId = (sessionId: string): boolean => {
    if (!sessionId || typeof sessionId !== 'string') return false;

    // Check if it's a reasonable length and contains valid characters
    return sessionId.length > 0 && sessionId.length < 255 && /^[a-zA-Z0-9-_]+$/.test(sessionId);
};

/**
 * Format session timestamp for display
 */
export const formatSessionTime = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Less than 1 minute
        if (diff < 60 * 1000) {
            return 'Just now';
        }

        // Less than 1 hour
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }

        // Less than 24 hours
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }

        // Less than 7 days
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }

        // Older than a week - show date
        return date.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting session time:', error);
        return 'Unknown';
    }
};

// ========================
// Session Cache Management
// ========================

/**
 * Session cache for optimistic updates
 */
class SessionCache {
    private cache = new Map<string, SessionsResponse>();
    private lastUpdate = new Map<string, number>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    set(userId: string, sessions: SessionsResponse): void {
        this.cache.set(userId, sessions);
        this.lastUpdate.set(userId, Date.now());
    }

    get(userId: string): SessionsResponse | null {
        const sessions = this.cache.get(userId);
        const lastUpdate = this.lastUpdate.get(userId);

        if (!sessions || !lastUpdate) return null;

        // Check if cache is still valid
        if (Date.now() - lastUpdate > this.CACHE_DURATION) {
            this.cache.delete(userId);
            this.lastUpdate.delete(userId);
            return null;
        }

        return sessions;
    }

    invalidate(userId: string): void {
        this.cache.delete(userId);
        this.lastUpdate.delete(userId);
    }

    clear(): void {
        this.cache.clear();
        this.lastUpdate.clear();
    }
}

export const sessionCache = new SessionCache();