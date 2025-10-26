/**
 * API Module Index
 * 
 * This module exports all API functions and types for easy importing throughout the application.
 */

// Export all API client utilities
export * from './client';
export * from './types';

// Export session API
export * as sessionApi from './session';

// Export query API  
export * as queryApi from './query';

// Export source API
export * as sourceApi from './source';

// Re-export commonly used functions for convenience
export {
    // Session functions
    getUserSessions,
    createSession,
    updateSession,
    deleteSession,
    deleteUserSessions,
    getSessionMessages,
    likeMessage,
    submitMessageFeedback,
    sessionCache,
} from './session';

export {
    // Query functions
    submitQuery,
    submitRedditQuery,
    createDefaultQueryState,
    createRedditQueryState,
    updateQueryState,
    validateQueryRequest,
    validateQueryState,
    processQueryResponse,
    queryCache,
} from './query';

export {
    // Source functions
    listSources,
    deleteSource,
    validateSourceId,
    validateSourceData,
    getSourceTypeDisplayName,
    getSourceTypeIcon,
    sortSources,
    filterSourcesByType,
    searchSources,
    sourceCache,
    SUPPORTED_SOURCE_TYPES,
} from './source';

export {
    // Health check
    checkApiHealth,
} from './client';