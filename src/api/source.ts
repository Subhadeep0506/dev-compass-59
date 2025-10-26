/**
 * Source API Module
 * 
 * This module handles all source-related API calls including:
 * - Listing available sources
 * - Deleting sources
 * - Managing source metadata
 * - Source validation and utilities
 */

import { apiClient, ApiResponse, handleApiError } from './client';
import {
    SourcesResponse,
    DeleteSourceResponse,
    SourceData,
} from './types';

// ========================
// Source Management APIs
// ========================

/**
 * List all available sources
 */
export const listSources = async (): Promise<ApiResponse<SourcesResponse>> => {
    try {
        const response = await apiClient.post<SourcesResponse>('/source/');

        return {
            data: response.data,
            success: true,
            message: 'Sources retrieved successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Delete a specific source by ID
 */
export const deleteSource = async (sourceId: string): Promise<ApiResponse<DeleteSourceResponse>> => {
    try {
        validateSourceId(sourceId);

        const response = await apiClient.delete<DeleteSourceResponse>(`/source/${sourceId}`);

        return {
            data: response.data,
            success: true,
            message: 'Source deleted successfully'
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// ========================
// Source Validation
// ========================

/**
 * Validate source ID format
 */
export const validateSourceId = (sourceId: string): void => {
    if (!sourceId || typeof sourceId !== 'string') {
        throw new Error('Source ID is required and must be a string');
    }

    if (sourceId.trim().length === 0) {
        throw new Error('Source ID cannot be empty');
    }

    if (sourceId.length > 255) {
        throw new Error('Source ID is too long (maximum 255 characters)');
    }

    // Check for valid characters (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9-_]+$/.test(sourceId)) {
        throw new Error('Source ID contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed');
    }
};

/**
 * Validate source data structure
 */
export const validateSourceData = (source: SourceData): void => {
    if (!source || typeof source !== 'object') {
        throw new Error('Source data must be an object');
    }

    validateSourceId(source.id);

    if (!source.name || typeof source.name !== 'string') {
        throw new Error('Source name is required and must be a string');
    }

    if (source.name.trim().length === 0) {
        throw new Error('Source name cannot be empty');
    }

    if (!source.type || typeof source.type !== 'string') {
        throw new Error('Source type is required and must be a string');
    }

    if (source.type.trim().length === 0) {
        throw new Error('Source type cannot be empty');
    }
};

// ========================
// Source Utilities
// ========================

/**
 * Source types that are supported by the system
 */
export const SUPPORTED_SOURCE_TYPES = [
    'website',
    'documentation',
    'forum',
    'reddit',
    'github',
    'stackoverflow',
    'blog',
    'wiki',
    'pdf',
    'text',
    'other'
] as const;

export type SupportedSourceType = typeof SUPPORTED_SOURCE_TYPES[number];

/**
 * Check if a source type is supported
 */
export const isSupportedSourceType = (type: string): type is SupportedSourceType => {
    return SUPPORTED_SOURCE_TYPES.includes(type as SupportedSourceType);
};

/**
 * Get display name for source type
 */
export const getSourceTypeDisplayName = (type: string): string => {
    const displayNames: Record<string, string> = {
        website: 'Website',
        documentation: 'Documentation',
        forum: 'Forum',
        reddit: 'Reddit',
        github: 'GitHub',
        stackoverflow: 'Stack Overflow',
        blog: 'Blog',
        wiki: 'Wiki',
        pdf: 'PDF Document',
        text: 'Text File',
        other: 'Other'
    };

    return displayNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

/**
 * Get icon for source type (returns icon name/class)
 */
export const getSourceTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
        website: 'globe',
        documentation: 'book-open',
        forum: 'message-circle',
        reddit: 'reddit',
        github: 'github',
        stackoverflow: 'stack-overflow',
        blog: 'edit-3',
        wiki: 'layers',
        pdf: 'file-text',
        text: 'file',
        other: 'help-circle'
    };

    return icons[type] || 'help-circle';
};

/**
 * Sort sources by relevance and type
 */
export const sortSources = (sources: SourceData[], sortBy: 'name' | 'type' | 'id' = 'name'): SourceData[] => {
    return [...sources].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'type':
                return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
            case 'id':
                return a.id.localeCompare(b.id);
            default:
                return 0;
        }
    });
};

/**
 * Filter sources by type
 */
export const filterSourcesByType = (sources: SourceData[], types: string[]): SourceData[] => {
    if (types.length === 0) return sources;
    return sources.filter(source => types.includes(source.type));
};

/**
 * Search sources by name or type
 */
export const searchSources = (sources: SourceData[], query: string): SourceData[] => {
    if (!query.trim()) return sources;

    const searchTerm = query.toLowerCase().trim();
    return sources.filter(source =>
        source.name.toLowerCase().includes(searchTerm) ||
        source.type.toLowerCase().includes(searchTerm) ||
        source.id.toLowerCase().includes(searchTerm)
    );
};

// ========================
// Source Cache Management
// ========================

/**
 * Source cache for storing retrieved sources
 */
class SourceCache {
    private cache: SourceData[] | null = null;
    private lastUpdate: number | null = null;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    get(): SourceData[] | null {
        if (!this.cache || !this.lastUpdate) return null;

        // Check if cache is still valid
        if (Date.now() - this.lastUpdate > this.CACHE_DURATION) {
            this.clear();
            return null;
        }

        return [...this.cache]; // Return a copy to prevent mutations
    }

    set(sources: SourceData[]): void {
        this.cache = [...sources]; // Store a copy to prevent mutations
        this.lastUpdate = Date.now();
    }

    addSource(source: SourceData): void {
        if (this.cache) {
            // Check if source already exists
            const existingIndex = this.cache.findIndex(s => s.id === source.id);
            if (existingIndex >= 0) {
                this.cache[existingIndex] = source;
            } else {
                this.cache.push(source);
            }
            this.lastUpdate = Date.now();
        }
    }

    removeSource(sourceId: string): void {
        if (this.cache) {
            this.cache = this.cache.filter(s => s.id !== sourceId);
            this.lastUpdate = Date.now();
        }
    }

    clear(): void {
        this.cache = null;
        this.lastUpdate = null;
    }

    isValid(): boolean {
        return this.cache !== null &&
            this.lastUpdate !== null &&
            (Date.now() - this.lastUpdate) <= this.CACHE_DURATION;
    }
}

export const sourceCache = new SourceCache();

// ========================
// Source Statistics
// ========================

/**
 * Get statistics about sources
 */
export interface SourceStatistics {
    total: number;
    byType: Record<string, number>;
    mostCommonType: string;
    typeDistribution: Array<{ type: string; count: number; percentage: number }>;
}

export const getSourceStatistics = (sources: SourceData[]): SourceStatistics => {
    const total = sources.length;
    const byType: Record<string, number> = {};

    // Count by type
    sources.forEach(source => {
        byType[source.type] = (byType[source.type] || 0) + 1;
    });

    // Find most common type
    const mostCommonType = Object.entries(byType)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    // Create distribution array
    const typeDistribution = Object.entries(byType)
        .map(([type, count]) => ({
            type,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

    return {
        total,
        byType,
        mostCommonType,
        typeDistribution
    };
};

// ========================
// Source URL Utilities (for future implementation)
// ========================

/**
 * Validate URL format (for future source uploads)
 */
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url: string): string => {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname;
    } catch {
        return '';
    }
};

/**
 * Determine source type from URL
 */
export const determineSourceTypeFromUrl = (url: string): SupportedSourceType => {
    const domain = extractDomain(url).toLowerCase();

    if (domain.includes('reddit.com')) return 'reddit';
    if (domain.includes('github.com')) return 'github';
    if (domain.includes('stackoverflow.com')) return 'stackoverflow';
    if (domain.includes('docs.') || domain.includes('documentation')) return 'documentation';
    if (domain.includes('wiki')) return 'wiki';
    if (domain.includes('blog')) return 'blog';
    if (domain.includes('forum')) return 'forum';

    return 'website';
};