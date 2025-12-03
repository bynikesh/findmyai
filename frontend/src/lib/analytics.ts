// ---------------------------------------------------------------
// analytics.ts – tiny wrapper around fetch for analytics events
// ---------------------------------------------------------------
import { apiUrl } from './constants';

async function post(endpoint: string, body?: any) {
    try {
        await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (e) {
        console.warn('Analytics POST failed', endpoint, e);
    }
}

/**
 * Record a tool view – called from ToolDetail page.
 */
export function trackToolView(toolId: number) {
    post(`/api/analytics/track/tool-view`, { toolId });
}

/**
 * Record an external click – called from the “Visit Website” button.
 */
export function trackExternalClick(toolId: number, source?: string) {
    post(`/api/analytics/track/external-click`, { toolId, source });
}

/**
 * Record a category view – called from CategoryList page or filtered ToolList.
 */
export function trackCategoryView(categoryId: number) {
    post(`/api/analytics/track/category-view`, { categoryId });
}

/**
 * Record a new submission – called after the submit form succeeds.
 */
export function trackSubmission(submissionId: number) {
    post(`/api/analytics/track/submission`, { submissionId });
}
