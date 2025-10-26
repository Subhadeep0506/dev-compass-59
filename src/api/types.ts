/**
 * API Types and Interfaces
 * 
 * This module contains all TypeScript interfaces and types for API requests/responses
 * based on the backend Pydantic models and API endpoints.
 */

// ========================
// Query Related Types
// ========================

export interface QueryState {
    model_name: string;
    category?: string;
    sub_category?: string;
    temperature: number;
    top_k: number;
    memory_service: string;
    reddit_username?: string;
    relevance?: string;
}

export interface QueryRequest {
    query: string;
    session_id: string;
    state: QueryState;
}

export interface QuerySource {
    content: string;
    source: string;
}

export interface QueryResponseData {
    answer: string;
    sources: QuerySource[];
}

export interface QueryResponse {
    response: QueryResponseData;
}

// ========================
// Session Related Types
// ========================

export interface CreateSessionRequest {
    user_id: string;
    title: string;
}

export interface UpdateSessionRequest {
    title: string;
}

export interface SessionData {
    session_id: string;
    user_id: string;
    title: string;
    time_created: string;
    time_updated: string;
}

export interface SessionsResponse {
    sessions: SessionData[];
}

export interface SessionResponse {
    session_id: string;
    user_id: string;
    title: string;
}

export interface UpdateSessionResponse {
    detail: string;
    session: {
        session_id: string;
        title: string;
    };
}

export interface DeleteResponse {
    detail: string;
}

// ========================
// Message Related Types
// ========================

export interface MessageContent {
    question: string;
    answer: string;
}

export interface SessionMessage {
    message_id: string;
    session_id: string;
    content: MessageContent;
    sources: QuerySource[];
    timestamp: string;
    like?: 'like' | 'dislike';
    feedback?: string;
    stars?: number;
}

export interface MessagesResponse {
    messages: SessionMessage[];
}

export interface LikeMessageResponse {
    detail: string;
}

export interface FeedbackMessageResponse {
    detail: string;
}

// ========================
// Source Related Types
// ========================

export interface SourceData {
    id: string;
    name: string;
    type: string;
}

export interface SourcesResponse {
    sources: SourceData[];
}

export interface DeleteSourceResponse {
    message: string;
}

// ========================
// Health Check Types
// ========================

export interface HealthResponse {
    status: string;
    message: string;
}

// ========================
// Error Types
// ========================

export interface ApiErrorDetails {
    detail?: string;
    message?: string;
    code?: string;
    [key: string]: unknown;
}

export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ValidationErrorResponse {
    detail: ValidationError[];
}

// ========================
// Common Types
// ========================

export type LikeStatus = 'like' | 'dislike';
export type MessageFeedback = string;

// ========================
// API Configuration Types
// ========================

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}

// ========================
// Pagination Types (for future use)
// ========================

export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_previous: boolean;
}

// ========================
// Search/Filter Types (for future use)
// ========================

export interface SearchParams {
    query?: string;
    filters?: Record<string, unknown>;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

// ========================
// Upload Types (for future file upload features)
// ========================

export interface FileUploadResponse {
    file_id: string;
    filename: string;
    size: number;
    url: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}