import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

// API Configuration
const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
};

// Error types for better error handling
export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
    data: T;
    success: boolean;
    message?: string;
}

// Extended request config for retry logic
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    retryCount?: number;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_CONFIG.baseURL,
        timeout: API_CONFIG.timeout,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            // Add authentication token if available
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Add request ID for tracking
            config.headers['X-Request-ID'] = crypto.randomUUID();

            // Log request in development
            if (import.meta.env.DEV) {
                console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                    data: config.data,
                    params: config.params,
                });
            }

            return config;
        },
        (error) => {
            console.error('[API Request Error]', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            // Log response in development
            if (import.meta.env.DEV) {
                console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                    status: response.status,
                    data: response.data,
                });
            }

            return response;
        },
        async (error: AxiosError) => {
            const originalRequest = error.config as ExtendedAxiosRequestConfig;

            // Log error in development
            if (import.meta.env.DEV) {
                console.error('[API Response Error]', error.response?.data || error.message);
            }

            // Handle different error scenarios
            if (error.response) {
                // Server responded with error status
                const { status, data } = error.response;
                const errorData = data as Record<string, unknown>;
                const apiError: ApiError = {
                    message: errorData?.detail as string || errorData?.message as string || 'An error occurred',
                    status,
                    details: errorData,
                };

                // Handle specific status codes
                switch (status) {
                    case 401:
                        // Unauthorized - redirect to login or refresh token
                        localStorage.removeItem('auth_token');
                        // You might want to redirect to login page here
                        toast({
                            title: 'Authentication Error',
                            description: 'Please log in again',
                            variant: 'destructive',
                        });
                        break;

                    case 403:
                        // Forbidden
                        toast({
                            title: 'Access Denied',
                            description: 'You don\'t have permission to perform this action',
                            variant: 'destructive',
                        });
                        break;

                    case 404:
                        // Not found
                        toast({
                            title: 'Not Found',
                            description: 'The requested resource was not found',
                            variant: 'destructive',
                        });
                        break;

                    case 429:
                        // Rate limiting
                        toast({
                            title: 'Too Many Requests',
                            description: 'Please wait a moment and try again',
                            variant: 'destructive',
                        });
                        break;

                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        // Server errors - retry logic
                        if (!originalRequest._retry && originalRequest) {
                            originalRequest._retry = true;

                            const retryDelay = API_CONFIG.retryDelay * Math.pow(2, originalRequest.retryCount || 0);
                            originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;

                            if (originalRequest.retryCount <= API_CONFIG.retryAttempts) {
                                await new Promise(resolve => setTimeout(resolve, retryDelay));
                                return client(originalRequest);
                            }
                        }

                        toast({
                            title: 'Server Error',
                            description: 'Something went wrong on our end. Please try again later.',
                            variant: 'destructive',
                        });
                        break;

                    default:
                        toast({
                            title: 'Error',
                            description: apiError.message,
                            variant: 'destructive',
                        });
                }

                throw apiError;
            } else if (error.request) {
                // Network error or no response
                const networkError: ApiError = {
                    message: 'Network error. Please check your connection.',
                    code: 'NETWORK_ERROR',
                };

                toast({
                    title: 'Network Error',
                    description: 'Please check your internet connection and try again',
                    variant: 'destructive',
                });

                throw networkError;
            } else {
                // Request setup error
                const requestError: ApiError = {
                    message: error.message || 'Failed to send request',
                    code: 'REQUEST_ERROR',
                };

                toast({
                    title: 'Request Error',
                    description: requestError.message,
                    variant: 'destructive',
                });

                throw requestError;
            }
        }
    );

    return client;
};

// Export configured API client
export const apiClient = createApiClient();

// Utility functions for common API patterns
export const handleApiError = (error: unknown): ApiError => {
    if (error && typeof error === 'object' && 'message' in error) {
        return error as ApiError;
    }

    return {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    };
};

export const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
    data,
    success: true,
    message,
});

// Health check endpoint
export const checkApiHealth = async (): Promise<ApiResponse<{ status: string; message: string }>> => {
    try {
        const response = await apiClient.get('/health');
        return createApiResponse(response.data, 'API is healthy');
    } catch (error) {
        throw handleApiError(error);
    }
};