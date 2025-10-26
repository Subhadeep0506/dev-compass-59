/**
 * Extended Store Types
 * 
 * Additional types for API integration and state management
 */

import {
    SessionData,
    QueryState,
    QueryResponseData,
    SourceData,
    QueryRequest,
    SessionMessage
} from '../api/types';
import {
    Message,
    ChatSession,
    UserProfile,
    ChatSettings,
    AppSettings,
    AssistantPanel
} from './types';

// ========================
// API State Types
// ========================

export interface ApiLoadingState {
    sessions: boolean;
    messages: boolean;
    query: boolean;
    sources: boolean;
}

export interface ApiErrorState {
    sessions: string | null;
    messages: string | null;
    query: string | null;
    sources: string | null;
}

// ========================
// Query Management Types
// ========================

export interface QueryHistory {
    id: string;
    query: string;
    sessionId: string;
    timestamp: Date;
    response?: QueryResponseData;
    state: QueryState;
    success: boolean;
    error?: string;
}

export interface ActiveQuery {
    id: string;
    query: string;
    sessionId: string;
    state: QueryState;
    startTime: Date;
    isStreaming?: boolean;
}

// ========================
// Session Management Types
// ========================

export interface SessionFilters {
    searchTerm: string;
    tags: string[];
    hasExternalSources: boolean | null;
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
}

export interface SessionSort {
    field: 'createdAt' | 'updatedAt' | 'title';
    direction: 'asc' | 'desc';
}

// ========================
// Source Management Types
// ========================

export interface SourceFilters {
    types: string[];
    searchTerm: string;
}

export interface SourceSort {
    field: 'name' | 'type' | 'id';
    direction: 'asc' | 'desc';
}

// ========================
// UI State Types
// ========================

export interface DialogState {
    chatSettings: boolean;
    externalSources: boolean;
    profileSettings: boolean;
    sessionSettings: boolean;
    sourceManagement: boolean;
}

export interface NotificationState {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
    visible: boolean;
}

// ========================
// Extended Store State
// ========================

export interface ApiState {
    // Loading states
    loading: ApiLoadingState;

    // Error states
    errors: ApiErrorState;

    // Session management
    sessions: SessionData[];
    activeSessionId: string | null;
    sessionMessages: Record<string, SessionMessage[]>;
    sessionFilters: SessionFilters;
    sessionSort: SessionSort;

    // Query management
    queryHistory: QueryHistory[];
    activeQuery: ActiveQuery | null;
    queryState: QueryState;
    lastResponse: QueryResponseData | null;

    // Source management
    sources: SourceData[];
    sourceFilters: SourceFilters;
    sourceSort: SourceSort;

    // UI state
    dialogs: DialogState;
    notifications: NotificationState[];

    // Cache timestamps
    lastSyncTimes: {
        sessions: Date | null;
        sources: Date | null;
        messages: Record<string, Date>;
    };
}

// ========================
// Store Actions Interface
// ========================

export interface ApiActions {
    // Session actions
    fetchUserSessions: (userId: string, forceRefresh?: boolean) => Promise<void>;
    createNewSession: (userId: string, title: string) => Promise<string>;
    updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
    deleteUserSession: (sessionId: string) => Promise<void>;
    deleteAllUserSessions: (userId: string) => Promise<void>;

    // Message actions
    fetchSessionMessages: (sessionId: string, forceRefresh?: boolean) => Promise<void>;
    likeSessionMessage: (messageId: string, likeStatus: 'like' | 'dislike') => Promise<void>;
    submitMessageFeedback: (messageId: string, feedback: string, stars: number) => Promise<void>;

    // Query actions
    submitNewQuery: (query: string, sessionId: string, state?: Partial<QueryState>) => Promise<QueryResponseData>;
    submitRedditQuery: (query: string, sessionId: string, username?: string, relevance?: string) => Promise<QueryResponseData>;
    updateQueryState: (updates: Partial<QueryState>) => void;
    clearQueryHistory: () => void;

    // Source actions
    fetchSources: (forceRefresh?: boolean) => Promise<void>;
    removeSource: (sourceId: string) => Promise<void>;
    refreshSources: () => Promise<void>;

    // UI actions
    setLoading: (key: keyof ApiLoadingState, loading: boolean) => void;
    setError: (key: keyof ApiErrorState, error: string | null) => void;
    clearErrors: () => void;

    // Dialog actions
    setDialogOpen: (dialog: keyof DialogState, open: boolean) => void;
    closeAllDialogs: () => void;

    // Notification actions
    showNotification: (message: string, type?: NotificationState['type'], duration?: number) => void;
    hideNotification: (id: string) => void;
    clearNotifications: () => void;

    // Cache management
    invalidateCache: (type: 'sessions' | 'sources' | 'messages', sessionId?: string) => void;
    clearAllCaches: () => void;

    // State management
    resetApiState: () => void;
}

// ========================
// Combined Store Interface  
// ========================

export interface ExtendedAppState extends ApiState {
    // Include all existing AppState properties
    user: UserProfile | null;
    chatSessions: ChatSession[];
    activeChatId: string | null;
    messages: Message[];
    chatSettings: ChatSettings;
    appSettings: AppSettings;
    assistantPanel: AssistantPanel;
    isLoading: boolean;
    chatSettingsOpen: boolean;
    externalDialogOpen: boolean;
    pendingQuery: string;

    // Existing actions (simplified interface)
    setUser: (user: UserProfile | null) => void;
    setChatSessions: (sessions: ChatSession[]) => void;
    addChatSession: (session: ChatSession) => void;
    updateChatSession: (id: string, updates: Partial<ChatSession>) => void;
    deleteChatSession: (id: string) => void;
    setActiveChatId: (id: string | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    deleteMessage: (id: string) => void;
    setChatSettings: (settings: ChatSettings) => void;
    setAppSettings: (settings: Partial<AppSettings>) => void;
    toggleTheme: () => void;
    toggleSidebarCollapsed: () => void;
    setRightPanelOpen: (open: boolean) => void;
    setAssistantPanel: (panel: Partial<AssistantPanel>) => void;
    toggleAssistantPanel: () => void;
    setIsLoading: (loading: boolean) => void;
    setChatSettingsOpen: (open: boolean) => void;
    setExternalDialogOpen: (open: boolean) => void;
    setPendingQuery: (query: string) => void;
    resetStore: () => void;
}

// Re-export existing types for convenience
export type {
    Message,
    ChatSession,
    UserProfile,
    ChatSettings,
    AppSettings,
    AssistantPanel
} from './types';