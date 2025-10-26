/**
 * Query API Module
 * 
 * This module handles all query-related API calls including:
 * - Submitting queries to the main endpoint
 * - Submitting Reddit queries
 * - Streaming responses (for future implementation)
 * - Query state management
 * - Response processing
 */

import { apiClient, ApiResponse, handleApiError } from './client';
import {
    QueryRequest,
    QueryResponse,
    QueryState,
    QueryResponseData,
} from './types';

// ========================
// Query APIs
// ========================

/**
 * Submit a query to the main RAG endpoint
 */
export const submitQuery = async (request: QueryRequest): Promise<ApiResponse<QueryResponse>> => {
    try {
        // Validate request before sending
        validateQueryRequest(request);

        const response = await apiClient.post<QueryResponse>('/query/', request);

        return {
            data: response.data,
            success: true,
            message: 'Query processed successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Submit a Reddit-specific query
 */
export const submitRedditQuery = async (request: QueryRequest): Promise<ApiResponse<QueryResponse>> => {
    try {
        // Validate request and ensure Reddit-specific fields are present
        validateQueryRequest(request);
        validateRedditQueryState(request.state);

        const response = await apiClient.post<QueryResponse>('/query/reddit', request);

        return {
            data: response.data,
            success: true,
            message: 'Reddit query processed successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// ========================
// Query State Management
// ========================

/**
 * Create default query state
 */
export const createDefaultQueryState = (overrides?: Partial<QueryState>): QueryState => {
    const baseState: QueryState = {
        model_name: 'codestral-latest',
        temperature: 0.7,
        top_k: 5,
        memory_service: 'astradb',
    };

    // Apply overrides, but category and sub_category are only included if explicitly provided
    return {
        ...baseState,
        ...overrides,
    };
};

/**
 * Create query state for Reddit queries
 */
export const createRedditQueryState = (
    username?: string,
    relevance?: string,
    overrides?: Partial<QueryState>
): QueryState => {
    return {
        ...createDefaultQueryState(overrides),
        reddit_username: username,
        relevance: relevance || 'top',
    };
};

/**
 * Update query state with new values
 */
export const updateQueryState = (
    currentState: QueryState,
    updates: Partial<QueryState>
): QueryState => {
    return {
        ...currentState,
        ...updates,
    };
};

// ========================
// Query Validation
// ========================

/**
 * Validate query request structure and content
 */
export const validateQueryRequest = (request: QueryRequest): void => {
    if (!request.query || typeof request.query !== 'string') {
        throw new Error('Query text is required and must be a string');
    }

    if (request.query.trim().length === 0) {
        throw new Error('Query text cannot be empty');
    }

    if (request.query.length > 5000) {
        throw new Error('Query text is too long (maximum 5000 characters)');
    }

    if (!request.session_id || typeof request.session_id !== 'string') {
        throw new Error('Session ID is required and must be a string');
    }

    if (!request.state) {
        throw new Error('Query state is required');
    }

    validateQueryState(request.state);
};

/**
 * Validate query state parameters
 */
export const validateQueryState = (state: QueryState): void => {
    if (!state.model_name || typeof state.model_name !== 'string') {
        throw new Error('Model name is required and must be a string');
    }

    if (typeof state.temperature !== 'number' || state.temperature < 0 || state.temperature > 2) {
        throw new Error('Temperature must be a number between 0 and 2');
    }

    if (typeof state.top_k !== 'number' || state.top_k < 1 || state.top_k > 100) {
        throw new Error('Top K must be a number between 1 and 100');
    }

    if (!state.memory_service || typeof state.memory_service !== 'string') {
        throw new Error('Memory service is required and must be a string');
    }

    // Optional field validations
    if (state.category && typeof state.category !== 'string') {
        throw new Error('Category must be a string if provided');
    }

    if (state.sub_category && typeof state.sub_category !== 'string') {
        throw new Error('Sub-category must be a string if provided');
    }
};

/**
 * Validate Reddit-specific query state
 */
export const validateRedditQueryState = (state: QueryState): void => {
    if (state.reddit_username && typeof state.reddit_username !== 'string') {
        throw new Error('Reddit username must be a string if provided');
    }

    if (state.relevance && !['hot', 'top', 'new', 'rising'].includes(state.relevance)) {
        throw new Error('Reddit relevance must be one of: hot, top, new, rising');
    }
};

// ========================
// Response Processing
// ========================

/**
 * Process and sanitize query response
 */
export const processQueryResponse = (response: QueryResponseData): QueryResponseData => {
    return {
        answer: sanitizeResponseText(response.answer),
        sources: response.sources?.map(source => ({
            content: sanitizeResponseText(source.content),
            source: source.source,
        })) || [],
    };
};

/**
 * Sanitize response text to prevent XSS and ensure proper formatting
 */
export const sanitizeResponseText = (text: string): string => {
    if (typeof text !== 'string') return '';

    // Basic HTML sanitization - in a real app, consider using a library like DOMPurify
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
};

/**
 * Extract keywords from query for analytics
 */
export const extractQueryKeywords = (query: string): string[] => {
    if (!query || typeof query !== 'string') return [];

    // Simple keyword extraction - remove common words and split
    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'how', 'what', 'when', 'where', 'why', 'who', 'which', 'can', 'could', 'would', 'should',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);

    return query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.has(word))
        .slice(0, 10); // Limit to 10 keywords
};

// ========================
// Query History and Caching
// ========================

/**
 * Query cache for storing recent responses
 */
class QueryCache {
    private cache = new Map<string, { response: QueryResponseData; timestamp: number }>();
    private readonly MAX_CACHE_SIZE = 100;
    private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    private generateCacheKey(query: string, state: QueryState): string {
        // Create a hash of the query and relevant state parameters
        const stateKey = `${state.model_name}-${state.category}-${state.sub_category}-${state.temperature}-${state.top_k}`;
        return `${query.toLowerCase().trim()}-${stateKey}`;
    }

    get(query: string, state: QueryState): QueryResponseData | null {
        const key = this.generateCacheKey(query, state);
        const cached = this.cache.get(key);

        if (!cached) return null;

        // Check if cache is still valid
        if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        return cached.response;
    }

    set(query: string, state: QueryState, response: QueryResponseData): void {
        const key = this.generateCacheKey(query, state);

        // Remove oldest entries if cache is full
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            response,
            timestamp: Date.now(),
        });
    }

    clear(): void {
        this.cache.clear();
    }
}

export const queryCache = new QueryCache();

// ========================
// Query Analytics
// ========================

/**
 * Track query metrics for analytics
 */
export interface QueryMetrics {
    query: string;
    sessionId: string;
    timestamp: Date;
    responseTime?: number;
    success: boolean;
    error?: string;
    keywords: string[];
    modelUsed: string;
    sourcesReturned: number;
}

/**
 * Log query metrics (placeholder for analytics implementation)
 */
export const logQueryMetrics = (metrics: QueryMetrics): void => {
    if (import.meta.env.DEV) {
        console.log('[Query Metrics]', metrics);
    }

    // In production, this would send metrics to an analytics service
    // Example: analytics.track('query_submitted', metrics);
};

// ========================
// Streaming Support (Future Implementation)
// ========================

/**
 * Setup for streaming query responses
 * This is a placeholder for future streaming implementation
 */
export interface StreamingOptions {
    onChunk?: (chunk: string) => void;
    onComplete?: (response: QueryResponseData) => void;
    onError?: (error: Error) => void;
}

export const submitStreamingQuery = async (
    request: QueryRequest,
    options: StreamingOptions = {}
): Promise<void> => {
    // Placeholder for streaming implementation
    // This would use Server-Sent Events or WebSocket for real-time streaming
    console.log('Streaming query not yet implemented', { request, options });
    throw new Error('Streaming queries are not yet implemented');
};