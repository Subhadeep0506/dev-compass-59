/**
 * API Hooks
 * 
 * Custom React hooks for API operations with loading states,
 * error handling, and optimistic updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { handleError, handleApiError, withRetry } from '../utils/errorHandler';
import { ApiError } from '../api/client';

// Helper function to handle errors
const handleApiErrorSafely = (error: unknown, context: Record<string, unknown>) => {
    const apiError = error as ApiError;
    return handleApiError(apiError, context);
};
import {
    getUserSessions,
    createSession,
    getSessionMessages,
    submitQuery,
    submitRedditQuery,
    listSources,
    deleteSource,
    CreateSessionRequest,
    QueryRequest,
    SessionData,
    SessionMessage,
    QueryResponseData,
    SourceData,
    QueryState,
    createDefaultQueryState,
} from '../api';

// ========================
// Hook Types
// ========================

interface ApiHookState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface MutationHookState<T, TArgs = unknown> {
    data: T | null;
    loading: boolean;
    error: string | null;
    mutate: (args: TArgs) => Promise<T>;
    reset: () => void;
}

// ========================
// Sessions Hooks
// ========================

export const useSessions = (userId?: string): ApiHookState<SessionData[]> => {
    const [state, setState] = useState<{
        data: SessionData[] | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null,
    });

    const abortControllerRef = useRef<AbortController>();

    const fetchSessions = useCallback(async () => {
        if (!userId) {
            console.log('useSessions: No userId provided');
            return;
        }

        console.log('useSessions: Fetching sessions for userId:', userId);

        // Abort previous request
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await getUserSessions(userId);
            console.log('useSessions: Successfully fetched sessions:', response.data);
            setState({
                data: response.data.sessions,
                loading: false,
                error: null,
            });
        } catch (error: unknown) {
            const apiError = error as Error;
            if (apiError.name !== 'AbortError') {
                console.error('useSessions: Error fetching sessions:', error);
                const errorId = handleApiErrorSafely(error, {
                    component: 'useSessions',
                    action: 'session_load',
                    userId,
                });
                const apiError = error as ApiError;
                setState({
                    data: null,
                    loading: false,
                    error: apiError.message || 'Failed to fetch sessions',
                });
            }
        }
    }, [userId]);

    useEffect(() => {
        fetchSessions();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchSessions]);

    return {
        ...state,
        refetch: fetchSessions,
    };
};

export const useCreateSession = () => {
    const [state, setState] = useState<{
        data: string | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null,
    });

    const mutate = useCallback(async (request: CreateSessionRequest): Promise<string> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await createSession(request);
            const sessionId = response.data.session_id;

            setState({
                data: sessionId,
                loading: false,
                error: null,
            });

            toast({
                title: 'Success',
                description: 'Chat session created successfully',
            });

            return sessionId;
        } catch (error: unknown) {
            const apiError = error as ApiError;
            handleApiErrorSafely(apiError, {
                component: 'useCreateSession',
                action: 'session_create',
                userId: request.user_id,
            });

            setState({
                data: null,
                loading: false,
                error: apiError.message || 'Failed to create session',
            });

            throw error;
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        mutate,
        reset,
    };
};

// ========================
// Messages Hooks
// ========================

export const useSessionMessages = (sessionId?: string): ApiHookState<SessionMessage[]> => {
    const [state, setState] = useState<{
        data: SessionMessage[] | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null,
    });

    const abortControllerRef = useRef<AbortController>();

    const fetchMessages = useCallback(async () => {
        if (!sessionId) {
            setState({
                data: null,
                loading: false,
                error: null,
            });
            return;
        }

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await getSessionMessages(sessionId);
            setState({
                data: response.data.messages,
                loading: false,
                error: null,
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                handleApiError(error, {
                    component: 'useSessionMessages',
                    action: 'message_load',
                    sessionId,
                });
                setState({
                    data: null,
                    loading: false,
                    error: error.message || 'Failed to fetch messages',
                });
            }
        }
    }, [sessionId]);

    useEffect(() => {
        fetchMessages();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchMessages]);

    return {
        ...state,
        refetch: fetchMessages,
    };
};

// ========================
// Query Hooks
// ========================

export interface QueryMutationParams {
    query: string;
    sessionId: string;
    state?: Partial<QueryState>;
    isRedditQuery?: boolean;
    redditUsername?: string;
    redditRelevance?: string;
}

export const useSubmitQuery = (): MutationHookState<QueryResponseData> => {
    const [state, setState] = useState<{
        data: QueryResponseData | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null,
    });

    const mutate = useCallback(async (params: QueryMutationParams): Promise<QueryResponseData> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const queryState = { ...createDefaultQueryState(), ...params.state };

            const request: QueryRequest = {
                query: params.query,
                session_id: params.sessionId,
                state: params.isRedditQuery ? {
                    ...queryState,
                    reddit_username: params.redditUsername,
                    relevance: params.redditRelevance || 'top',
                } : queryState,
            };

            // Add retry logic for queries
            const response = await withRetry(
                () => params.isRedditQuery ? submitRedditQuery(request) : submitQuery(request),
                {
                    maxAttempts: 3,
                    delay: 1000,
                    backoff: true,
                    onRetry: (attempt, error) => {
                        console.log(`Query retry attempt ${attempt}:`, error);
                    },
                }
            );

            const responseData = response.data.response;

            setState({
                data: responseData,
                loading: false,
                error: null,
            });

            return responseData;
        } catch (error: any) {
            handleApiError(error, {
                component: 'useSubmitQuery',
                action: 'query_submit',
                sessionId: params.sessionId,
                additionalInfo: {
                    queryLength: params.query.length,
                    isRedditQuery: params.isRedditQuery,
                },
            });

            setState({
                data: null,
                loading: false,
                error: error.message || 'Failed to process query',
            });

            throw error;
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        mutate,
        reset,
    };
};

// ========================
// Sources Hooks
// ========================

export const useSources = (): ApiHookState<SourceData[]> => {
    const [state, setState] = useState<{
        data: SourceData[] | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null,
    });

    const abortControllerRef = useRef<AbortController>();

    const fetchSources = useCallback(async () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await listSources();
            setState({
                data: response.data.sources,
                loading: false,
                error: null,
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                handleApiError(error, {
                    component: 'useSources',
                    action: 'source_load',
                });
                setState({
                    data: null,
                    loading: false,
                    error: error.message || 'Failed to fetch sources',
                });
            }
        }
    }, []);

    useEffect(() => {
        fetchSources();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchSources]);

    return {
        ...state,
        refetch: fetchSources,
    };
};

export const useDeleteSource = (): MutationHookState<void> => {
    const [state, setState] = useState<{
        data: void | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null,
    });

    const mutate = useCallback(async (sourceId: string): Promise<void> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            await deleteSource(sourceId);

            setState({
                data: undefined,
                loading: false,
                error: null,
            });

            toast({
                title: 'Success',
                description: 'Source deleted successfully',
            });
        } catch (error: any) {
            handleApiError(error, {
                component: 'useDeleteSource',
                action: 'source_delete',
                additionalInfo: { sourceId },
            });

            setState({
                data: null,
                loading: false,
                error: error.message || 'Failed to delete source',
            });

            throw error;
        }
    }, []);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        mutate,
        reset,
    };
};

// ========================
// Utility Hooks
// ========================

/**
 * Hook for handling optimistic updates
 */
export const useOptimisticUpdate = <T>(
    initialData: T,
    updateFn: (data: T, optimisticUpdate: Partial<T>) => T
) => {
    const [data, setData] = useState<T>(initialData);
    const [isOptimistic, setIsOptimistic] = useState(false);

    const optimisticUpdate = useCallback((update: Partial<T>) => {
        setData(current => updateFn(current, update));
        setIsOptimistic(true);
    }, [updateFn]);

    const confirmUpdate = useCallback((finalData: T) => {
        setData(finalData);
        setIsOptimistic(false);
    }, []);

    const revertUpdate = useCallback(() => {
        setData(initialData);
        setIsOptimistic(false);
    }, [initialData]);

    return {
        data,
        isOptimistic,
        optimisticUpdate,
        confirmUpdate,
        revertUpdate,
    };
};

/**
 * Hook for debounced API calls
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => callback(...args), delay);
        },
        [callback, delay]
    ) as T;

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, []);

    return debouncedCallback;
};

/**
 * Hook for polling data
 */
export const usePolling = (
    callback: () => Promise<void>,
    interval: number,
    enabled = true
) => {
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (enabled) {
            intervalRef.current = setInterval(callback, interval);
            return () => {
                clearInterval(intervalRef.current);
            };
        }
    }, [callback, interval, enabled]);
};

/**
 * Hook for managing API cache
 */
export const useApiCache = <T>(key: string, initialValue: T | null = null) => {
    const [cache, setCache] = useState<T | null>(initialValue);

    const updateCache = useCallback((value: T) => {
        setCache(value);
        localStorage.setItem(`api_cache_${key}`, JSON.stringify(value));
    }, [key]);

    const clearCache = useCallback(() => {
        setCache(null);
        localStorage.removeItem(`api_cache_${key}`);
    }, [key]);

    // Load from localStorage on mount
    useEffect(() => {
        const cached = localStorage.getItem(`api_cache_${key}`);
        if (cached) {
            try {
                setCache(JSON.parse(cached));
            } catch (error) {
                console.warn('Failed to parse cached data:', error);
                clearCache();
            }
        }
    }, [key, clearCache]);

    return {
        cache,
        updateCache,
        clearCache,
        hasCache: cache !== null,
    };
};