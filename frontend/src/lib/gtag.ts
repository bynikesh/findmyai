// Google Analytics utility functions

declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'js',
            targetId: string | Date,
            config?: Record<string, unknown>
        ) => void;
        dataLayer: unknown[];
    }
}

const GA_MEASUREMENT_ID = 'G-36L17DRH85';

/**
 * Track a page view in Google Analytics
 */
export const trackPageView = (url: string) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }
};

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

/**
 * Track tool click/view events
 */
export const trackToolView = (toolSlug: string, toolName: string) => {
    trackEvent('view_tool', 'Tools', `${toolName} (${toolSlug})`);
};

/**
 * Track external link clicks (e.g., "Visit Website" button)
 */
export const trackExternalClick = (toolSlug: string, destination: string) => {
    trackEvent('external_click', 'Outbound', `${toolSlug} -> ${destination}`);
};

/**
 * Track search queries
 */
export const trackSearch = (query: string, resultsCount: number) => {
    trackEvent('search', 'Search', query, resultsCount);
};

/**
 * Track category filter usage
 */
export const trackCategoryFilter = (categorySlug: string) => {
    trackEvent('filter_category', 'Filters', categorySlug);
};

/**
 * Track pricing filter usage
 */
export const trackPricingFilter = (pricingType: string) => {
    trackEvent('filter_pricing', 'Filters', pricingType);
};
