/**
 * Extended Store Implementation
 * 
 * This module extends the existing Zustand store with API integration,
 * providing centralized state management for all API operations.
 */

import { create } from 'zustand';
import { persist, StorageValue, StateStorage } from 'zustand/middleware';
import { toast } from '@/hooks/use-toast';

// Import API functions
import {
    getUserSessions,
    createSession,
    updateSession,
    deleteSession,
    deleteUserSessions,
    getSessionMessages,
    likeMessage,
    submitMessageFeedback,
    submitQuery,
    submitRedditQuery,
    createDefaultQueryState,
    listSources,
    deleteSource,
    queryCache,
    sessionCache,
    sourceCache,
} from '../api';

// Import types
import {
    ExtendedAppState,
    ApiState,
    ApiActions,
    ApiLoadingState,
    ApiErrorState,
    DialogState,
    NotificationState,
    SessionFilters,
    SessionSort,
    SourceFilters,
    SourceSort,
    QueryHistory,
    ActiveQuery,
} from './apiTypes';
import { QueryState, SessionData, SourceData, QueryResponseData } from '../api/types';

// ========================
// Initial API State
// ========================

const initialApiState: ApiState = {
    // Loading states
    loading: {
        sessions: false,
        messages: false,
        query: false,
        sources: false,
    },

    // Error states
    errors: {
        sessions: null,
        messages: null,
        query: null,
        sources: null,
    },

    // Session management
    sessions: [],
    activeSessionId: null,
    sessionMessages: {},
    sessionFilters: {
        searchTerm: '',
        tags: [],
        hasExternalSources: null,
        dateRange: {
            start: null,
            end: null,
        },
    },
    sessionSort: {
        field: 'updatedAt',
        direction: 'desc',
    },

    // Query management
    queryHistory: [],
    activeQuery: null,
    queryState: createDefaultQueryState(),
    lastResponse: null,

    // Source management
    sources: [],
    sourceFilters: {
        types: [],
        searchTerm: '',
    },
    sourceSort: {
        field: 'name',
        direction: 'asc',
    },

    // UI state
    dialogs: {
        chatSettings: false,
        externalSources: false,
        profileSettings: false,
        sessionSettings: false,
        sourceManagement: false,
    },
    notifications: [],

    // Cache timestamps
    lastSyncTimes: {
        sessions: null,
        sources: null,
        messages: {},
    },
};

// ========================
// API Actions Implementation
// ========================

const createApiActions = (set: any, get: any): ApiActions => ({
    // Session actions
    fetchUserSessions: async (userId: string, forceRefresh = false) => {
        try {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, sessions: true },
                errors: { ...state.errors, sessions: null },
            }));

            // Check cache first
            if (!forceRefresh) {
                const cached = sessionCache.get(userId);
                if (cached) {
                    set((state: ExtendedAppState) => ({
                        ...state,
                        sessions: cached.sessions,
                        loading: { ...state.loading, sessions: false },
                        lastSyncTimes: { ...state.lastSyncTimes, sessions: new Date() },
                    }));
                    return;
                }
            }

            const response = await getUserSessions(userId);
            const sessions = response.data.sessions;

            // Update cache
            sessionCache.set(userId, response.data);

            set((state: ExtendedAppState) => ({
                ...state,
                sessions,
                loading: { ...state.loading, sessions: false },
                lastSyncTimes: { ...state.lastSyncTimes, sessions: new Date() },
            }));

        } catch (error: any) {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, sessions: false },
                errors: { ...state.errors, sessions: error.message || 'Failed to fetch sessions' },
            }));

            toast({
                title: 'Error',
                description: 'Failed to load chat sessions',
                variant: 'destructive',
            });
        }
    },

    createNewSession: async (userId: string, title: string) => {
        try {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, sessions: true },
                errors: { ...state.errors, sessions: null },
            }));

            const response = await createSession({ user_id: userId, title });
            const newSession = response.data;

            set((state: ExtendedAppState) => ({
                ...state,
                sessions: [
                    {
                        session_id: newSession.session_id,
                        user_id: newSession.user_id,
                        title: newSession.title,
                        time_created: new Date().toISOString(),
                        time_updated: new Date().toISOString(),
                    } as SessionData,
                    ...state.sessions,
                ],
                activeSessionId: newSession.session_id,
                loading: { ...state.loading, sessions: false },
            }));

            // Invalidate cache
            sessionCache.invalidate(userId);

            toast({
                title: 'Success',
                description: 'New chat session created',
                variant: 'default',
            });

            return newSession.session_id;
        } catch (error: any) {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, sessions: false },
                errors: { ...state.errors, sessions: error.message || 'Failed to create session' },
            }));

            toast({
                title: 'Error',
                description: 'Failed to create new chat session',
                variant: 'destructive',
            });

            throw error;
        }
    },

    updateSessionTitle: async (sessionId: string, title: string) => {
        try {
            await updateSession(sessionId, { title });

            set((state: ExtendedAppState) => ({
                ...state,
                sessions: state.sessions.map(session =>
                    session.session_id === sessionId
                        ? { ...session, title, time_updated: new Date().toISOString() }
                        : session
                ),
            }));

            toast({
                title: 'Success',
                description: 'Session title updated',
                variant: 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to update session title',
                variant: 'destructive',
            });
            throw error;
        }
    },

    deleteUserSession: async (sessionId: string) => {
        try {
            await deleteSession(sessionId);

            set((state: ExtendedAppState) => ({
                ...state,
                sessions: state.sessions.filter(session => session.session_id !== sessionId),
                activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
                sessionMessages: Object.fromEntries(
                    Object.entries(state.sessionMessages).filter(([id]) => id !== sessionId)
                ),
            }));

            toast({
                title: 'Success',
                description: 'Chat session deleted',
                variant: 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to delete chat session',
                variant: 'destructive',
            });
            throw error;
        }
    },

    deleteAllUserSessions: async (userId: string) => {
        try {
            await deleteUserSessions(userId);

            set((state: ExtendedAppState) => ({
                ...state,
                sessions: [],
                activeSessionId: null,
                sessionMessages: {},
            }));

            // Clear cache
            sessionCache.invalidate(userId);

            toast({
                title: 'Success',
                description: 'All chat sessions deleted',
                variant: 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to delete chat sessions',
                variant: 'destructive',
            });
            throw error;
        }
    },

    // Message actions
    fetchSessionMessages: async (sessionId: string, forceRefresh = false) => {
        try {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, messages: true },
                errors: { ...state.errors, messages: null },
            }));

            const response = await getSessionMessages(sessionId);
            const messages = response.data.messages;

            set((state: ExtendedAppState) => ({
                ...state,
                sessionMessages: {
                    ...state.sessionMessages,
                    [sessionId]: messages,
                },
                loading: { ...state.loading, messages: false },
                lastSyncTimes: {
                    ...state.lastSyncTimes,
                    messages: {
                        ...state.lastSyncTimes.messages,
                        [sessionId]: new Date(),
                    },
                },
            }));
        } catch (error: any) {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, messages: false },
                errors: { ...state.errors, messages: error.message || 'Failed to fetch messages' },
            }));

            toast({
                title: 'Error',
                description: 'Failed to load chat messages',
                variant: 'destructive',
            });
        }
    },

    likeSessionMessage: async (messageId: string, likeStatus: 'like' | 'dislike') => {
        try {
            await likeMessage(messageId, likeStatus);

            toast({
                title: 'Success',
                description: `Message ${likeStatus === 'like' ? 'liked' : 'disliked'}`,
                variant: 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to update message rating',
                variant: 'destructive',
            });
        }
    },

    submitMessageFeedback: async (messageId: string, feedback: string, stars: number) => {
        try {
            await submitMessageFeedback(messageId, feedback, stars);

            toast({
                title: 'Success',
                description: 'Feedback submitted successfully',
                variant: 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to submit feedback',
                variant: 'destructive',
            });
        }
    },

    // Query actions
    submitNewQuery: async (query: string, sessionId: string, stateUpdates?: Partial<QueryState>) => {
        try {
            const state = get() as ExtendedAppState;
            const queryState = { ...state.queryState, ...stateUpdates };

            const queryId = crypto.randomUUID();
            const startTime = new Date();

            // Set active query
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, query: true },
                errors: { ...state.errors, query: null },
                activeQuery: {
                    id: queryId,
                    query,
                    sessionId,
                    state: queryState,
                    startTime,
                },
            }));

            const request = {
                query,
                session_id: sessionId,
                state: queryState,
            };

            const response = await submitQuery(request);
            const responseData = response.data.response;

            // Add to query history
            const historyEntry: QueryHistory = {
                id: queryId,
                query,
                sessionId,
                timestamp: startTime,
                response: responseData,
                state: queryState,
                success: true,
            };

            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, query: false },
                activeQuery: null,
                lastResponse: responseData,
                queryHistory: [historyEntry, ...state.queryHistory.slice(0, 49)], // Keep last 50
            }));

            return responseData;
        } catch (error: any) {
            const state = get() as ExtendedAppState;

            // Add failed query to history
            if (state.activeQuery) {
                const historyEntry: QueryHistory = {
                    ...state.activeQuery,
                    timestamp: state.activeQuery.startTime,
                    success: false,
                    error: error.message,
                };

                set((state: ExtendedAppState) => ({
                    ...state,
                    loading: { ...state.loading, query: false },
                    activeQuery: null,
                    errors: { ...state.errors, query: error.message || 'Query failed' },
                    queryHistory: [historyEntry, ...state.queryHistory.slice(0, 49)],
                }));
            }

            toast({
                title: 'Error',
                description: 'Failed to process query',
                variant: 'destructive',
            });

            throw error;
        }
    },

    submitRedditQuery: async (query: string, sessionId: string, username?: string, relevance?: string) => {
        try {
            const state = get() as ExtendedAppState;
            const queryState = {
                ...state.queryState,
                reddit_username: username,
                relevance: relevance || 'top'
            };

            const queryId = crypto.randomUUID();
            const startTime = new Date();

            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, query: true },
                errors: { ...state.errors, query: null },
                activeQuery: {
                    id: queryId,
                    query,
                    sessionId,
                    state: queryState,
                    startTime,
                },
            }));

            const request = {
                query,
                session_id: sessionId,
                state: queryState,
            };

            const response = await submitRedditQuery(request);
            const responseData = response.data.response;

            const historyEntry: QueryHistory = {
                id: queryId,
                query,
                sessionId,
                timestamp: startTime,
                response: responseData,
                state: queryState,
                success: true,
            };

            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, query: false },
                activeQuery: null,
                lastResponse: responseData,
                queryHistory: [historyEntry, ...state.queryHistory.slice(0, 49)],
            }));

            return responseData;
        } catch (error: any) {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, query: false },
                activeQuery: null,
                errors: { ...state.errors, query: error.message || 'Reddit query failed' },
            }));

            toast({
                title: 'Error',
                description: 'Failed to process Reddit query',
                variant: 'destructive',
            });

            throw error;
        }
    },

    updateQueryState: (updates: Partial<QueryState>) => {
        set((state: ExtendedAppState) => ({
            ...state,
            queryState: { ...state.queryState, ...updates },
        }));
    },

    clearQueryHistory: () => {
        set((state: ExtendedAppState) => ({
            ...state,
            queryHistory: [],
        }));
    },

    // Source actions
    fetchSources: async (forceRefresh = false) => {
        try {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, sources: true },
                errors: { ...state.errors, sources: null },
            }));

            // Check cache first
            if (!forceRefresh && sourceCache.isValid()) {
                const cached = sourceCache.get();
                if (cached) {
                    set((state: ExtendedAppState) => ({
                        ...state,
                        sources: cached,
                        loading: { ...state.loading, sources: false },
                        lastSyncTimes: { ...state.lastSyncTimes, sources: new Date() },
                    }));
                    return;
                }
            }

            const response = await listSources();
            const sources = response.data.sources;

            // Update cache
            sourceCache.set(sources);

            set((state: ExtendedAppState) => ({
                ...state,
                sources,
                loading: { ...state.loading, sources: false },
                lastSyncTimes: { ...state.lastSyncTimes, sources: new Date() },
            }));
        } catch (error: any) {
            set((state: ExtendedAppState) => ({
                ...state,
                loading: { ...state.loading, sources: false },
                errors: { ...state.errors, sources: error.message || 'Failed to fetch sources' },
            }));

            toast({
                title: 'Error',
                description: 'Failed to load sources',
                variant: 'destructive',
            });
        }
    },

    removeSource: async (sourceId: string) => {
        try {
            await deleteSource(sourceId);

            set((state: ExtendedAppState) => ({
                ...state,
                sources: state.sources.filter(source => source.id !== sourceId),
            }));

            // Update cache
            sourceCache.removeSource(sourceId);

            toast({
                title: 'Success',
                description: 'Source deleted successfully',
                variant: 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to delete source',
                variant: 'destructive',
            });
        }
    },

    refreshSources: async () => {
        const actions = get() as ExtendedAppState & ApiActions;
        await actions.fetchSources(true);
    },

    // UI actions
    setLoading: (key: keyof ApiLoadingState, loading: boolean) => {
        set((state: ExtendedAppState) => ({
            ...state,
            loading: { ...state.loading, [key]: loading },
        }));
    },

    setError: (key: keyof ApiErrorState, error: string | null) => {
        set((state: ExtendedAppState) => ({
            ...state,
            errors: { ...state.errors, [key]: error },
        }));
    },

    clearErrors: () => {
        set((state: ExtendedAppState) => ({
            ...state,
            errors: {
                sessions: null,
                messages: null,
                query: null,
                sources: null,
            },
        }));
    },

    setDialogOpen: (dialog: keyof DialogState, open: boolean) => {
        set((state: ExtendedAppState) => ({
            ...state,
            dialogs: { ...state.dialogs, [dialog]: open },
        }));
    },

    closeAllDialogs: () => {
        set((state: ExtendedAppState) => ({
            ...state,
            dialogs: {
                chatSettings: false,
                externalSources: false,
                profileSettings: false,
                sessionSettings: false,
                sourceManagement: false,
            },
        }));
    },

    showNotification: (message: string, type: NotificationState['type'] = 'info', duration = 5000) => {
        const id = crypto.randomUUID();
        const notification: NotificationState = {
            message,
            type,
            duration,
            visible: true,
        };

        set((state: ExtendedAppState) => ({
            ...state,
            notifications: [...state.notifications, { ...notification, id } as any],
        }));

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                set((state: ExtendedAppState) => ({
                    ...state,
                    notifications: state.notifications.filter((n: any) => n.id !== id),
                }));
            }, duration);
        }
    },

    hideNotification: (id: string) => {
        set((state: ExtendedAppState) => ({
            ...state,
            notifications: state.notifications.filter((n: any) => (n as any).id !== id),
        }));
    },

    clearNotifications: () => {
        set((state: ExtendedAppState) => ({
            ...state,
            notifications: [],
        }));
    },

    invalidateCache: (type: 'sessions' | 'sources' | 'messages', sessionId?: string) => {
        switch (type) {
            case 'sessions':
                sessionCache.clear();
                break;
            case 'sources':
                sourceCache.clear();
                break;
            case 'messages':
                if (sessionId) {
                    set((state: ExtendedAppState) => ({
                        ...state,
                        lastSyncTimes: {
                            ...state.lastSyncTimes,
                            messages: Object.fromEntries(
                                Object.entries(state.lastSyncTimes.messages).filter(([id]) => id !== sessionId)
                            ),
                        },
                    }));
                }
                break;
        }
    },

    clearAllCaches: () => {
        sessionCache.clear();
        sourceCache.clear();
        queryCache.clear();

        set((state: ExtendedAppState) => ({
            ...state,
            lastSyncTimes: {
                sessions: null,
                sources: null,
                messages: {},
            },
        }));
    },

    resetApiState: () => {
        set((state: ExtendedAppState) => ({
            ...state,
            ...initialApiState,
        }));
    },
});

export { createApiActions, initialApiState };