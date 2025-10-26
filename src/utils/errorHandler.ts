/**
 * Global Error Handler
 * 
 * This module provides centralized error handling for the entire application,
 * including API errors, validation errors, and unexpected errors.
 */

import { toast } from '@/hooks/use-toast';
import { ApiError } from '../api/client';

// ========================
// Error Types
// ========================

export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    sessionId?: string;
    additionalInfo?: Record<string, unknown>;
}

export interface ErrorLog {
    id: string;
    timestamp: Date;
    error: Error | ApiError;
    context: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
    handled: boolean;
}

// ========================
// Error Severity Classification
// ========================

const classifyErrorSeverity = (error: Error | ApiError): 'low' | 'medium' | 'high' | 'critical' => {
    // API errors with status codes
    if ('status' in error && error.status) {
        switch (error.status) {
            case 400:
            case 422: // Validation errors
                return 'low';
            case 401:
            case 403: // Auth errors
                return 'medium';
            case 404: // Not found
                return 'low';
            case 429: // Rate limiting
                return 'medium';
            case 500:
            case 502:
            case 503:
            case 504: // Server errors
                return 'high';
            default:
                return 'medium';
        }
    }

    // Network errors
    if ('code' in error && error.code === 'NETWORK_ERROR') {
        return 'high';
    }

    // Generic errors
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
        return 'high';
    }

    if (message.includes('validation') || message.includes('invalid')) {
        return 'low';
    }

    if (message.includes('unauthorized') || message.includes('forbidden')) {
        return 'medium';
    }

    return 'medium';
};

// ========================
// Error Messages
// ========================

const getErrorDisplayMessage = (error: Error | ApiError, context: ErrorContext): string => {
    // Custom messages based on context
    const contextMessages: Record<string, string> = {
        login: 'Failed to log in. Please check your credentials.',
        logout: 'Failed to log out. Please try again.',
        session_create: 'Failed to create chat session. Please try again.',
        session_load: 'Failed to load chat sessions. Please refresh the page.',
        message_load: 'Failed to load messages. Please try again.',
        query_submit: 'Failed to send your message. Please check your connection and try again.',
        source_load: 'Failed to load sources. Please refresh the page.',
        source_delete: 'Failed to delete source. Please try again.',
    };

    const actionKey = context.action;
    if (actionKey && contextMessages[actionKey]) {
        return contextMessages[actionKey];
    }

    // Fallback to error message
    return error.message || 'An unexpected error occurred';
};

// ========================
// Error Logging
// ========================

class ErrorLogger {
    private logs: ErrorLog[] = [];
    private maxLogs = 100;

    log(error: Error | ApiError, context: ErrorContext = {}): string {
        const id = crypto.randomUUID();
        const errorLog: ErrorLog = {
            id,
            timestamp: new Date(),
            error,
            context,
            severity: classifyErrorSeverity(error),
            handled: false,
        };

        this.logs.unshift(errorLog);

        // Keep only the most recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Log to console in development
        if (import.meta.env.DEV) {
            console.group(`[Error ${errorLog.severity.toUpperCase()}] ${context.component || 'Unknown'}`);
            console.error('Error:', error);
            console.log('Context:', context);
            console.log('Timestamp:', errorLog.timestamp);
            console.groupEnd();
        }

        // In production, you might want to send critical errors to a monitoring service
        if (import.meta.env.PROD && errorLog.severity === 'critical') {
            // Example: sendToMonitoringService(errorLog);
        }

        return id;
    }

    markAsHandled(id: string): void {
        const log = this.logs.find(l => l.id === id);
        if (log) {
            log.handled = true;
        }
    }

    getLogs(): ErrorLog[] {
        return [...this.logs];
    }

    getUnhandledErrors(): ErrorLog[] {
        return this.logs.filter(l => !l.handled);
    }

    clearLogs(): void {
        this.logs = [];
    }

    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

export const errorLogger = new ErrorLogger();

// ========================
// Global Error Handler
// ========================

export interface ErrorHandlerOptions {
    showToast?: boolean;
    logError?: boolean;
    toastDuration?: number;
    customMessage?: string;
    onError?: (error: Error | ApiError, context: ErrorContext) => void;
}

export const handleError = (
    error: Error | ApiError,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
): string => {
    const {
        showToast = true,
        logError = true,
        toastDuration = 5000,
        customMessage,
        onError,
    } = options;

    // Log the error
    let errorId = '';
    if (logError) {
        errorId = errorLogger.log(error, context);
    }

    // Get display message
    const message = customMessage || getErrorDisplayMessage(error, context);

    // Show toast notification
    if (showToast) {
        const severity = classifyErrorSeverity(error);
        const variant = severity === 'critical' || severity === 'high' ? 'destructive' : 'default';

        toast({
            title: 'Error',
            description: message,
            variant,
            duration: toastDuration,
        });
    }

    // Call custom error handler
    if (onError) {
        try {
            onError(error, context);
        } catch (handlerError) {
            console.error('Error in custom error handler:', handlerError);
        }
    }

    // Mark as handled
    if (errorId) {
        errorLogger.markAsHandled(errorId);
    }

    return errorId;
};

// ========================
// Specialized Error Handlers
// ========================

export const handleApiError = (
    error: ApiError,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
): string => {
    return handleError(error, { ...context, component: 'API' }, options);
};

export const handleValidationError = (
    error: Error,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
): string => {
    return handleError(error, { ...context, action: 'validation' }, {
        ...options,
        customMessage: options.customMessage || 'Please check your input and try again.',
    });
};

export const handleNetworkError = (
    error: Error,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
): string => {
    return handleError(error, { ...context, action: 'network' }, {
        ...options,
        customMessage: options.customMessage || 'Network error. Please check your connection and try again.',
    });
};

export const handleAuthError = (
    error: Error,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
): string => {
    return handleError(error, { ...context, action: 'auth' }, {
        ...options,
        customMessage: options.customMessage || 'Authentication error. Please log in again.',
    });
};

// ========================
// Error Recovery Utilities
// ========================

export interface RetryOptions {
    maxAttempts: number;
    delay: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
}

export const withRetry = async <T>(
    fn: () => Promise<T>,
    options: RetryOptions
): Promise<T> => {
    const { maxAttempts, delay, backoff = true, onRetry } = options;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                break; // Don't retry on last attempt
            }

            if (onRetry) {
                onRetry(attempt, lastError);
            }

            // Calculate delay (with optional exponential backoff)
            const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
            await new Promise(resolve => setTimeout(resolve, currentDelay));
        }
    }

    throw lastError!;
};

// ========================
// Error Boundary Helper
// ========================

export interface ErrorBoundaryInfo {
    componentStack?: string;
    errorBoundary?: string;
    eventType?: string;
}

export const handleErrorBoundary = (
    error: Error,
    errorInfo: ErrorBoundaryInfo,
    context: ErrorContext = {}
): string => {
    const enhancedContext: ErrorContext = {
        ...context,
        component: 'ErrorBoundary',
        additionalInfo: {
            componentStack: errorInfo.componentStack,
            errorBoundary: errorInfo.errorBoundary,
            eventType: errorInfo.eventType,
        },
    };

    return handleError(error, enhancedContext, {
        customMessage: 'Something went wrong. Please refresh the page and try again.',
        toastDuration: 10000, // Longer duration for boundary errors
    });
};

// ========================
// Development Utilities
// ========================

export const getErrorSummary = (): {
    total: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
    recent: ErrorLog[];
} => {
    const logs = errorLogger.getLogs();

    const bySeverity: Record<string, number> = {};
    const byComponent: Record<string, number> = {};

    logs.forEach(log => {
        bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
        const component = log.context.component || 'Unknown';
        byComponent[component] = (byComponent[component] || 0) + 1;
    });

    return {
        total: logs.length,
        bySeverity,
        byComponent,
        recent: logs.slice(0, 10),
    };
};

// ========================
// Global Error Listener
// ========================

if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        handleError(
            new Error(event.reason?.message || 'Unhandled promise rejection'),
            { component: 'Global', action: 'unhandledrejection' },
            { customMessage: 'An unexpected error occurred. Please try again.' }
        );
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
        handleError(
            event.error || new Error(event.message),
            {
                component: 'Global',
                action: 'error',
                additionalInfo: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                }
            },
            { customMessage: 'An unexpected error occurred. Please refresh the page.' }
        );
    });
}